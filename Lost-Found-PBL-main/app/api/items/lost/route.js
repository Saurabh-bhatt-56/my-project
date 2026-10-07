import LostItem from "@/lib/models/LostItemSchema";
import { GetUserFromToken } from "@/lib/server/GetUserFromToken";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const lostItems = await LostItem.find({});

    const items = lostItems.map(item => {
      return {
        id: item._id,
        title: item.title,
        location: item.locationLost,
        date: item.dateLost,
        images: item.images,
        type: "lost",
        category: item.category
      };
    });

    return NextResponse.json({ success: true, message: "Lost items retrieved successfully", data: items }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lost items not retrieved successfully : " + error }, { status: 500 });
  }
}

export async function POST(req) {
  const { formData } = await req.json();

  try {

    const user = await GetUserFromToken();

    if (!user) {
      return NextResponse.json({ success: false, message: "user not found" }, { status: 404 });
    }



    const normalizedTitle = formData.title.trim().toLowerCase();
    const normalizedLocation = formData.locationLost.trim().toLowerCase();


    const existingItem =
      await LostItem.findOne({
        ownerId: user._id,
        title: normalizedTitle,
        category: formData.category,
        locationLost: normalizedLocation,
        dateLost: formData.dateLost
      });


    if (existingItem) {
      return NextResponse.json({ success: false, message: "This item has already been reported" }, { status: 409 });
    }

    await LostItem.create({
      ownerId: user._id,
      title: formData.title.trim(),
      category: formData.category,
      color: formData.color.trim(),
      description: formData.description.trim(),
      dateLost: formData.dateLost,
      locationLost: formData.locationLost.trim(),
      images: formData.images || []
    });

    return NextResponse.json({ success: true, message: "Lost item reported successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lost item not reported successfully : " + error }, { status: 500 });
  }
}
