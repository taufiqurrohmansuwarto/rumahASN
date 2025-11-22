/**
 * Custom Image Loader untuk Next.js
 * Dengan timeout dan fallback handling untuk external images
 */

// Check if proxy mode enabled
const USE_IMAGE_PROXY = process.env.NEXT_PUBLIC_USE_IMAGE_PROXY === "true";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "/helpdesk";

// Custom loader dengan optional proxy support
export const externalImageLoader = ({ src, width, quality }) => {
  // Jika src kosong atau relative path, return as-is
  if (!src || !src.includes("http")) {
    return src;
  }

  // Jika dari SIASN/Master dan proxy enabled, route via proxy
  const isExternalSIASN =
    src?.includes("siasn.bkd.jatimprov.go.id") ||
    src?.includes("master.bkd.jatimprov.go.id");

  if (USE_IMAGE_PROXY && isExternalSIASN) {
    // Route through proxy API
    return `${BASE_PATH}/api/image-proxy?url=${encodeURIComponent(src)}`;
  }

  // Otherwise, use Next.js optimization
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${
    quality || 75
  }`;
};

// Helper untuk add timeout ke image loading
export const loadImageWithTimeout = (src, timeout = 15000) => {
  return new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error("No image source provided"));
      return;
    }

    const img = new window.Image();
    const timer = setTimeout(() => {
      img.src = ""; // Cancel loading
      reject(new Error(`Image load timeout after ${timeout}ms: ${src}`));
    }, timeout);

    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };

    img.onerror = (error) => {
      clearTimeout(timer);
      reject(error);
    };

    img.src = src;
  });
};

// Helper untuk get fallback avatar URL
export const getFallbackAvatar = (name) => {
  // Bisa gunakan dicebear avatars atau UI Avatars
  if (name) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=1890ff&color=fff&size=128`;
  }
  return null;
};

// Helper untuk check if image URL is accessible
export const isImageAccessible = async (url, timeout = 10000) => {
  try {
    await loadImageWithTimeout(url, timeout);
    return true;
  } catch (error) {
    console.warn(`[imageLoader] Image not accessible:`, {
      url,
      error: error.message,
    });
    return false;
  }
};

