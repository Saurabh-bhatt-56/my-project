import mongoose from "mongoose";

const lostItemSchema = new mongoose.Schema(
  {
    // Owner of lost item
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true
    },

    // Public Information
    title: {
      type: String,
      required: [true, "Title required"],
      trim: true,
      minlength: 5,
      maxlength: 100
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Electronics",
        "Wallets & IDs",
        "Keys",
        "Bags & Luggage",
        "Documents & Folders",
        "Jewelry & Watches",
        "Pets",
        "Clothing & Accessories",
        "Other"
      ]
    },

    color: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 30,
      maxlength: 1000
    },

    locationLost: {
      type: String,
      required: true,
      trim: true
    },

    dateLost: {
      type: Date,
      required: true
    },

    images: [
      {
        url: {
          type: String,
          required: true
        },

        public_id: {
          type: String,
          required: true
        }
      }
    ],

    status: {
      type: String,
      enum: [
        "lost",
        "matched",
        "claimed",
        "returned"
      ],
      default: "lost"
    },

    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false
    }

  },
  {
    timestamps: true
  });

const LostItem = mongoose.models.LostItems || mongoose.model("LostItems", lostItemSchema);

export default LostItem;