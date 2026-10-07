import connectDB from '@/lib/connectDB';
import FoundItem from '@/lib/models/FoundItemSchema';
import LostItem from '@/lib/models/LostItemSchema';
import { GetUserFromToken } from '@/lib/server/GetUserFromToken';
import { NextResponse } from 'next/server';

export async function GET(req) {

  try {
    await connectDB();

    const foundItems = await FoundItem.find({ isDeleted: false }).sort({ createdAt: -1 }).select("-createdAt -updatedAt -__v");

    const items = foundItems.map(item => {
      return {
        id: item._id,
        title: item.title,
        location: item.locationFound,
        date: item.dateFound,
        images: item.images,
        type: "found",
        category: item.category,
      };
    });

    return NextResponse.json({ success: true, message: 'Found items retrieved successfully', data: items }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, message: 'Failed to get found items' }, { status: 501 });
  }
}

export async function POST(req) {
  const data = await req.json();

  const user = await GetUserFromToken();

  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const foundItem = data.foundItem;

  if (!foundItem) {
    return NextResponse.json({ success: false, message: 'Please provide found item details' }, { status: 400 });
  }

  const { title, category, color, description, dateFound, locationFound, images } = foundItem;

  if (!title || !category || !color || !description || !dateFound || !locationFound || !images || images.length === 0) {
    return NextResponse.json({ success: false, message: 'Please provide all the details' }, { status: 400 });
  }

  try {

    const normalizedTitle = title.trim().toLowerCase();
    const normalizedLocation = locationFound.trim().toLowerCase();
    const normalizedColor = color.trim().toLowerCase();
    const normalizedDescription = description.trim().toLowerCase();

    const existingItem = await FoundItem.findOne({
      finderId: user._id,
      title: normalizedTitle,
      category,
      locationFound: normalizedLocation,
      color: normalizedColor,
      dateFound,
      description: normalizedDescription,
      images
    });

    if (existingItem) {
      return NextResponse.json({ success: false, message: 'Item already exists' }, { status: 409 });
    }

    await FoundItem.create({
      finderId: user._id,
      title: normalizedTitle,
      category,
      locationFound: normalizedLocation,
      color: normalizedColor,
      dateFound,
      description: normalizedDescription,
      images
    });

    // Find potential matches in LostItems
    const lostItems = await LostItem.find({
      category: category,
      status: "lost",
      isDeleted: false
    }).populate("ownerId");

    const matchedLostItems = lostItems.map(item => {
      let score = 60; // Base score for same category

      // Color matching (case-insensitive)
      if (color && item.color && color.trim().toLowerCase() === item.color.trim().toLowerCase()) {
        score += 20;
      }

      // Title keyword overlap
      const foundTitleWords = normalizedTitle.split(/\s+/);
      const lostTitleWords = item.title.trim().toLowerCase().split(/\s+/);
      let matchCount = 0;
      for (const word of foundTitleWords) {
        if (word && lostTitleWords.includes(word)) {
          matchCount++;
        }
      }
      if (matchCount > 0) {
        score += 20;
      }

      return {
        id: item._id.toString(),
        title: item.title,
        location: item.locationLost,
        date: item.dateLost,
        ownerFirstName: item.ownerId && item.ownerId.name ? item.ownerId.name.split(' ')[0] : 'Someone',
        matchScore: score
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      success: true,
      message: 'Item found successfully',
      foundItems: matchedLostItems
    }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, message: 'Failed to report found item' }, { status: 501 });
  }
}