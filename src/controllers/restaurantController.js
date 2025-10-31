import Restaurant from "../models/RestaurantModel.js";

export const listByRegion = async (req, res) => {
  try {
    const { region } = req.query;
    const filter = {};
    if (region) filter.region = region;
    const restaurants = await Restaurant.find(filter).sort({ name: 1 });
    res.json(restaurants);
  } catch (err) {
    console.error("Error listByRegion:", err.message);
    res.status(500).send("Server error");
  }
};

export const createRestaurant = async (req, res) => {
  try {
    const { name, region, address } = req.body;
    if (req.user?.id) {
    }
    const restaurant = await Restaurant.create({
      name,
      region,
      address,
      createdBy: req.user?.id,
      updatedBy: req.user?.id,
    });
    res.status(201).json(restaurant);
  } catch (err) {
    console.error("Error createRestaurant:", err.message);
    res
      .status(400)
      .json({ message: "Create restaurant failed", error: err.message });
  }
};

export const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user?.id) {
    }
    const updated = await Restaurant.findByIdAndUpdate(
      id,
      { ...req.body, updatedBy: req.user?.id },
      {
        new: true,
      }
    );
    if (!updated)
      return res.status(404).json({ message: "Restaurant not found" });
    res.json(updated);
  } catch (err) {
    console.error("Error updateRestaurant:", err.message);
    res
      .status(400)
      .json({ message: "Update restaurant failed", error: err.message });
  }
};

export const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user?.id) {
    }
    const deleted = await Restaurant.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ message: "Restaurant not found" });
    res.json({ message: "Restaurant deleted" });
  } catch (err) {
    console.error("Error deleteRestaurant:", err.message);
    res
      .status(400)
      .json({ message: "Delete restaurant failed", error: err.message });
  }
};
