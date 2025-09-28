const categoryTree = (categories, parentId = null) => {
  return categories
    .filter((cat) => String(cat.parentId) === String(parentId))
    .map((cat) => ({
      _id: cat._id,
      name: cat.name,
      images: cat.images,
      children: categoryTree(categories, cat._id),
    }));
};
module.exports = categoryTree;
