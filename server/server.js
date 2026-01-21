import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { sequelize } from "./db/db.js";
import authRouter from "./routes/auth/auth-routes.js";
import pharmacyRouter from "./routes/pharmacist/pharmacy-routes.js";
import pharmaryMedicineRouter from "./routes/pharmacist/medicine-routes.js";
import orderRouter from "./routes/pharmacist/order-routes.js";
import dashboardRoutes from "./routes/pharmacist/dashboard-routes.js";
import revenueRoutes from "./routes/pharmacist/revenue-routes.js";

const app = express();
const PORT = 5001;

// ✅ PERFECT CORS CONFIG
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);
app.use("/api/pharmacy", pharmacyRouter);
app.use("/api/pharmacymedicine", pharmaryMedicineRouter);
app.use("/api/order", orderRouter);
app.use("/api/pharmacy/dashboard", dashboardRoutes);
app.use("/api/pharmacy/revenue", revenueRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "MedWay Server is running!",
    database: "MySQL with Sequelize",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: "OK",
      database: "Connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      database: "Disconnected",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
