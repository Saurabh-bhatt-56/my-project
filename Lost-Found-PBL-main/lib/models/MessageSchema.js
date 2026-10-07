import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  claimId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Claims",
    required: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  }
}, {
  timestamps: true
});

const Message = mongoose.models.Messages || mongoose.model("Messages", messageSchema);

export default Message;
