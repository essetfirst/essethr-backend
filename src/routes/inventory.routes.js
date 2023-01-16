const router = require("express").Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const authenticate = require("../middlewares/authenticate");
const fileUpload = require("../middlewares/fileUpload");

const InventoryController = require("../controllers/inventory.controller");

/// Product
router
  .route("/product")
  .get(authenticate, InventoryController.apiGetAllProduct)
  .post(authenticate,fileUpload.addProduct,InventoryController.apiCreateProduct);

router
  .route("/product/:id")
  .get(InventoryController.apiGetProduct)
  .put(upload.any("product"), InventoryController.apiUpdateProduct)
  .delete(InventoryController.apiDeleteProduct);

/// Product Category
router
  .route("/category")
  .get(authenticate, InventoryController.apiGetAllCategory)
  .post(authenticate,fileUpload.addCategory,InventoryController.apiCreateCategory);

router
  .route("/category/:id")
  .get(InventoryController.apiGetCategory)
  .put(upload.any("product"), InventoryController.apiUpdateCategory)
  .delete(InventoryController.apiDeleteCategory);

/// CUSTOMER
router
  .route("/customer")
  .get(authenticate, InventoryController.apiGetAllCustomer)
  .post(authenticate, InventoryController.apiCreateCustomer);

router
  .route("/customer/:id")
  .get(InventoryController.apiGetCustomer)
  .put(InventoryController.apiUpdateCustomer)
  .delete(InventoryController.apiDeleteCustomer);

/// DISCOUNT
router
  .route("/discount")
  .get(authenticate, InventoryController.apiGetAllDiscount)
  .post(authenticate, InventoryController.apiCreateDiscount);

router
  .route("/discount/:id")
  .get(InventoryController.apiGetDiscount)
  .put(InventoryController.apiUpdateDiscount)
  .delete(InventoryController.apiDeleteDiscount);

/// SALES
router
  .route("/sales")
  .get(authenticate, InventoryController.apiGetAllSales)
  .post(authenticate, InventoryController.apiCreateSales);

router
  .route("/sales/:id")
  .get(InventoryController.apiGetSales)
  .put(InventoryController.apiUpdateSales)
  .delete(InventoryController.apiDeleteSales )
module.exports = router;
