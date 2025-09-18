const homeRouter = require("./home.router");
const registerRouter = require("./register.router");
const categoryRouter = require("./category.router");
const productRouter = require("./product.router");
const cartRouter = require("./cart.router");
const myListRouter = require("./myList.router");
const adminUser = require("./userAdmin.router");
module.exports = (app) => {
  app.use("/", homeRouter);
  app.use("/api/user", registerRouter);
  app.use("/api/category", categoryRouter);
  app.use("/api/product", productRouter);
  app.use("/api/cart", cartRouter);
  app.use("/api/myList", myListRouter);
  app.use("/api/userAdmin", adminUser);
};
