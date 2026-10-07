import connectDB from "@/lib/connectDB";
import Claim from "@/lib/models/ClaimSchema";
import FoundItem from "@/lib/models/FoundItemSchema";
import LostItem from "@/lib/models/LostItemSchema";
import { userModel } from "@/lib/models/userSchema";
import { GetUserFromToken } from "@/lib/server/GetUserFromToken";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();

    const user = await GetUserFromToken();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Fetch all claims where the user is sender or receiver
    const claims = await Claim.find({
      $or: [{ senderId: user._id }, { receiverId: user._id }],
    })
      .populate("senderId", "name email phoneNumber profileImage")
      .populate("receiverId", "name email phoneNumber profileImage")
      .sort({ createdAt: -1 })
      .lean();

    // Map claims to include resolved items
    const claimsWithItems = await Promise.all(
      claims.map(async (claim) => {
        let itemDetails = null;
        try {
          if (claim.itemType === "found") {
            const foundItem = await FoundItem.findById(claim.itemId).lean();
            if (foundItem) {
              itemDetails = {
                ...foundItem,
                title: foundItem.title,
                location: foundItem.locationFound,
                date: foundItem.dateFound,
              };
            }
          } else if (claim.itemType === "lost") {
            const lostItem = await LostItem.findById(claim.itemId).lean();
            if (lostItem) {
              itemDetails = {
                ...lostItem,
                title: lostItem.title,
                location: lostItem.locationLost,
                date: lostItem.dateLost,
              };
            }
          }
        } catch (itemErr) {
          console.error(`Error resolving item for claim ${claim._id}:`, itemErr);
        }

        return {
          ...claim,
          sender: claim.senderId,
          receiver: claim.receiverId,
          item: itemDetails,
        };
      })
    );

    const mySubmittedClaims = claimsWithItems.filter(
      (c) => c.sender?._id?.toString() === user._id.toString()
    );
    const receivedClaims = claimsWithItems.filter(
      (c) => c.receiver?._id?.toString() === user._id.toString()
    );

    return NextResponse.json({
      success: true,
      mySubmittedClaims,
      receivedClaims,
    });
  } catch (error) {
    console.error("Dashboard claims fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error: " + error.message },
      { status: 500 }
    );
  }
}
