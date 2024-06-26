const mongoose = require('mongoose');

const { Schema, models } = mongoose;

const aiChatroomSchema = new Schema({
    participants: {
        type: Array,
        required: true,
    },
},
    { timestamps: true }
);

const AIChatroom = models.AIChatroom || mongoose.model("AIChatroom", aiChatroomSchema);

module.exports = AIChatroom;
