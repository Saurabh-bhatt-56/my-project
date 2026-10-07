import connectDB from "@/lib/connectDB";
import Claim from "@/lib/models/ClaimSchema";
import Message from "@/lib/models/MessageSchema";
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

    const { searchParams } = new URL(req.url);
    const claimId = searchParams.get("claimId");

    if (!claimId) {
      return NextResponse.json(
        { success: false, message: "Claim ID is required." },
        { status: 400 }
      );
    }

    // Verify claim exists and user is a participant
    const claim = await Claim.findById(claimId);
    if (!claim) {
      return NextResponse.json(
        { success: false, message: "Claim not found." },
        { status: 404 }
      );
    }

    if (
      claim.senderId.toString() !== user._id.toString() &&
      claim.receiverId.toString() !== user._id.toString()
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to access this chat." },
        { status: 403 }
      );
    }

    // Fetch messages sorted by time
    const messages = await Message.find({ claimId })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Fetch messages error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const user = await GetUserFromToken();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { claimId, messageText } = await req.json();

    if (!claimId || !messageText || !messageText.trim()) {
      return NextResponse.json(
        { success: false, message: "Claim ID and message text are required." },
        { status: 400 }
      );
    }

    // Find and verify the claim
    const claim = await Claim.findById(claimId);
    if (!claim) {
      return NextResponse.json(
        { success: false, message: "Claim not found." },
        { status: 404 }
      );
    }

    // Only allow messaging if the claim is approved
    if (claim.status !== "approved") {
      return NextResponse.json(
        { success: false, message: "Chat is only enabled for approved claims." },
        { status: 403 }
      );
    }

    // Verify user is a participant in this claim
    const isSender = claim.senderId.toString() === user._id.toString();
    const isReceiver = claim.receiverId.toString() === user._id.toString();

    if (!isSender && !isReceiver) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. You are not a participant in this claim." },
        { status: 403 }
      );
    }

    // The other party is the receiver of this specific message
    const receiverId = isSender ? claim.receiverId : claim.senderId;

    const newMessage = await Message.create({
      claimId,
      itemId: claim.itemId,
      senderId: user._id,
      receiverId,
      message: messageText.trim()
    });

    return NextResponse.json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error: " + error.message },
      { status: 500 }
    );
  }
}
