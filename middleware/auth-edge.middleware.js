import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET || process.env.SECRET;

/**
 * Edge-compatible auth middleware untuk createEdgeRouter
 * Menambahkan user ke ctx.user
 */
export async function authEdgeMiddleware(ctx) {
  try {
    const token = await getToken({
      req: ctx.req,
      secret: secret,
      // Untuk next-auth v4, cookie name berbeda di dev vs prod
      cookieName:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
    });

    if (!token) {
      return new Response(
        JSON.stringify({ code: 401, message: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Struktur token dari [...nextauth].js callback
    // token.id = providerAccountId
    // token.accessToken = access_token
    // token.username = profile.name
    // token.role, token.group, token.employee_number, dll

    const customId = token.id || token.sub;
    const userId = customId?.split("|")?.[1];

    ctx.user = {
      id: token.id,
      customId: customId,
      userId: userId ? parseInt(userId) : null,
      name: token.username || token.name,
      email: token.email,
      image: token.picture,
      role: token.role,
      group: token.group,
      employee_number: token.employee_number,
      organization_id: token.organization_id,
      current_role: token.current_role,
      status_kepegawaian: token.status_kepegawaian,
      accessToken: token.accessToken,
    };

    // Continue to next middleware/handler
    return true;
  } catch (error) {
    console.error("Auth Edge Error:", error);
    return new Response(
      JSON.stringify({ code: 500, message: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * Standalone auth function (untuk penggunaan tanpa router)
 */
export async function authEdge(req) {
  try {
    const token = await getToken({
      req,
      secret: secret,
      cookieName:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
    });

    if (!token) {
      return {
        success: false,
        response: new Response(
          JSON.stringify({ code: 401, message: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        ),
      };
    }

    const customId = token.id || token.sub;
    const userId = customId?.split("|")?.[1];

    const user = {
      id: token.id,
      customId: customId,
      userId: userId ? parseInt(userId) : null,
      name: token.username || token.name,
      email: token.email,
      image: token.picture,
      role: token.role,
      group: token.group,
      employee_number: token.employee_number,
      organization_id: token.organization_id,
      current_role: token.current_role,
      status_kepegawaian: token.status_kepegawaian,
      accessToken: token.accessToken,
    };

    return { success: true, user, token };
  } catch (error) {
    console.error("Auth Edge Error:", error);
    return {
      success: false,
      response: new Response(
        JSON.stringify({ code: 500, message: "Internal Server Error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      ),
    };
  }
}

/**
 * Edge-compatible ASN/Non-ASN middleware
 * Cek apakah user memiliki status kepegawaian yang valid
 */
export async function asnNonAsnEdgeMiddleware(ctx) {
  try {
    const { status_kepegawaian } = ctx.user || {};

    const validStatusKepegawaian = [
      "PNS",
      "PPPK",
      "CPNS",
      "NON ASN",
      "PPPK Paruh Waktu",
    ];

    const isAuthorized = validStatusKepegawaian.includes(status_kepegawaian);

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({
          code: 403,
          message: "Akses ditolak. Status kepegawaian tidak valid.",
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    return true;
  } catch (error) {
    console.error("ASN Non-ASN Edge Error:", error);
    return new Response(
      JSON.stringify({ code: 500, message: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * Helper untuk membuat error response
 */
export function errorResponse(message = "Internal Server Error", status = 500) {
  return new Response(JSON.stringify({ code: status, message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
