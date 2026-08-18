import { Model, Document, Query, PipelineStage, Types } from 'mongoose';
import type { IQueryResult, PriceRange, BaseFilter } from '../interface/iproducts.js';

interface QueryBuilderOptions {
  isAdmin?: boolean;
  defaultStatus?: string;
  allowedStatuses?: string[];
}

const SORT_MAP: Record<string, string> = {
  recommend: '-ratingAvg -ratingCount',
  newest: '-createdAt',
  price_high: '-price',
  price_low: 'price',
};

const RESERVED_QUERY_KEYS = [
  'page',
  'limit',
  'sort',
  'fields',
  'search',
  'minPrice',
  'maxPrice',
  'minRating',
  'status',
];

class QueryBuilder<T extends Document> {
  private model: Model<T>;
  private queryString: Record<string, unknown>;
  private query: Query<T[], T>;
  private page = 1;
  private limit = 20;
  private isTextSearch = false;
  private options: QueryBuilderOptions;

  constructor(model: Model<T>, queryString: Record<string, unknown>, options?: QueryBuilderOptions) {
    this.model = model;
    this.queryString = queryString;
    this.query = model.find();
    this.options = {
      isAdmin: false,
      defaultStatus: 'active',
      allowedStatuses: ['active', 'inactive', 'draft', 'out_of_stock'],
      ...options,
    };
  }

  private static castObjectId(val: unknown): unknown {
    if (typeof val === 'string' && Types.ObjectId.isValid(val)) {
      return new Types.ObjectId(val);
    }
    if (val && typeof val === 'object' && '$in' in val && Array.isArray((val as { $in: unknown[] }).$in)) {
      return {
        ...val,
        $in: (val as { $in: unknown[] }).$in.map((v) =>
          typeof v === 'string' && Types.ObjectId.isValid(v) ? new Types.ObjectId(v) : v
        ),
      };
    }
    return val;
  }

  private static buildBaseFilter(
    queryString: Record<string, unknown>,
    options: QueryBuilderOptions = {}
  ): BaseFilter {
    const isAdmin = options.isAdmin ?? false;
    const defaultStatus = options.defaultStatus ?? 'active';
    const allowedStatuses = options.allowedStatuses ?? ['active', 'inactive', 'draft', 'out_of_stock'];

    const filter: Record<string, unknown> = {};

    // 1. Soft-delete logic: Admins see soft-deleted records unless explicitly filtered
    if (queryString.isDeleted !== undefined) {
      filter.isDeleted = queryString.isDeleted === 'true';
    } else if (!isAdmin) {
      filter.isDeleted = false;
    }

    // 2. Dynamic key assignments (casts 'true'/'false' strings to boolean and converts ObjectIds)
    Object.keys(queryString).forEach((key) => {
      if (!RESERVED_QUERY_KEYS.includes(key) && key !== 'isDeleted') {
        let val = queryString[key];
        if (val === 'true') val = true;
        if (val === 'false') val = false;
        filter[key] = QueryBuilder.castObjectId(val);
      }
    });

    // 3. Dynamic status logic (works for products or categories)
    const requestedStatus = queryString.status as string;

    if (requestedStatus && allowedStatuses.includes(requestedStatus)) {
      filter.status = requestedStatus;
    } else if (!isAdmin) {
      filter.status = defaultStatus;
    }

    // 4. Price & Rating range filters
    if (queryString.minPrice || queryString.maxPrice) {
      const price: PriceRange = {};
      if (queryString.minPrice) price.$gte = Number(queryString.minPrice);
      if (queryString.maxPrice) price.$lte = Number(queryString.maxPrice);
      filter.price = price;
    }

    if (queryString.minRating) {
      filter.ratingAvg = { $gte: Number(queryString.minRating) };
    }

    // 5. Full-text search
    if (typeof queryString.search === 'string' && queryString.search.trim()) {
      filter.$text = { $search: queryString.search.trim() };
    }

    return filter as BaseFilter;
  }

  public getQuery(): Query<T[], T> {
    return this.query;
  }

  filter(): this {
    const baseFilter = QueryBuilder.buildBaseFilter(this.queryString, this.options);
    const { $text, ...rest } = baseFilter;

    this.query = this.query.find(rest as unknown as Record<string, unknown>);

    if ($text) {
      this.query = this.query.find(
        { $text } as unknown as Record<string, unknown>,
        { score: { $meta: 'textScore' } }
      );
      this.isTextSearch = true;
    }

    return this;
  }

  sort(): this {
    const rawSort = this.queryString.sort;

    if (typeof rawSort === 'string' && rawSort) {
      const translated = SORT_MAP[rawSort];
      this.query = translated
        ? this.query.sort(translated)
        : this.query.sort(rawSort.split(',').join(' '));
    } else if (this.isTextSearch) {
      this.query = this.query.sort({ score: { $meta: 'textScore' } });
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  paginate(): this {
    this.page = Math.max(1, Number(this.queryString.page) || 1);
    this.limit = Math.min(100, Math.max(1, Number(this.queryString.limit) || 20));
    const skip = (this.page - 1) * this.limit;
    this.query = this.query.skip(skip).limit(this.limit);
    return this;
  }

  async execute(): Promise<IQueryResult<T>> {
    const filter = this.query.getFilter();
    const [data, total] = await Promise.all([
      this.query,
      this.model.countDocuments(filter),
    ]);

    const totalPage = Math.ceil(total / this.limit) || 1;

    return {
      data,
      pagination: {
        total,
        page: this.page,
        limit: this.limit,
        totalPage,
        hasNextPage: this.page < totalPage,
        hasPrevPage: this.page > 1,
      },
    };
  }

  static isDiscountSort(sortValue: unknown): boolean {
    return sortValue === 'discount_high' || sortValue === 'discount_low';
  }

  static async executeDiscountSort<T extends Document>(
    model: Model<T>,
    queryString: Record<string, unknown>,
    options?: QueryBuilderOptions
  ): Promise<IQueryResult<T>> {
    const direction = queryString.sort === 'discount_high' ? -1 : 1;
    const page = Math.max(1, Number(queryString.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(queryString.limit) || 20));

    const match = QueryBuilder.buildBaseFilter(queryString, options);

    const discountCalculationStage: PipelineStage.AddFields = {
      $addFields: {
        discountAmount: {
          $let: {
            vars: {
              cPrice: { $ifNull: ['$comparePrice', 0] },
              pPrice: { $ifNull: ['$price', 0] },
            },
            in: {
              $cond: [
                { $gt: ['$$cPrice', '$$pPrice'] },
                { $subtract: ['$$cPrice', '$$pPrice'] },
                0,
              ],
            },
          },
        },
      },
    };

    const pipeline: PipelineStage[] = [
      { $match: match },
      discountCalculationStage,
      { $match: { discountAmount: { $gt: 0 } } },
      { $sort: { discountAmount: direction, _id: 1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const countPipeline: PipelineStage[] = [
      { $match: match },
      discountCalculationStage,
      { $match: { discountAmount: { $gt: 0 } } },
      { $count: 'total' },
    ];

    const [data, countResult] = await Promise.all([
      model.aggregate<T>(pipeline),
      model.aggregate<{ total: number }>(countPipeline),
    ]);

    const total = countResult[0]?.total ?? 0;
    const totalPage = Math.ceil(total / limit) || 1;

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPage,
        hasNextPage: page < totalPage,
        hasPrevPage: page > 1,
      },
    };
  }
}

export default QueryBuilder;