import { Model, Document, Query, PipelineStage  } from 'mongoose';
import type { IQueryResult, PriceRange, BaseFilter } from '../interface/iproducts.js';

const SORT_MAP: Record<string, string> = {
  recommend: '-ratingAvg -ratingCount',
  newest: '-createdAt',
  price_high: '-price',
  price_low: 'price',
};

const RESERVED_QUERY_KEYS = ['page', 'limit', 'sort', 'fields', 'search', 'minPrice', 'maxPrice', 'minRating'];

class QueryBuilder<T extends Document> {
  private model: Model<T>;
  private queryString: Record<string, unknown>;
  private query: Query<T[], T>;
  private page = 1;
  private limit = 20;
  private isTextSearch = false;

  constructor(model: Model<T>, queryString: Record<string, unknown>) {
    this.model = model;
    this.queryString = queryString;
    this.query = model.find();
  }

  private static buildBaseFilter(queryString: Record<string, unknown>): BaseFilter {
    const filter: BaseFilter = { isDeleted: false };

    Object.keys(queryString).forEach((key) => {
      if (!RESERVED_QUERY_KEYS.includes(key)) {
        filter[key] = queryString[key];
      }
    });

    if (queryString.isActive !== undefined) {
      filter.isActive = queryString.isActive === 'true';
    }

    if (queryString.minPrice || queryString.maxPrice) {
      const price: PriceRange = {};
      if (queryString.minPrice) price.$gte = Number(queryString.minPrice);
      if (queryString.maxPrice) price.$lte = Number(queryString.maxPrice);
      filter.price = price;
    }

    if (typeof queryString.search === 'string' && queryString.search.trim()) {
      filter.$text = { $search: queryString.search.trim() };
    }

    if (queryString.minRating) {
      filter.ratingAvg = { $gte: Number(queryString.minRating) };
    }

    if (typeof queryString.search === 'string' && queryString.search.trim()) {
      filter.$text = { $search: queryString.search.trim() };
    }

    return filter;
  }

  filter(): this {
    const baseFilter = QueryBuilder.buildBaseFilter(this.queryString);
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
    queryString: Record<string, unknown>
  ): Promise<IQueryResult<T>> {
    const direction = queryString.sort === 'discount_high' ? -1 : 1;
    const page = Math.max(1, Number(queryString.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(queryString.limit) || 20));

    const match = QueryBuilder.buildBaseFilter(queryString);

    const pipeline: PipelineStage[] = [
      { $match: match },
      {
        $addFields: {
          discountAmount: {
            $cond: [
              { $gt: ['$comparePrice', 0] },
              { $subtract: ['$comparePrice', '$price'] },
              0,
            ],
          },
        },
      },
      { $sort: { discountAmount: direction } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const [data, total] = await Promise.all([
      model.aggregate(pipeline),
      model.countDocuments(match as unknown as Record<string, unknown>),
    ]);

    const totalPage = Math.ceil(total / limit) || 1;

    return {
      data: data as T[],
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