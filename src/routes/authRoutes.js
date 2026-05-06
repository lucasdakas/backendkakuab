const express = require("express");
const rateLimit = require("express-rate-limit");

const router = express.Router();

const { register, login } = require("../controllers/authController");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: "Muitas tentativas de login. Tente novamente em 15 minutos."
  }
});

router.post("/register", register);
router.post("/login", loginLimiter, login);

module.exports = router;
