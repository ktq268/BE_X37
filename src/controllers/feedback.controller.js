const feedbackService = require('../services/feedback.service');

class FeedbackController {
    async createFeedback(req, res) {
        try {
            const { orderId } = req.params;
            const userId = req.user.id; // Assuming user info is added by auth middleware
            const { rating, comment } = req.body;

            if (!rating || rating < 1 || rating > 5) {
                return res.status(400).json({ message: 'Rating must be between 1 and 5' });
            }

            const feedback = await feedbackService.createFeedback(orderId, userId, { rating, comment });
            res.status(201).json(feedback);
        } catch (error) {
            res.status(error.message.includes('not found') ? 404 : 400).json({ message: error.message });
        }
    }
}

module.exports = new FeedbackController();
