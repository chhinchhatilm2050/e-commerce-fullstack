import { Request, Response, NextFunction } from 'express';
import { CategoryModel } from '../model/category.js';
import { buildTree, getAllDescendantIds } from '../utils/categoryTree.js';
import { uploadTopCloudinary } from '../utils/uploadTocloudinary.js';
import AppError from '../utils/appError.js';
import asyncHandler from 'express-async-handler';
import type { ICategory } from '../interface/icategory.js';
import mongoose from 'mongoose';
import { deleteFromCaloudinay } from '../utils/deleteFromCloudinary.js';
import ProductModel from '../model/product.js';

export const getTopLevelCategories = asyncHandler(async( req: Request, res: Response, next: NextFunction): Promise<void> => {
  const categories = await CategoryModel.find({parentId: null, status: 'active'});
  if(!categories) {
    return next(new AppError('Category not found!', 404));
  }

  res.status(200).json({
    success: true,
    data: {categories}
  });
});

export const getCategoryBySlugg = asyncHandler(async(req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { slug } = req.params;
  const category = await CategoryModel.findOne({ slug , status: 'active'});
  if(!category) {
    return next(new AppError('Category not found', 404));
  }
  res.status(200).json({
    success: true,
    data: {category}
  });
});

export const getCategoryChildren = asyncHandler(async(req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { slug } = req.params;

  const parent = await CategoryModel.findOne({slug});
  if(!parent) {
    return next(new AppError('Category not found', 404));
  };

  const chhildren = await CategoryModel.find({ parentId: parent._id, status: 'active'});
  res.status(200).json({
    success: true,
    data: {chhildren}
  });
});

export const createCategory = asyncHandler(async(req: Request<unknown, unknown,ICategory>, res: Response, next: NextFunction): Promise<void> => {
  const { name, parentId, status, description } = req.body;

  if (parentId) {
    const parentExists = await CategoryModel.findById(parentId);
    if(!parentExists) {
      return next(new AppError('Parent category not found.', 404));
    }
  } 

  let imageUrl = '';
  let imagePublicId = '';
  if (req.file) {
    const uploaded = await uploadTopCloudinary(req.file.buffer, 'categories');
    imageUrl = uploaded.url;
    imagePublicId = uploaded.publicId;
  }

  const category = new CategoryModel({
    name,
    parentId: parentId || null,
    status: status || 'active',
    image: imageUrl,
    imagePublicId,
    description
  });

  await category.save();
  res.status(201).json({
    success: true,
    message: 'Category create successsfully',
    data: {category}
  });
});

export const getAllCategoriesAdmin = asyncHandler(async(req: Request, res: Response, next: NextFunction): Promise<void> => {
  const categories = await CategoryModel.find().sort({ createdAt: -1 });
  if(!categories) {
    return next(new AppError('No categorise found.', 404));
  };

  res.status(200).json({
    success: true,
    data: {categories}
  });
});

export const getCategoryTreeAdmin = asyncHandler(async(req: Request, res: Response, next: NextFunction): Promise<void> => {
  const categories = await CategoryModel.find();
  const tree = buildTree(categories, null);
  if(!tree) {
    return next(new AppError('Cannot find CategoryTree', 404));
  };

  res.status(200).json({
    success: true,
    data: { tree }
  });
});

export const getCategoryById = asyncHandler(async(req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const category = await CategoryModel.findById(id);
  if(!category) {
    return next(new AppError('Category not found.', 404));
  }
  res.status(200).json({
    success: true,
    data: { category }
  });
});

export const updateCategory = asyncHandler(async(req: Request<{id: string}, unknown, ICategory>, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const { name, status, description } = req.body;
  const category = await CategoryModel.findById(id);
  if(!category) {
    return next(new AppError('Category not found', 404));
  }

  if (Object.keys(req.body).length === 0) {
    return next(
      new AppError('Please provide at least one field to update', 400),
    );
  }

  if(name) category.name = name;
  if(status) category.status = status;
  if(description) category.description = description;
  if(req.file) {
    const oldPublicId = category.imagePublicId;
    const uploaded = await uploadTopCloudinary(req.file.buffer, 'categories');
    category.image = uploaded.url;
    category.imagePublicId = uploaded.publicId;

    if(oldPublicId) {
      void deleteFromCaloudinay(oldPublicId);
    }
  }
  category.updatedBy = req.user?._id;
  await category.save();
  res.status(200).json({
    success: true,
    message: 'Category update successfully',
    data: { category }
  });
});

export const moveCategory = asyncHandler(async(req: Request<{ id: string} ,unknown, { newParentId: string}>, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const { newParentId } = req.body;

  const category = await CategoryModel.findById(id);
  if(!category) {
    return next(new AppError('Category not found', 404));
  };

  const allCategories = await CategoryModel.find();
  const descendantIds = getAllDescendantIds(allCategories, id);
  
  if (newParentId && descendantIds.includes(newParentId)) {
    return next(new AppError('Cannot move category into its own descendant', 400));
  };

  console.log(newParentId && descendantIds.includes(newParentId));

  category.parentId = newParentId ? new mongoose.Types.ObjectId(newParentId): null;
  category.updatedBy = req.user?._id;
  
  await category.save();
  res.status(200).json({
    success: true,
    message: 'Category move successfullly',
    data: { category }
  });
});

export const updateCategoryStatus = asyncHandler(async(req: Request<{id: string}, unknown, {status: string}>, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;

  const category = await CategoryModel.findByIdAndUpdate(
    id,
    { status, updatedBy: req.user?._id},
    { new: true, runValidators: true},
  );

  if(!category) {
    return next(new AppError('Category not found.', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Stauts update successfully',
    data: { category }
  });
});

export const deleteCategory = asyncHandler(async(req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const category = await CategoryModel.findById(id);
  if (!category) {
    return next(new AppError('Category not found.', 404));
  };

  const hasChildren = await CategoryModel.exists({parentId: id});
  if(hasChildren) {
    return next(new AppError('Delete or move subcategories first', 400));
  };

  const hasProduct = await ProductModel.exists({ categoryId: id });
  if (hasProduct) {
    return next(new AppError('Delete or move products in this category first', 400));
  }

  await category.softDelete(req.user!._id);
  res.status(200).json({
    success: true,
    message: 'Category deleted successfully'
  });
});

export const getDeleteCategories = asyncHandler(async(req: Request, res: Response, next: NextFunction): Promise<void> => {
  const deleteCategories = await CategoryModel.find({isDeleted: true})
    .populate('deletedBy', 'firstName lastName email');
  if(!deleteCategories) {
    return next(new AppError('No delete category found.', 404));
  };

  res.status(200).json({
    success: true,
    data: { deleteCategories }
  });
});

export const restoreCategory = asyncHandler(async(req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const category = await CategoryModel.findOne({ _id: id, isDeleted: true});
  if (!category) {
    return next(new AppError('Deleted category not found', 404));
  }
  if (category.parentId) {
    const parent = await CategoryModel.findById(category.parentId);
    if (!parent) {
      return next(new AppError(
        'Cannot restore: parent category no longer exists. Move this category to a different parent first.',
        400
      ));
    }
  };
  category.isDeleted = false;
  category.deletedAt = null;
  category.deletedBy = null;
  category.status = 'active';
  category.updatedBy = req.user?._id;

  await category.save();

  res.status(200).json({
    success: true,
    message: 'Category restored successfully',
    data: { category }
  });
}); 