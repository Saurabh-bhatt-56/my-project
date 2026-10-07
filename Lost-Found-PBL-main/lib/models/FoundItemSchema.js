import mongoose from "mongoose";

const foundItemSchema = new mongoose.Schema({

    // User who found the item
    finderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },

    // PUBLIC ITEM DETAILS
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
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
        trim: true,
        maxlength: 30
    },

    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150
    },

    locationFound: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },

    dateFound: {
        type: Date,
        required: true
    },

    // CLOUDINARY IMAGES
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

    // ITEM STATUS
    status: {
        type: String,
        enum: [
            "available",
            "claimed",
            "returned"
        ],
        default: "available"
    },

    // ADMIN 
    isDeleted: {
        type: Boolean,
        default: false
    }

},
    {
        timestamps: true
    });

const FoundItem = mongoose.models.FoundItems || mongoose.model("FoundItems", foundItemSchema);

export default FoundItem;