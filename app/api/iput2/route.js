const { NextResponse } = require("next/server");
const { requireAuth } = require("../../../middleware/app-auth.middleware");

async function handler(request) {
  console.log(request.user);
  console.log(request.ip);
  return NextResponse.json({
    success: true,
    message: "GET users OK",
    data: [
      { id: 1, name: "Budi" },
      { id: 2, name: "Siti" },
    ],
  });
}

export const GET = requireAuth(handler);
