const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Add feedback route
router.post('/:orderId/feedback', authenticateToken, feedbackController.createFeedback);

module.exports = router;