import Feedback from "../models/FeedbackModel.js";
import Booking from "../models/BookingModel.js";

// 🟢 CREATE
export const createFeedback = async (req, res) => {
    try {
      const { bookingId, rating, comment, images } = req.body;
      const userId = req.user._id;
  
      const booking = await Booking.findById(bookingId);
      if (!booking || booking.status !== "completed")
        return res.status(400).json({ message: "Chỉ gửi feedback khi bữa ăn đã hoàn tất" });
  
      const feedback = await Feedback.create({ bookingId, userId, rating, comment, images });
      res.status(201).json({ message: "Cảm ơn bạn đã đánh giá!", feedback });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

// 🟡 READ ALL
export const getFeedbacks = async (req, res) => {
    try {
      const { rating, search } = req.query;
      const query = {};
  
      if (rating) query.rating = Number(rating);
      if (search) query.comment = { $regex: search, $options: "i" };
  
      const feedbacks = await Feedback.find(query)
        .populate("userId", "name email")
        .populate("restaurantId", "name")
        .sort({ createdAt: -1 });
  
      res.status(200).json(feedbacks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

// 🔵 UPDATE
export const updateFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json({ message: "Feedback updated", feedback });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔴 DELETE
export const deleteFeedback = async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Feedback deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📊 STATISTICS
export const feedbackStats = async (req, res) => {
    try {
      const stats = await Feedback.aggregate([
        {
          $group: {
            _id: "$rating",
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
      ]);
  
      const total = stats.reduce((acc, s) => acc + s.count, 0);
      const average =
        stats.reduce((sum, s) => sum + s._id * s.count, 0) / (total || 1);
  
      res.status(200).json({
        totalFeedbacks: total,
        averageRating: Number(average.toFixed(2)),
        ratingCounts: stats.reduce((obj, s) => {
          obj[s._id] = s.count;
          return obj;
        }, {}),
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


  export const getTopRestaurantsByFeedback = async (req, res) => {
    try {
      const result = await Feedback.aggregate([
        {
          $group: {
            _id: "$restaurantId",
            avgRating: { $avg: "$rating" },
            totalFeedbacks: { $sum: 1 },
          },
        },
        { $sort: { avgRating: -1, totalFeedbacks: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "restaurants",
            localField: "_id",
            foreignField: "_id",
            as: "restaurant",
          },
        },
        { $unwind: "$restaurant" },
        {
          $project: {
            restaurantName: "$restaurant.name",
            avgRating: 1,
            totalFeedbacks: 1,
          },
        },
      ]);
  
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  