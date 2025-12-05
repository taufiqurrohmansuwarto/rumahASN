import { useState } from "react";
import { Avatar, Tooltip } from "antd";
import { IconMail } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

/**
 * ClickableAvatar - Avatar yang bisa diklik untuk mengirim email
 * Menampilkan icon email saat hover
 */
function ClickableAvatar({
  user,
  size = 26,
  showEmailIcon = true,
  style = {},
  ...props
}) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  // Jangan tampilkan click jika user adalah diri sendiri
  const isSelf = session?.user?.id === user?.custom_id;

  const handleClick = (e) => {
    e.stopPropagation(); // Prevent card click
    if (isSelf || !user?.custom_id) return;

    const params = new URLSearchParams({
      to: user.custom_id,
      toName: user.username || "",
    });
    router.push(`/mails/compose?${params.toString()}`);
  };

  const tooltipTitle = isSelf
    ? user?.username
    : `${user?.username} • Klik untuk kirim pesan`;

  return (
    <Tooltip title={tooltipTitle}>
      <div
        style={{
          position: "relative",
          display: "inline-block",
          cursor: isSelf ? "default" : "pointer",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        <Avatar
          src={user?.image}
          size={size}
          style={{
            border: "2px solid #fff",
            boxShadow: isHovered && !isSelf ? "0 0 0 2px #fa541c" : "0 0 0 1px #fa541c",
            transition: "all 0.2s ease",
            opacity: isHovered && !isSelf ? 0.85 : 1,
            ...style,
          }}
          {...props}
        >
          {user?.username?.charAt(0)?.toUpperCase()}
        </Avatar>

        {/* Email icon overlay on hover */}
        {showEmailIcon && isHovered && !isSelf && (
          <div
            style={{
              position: "absolute",
              bottom: -2,
              right: -2,
              backgroundColor: "#fa541c",
              borderRadius: "50%",
              width: size > 24 ? 14 : 12,
              height: size > 24 ? 14 : 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1.5px solid #fff",
            }}
          >
            <IconMail size={size > 24 ? 8 : 7} color="#fff" />
          </div>
        )}
      </div>
    </Tooltip>
  );
}

/**
 * ClickableAvatarGroup - Group of clickable avatars
 */
export function ClickableAvatarGroup({
  users = [],
  maxCount = 3,
  size = 26,
  showEmailIcon = true,
}) {
  const displayUsers = users.slice(0, maxCount);
  const remainingCount = users.length - maxCount;

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {displayUsers.map((user, idx) => (
        <div
          key={user?.custom_id || idx}
          style={{
            marginLeft: idx > 0 ? -8 : 0,
            zIndex: displayUsers.length - idx,
          }}
        >
          <ClickableAvatar
            user={user}
            size={size}
            showEmailIcon={showEmailIcon}
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <Tooltip
          title={users
            .slice(maxCount)
            .map((u) => u.username)
            .join(", ")}
        >
          <Avatar
            size={size}
            style={{
              marginLeft: -8,
              backgroundColor: "#fa541c",
              fontSize: size > 24 ? 10 : 9,
              border: "2px solid #fff",
              zIndex: 0,
            }}
          >
            +{remainingCount}
          </Avatar>
        </Tooltip>
      )}
    </div>
  );
}

export default ClickableAvatar;

