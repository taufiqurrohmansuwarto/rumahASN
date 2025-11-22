import { Avatar } from "antd";
import { IconUser } from "@tabler/icons-react";
import Image from "next/image";
import { useState } from "react";

/**
 * Custom Avatar Component dengan Next.js Image Optimization
 * - Auto-optimized untuk faster loading (WebP/AVIF)
 * - Aggressive caching (24 jam)
 * - Graceful fallback jika error
 * 
 * @param {string} src - Image source URL
 * @param {number} size - Avatar size (default: 64)
 * @param {string} shape - Avatar shape: 'circle' | 'square' (default: 'square')
 * @param {string} alt - Alt text untuk image
 * @param {boolean} useOptimization - Gunakan Next.js Image optimization (default: true)
 */
export function CustomAvatar({
  src,
  size = 64,
  shape = "square",
  alt,
  useOptimization = true,
  ...props
}) {
  const [imgError, setImgError] = useState(false);

  // Fallback icon jika error atau no src
  if (!src || imgError) {
    return (
      <Avatar
        size={size}
        shape={shape}
        icon={<IconUser size={size > 50 ? 24 : 16} />}
        alt={alt || "Avatar"}
        style={{
          border: "2px solid #f0f0f0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          backgroundColor: "#f5f5f5",
          ...props.style,
        }}
        {...props}
      />
    );
  }

  // Jika disable optimization atau bukan URL external, gunakan Avatar biasa
  const isExternalImage =
    src?.includes("http://") || src?.includes("https://");
  
  if (!useOptimization || !isExternalImage) {
    return (
      <Avatar
        src={src}
        size={size}
        shape={shape}
        alt={alt || "Avatar"}
        icon={<IconUser size={size > 50 ? 24 : 16} />}
        onError={() => {
          console.warn(`[CustomAvatar] Image load error:`, src);
          setImgError(true);
        }}
        style={{
          border: "2px solid #f0f0f0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          ...props.style,
        }}
        {...props}
      />
    );
  }

  // Gunakan Next.js Image untuk optimization
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: shape === "circle" ? "50%" : "8px",
        overflow: "hidden",
        border: "2px solid #f0f0f0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        backgroundColor: "#f5f5f5",
        ...props.style,
      }}
      {...props}
    >
      <Image
        src={src}
        alt={alt || "Avatar"}
        fill
        sizes={`${size}px`}
        quality={85}
        priority={size > 100} // Priority untuk avatar besar
        style={{
          objectFit: "cover",
        }}
        onError={() => {
          console.warn(`[CustomAvatar] Image load error:`, src);
          setImgError(true);
        }}
        // Placeholder blur untuk better UX
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
      />
    </div>
  );
}

export default CustomAvatar;

