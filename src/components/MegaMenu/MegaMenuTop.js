import { getUserType } from "@/utils/appLists";
import { IconGridDots } from "@tabler/icons-react";
import { Grid, Popover, Typography } from "antd";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";

const { useBreakpoint } = Grid;
const { Text } = Typography;

const AppItem = ({ app, onNavigate }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={() => onNavigate(app.url)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        padding: "10px 6px",
        borderRadius: "8px",
        transition: "background-color 0.15s ease",
        backgroundColor: isHovered ? "rgba(60, 64, 67, 0.08)" : "transparent",
        minWidth: "72px",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 6,
        }}
      >
        <Image
          width={28}
          height={28}
          src={app.icon}
          alt={app.title}
          style={{
            width: 28,
            height: 28,
            objectFit: "contain",
          }}
        />
      </div>
      <Text
        style={{
          fontSize: 11,
          color: "#3c4043",
          textAlign: "center",
          lineHeight: 1.2,
          maxWidth: "64px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {app.title}
      </Text>
    </div>
  );
};

const MegaMenuTop = () => {
  const screens = useBreakpoint();
  const router = useRouter();
  const { data } = useSession();
  const [isHovered, setIsHovered] = useState(false);

  const breakPoint = Grid.useBreakpoint();
  const { userType, filteredApps } = getUserType(data?.user || {});

  const handleLink = (link) => {
    if (link) {
      router.push(link);
    }
  };

  const isMobile = breakPoint.xs || breakPoint.sm;

  // Calculate grid columns based on number of apps
  const getGridColumns = () => {
    if (screens.xs) return 3;
    return Math.min(3, Math.ceil(filteredApps?.length / 3) || 3);
  };

  const popoverContent = (
    <div
      style={{
        width: screens.xs ? "280px" : "290px",
        maxHeight: "400px",
        overflowY: "auto",
        padding: "16px",
      }}
    >
      {filteredApps?.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${getGridColumns()}, 1fr)`,
            gap: "8px",
          }}
        >
          {filteredApps.map((app, index) => (
            <AppItem key={index} app={app} onNavigate={handleLink} />
          ))}
        </div>
      ) : (
        <div
          style={{
            padding: "24px",
            textAlign: "center",
          }}
        >
          <Text style={{ color: "#5f6368", fontSize: 13 }}>
            Tidak ada aplikasi tersedia
          </Text>
        </div>
      )}
    </div>
  );

  if (!userType?.length || !isMobile) {
    return null;
  }

  return (
    <Popover
      content={popoverContent}
      trigger="click"
      placement="bottomRight"
      arrow={false}
      overlayInnerStyle={{
        padding: 0,
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1), 0 8px 40px rgba(0,0,0,0.15)",
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          borderRadius: "50%",
          cursor: "pointer",
          transition: "background-color 0.15s ease",
          backgroundColor: isHovered ? "rgba(60, 64, 67, 0.1)" : "transparent",
          marginLeft: 8,
        }}
      >
        <IconGridDots size={20} color="#5f6368" stroke={1.5} />
      </div>
    </Popover>
  );
};

export default MegaMenuTop;
