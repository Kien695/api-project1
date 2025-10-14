const Category = require("../model/category.model");
const categoryList = async (categoryId) => {
  const childCategory = await Category.find({ parentId: categoryId });
  let ids = [categoryId];
  for (const child of childCategory) {
    const subId = await categoryList(child._id);
    ids = ids.concat(subId);
  }
  return ids;
};
module.exports = categoryList;
