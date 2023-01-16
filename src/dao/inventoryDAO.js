const path = require("path");
const chalk = require("chalk");
const { ObjectID, ObjectId } = require("mongodb");
const ObjectsToCsv = require("objects-to-csv");

let products;
let category;
let customers;
let discounts;
let sales;

class InventoryDAO {
  static async injectDB(db) {
    try {
      products = await db.collection("products", {
        $validator: {
          $jsonSchema: {},
        },
      });
      category = await db.collection("category", {
        $validator: {
          $jsonSchema: {},
        },
      });
      customers = await db.collection("customers", {
        $validator: {
          $jsonSchema: {},
        },
      });
      discounts = await db.collection("discounts", {
        $validator: {
          $jsonSchema: {},
        },
      });

      sales = await db.collection("sales", {
        $validator: {
          $jsonSchema: {},
        },
      });
      await products.createIndex({ category: 1, image: 1, name: 1 });
      await category.createIndex({ image: 1 });
      await customers.createIndex({ fullname: 1 });
      await discounts.createIndex({ productId: 1 });
      await sales.createIndex({ productId: 1, customerId: 1 });
    } catch (e) {
      console.error(
        chalk.redBright(`Unable to establish handle for Inventory DAO, ${e}`)
      );
    }
  }

  static async createProduct(filterCriteria = {}) {
    try {
      const { image, ...rest } = filterCriteria;
      const prodInfo = { ...rest, image: image.path };
      console.log(prodInfo);
      const prod = await products.insertOne(prodInfo);
      return prod;
    } catch (e) {
      console.error(chalk.redBright(`Unable to create products, ${e}`));
      return { server: true, error: e };
    }
  }
  static async getAllProduct(filterCriteria = {}) {
    try {
      const { org } = filterCriteria;
      const query = {
        org: String(org),
      };
      console.log(query);
      return await products.find(query).toArray();
    } catch (e) {
      console.error(chalk.redBright(`Unable to fetch leaves, ${e}`));
      return { server: true, error: e };
    }
  }

  static async deleteProduct(productId) {
    try {
      const query = { _id: ObjectId(productId) };
      return await products.deleteOne(query);
    } catch (e) {
      console.error(chalk.redBright(`Unable to fetch produtcs, ${e}`));
      return { server: true, error: e };
    }
  }

  static async updateProduct(productInfo = {}) {
    try {
      const { id, ...rest } = productInfo;
      const query = { _id: ObjectId(id) };
      const update = { $set: rest };
      console.log(query, update);
      return await products.updateOne(query, update);
    } catch (e) {
      console.error(chalk.redBright(`Unable to fetch produtcs, ${e}`));
      return { server: true, error: e };
    }
  }
  static async getProduct(productId) {
    try {
      const query = { _id: ObjectId(productId) };
      return await products.findOne(query);
    } catch (e) {
      console.error(chalk.redBright(`Unable to fetch product by id, ${e}`));
      return { server: true, error: e };
    }
  }

  /***
   *     Product Category
   */

  static async createCategory(filterCriteria = {}) {
    try {
      const { image, ...rest } = filterCriteria;
      const prodInfo = { ...rest, image: image.path };
      console.log(prodInfo);
      const prod = await category.insertOne(prodInfo);
      return prod;
    } catch (e) {
      console.error(chalk.redBright(`Unable to create category, ${e}`));
      return { server: true, error: e };
    }
  }
  static async getAllCategory(filterCriteria = {}) {
    try {
      const { org } = filterCriteria;
      const query = {
        org: String(org),
      };
      console.log(query);
      return await category.find(query).toArray();
    } catch (e) {
      console.error(chalk.redBright(`Unable to fetch category, ${e}`));
      return { server: true, error: e };
    }
  }

  static async deleteCategory(productId) {
    try {
      const query = { _id: ObjectId(productId) };
      return await category.deleteOne(query);
    } catch (e) {
      console.error(chalk.redBright(`Unable to fetch category, ${e}`));
      return { server: true, error: e };
    }
  }

  static async updateCategory(productInfo = {}) {
    try {
      const { id, ...rest } = productInfo;
      const query = { _id: ObjectId(id) };
      const update = { $set: rest };
      console.log(query, update);
      return await category.updateOne(query, update);
    } catch (e) {
      console.error(chalk.redBright(`Unable to fetch category, ${e}`));
      return { server: true, error: e };
    }
  }
  static async getCategory(productId) {
    try {
      const query = { _id: ObjectId(productId) };
      return await category.findOne(query);
    } catch (e) {
      console.error(chalk.redBright(`Unable to fetch product by id, ${e}`));
      return { server: true, error: e };
    }
  }

  /***
   *     Customer
   */

  static async createCustomer(filterCriteria = {}) {
    try {
      const { org, ...rest } = filterCriteria;
      // const prodInfo = { };
      console.log(filterCriteria, org, rest);
      const prod = await customers.insertOne(filterCriteria);
      return prod;
    } catch (e) {
      console.error(chalk.redBright(`Unable to create customers, ${e}`));
      return { server: true, error: e };
    }
  }
  static async getAllCustomer(filterCriteria = {}) {
    try {
      const { org } = filterCriteria;
      const query = {
        org: String(org),
      };
      console.log(query);
      return await customers.find(query).toArray();
    } catch (e) {
      console.error(chalk.redBright(`Unable to fetch customers, ${e}`));
      return { server: true, error: e };
    }
  }

  static async deleteCustomer(productId) {
    try {
      const query = { _id: ObjectId(productId) };
      return await customers.deleteOne(query);
    } catch (e) {
      console.error(chalk.redBright(`Unable to fetch customers, ${e}`));
      return { server: true, error: e };
    }
  }

  static async updateCustomer(productInfo = {}) {
    try {
      const { id, ...rest } = productInfo;
      const query = { _id: ObjectId(id) };
      const update = { $set: rest };
      console.log(query, update);
      return await customers.updateOne(query, update);
    } catch (e) {
      console.error(chalk.redBright(`Unable to fetch customers, ${e}`));
      return { server: true, error: e };
    }
  }
  static async getCustomer(productId) {
    try {
      const query = { _id: ObjectId(productId) };
      return await customers.findOne(query);
    } catch (e) {
      console.error(chalk.redBright(`Unable to fetch customers by id, ${e}`));
      return { server: true, error: e };
    }
  }

  /***
   *     DISCOUNTS
   */

  static async createDiscount(filterCriteria = {}) {
    try {
      const { org, ...rest } = filterCriteria;
      // const prodInfo = { };
      console.log(filterCriteria, org, rest);
      const prod = await discounts.insertOne(filterCriteria);
      return prod;
    } catch (e) {
      console.error(chalk.redBright(`Unable to create Discount, ${e}`));
      return { server: true, error: e };
    }
  }
  static async getAllDiscount(filterCriteria = {}) {
    try {
      const { org } = filterCriteria;
      const query = {
        org: String(org),
      };
      console.log(query);
      return await discounts.find(query).toArray();
    } catch (e) {
      console.error(chalk.redBright(`Unable to fetch Discount, ${e}`));
      return { server: true, error: e };
    }
  }

  static async deleteDiscount(productId) {
    try {
      const query = { _id: ObjectId(productId) };
      return await discounts.deleteOne(query);
    } catch (e) {
      console.error(chalk.redBright(`Unable to fetch Discount, ${e}`));
      return { server: true, error: e };
    }
  }

  static async updateDiscount(productInfo = {}) {
    try {
      const { id, ...rest } = productInfo;
      const query = { _id: ObjectId(id) };
      const update = { $set: rest };
      console.log(query, update);
      return await discounts.updateOne(query, update);
    } catch (e) {
      console.error(chalk.redBright(`Unable to fetch Discount, ${e}`));
      return { server: true, error: e };
    }
  }
  static async getDiscount(productId) {
    try {
      const query = { _id: ObjectId(productId) };
      return await discounts.findOne(query);
    } catch (e) {
      console.error(chalk.redBright(`Unable to fetch Discount by id, ${e}`));
      return { server: true, error: e };
    }
  }

  /***
   *     Sales
   */

  static async createSales(filterCriteria = {}) {
    try {
      const { org, ...rest } = filterCriteria;
      // const prodInfo = { };
      console.log(filterCriteria, org, rest);
      const prod = await sales.insertOne(filterCriteria);
      return prod;
    } catch (e) {
      console.error(chalk.redBright(`Unable to create Sales, ${e}`));
      return { server: true, error: e };
    }
  }
  static async getAllSales(filterCriteria = {}) {
    try {
      const { org } = filterCriteria;
      const query = {
        org: String(org),
      };
      console.log(query);
      return await sales.find(query).toArray();
    } catch (e) {
      console.error(chalk.redBright(`Unable to fetch Sales, ${e}`));
      return { server: true, error: e };
    }
  }

  static async deleteSales(productId) {
    try {
      const query = { _id: ObjectId(productId) };
      return await sales.deleteOne(query);
    } catch (e) {
      console.error(chalk.redBright(`Unable to fetch Sales, ${e}`));
      return { server: true, error: e };
    }
  }

  static async updateSales(productInfo = {}) {
    try {
      const { id, ...rest } = productInfo;
      const query = { _id: ObjectId(id) };
      const update = { $set: rest };
      console.log(query, update);
      return await sales.updateOne(query, update);
    } catch (e) {
      console.error(chalk.redBright(`Unable to fetch Sales, ${e}`));
      return { server: true, error: e };
    }
  }
  static async getSales(productId) {
    try {
      const query = { _id: ObjectId(productId) };
      return await sales.findOne(query);
    } catch (e) {
      console.error(chalk.redBright(`Unable to fetch sales by id, ${e}`));
      return { server: true, error: e };
    }
  }
}


module.exports = { InventoryDAO };
