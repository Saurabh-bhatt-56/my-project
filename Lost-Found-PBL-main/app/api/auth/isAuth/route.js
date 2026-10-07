import { NextResponse } from "next/server";
import { GetUserFromToken } from "@/lib/server/GetUserFromToken";

export async function GET() {
    try {
        const user = await GetUserFromToken();

        if (user) {
            return NextResponse.json({ success: true, user });
        } else {
            return NextResponse.json({ success: false });
        }
    } catch (error) {
        console.error("isAuth API error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}