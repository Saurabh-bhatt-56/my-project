import connectDB from "@/lib/connectDB";
import Claim from "@/lib/models/ClaimSchema";
import FoundItem from "@/lib/models/FoundItemSchema";
import LostItem from "@/lib/models/LostItemSchema";
import { GetUserFromToken } from "@/lib/server/GetUserFromToken";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  try {
    await connectDB();

    const user = await GetUserFromToken();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { id: claimId } = await params;
    const { status } = await req.json();

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status. Must be 'approved' or 'rejected'." },
        { status: 400 }
      );
    }

    // Find the claim
    const claim = await Claim.findById(claimId);
    if (!claim) {
      return NextResponse.json(
        { success: false, message: "Claim request not found." },
        { status: 404 }
      );
    }

    // Symmetrical verification authority:
    // - For 'found' items: Finder (receiverId) approves/rejects the claim.
    // - For 'lost' items: Finder (senderId) reviews the owner's proof and decides (approves/rejects).
    const isAuthorized = claim.itemType === "lost" 
      ? claim.senderId.toString() === user._id.toString() 
      : claim.receiverId.toString() === user._id.toString();

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. You are not authorized to respond to this claim." },
        { status: 403 }
      );
    }

    // For lost items, ensure Owner has already submitted their proof before Finder can approve/reject
    if (claim.itemType === "lost" && status === "approved" && !claim.ownerProof) {
      return NextResponse.json(
        { success: false, message: "Verification proof is required from the item owner before this claim can be decided." },
        { status: 400 }
      );
    }

    // Check if the claim is already processed
    if (claim.status !== "pending") {
      return NextResponse.json(
        { success: false, message: `This claim has already been ${claim.status}.` },
        { status: 400 }
      );
    }

    // Ensure the item isn't already claimed/resolved before approving
    if (status === "approved") {
      if (claim.itemType === "found") {
        const foundItem = await FoundItem.findById(claim.itemId);
        if (!foundItem || foundItem.status === "claimed") {
          return NextResponse.json(
            { success: false, message: "This item has already been claimed and returned." },
            { status: 400 }
          );
        }
      } else if (claim.itemType === "lost") {
        const lostItem = await LostItem.findById(claim.itemId);
        if (!lostItem || lostItem.status === "claimed") {
          return NextResponse.json(
            { success: false, message: "This item has already been claimed and returned." },
            { status: 400 }
          );
        }
      }
    }

    // Update claim status
    claim.status = status;
    await claim.save();

    // If approved, update the item status to 'claimed' and reject other pending claims for this item
    if (status === "approved") {
      if (claim.itemType === "found") {
        await FoundItem.findByIdAndUpdate(claim.itemId, { status: "claimed" });

        // Resolve matching LostItem report by this claimant (senderId) if it exists
        const foundItemObj = await FoundItem.findById(claim.itemId);
        if (foundItemObj) {
          const matchingLostItem = await LostItem.findOne({
            ownerId: claim.senderId,
            status: { $ne: "claimed" },
            category: foundItemObj.category,
          });

          if (matchingLostItem) {
            matchingLostItem.status = "claimed";
            await matchingLostItem.save();

            // Auto-reject competing pending claims on that newly resolved LostItem
            await Claim.updateMany(
              {
                itemId: matchingLostItem._id,
                status: "pending"
              },
              { status: "rejected" }
            );
          }
        }
      } else if (claim.itemType === "lost") {
        await LostItem.findByIdAndUpdate(claim.itemId, { status: "claimed" });

        // Resolve matching FoundItem report by this claimant (senderId) if it exists
        const lostItemObj = await LostItem.findById(claim.itemId);
        if (lostItemObj) {
          const matchingFoundItem = await FoundItem.findOne({
            finderId: claim.senderId,
            status: { $ne: "claimed" },
            category: lostItemObj.category,
          });

          if (matchingFoundItem) {
            matchingFoundItem.status = "claimed";
            await matchingFoundItem.save();

            // Auto-reject competing pending claims on that newly resolved FoundItem
            await Claim.updateMany(
              {
                itemId: matchingFoundItem._id,
                status: "pending"
              },
              { status: "rejected" }
            );
          }
        }
      }

      // Automatically reject all other pending claims for this item
      await Claim.updateMany(
        {
          itemId: claim.itemId,
          _id: { $ne: claim._id },
          status: "pending",
        },
        { status: "rejected" }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Claim request has been successfully ${status}.`,
      claim,
    });
  } catch (error) {
    console.error("Error updating claim status:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error: " + error.message },
      { status: 500 }
    );
  }
}
