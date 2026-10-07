import connectDB from "@/lib/connectDB";
import FoundItem from "@/lib/models/FoundItemSchema";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    const { id } = await params;

    try {
        await connectDB();
        const item = await FoundItem.findOne({
            _id: id,
            isDeleted: false
        }).select("-createdAt -updatedAt -__v");

        if (!item) {
            return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: item });

    } catch (error) {
        return NextResponse.json({ success: false, message: "Failed to fetch item" }, { status: 500 });
    }
}
