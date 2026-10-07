import connectDB from "@/lib/connectDB";
import { userModel } from "@/lib/models/userSchema";
import LostItem from "@/lib/models/LostItemSchema";
import FoundItem from "@/lib/models/FoundItemSchema";
import { GetUserFromToken } from "@/lib/server/GetUserFromToken";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import cloudinary from "@/lib/cloudinary";

export async function GET(req) {
  try {
    await connectDB();
    const user = await GetUserFromToken();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Fetch live stats from db
    const [lostCount, foundCount, resolvedLostCount, resolvedFoundCount, lostItems, foundItems] = await Promise.all([
      LostItem.countDocuments({ ownerId: user._id, isDeleted: false }),
      FoundItem.countDocuments({ finderId: user._id, isDeleted: false }),
      LostItem.countDocuments({ ownerId: user._id, status: "claimed", isDeleted: false }),
      FoundItem.countDocuments({ finderId: user._id, status: "claimed", isDeleted: false }),
      LostItem.find({ ownerId: user._id, isDeleted: false }).sort({ createdAt: -1 }).limit(10),
      FoundItem.find({ finderId: user._id, isDeleted: false }).sort({ createdAt: -1 }).limit(10)
    ]);

    // Format recent reports
    const formattedLost = lostItems.map(item => ({
      id: item._id,
      title: item.title,
      location: item.locationLost,
      date: item.dateLost,
      type: "lost",
      status: item.status,
      category: item.category,
      images: item.images
    }));

    const formattedFound = foundItems.map(item => ({
      id: item._id,
      title: item.title,
      location: item.locationFound,
      date: item.dateFound,
      type: "found",
      status: item.status,
      category: item.category,
      images: item.images
    }));

    const recentReports = [...formattedLost, ...formattedFound]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || "",
        role: user.role || "user",
        profileImage: user.profileImage || "",
        avatar: user.avatar || (user.name ? user.name.trim().charAt(0).toUpperCase() : "U"),
        avatarPublicId: user.avatarPublicId || "",
        createdAt: user.createdAt,
        stats: {
          lostItemsCount: lostCount,
          foundItemsCount: foundCount,
          resolvedItemsCount: resolvedLostCount + resolvedFoundCount
        },
        recentReports
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ success: false, message: "Internal server error: " + error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await connectDB();
    const user = await GetUserFromToken();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { name, phoneNumber, profileImage, avatar, avatarPublicId, currentPassword, newPassword } = await req.json();

    const dbUser = await userModel.findById(user._id);
    if (!dbUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Handle profile info changes
    if (name && name.trim()) dbUser.name = name.trim();
    if (phoneNumber !== undefined) dbUser.phoneNumber = phoneNumber.trim();
    if (profileImage !== undefined) dbUser.profileImage = profileImage;
    if (avatar !== undefined) {
      // If we have a stored public ID, destroy the previous image directly
      const oldAvatarPublicId = dbUser.avatarPublicId;
      if (oldAvatarPublicId && oldAvatarPublicId !== avatarPublicId) {
        try {
          await cloudinary.uploader.destroy(oldAvatarPublicId);
          console.log("Successfully destroyed old avatar from Cloudinary using stored public ID:", oldAvatarPublicId);
        } catch (e) {
          console.error("Failed to destroy old avatar from Cloudinary using stored public ID:", e);
        }
      } else if (!oldAvatarPublicId && dbUser.avatar && dbUser.avatar !== avatar && dbUser.avatar.includes("res.cloudinary.com")) {
        const parts = dbUser.avatar.split("/upload/");
        if (parts.length >= 2) {
          let path = parts[1];
          const versionMatch = path.match(/^v\d+\//);
          if (versionMatch) {
            path = path.substring(versionMatch[0].length);
          }
          const dotIndex = path.lastIndexOf(".");
          if (dotIndex !== -1) {
            path = path.substring(0, dotIndex);
          }
          try {
            await cloudinary.uploader.destroy(path);
            console.log("Successfully destroyed old avatar from Cloudinary using parsed URL path:", path);
          } catch (e) {
            console.error("Failed to destroy old avatar from Cloudinary using parsed URL path:", e);
          }
        }
      }
      dbUser.avatar = avatar;
      dbUser.avatarPublicId = avatarPublicId || "";
    }

    // Handle password update if provided
    if (newPassword && newPassword.trim()) {
      if (!currentPassword) {
        return NextResponse.json({ success: false, message: "Current password is required to set a new password." }, { status: 400 });
      }

      const isMatch = await bcrypt.compare(currentPassword, dbUser.password);
      if (!isMatch) {
        return NextResponse.json({ success: false, message: "Incorrect current password." }, { status: 400 });
      }

      if (newPassword.trim().length < 6) {
        return NextResponse.json({ success: false, message: "New password must be at least 6 characters." }, { status: 400 });
      }

      const salt = await bcrypt.genSalt(10);
      dbUser.password = await bcrypt.hash(newPassword.trim(), salt);
    }

    await dbUser.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: dbUser._id,
        name: dbUser.name,
        email: dbUser.email,
        phoneNumber: dbUser.phoneNumber,
        role: dbUser.role,
        profileImage: dbUser.profileImage,
        avatar: dbUser.avatar || (dbUser.name ? dbUser.name.trim().charAt(0).toUpperCase() : "U"),
        avatarPublicId: dbUser.avatarPublicId || ""
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Profile PATCH error:", error);
    return NextResponse.json({ success: false, message: "Internal server error: " + error.message }, { status: 500 });
  }
}