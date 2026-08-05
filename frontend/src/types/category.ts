export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  parentId: string | null;
  image?: string;
  status: 'active' | 'inactive';
  description?: string;
  productCount?: number;
}

export interface ICategoryListResponse {
  success: boolean;
  data: { categories: ICategory[]}
}

export interface ICategorySingleResponse {
  success: boolean;
  data: { category: ICategory };
};

export interface ICategoryListChildrenResponse {
  success: boolean;
  data: { children: ICategory[]}
}

export interface ICategoryListSiblingsResponse {
  success: boolean;
  data: { siblings: ICategory[]}
}
