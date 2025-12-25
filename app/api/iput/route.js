const { NextResponse } = require("next/server");

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "GET users OK",
    data: [
      { id: 1, name: "Budi" },
      { id: 2, name: "Siti" },
    ],
  });
}
