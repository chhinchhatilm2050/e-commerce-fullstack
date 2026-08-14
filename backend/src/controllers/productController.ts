import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import ProductModel from '../model/product.js';
import ReviewModel from '../model/review.js';
import { getAllDescendantIds } from '../utils/categoryTree.js';
import { uploadTopCloudinary } from '../utils/uploadTocloudinary.js';
import { deleteFromCaloudinay } from '../utils/deleteFromCloudinary.js';
import QueryBuilder from '../utils/queryBuilder.js';
import type { CreateProductBody, IProduct, IProductImage } from '../interface/iproducts.js';
import AppError from '../utils/appError.js';
import { CategoryModel } from '../model/category.js';

export const getAllProducts = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    let result;

    if (QueryBuilder.isDiscountSort(req.query.sort)) {
      result = await QueryBuilder.executeDiscountSort(ProductModel, req.query);
    } else {
      result = await new QueryBuilder(ProductModel, req.query)
        .filter()
        .sort()
        .paginate()
        .execute();
    }

    res.status(200).json({
      success: true,
      ...result,
    });
  }
);

export const getProductById = asyncHandler(async(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  console.log(id);
  const reviewPage = Math.max(1, Number(req.query.reviewPage) || 1);
  const reviewLimit = 10;

  const product = await ProductModel.findOne(({ _id: id, status: 'active' })).populate('categoryId', 'name slug').lean();
  if(!product) {
    return next(new AppError('Product not found', 404));
  }

  const [ review, totalReviews ] = await Promise.all([
    ReviewModel.find({ productId: id })
      .populate('userId', 'firstName, lastName avatar')
      .sort('-createdAt')
      .skip((reviewPage - 1) * reviewLimit)
      .limit(reviewLimit)
      .lean(),
    ReviewModel.countDocuments({ productId: id }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      product,
      review,
      reviewPagination: {
        total: totalReviews,
        page: reviewPage,
        limit: reviewLimit,
        totalPage: Math.ceil(totalReviews / reviewLimit) || 1,
      },
    },
  });
});

export const getProductsByCategorySlug = asyncHandler(async (
  req: Request<{ slug: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { slug } = req.params;

  const category = await CategoryModel.findOne({ slug, status: 'active' });
  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  const allCategories = await CategoryModel.find().lean();
  const descendantIds = getAllDescendantIds(allCategories, String(category._id));
  const categoryIds = [category._id, ...descendantIds];

  const queryWithCategory = {
    ...req.query,
    categoryId: { $in: categoryIds },
  } as Record<string, unknown>;

  let result;

  if (QueryBuilder.isDiscountSort(req.query.sort)) {
    result = await QueryBuilder.executeDiscountSort(ProductModel, queryWithCategory);
  } else {
    result = await new QueryBuilder(ProductModel, queryWithCategory)
      .filter()
      .sort()
      .paginate()
      .execute();
  }

  res.status(200).json({
    success: true,
    ...result,
  });
});

export const createProduct = asyncHandler(async(req: Request<unknown, unknown, CreateProductBody>, res: Response, next: NextFunction): Promise<void> => {
  const { name, description, price, comparePrice, categoryId, stock, specification } = req.body;

  const categoryExists = await CategoryModel.findById(categoryId);
  if (!categoryExists) {
    return next(new AppError('Category not found', 400));
  };

  const files = req.files as Express.Multer.File[] | undefined;
  let images: IProductImage[] = [];
  
  if (files && files.length > 0 ) {
    const uploaded = await Promise.all(
      files.map((file) => uploadTopCloudinary(file.buffer, 'products'))
    );

    images = uploaded.map((img, index) => ({
      url: img.url,
      publicId: img.publicId,
      isPrimary: index === 0,
      order: index
    }));
  }

  let parsedSpecification: string | undefined;
  try {
    parsedSpecification = specification ? JSON.parse(specification) as string : undefined;
  } catch {
    return next(new AppError('Invalid JSON in specification field', 400));
  }

  const product = new ProductModel({
    name, 
    description,
    price,
    comparePrice,
    categoryId,
    stock: stock || 0,
    specification: parsedSpecification,
    images,
  });

  await product.save();

  res.status(201).json({ 
    success: true, 
    message: 'Product created successfully', 
    data: { product } 
  });
});

export const getAllProductsAdmin = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const result = await new QueryBuilder(ProductModel, req.query)
    .filter()
    .sort()
    .paginate()
    .execute();
  res.status(200).json({ success: true, ...result });
});

export const getProductByIdAdmin = asyncHandler(async (req: Request<{ id: string }>,res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const product = await ProductModel.findById(id).populate('categoryId', 'name slug').lean();
  if (!product) {
    return next( new AppError('Product not found', 404));
  }
  res.status(200).json({ success: true, data: { product } });
});

export const updateProduct = asyncHandler(async(req: Request<{ id: string }, unknown, IProduct>, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const { name, description, price, comparePrice, categoryId, stock, specification } = req.body;

  const product = await ProductModel.findById(id);
  if (!product) {
    return next(new AppError('Product not found', 404));
  };

  if (Object.keys(req.body).length === 0 ) {
    return next(new AppError('Please provide at least one field to update', 400));
  };

  if(categoryId) {
    const categoryExists = await CategoryModel.findById(categoryId);
    if (!categoryExists) {
      return next(new AppError('Category not found', 400));
    }
    product.categoryId = categoryId;
  };

  if (name) product.name = name;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = price;
  if (comparePrice !== undefined) product.comparePrice = comparePrice;
  if (stock !== undefined) product.stock = stock;
  if (specification !== undefined) product.specification = specification;
  product.updatedBy = req.user?._id;
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: { product},
  });
});

export const updateProductStatus = asyncHandler(async(req: Request<{ id: string}, unknown, { status: string}>, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;

  const product = await ProductModel.findByIdAndUpdate(
    id,
    { status, updatedBy: req.user?._id },
    { new: true , runValidators: true }
  );

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  res.status(200).json({ 
    success: true, 
    message: 'Status updated successfully',
    data: { product } 
  });
});

export const updateProductStock = asyncHandler(async(req: Request<{ id: string}, unknown, { stock: number}>, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const { stock } = req.body;

  const product = await ProductModel.findByIdAndUpdate(
    id,
    { stock, updatedBy: req.user?._id },
    { new: true, runValidators: true },
  );

  if (!product) {
    return next(new AppError('Product not found', 404));
  };

  res.status(200).json({
    success: true,
    message: 'Status updated successfully',
    data: { product },
  });
});

export const addProductImages = asyncHandler(async(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;

  const product = await ProductModel.findById(id);
  if (!product) {
    return next(new AppError('Product not found', 404));
  };

  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0 ) {
    return next(new AppError('No images uploaded', 400));
  };

  const uploaded = await Promise.all(files.map((file) => uploadTopCloudinary(file.buffer, 'products')));
  
  const hasNoImage = product.images.length === 0;
  const startOrder = product.images.length;

  const newImages = uploaded.map((img, index) => ({
    url: img.url,
    publicId: img.publicId,
    isPrimary: hasNoImage && index === 0,
    order: startOrder + index,
  }));
  product.images.push(...newImages);
  product.updatedBy = req.user?._id;

  await product.save();

  res.status(200).json({ success: true, message: 'Images added successfully', data: { product } });
});

export const removeProductImage = asyncHandler(async(req: Request<{ id: string }, unknown, { publicId: string }>, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const { publicId } = req.body;

  const product = await ProductModel.findById(id);
  if (!product) {
    return next(new AppError('Product not found', 404));
  };

  const imageToRemove = product.images.find((img) => img.publicId === publicId);
  if (!imageToRemove) {
    return next(new AppError('Image not found on this product', 404));
  };

  if (product.images.length === 1) {
    return next(new AppError('Product must have at least one image', 400));
  }

  product.images = product.images.filter((img) => img.publicId !== publicId);
  if (imageToRemove.isPrimary && product.images.length > 0) {
    product.images[0].isPrimary = true;
  };
  
  product.updatedBy = req.user?._id;
  await product.save();

  void deleteFromCaloudinay(publicId);

  res.status(200).json({ success: true, message: 'Image removed successfully', data: { product } });
});

export const deleteProduct = asyncHandler(async(req: Request<{ id: string }>, res: Response, _next: NextFunction): Promise<void> => {
  const { id } = req.params;

  const product = await ProductModel.findById(id);

  await product?.softDelete(req.user!._id);

  res.status(200).json({ success: true, message: 'Product deleted successfully' });
});

export const restoreProduct = asyncHandler(async(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;

  const product = await ProductModel.findOne({ _id: id, isDeleted: true });
  if (!product) {
    return next(new AppError('Deleted product not found', 404));
  };

  const categoryExists = await CategoryModel.findById(product.categoryId);
  if (!categoryExists) {
    return next(new AppError('Cannot restore: category no longer exists', 400));
  }

  product.isDeleted = false;
  product.deletedAt = null;
  product.deletedBy = null;
  product.updatedBy = req.user?._id;

  await product.save();

  res.status(200).json({ success: true, message: 'Product restored successfully', data: { product } });
});

export const getDeletedProducts = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const products = await ProductModel.find({ isDeleted: true })
    .populate('deletedBy', 'firstName lastName email')
    .populate('categoryId', 'name slug')
    .lean();

  res.status(200).json({ success: true, data: { products } });
});