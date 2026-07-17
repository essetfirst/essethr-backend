const router = require("express").Router();
const DocumentController = require("./document.controller");
const documentUpload = require("../../middlewares/documentUpload");
const requirePermission = require("../../middlewares/requirePermission");
const { PERMISSIONS } = require("../../constants/permissions");

router
  .route("/")
  .get(requirePermission(PERMISSIONS.DOCUMENTS_READ), DocumentController.apiListDocuments)
  .post(
    requirePermission(PERMISSIONS.DOCUMENTS_WRITE),
    (req, res, next) => {
      documentUpload(req, res, (err) => {
        if (err) {
          return res.status(400).json({ success: false, error: err.message });
        }
        next();
      });
    },
    DocumentController.apiUploadDocument,
  );

router
  .route("/:id/download")
  .get(requirePermission(PERMISSIONS.DOCUMENTS_READ), DocumentController.apiDownloadDocument);

router
  .route("/:id")
  .delete(requirePermission(PERMISSIONS.DOCUMENTS_WRITE), DocumentController.apiDeleteDocument);

module.exports = router;
