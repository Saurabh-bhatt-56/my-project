import connectDB from "@/lib/connectDB";
import Claim from "@/lib/models/ClaimSchema";
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
    const { ownerProof, ownerImages } = await req.json();

    if (!ownerProof || ownerProof.trim().length < 5) {
      return NextResponse.json(
        { success: false, message: "Please describe the unique identity/details in at least 5 characters." },
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

    // Verify authorized user (must be the receiverId of a 'lost' claim, i.e., the Owner of the lost item)
    if (claim.itemType !== "lost") {
      return NextResponse.json(
        { success: false, message: "Proof submission is only applicable for match requests on lost items." },
        { status: 400 }
      );
    }

    if (claim.receiverId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Only the owner of this lost item can submit verification proof." },
        { status: 403 }
      );
    }

    // Verify claim is pending
    if (claim.status !== "pending") {
      return NextResponse.json(
        { success: false, message: `This claim has already been ${claim.status}.` },
        { status: 400 }
      );
    }

    // Ensure proof hasn't been submitted already
    if (claim.ownerProof) {
      return NextResponse.json(
        { success: false, message: "You have already submitted ownership verification details for this match notice." },
        { status: 400 }
      );
    }

    // Save owner proof
    claim.ownerProof = ownerProof.trim();
    claim.ownerImages = ownerImages || [];
    await claim.save();

    return NextResponse.json({
      success: true,
      message: "Ownership proof submitted successfully! The finder will now review your details.",
      claim,
    });
  } catch (error) {
    console.error("Error submitting owner proof:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error: " + error.message },
      { status: 500 }
    );
  }
}
