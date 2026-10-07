import mongoose from "mongoose";

const claimSchema = new mongoose.Schema({

  itemType: {
    type: String,
    enum: ["lost", "found"],
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
    maxlength: 1000
  },

  // optional proof images from sender
  images: [
    {
      url: String,
      public_id: String
    }
  ],

  ownerProof: {
    type: String,
    trim: true,
    maxlength: 1000
  },

  ownerImages: [
    {
      url: String,
      public_id: String
    }
  ],

  status: {
    type: String,
    enum: [
      "pending",
      "approved",
      "rejected"
    ],
    default: "pending"
  }

},
  {
    timestamps: true
  });

const Claim = mongoose.models.Claims || mongoose.model("Claims", claimSchema);

export default Claim;