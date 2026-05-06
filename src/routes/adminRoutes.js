const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.get(
  "/anuncios/pendentes",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.listarPendentes
);

router.patch(
  "/anuncios/:id/aprovar",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.aprovarAnuncio
);

router.patch(
  "/anuncios/:id/reprovar",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.reprovarAnuncio
);

module.exports = router;
