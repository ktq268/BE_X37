export const validateReservation = (req, res, next) => {
  const { customerName, customerPhone, tableId, date, time, guestCount } = req.body;
  if (!customerName || !customerPhone || !tableId || !date || !time || !guestCount) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  // có thể validate số lượng khách > 0
  if (guestCount <= 0) {
    return res.status(400).json({ message: "Guest count must be greater than 0" });
  }
  next();
};