import connectDB from "@/lib/connectDB";
import LostItem from "@/lib/models/LostItemSchema";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {

  const { id } = await params;
  
  try {
    await connectDB();
    const item = await LostItem.findById(id);
    if(!item){
      return NextResponse.json({ success: false, message: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Item found', data: item }, { status: 200 });


  } catch (error) {
    return NextResponse.json({ success: false, message: 'Item not found' }, { status: 404 });
  }
}