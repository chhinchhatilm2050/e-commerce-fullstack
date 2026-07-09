import type { ICategory, ICategoryTreeNode } from '../interface/icategory.js';

export const buildTree = (categories: ICategory[], parentId: string | null): ICategoryTreeNode[] => {
  return categories
    .filter((cat) => String(cat.parentId) === String(parentId))
    .map((cat) => ({
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
      image: cat.image,
      status: cat.status,
      description: cat.description,
      children: buildTree(categories, String(cat._id))
    }));
};

export const getAllDescendantIds = (categories: ICategory[], parentId: string | null): string[] => {
  const directChildren = categories.filter(
    (cat) => String(cat.parentId) === String(parentId)
  );

  let ids = directChildren.map((cat) => String(cat._id));

  for (const child of directChildren) {
    ids = ids.concat(getAllDescendantIds(categories, String(child._id)));
  }

  return ids;
};