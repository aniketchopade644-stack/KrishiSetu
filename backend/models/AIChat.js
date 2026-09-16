import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const aiChatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      default: null,
    },
    language: {
      type: String,
      enum: ['en', 'hi', 'mr'],
      default: 'en',
    },
    topic: {
      type: String,
      default: 'General Agro-Advisory',
    },
    messages: [chatMessageSchema],
    contextSnapshot: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const AIChat = mongoose.model('AIChat', aiChatSchema);
export default AIChat;
