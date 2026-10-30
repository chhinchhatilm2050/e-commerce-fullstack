export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  parentId: string | null;
  parentName?: string | null;
  image?: string;
  status: 'active' | 'inactive';
  description?: string;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
}

export interface ICategoryTreeNode extends Omit<ICategory, 'parentId'> {
  children: ICategoryTreeNode[];
}

export interface ICategoryAdminListResponse {
  success: boolean;
  data: ICategory[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ICategoryAdminTreeResponse {
  success: boolean;
  data: { tree: ICategoryTreeNode[] };
}

export interface ICategoryTrashResponse {
  success: boolean;
  data: { deleteCategories: ICategory[] };
  pagination: ICategoryAdminListResponse['pagination'];
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
