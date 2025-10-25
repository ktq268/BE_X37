const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    // ...existing code...
    feedback: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Feedback'
    },
    // ...existing code...
});

// ...existing code...