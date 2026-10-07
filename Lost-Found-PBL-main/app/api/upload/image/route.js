import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req) {
    try {
        const formData = await req.formData();
        const image = formData.get("image");

        if (!image) {
            return NextResponse.json({ success: false, message: "image not uploaded" }, { status: 400 });
        }


        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Convert buffer to base64 data URI (Cloudinary requirement)
        const base64Image = `data:${image.type};base64,${buffer.toString("base64")}`;

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(base64Image, {
            folder: "Lost_and_Found_Images",
        });

        return NextResponse.json({
            success: true,
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id
        });
    } catch (error) {
        console.error("Image upload error:", error);
        return NextResponse.json({ success: false, message: "image uploading error occur" }, { status: 400 });
    }

}

export async function DELETE(req) {
    try {
        const { public_id } = await req.json();

        if (!public_id) {
            return NextResponse.json({ success: false, message: "public_id is required" }, { status: 400 });
        }

        // Delete from Cloudinary
        const result = await cloudinary.uploader.destroy(public_id);

        if (result.result === "ok" || result.result === "not found") {
            return NextResponse.json({ success: true, message: "Image deleted successfully" });
        } else {
            return NextResponse.json({ success: false, message: `Cloudinary error: ${result.result}` }, { status: 400 });
        }
    } catch (error) {
        console.error("Image deletion error:", error);
        return NextResponse.json({ success: false, message: "Failed to delete image" }, { status: 500 });
    }
}