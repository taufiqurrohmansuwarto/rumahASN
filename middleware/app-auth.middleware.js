import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../pages/api/auth/[...nextauth]";

export function requireAuth(handler) {
  return async (request, context) => {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    request.user = session.user;

    return handler(request, context);
  };
}
