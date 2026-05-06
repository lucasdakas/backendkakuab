require("dotenv").config();
require("./database/seed");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const anuncioRoutes = require("./routes/anuncioRoutes");
const adminRoutes = require("./routes/adminRoutes");
const imagemRoutes = require("./routes/imagemRoutes");
const favoritoRoutes = require("./routes/favoritoRoutes");
const avaliacaoRoutes = require("./routes/avaliacaoRoutes");
const userRoutes = require("./routes/userRoutes");
const rateLimit = require("express-rate-limit");
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "API Kakuab Market funcionando!"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/anuncios", anuncioRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/imagens", imagemRoutes);
app.use("/api/favoritos", favoritoRoutes);
app.use("/api/avaliacoes", avaliacaoRoutes);
app.use("/api/users", userRoutes);


app.use((req, res) => {
  res.status(404).json({
    error: "Rota não encontrada"
  });
});
const errorMiddleware = require("./middlewares/errorMiddleware");
const authMiddleware = require("./middlewares/authMiddleware");
const roleMiddleware = require("./middlewares/roleMiddleware")
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
