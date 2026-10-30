import { Model, Document, Query, PipelineStage, Types } from 'mongoose';
import type { IQueryResult, PriceRange, BaseFilter } from '../interface/iproducts.js';

interface QueryBuilderOptions {
  isAdmin?: boolean;
  defaultStatus?: string;
  allowedStatuses?: string[];
  searchFields?: string[];   
  allowedFilters?: string[];
}

const escapeRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

// Build a query in stages: filter -> sort -> paginate -> execute.
// Each stage returns this builder so controllers can chain them in that order.
class QueryBuilder<T extends Document> {
  private model: Model<T>;
  private queryString: Record<string, unknown>;
  private query: Query<T[], T>;
  private page = 1;
  private limit = 20;
  private isTextSearch = false;
  private options: QueryBuilderOptions;

  populate(path: string, select?: string) {
    this.query = this.query.populate(path, select);
    return this;
  }

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

  // Convert request string values to MongoDB types before they are used in filters.
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

    // Non-admin queries exclude deleted records by default. Admin queries include both
    // states unless the caller explicitly supplies isDeleted (for example, Trash = true).
    if (queryString.isDeleted !== undefined) {
      filter.isDeleted = queryString.isDeleted === 'true' || queryString.isDeleted === true;
    } else if (!isAdmin) {
      filter.isDeleted = false;
    }

    // Add non-reserved query parameters as filters. allowedFilters, when configured,
    // is an allowlist; booleans and ObjectId values are cast for MongoDB.
    Object.keys(queryString).forEach((key) => {
      if (RESERVED_QUERY_KEYS.includes(key) || key === 'isDeleted') return;
      if (options.allowedFilters && !options.allowedFilters.includes(key)) return;

      let val = queryString[key];
      if (val === 'true') val = true;
      if (val === 'false') val = false;
      filter[key] = QueryBuilder.castObjectId(val);
    });
    // Only accept supported statuses. Public queries fall back to defaultStatus;
    // admins without a valid explicit status are not restricted by status.
    const requestedStatus = queryString.status as string;

    if (requestedStatus && allowedStatuses.includes(requestedStatus)) {
      filter.status = requestedStatus;
    } else if (!isAdmin) {
      filter.status = defaultStatus;
    }

    // Build numeric range filters used by product listings.
    if (queryString.minPrice || queryString.maxPrice) {
      const price: PriceRange = {};
      if (queryString.minPrice) price.$gte = Number(queryString.minPrice);
      if (queryString.maxPrice) price.$lte = Number(queryString.maxPrice);
      filter.price = price;
    }

    if (queryString.minRating) {
      filter.ratingAvg = { $gte: Number(queryString.minRating) };
    }

    // MongoDB text-search filter for callers using buildBaseFilter directly.
    if (typeof queryString.search === 'string' && queryString.search.trim()) {
      filter.$text = { $search: queryString.search.trim() };
    }

    return filter as BaseFilter;
  }

  public getQuery(): Query<T[], T> {
    return this.query;
  }

  filter(): this {
    // Search and stockStatus need custom query conditions, so remove them before
    // turning the remaining request parameters into the base filter.
    const stockStatus = this.queryString.stockStatus;
    const search = this.queryString.search;
    
    delete this.queryString.stockStatus;
    delete this.queryString.search;

    const baseFilter = QueryBuilder.buildBaseFilter(this.queryString, this.options);

    this.query = this.query.find(baseFilter as Record<string, unknown>);

    // Escape each search word to treat user input literally. Every word must match
    // at least one configured field; fields default to code and name.
    if (search && typeof search === 'string' && search.trim()) {
      const fields = this.options.searchFields ?? ['code', 'name'];
      const words = search.trim().split(/\s+/).map(escapeRegex);

      this.query = this.query.find({
        $and: words.map((word) => {
          const regex = new RegExp(word, 'i');
          return { $or: fields.map((f) => ({ [f]: regex })) };
        }),
      } as Record<string, unknown>);
    }

    // Apply optional inventory filters after the common filters and search.
    if (stockStatus === 'low-stock') {
      this.query = this.query.find({ stock: { $gt: 0, $lte: 5 } });
    } else if (stockStatus === 'out-of-stock') {
      this.query = this.query.find({ stock: 0 });
    }

    return this;
  }

  // Select only the requested response fields; fields may be passed here or in the URL.
  select(fields?: string): this {
    let fieldsToSelect = '';
    if (fields) {
      fieldsToSelect = fields.split(',').join(' ');
    } else if (typeof this.queryString.fields === 'string' && this.queryString.fields.trim()) {
      fieldsToSelect = this.queryString.fields.split(',').join(' ');
    }
    if (fieldsToSelect) {
      this.query.select(fieldsToSelect);
    }
    return this;
  }

  sort(): this {
    const rawSort = this.queryString.sort;

    if (typeof rawSort === 'string' && rawSort) {
      // Friendly sort names use SORT_MAP; other values are treated as comma-separated
      // MongoDB sort fields (prefix a field with '-' for descending order).
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
    // Clamp invalid pages and limits, then apply MongoDB skip/limit to the result query.
    this.page = Math.max(1, Number(this.queryString.page) || 1);
    this.limit = Math.min(100, Math.max(1, Number(this.queryString.limit) || 20));
    const skip = (this.page - 1) * this.limit;
    this.query = this.query.skip(skip).limit(this.limit);
    return this;
  }

  async execute(): Promise<IQueryResult<T>> {
    // Run the page query and a count with the same filters in parallel. The count is
    // unpaginated and drives totalPages and the next/previous-page flags.
    const filter = this.query.getFilter();
    const [data, total] = await Promise.all([
      this.query,
      this.model.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / this.limit) || 1;

    return {
      data,
      pagination: {
        total,
        page: this.page,
        limit: this.limit,
        totalPages,
        hasNextPage: this.page < totalPages,
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
    // Discount sorting needs an aggregation because discountAmount is calculated
    // from comparePrice and price rather than stored as a sortable field.
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
      // Filter first, calculate and discard non-discounted products, then sort/page.
      { $match: match },
      discountCalculationStage,
      { $match: { discountAmount: { $gt: 0 } } },
      { $sort: { discountAmount: direction, _id: 1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const countPipeline: PipelineStage[] = [
      // Mirror the same match/calculation stages so pagination totals match the page.
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
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}

export default QueryBuilder;