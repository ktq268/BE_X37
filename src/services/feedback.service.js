const Feedback = require('../models/feedback.model');
const Order = require('../models/order.model');

class FeedbackService {
    async createFeedback(orderId, userId, feedbackData) {
        const order = await Order.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        if (order.userId.toString() !== userId.toString()) {
            throw new Error('Unauthorized: This order does not belong to the user');
        }

        if (order.feedback) {
            throw new Error('Feedback already exists for this order');
        }

        const feedback = new Feedback({
            orderId,
            userId,
            rating: feedbackData.rating,
            comment: feedbackData.comment
        });

        const savedFeedback = await feedback.save();
        
        // Update order with feedback reference
        order.feedback = savedFeedback._id;
        await order.save();

        return savedFeedback;
    }
}

module.exports = new FeedbackService();
