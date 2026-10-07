import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true
  },

  phoneNumber: {
    type: String,
    default: ""
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },

  profileImage: {
    type: String,
    default: ""
  },

  avatar: {
    type: String,
    default: ""
  },

  avatarPublicId: {
    type: String,
    default: ""
  },

  // Stats (useful for dashboard)
  totalLostItems: {
    type: Number,
    default: 0
  },

  totalFoundItems: {
    type: Number,
    default: 0
  },

  totalClaims: {
    type: Number,
    default: 0
  },

  // Security
  isBlocked: {
    type: Boolean,
    default: false
  },

  // Tracking
  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date
  }

}, { timestamps: true });

const userModel = mongoose.models.users || mongoose.model("users", userSchema);

export { userModel }


