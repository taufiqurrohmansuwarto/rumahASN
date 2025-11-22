/**
 * Image Proxy API
 * Optional endpoint untuk cache images dari external sources
 *
 * Usage:
 * /api/image-proxy?url=https://siasn.bkd.jatimprov.go.id/foto/123.jpg
 *
 * Benefits:
 * - Server-side caching
 * - Retry mechanism
 * - Error handling
 * - Consistent CORS headers
 */

const { logger } = require("@/utils/logger");

// Helper untuk retry dengan backoff
const fetchWithRetry = async (url, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "RumahASN-Image-Proxy/1.0",
          Accept: "image/*",
        },
        signal: AbortSignal.timeout(15000), // 15s timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      const isTimeout =
        error.name === "AbortError" || error.name === "TimeoutError";

      if ((isTimeout || error.code === "ECONNREFUSED") && !isLastAttempt) {
        const waitTime = 1000 * Math.pow(2, attempt - 1); // Exponential backoff
        logger.warn(
          `[Image Proxy] Retry ${attempt}/${maxRetries} after ${waitTime}ms`,
          {
            url,
            error: error.message,
          }
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      } else {
        throw error;
      }
    }
  }
};

export default async function handler(req, res) {
  // Only GET method
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.query;

  // Validate URL
  if (!url) {
    return res.status(400).json({ error: "URL parameter required" });
  }

  // Security: Only allow whitelisted domains
  const allowedDomains = [
    "siasn.bkd.jatimprov.go.id",
    "master.bkd.jatimprov.go.id",
  ];

  let imageUrl;
  try {
    imageUrl = new URL(url);
  } catch (error) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  const isAllowed = allowedDomains.some((domain) =>
    imageUrl.hostname.includes(domain)
  );

  if (!isAllowed) {
    logger.warn("[Image Proxy] Blocked unauthorized domain:", {
      hostname: imageUrl.hostname,
    });
    return res.status(403).json({ error: "Domain not allowed" });
  }

  try {
    logger.debug("[Image Proxy] Fetching image:", { url });

    // Fetch image dengan retry
    const response = await fetchWithRetry(url);
    const contentType = response.headers.get("content-type");

    // Validate content type
    if (!contentType || !contentType.startsWith("image/")) {
      throw new Error(`Invalid content type: ${contentType}`);
    }

    const buffer = await response.arrayBuffer();

    // Set aggressive cache headers
    res.setHeader(
      "Cache-Control",
      "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800, immutable"
    );
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", buffer.byteLength);
    res.setHeader("X-Image-Proxy", "RumahASN");

    logger.debug("[Image Proxy] Image served successfully:", {
      url,
      size: buffer.byteLength,
      contentType,
    });

    return res.send(Buffer.from(buffer));
  } catch (error) {
    logger.error("[Image Proxy] Failed to fetch image:", error, {
      url,
      errorName: error.name,
      errorMessage: error.message,
    });

    // Return appropriate error code
    if (error.name === "AbortError" || error.name === "TimeoutError") {
      return res.status(504).json({ error: "Gateway timeout" });
    }

    if (error.message.includes("HTTP 404")) {
      return res.status(404).json({ error: "Image not found" });
    }

    return res.status(500).json({ error: "Failed to fetch image" });
  }
}

// Disable body parser untuk handle binary data
export const config = {
  api: {
    bodyParser: false,
    responseLimit: "10mb", // Max 10MB per image
  },
};
