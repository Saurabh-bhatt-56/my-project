import connectDB from "@/lib/connectDB";
import Claim from "@/lib/models/ClaimSchema";
import FoundItem from "@/lib/models/FoundItemSchema";
import LostItem from "@/lib/models/LostItemSchema";
import { GetUserFromToken } from "@/lib/server/GetUserFromToken";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const user = await GetUserFromToken();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in to make a claim." },
        { status: 401 }
      );
    }

    const { itemId, uniqueDetails, proofImages, itemType } = await req.json();

    if (!itemId) {
      return NextResponse.json(
        { success: false, message: "Item ID is required." },
        { status: 400 }
      );
    }

    if (!uniqueDetails || uniqueDetails.trim().length < 5) {
      return NextResponse.json(
        { success: false, message: "Please describe the unique identity/details in at least 5 characters." },
        { status: 400 }
      );
    }

    // Verify item exists and fetch its details dynamically
    let targetItem;
    let receiverId;

    if (itemType === "lost") {
      targetItem = await LostItem.findById(itemId);
      if (!targetItem) {
        return NextResponse.json(
          { success: false, message: "Lost item not found." },
          { status: 404 }
        );
      }
      receiverId = targetItem.ownerId;
    } else {
      targetItem = await FoundItem.findById(itemId);
      if (!targetItem) {
        return NextResponse.json(
          { success: false, message: "Found item not found." },
          { status: 404 }
        );
      }
      receiverId = targetItem.finderId;
    }

    // Prevent submitting claims on already claimed/returned items
    if (targetItem.status === "claimed") {
      return NextResponse.json(
        { success: false, message: "This item has already been successfully claimed and returned!" },
        { status: 400 }
      );
    }

    // Prevent reporter from claiming their own item
    if (receiverId.toString() === user._id.toString()) {
      return NextResponse.json(
        { success: false, message: "You reported this item! You cannot submit a claim request for it." },
        { status: 400 }
      );
    }

    // Check if user already has an active (pending or approved) claim for this item
    const existingActiveClaim = await Claim.findOne({
      itemId,
      senderId: user._id,
      status: { $in: ["pending", "approved"] }
    });

    if (existingActiveClaim) {
      return NextResponse.json(
        { success: false, message: "You have already submitted a claim for this item. Please wait for the finder to review it." },
        { status: 409 }
      );
    }

    const claim = await Claim.create({
      itemId,
      receiverId,
      senderId: user._id,
      message: uniqueDetails.trim(),
      images: proofImages || [],
      itemType: itemType || "found"
    });

    return NextResponse.json(
      { success: true, message: "Claim request submitted successfully!", claim },
      { status: 201 }
    );

  } catch (error) {
    console.error("Claim submission error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit claim request. " + error.message },
      { status: 500 }
    );
  }
}
