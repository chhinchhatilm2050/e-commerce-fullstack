export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  parentId: string | null;
  image?: string;
  status: 'active' | 'inactive';
}

export interface ICategoryListResponse {
  success: boolean;
  data: { categories: ICategory[]}
}

export interface ICategorySingleResponse {
  success: boolean;
  data: ICategory;
};
