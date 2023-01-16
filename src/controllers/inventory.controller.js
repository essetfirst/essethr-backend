const { InventoryDAO } = require("../dao/inventoryDAO");

class InventoryController {
  ///TODO PRODUCT
  static async apiCreateProduct(req, res) {
    const productInfo = req.body;
    const image = req.file;
    console.log(image, productInfo);
    const result = await InventoryDAO.createProduct({
      ...req.body,
      org: String(req.org),
      image,
    });
    // console.log(result);
    if (result.error) {
      return res
        .status(500)
        .json({ success: false, error: "Internal error, try again later." });
    }
    return res.status(201).json({
      success: true,
      message: "Product Created successfully",
      product: result,
    });
  }

  static async apiUpdateProduct(req, res) {
    const productInfo = req.body;
    const result = await InventoryDAO.updateProduct({
      ...req.body,
      id: req.params.id,
    });
    console.log(result);
    if (result.error) {
      return res
        .status(500)
        .json({ success: false, error: "Internal error, try again later." });
    }
    return res.status(201).json({
      success: true,
      message: "Product updated successfully",
    });
  }
  static async apiGetProduct(req, res) {
    const productInfo = req.body;
    const result = await InventoryDAO.getProduct(req.params.id);
    console.log(result);
    if (!result) {
      return res
        .status(500)
        .json({ success: false, error: "Internal error, try again later." });
    }
    return res.status(201).json({
      success: true,
      product: result,
    });
  }

  static async apiGetAllProduct(req, res) {
    // const productInfo = req.body;
    const result = await InventoryDAO.getAllProduct({ org: req.org });
    console.log(result);
    if (result.error) {
      return res
        .status(500)
        .json({ success: false, error: "Internal error, try again later." });
    }
    return res.status(201).json({
      success: true,
      products: result,
      message: "List of All Products",
    });
  }
  static async apiDeleteProduct(req, res) {
    // const productInfo = req.body;
    const result = await InventoryDAO.deleteProduct(req.params.id);
    console.log(result);
    if (result.error) {
      return res
        .status(500)
        .json({ success: false, error: "Internal error, try again later." });
    }
    return res.status(201).json({
      success: true,
      message: "Product deleted successfully",
    });
  }

  //// TODO CATEGORY

  static async apiCreateCategory(req, res) {
    const productInfo = req.body;
    const image = req.file;
    console.log(image, productInfo);
    const result = await InventoryDAO.createCategory({
      ...req.body,
      org: String(req.org),
      image,
    });
    // console.log(result);
    if (result.error) {
      return res
        .status(500)
        .json({ success: false, error: "Internal error, try again later." });
    }
    return res.status(201).json({
      success: true,
      message: "Category Created successfully",
      category: result,
    });
  }

  static async apiUpdateCategory(req, res) {
    const productInfo = req.body;
    const result = await InventoryDAO.updateCategory({
      ...req.body,
      id: req.params.id,
    });
    console.log(result);
    if (result.error) {
      return res
        .status(500)
        .json({ success: false, error: "Internal error, try again later." });
    }
    return res.status(201).json({
      success: true,
      message: "Category updated successfully",
    });
  }
  static async apiGetCategory(req, res) {
    const productInfo = req.body;
    const result = await InventoryDAO.getCategory(req.params.id);
    console.log(result);
    if (!result) {
      return res
        .status(500)
        .json({ success: false, error: "Internal error, try again later." });
    }
    return res.status(201).json({
      success: true,
      product: result,
    });
  }

  static async apiGetAllCategory(req, res) {
    // const productInfo = req.body;
    const result = await InventoryDAO.getAllCategory({ org: req.org });
    console.log(result);
    if (result.error) {
      return res
        .status(500)
        .json({ success: false, error: "Internal error, try again later." });
    }
    return res.status(201).json({
      success: true,
      category: result,
      message: "List of All Category",
    });
  }
  static async apiDeleteCategory(req, res) {
    // const productInfo = req.body;
    const result = await InventoryDAO.deleteCategory(req.params.id);
    console.log(result);
    if (result.error) {
      return res
        .status(500)
        .json({ success: false, error: "Internal error, try again later." });
    }
    return res.status(201).json({
      success: true,
      message: "Category deleted successfully",
    });
  }

  //// TODO CUSTOMER

  static async apiCreateCustomer(req, res) {
    const productInfo = req.body;
    // const image = req.file;
    console.log(productInfo);
    const result = await InventoryDAO.createCustomer({
      ...productInfo,
      org: String(req.org),
    });
    // console.log(result);
    if (result.error) {
      return res
        .status(500)
        .json({ success: false, error: "Internal error, try again later." });
    }
    return res.status(201).json({
      success: true,
      message: "Customer Created successfully",
      Customer: result,
    });
  }

  static async apiUpdateCustomer(req, res) {
    const productInfo = req.body;
    const result = await InventoryDAO.updateCustomer({
      ...req.body,
      id: req.params.id,
    });
    console.log(result);
    if (result.error) {
      return res
        .status(500)
        .json({ success: false, error: "Internal error, try again later." });
    }
    return res.status(201).json({
      success: true,
      message: "Customer updated successfully",
    });
  }
  static async apiGetCustomer(req, res) {
    const productInfo = req.body;
    const result = await InventoryDAO.getCustomer(req.params.id);
    console.log(result);
    if (!result) {
      return res
        .status(500)
        .json({ success: false, error: "Internal error, try again later." });
    }
    return res.status(201).json({
      success: true,
      customer: result,
    });
  }

  static async apiGetAllCustomer(req, res) {
    // const productInfo = req.body;
    const result = await InventoryDAO.getAllCustomer({ org: req.org });
    console.log(result);
    if (result.error) {
      return res
        .status(500)
        .json({ success: false, error: "Internal error, try again later." });
    }
    return res.status(201).json({
      success: true,
      customers: result,
      message: "List of All Customers",
    });
  }
  static async apiDeleteCustomer(req, res) {
    // const productInfo = req.body;
    const result = await InventoryDAO.deleteCustomer(req.params.id);
    console.log(result);
    if (result.error) {
      return res
        .status(500)
        .json({ success: false, error: "Internal error, try again later." });
    }
    return res.status(201).json({
      success: true,
      message: "Customer deleted successfully",
    });
  }

  //// TODO DISCOUNTS

  static async apiCreateDiscount(req, res) {
    const productInfo = req.body;
    // const image = req.file;
    console.log(productInfo);
    const result = await InventoryDAO.createDiscount({
      ...productInfo,
      org: String(req.org),
    });
    // console.log(result);
    if (result.error) {
      return res
        .status(500)
        .json({ success: false, error: "Internal error, try again later." });
    }
    return res.status(201).json({
      success: true,
      message: "Discount Created successfully",
      Discount: result,
    });
  }

  static async apiUpdateDiscount(req, res) {
    const productInfo = req.body;
    const result = await InventoryDAO.updateDiscount({
      ...req.body,
      id: req.params.id,
    });
    console.log(result);
    if (result.error) {
      return res
        .status(500)
        .json({ success: false, error: "Internal error, try again later." });
    }
    return res.status(201).json({
      success: true,
      message: "Discount updated successfully",
    });
  }
  static async apiGetDiscount(req, res) {
    const productInfo = req.body;
    const result = await InventoryDAO.getDiscount(req.params.id);
    console.log(result);
    if (!result) {
      return res
        .status(500)
        .json({ success: false, error: "Internal error, try again later." });
    }
    return res.status(201).json({
      success: true,
      Discount: result,
    });
  }

  static async apiGetAllDiscount(req, res) {
    // const productInfo = req.body;
    const result = await InventoryDAO.getAllDiscount({ org: req.org });
    console.log(result);
    if (result.error) {
      return res
        .status(500)
        .json({ success: false, error: "Internal error, try again later." });
    }
    return res.status(201).json({
      success: true,
      Discounts: result,
      message: "List of All Discounts",
    });
  }
  static async apiDeleteDiscount(req, res) {
    // const productInfo = req.body;
    const result = await InventoryDAO.deleteDiscount(req.params.id);
    console.log(result);
    if (result.error) {
      return res
        .status(500)
        .json({ success: false, error: "Internal error, try again later." });
    }
    return res.status(201).json({
      success: true,
      message: "Discount deleted successfully",
    });
  }

  //// TODO SALES

  static async apiCreateSales(req, res) {
    const productInfo = req.body;
    // const image = req.file;
    console.log(productInfo);
    const result = await InventoryDAO.createSales({
      ...productInfo,
      org: String(req.org),
    });
    // console.log(result);
    if (result.error) {
      return res
        .status(500)
        .json({ success: false, error: "Internal error, try again later." });
    }
    return res.status(201).json({
      success: true,
      message: "Sales Created successfully",
      Sales: result,
    });
  }

  static async apiUpdateSales(req, res) {
    const productInfo = req.body;
    const result = await InventoryDAO.updateSales({
      ...req.body,
      id: req.params.id,
    });
    console.log(result);
    if (result.error) {
      return res
        .status(500)
        .json({ success: false, error: "Internal error, try again later." });
    }
    return res.status(201).json({
      success: true,
      message: "Sales updated successfully",
    });
  }
  static async apiGetSales(req, res) {
    const productInfo = req.body;
    const result = await InventoryDAO.getSales(req.params.id);
    console.log(result);
    if (!result) {
      return res
        .status(500)
        .json({ success: false, error: "Internal error, try again later." });
    }
    return res.status(201).json({
      success: true,
      Sales: result,
    });
  }

  static async apiGetAllSales(req, res) {
    // const productInfo = req.body;
    const result = await InventoryDAO.getAllSales({ org: req.org });
    console.log(result);
    if (result.error) {
      return res
        .status(500)
        .json({ success: false, error: "Internal error, try again later." });
    }
    return res.status(201).json({
      success: true,
      Saless: result,
      message: "List of All Saless",
    });
  }
  static async apiDeleteSales(req, res) {
    // const productInfo = req.body;
    const result = await InventoryDAO.deleteSales(req.params.id);
    console.log(result);
    if (result.error) {
      return res
        .status(500)
        .json({ success: false, error: "Internal error, try again later." });
    }
    return res.status(201).json({
      success: true,
      message: "Sales deleted successfully",
    });
  }
}

module.exports = InventoryController;
