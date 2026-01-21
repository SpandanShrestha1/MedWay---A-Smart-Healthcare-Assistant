export const authenticatePharmacist = (req, res, next) => {
  if (!req.user || req.user.role !== "pharmacist") {
    return res.status(403).json({ error: "Unauthorized access" });
  }

  next();
};
