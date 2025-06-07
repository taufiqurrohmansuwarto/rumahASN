import { Avatar, Popover } from "antd";
import ContentInformation from "./ContentInformation";

function AvatarUser({ userId, user, ...props }) {
  const getStatusConfig = (user) => {
    const pns = user?.status_kepegawaian === "PNS";
    const pppk = user?.status_kepegawaian === "PPPK";
    const nonAsn = user?.status_kepegawaian === "NON ASN";

    if (pns) {
      return {
        borderColor: "#1890FF",
        backgroundColor: "#E6F7FF",
        badgeColor: "#1890FF",
        label: "PNS",
      };
    } else if (pppk) {
      return {
        borderColor: "#EB2F96",
        backgroundColor: "#FFF0F6",
        badgeColor: "#EB2F96",
        label: "PPPK",
      };
    } else if (nonAsn) {
      return {
        borderColor: "#FA8C16",
        backgroundColor: "#FFF7E6",
        badgeColor: "#FA8C16",
        label: "NON ASN",
      };
    } else {
      return {
        borderColor: "#D9D9D9",
        backgroundColor: "#FAFAFA",
        badgeColor: "#8C8C8C",
        label: "GUEST",
      };
    }
  };

  const statusConfig = getStatusConfig(user);

  const popoverContent = (
    <div
      style={{
        background: "linear-gradient(135deg, #FF4500 0%, #FF6B35 100%)",
        margin: "-12px",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 8px 24px rgba(255, 69, 0, 0.15)",
      }}
    >
      {/* Header with gradient */}
      <div
        style={{
          padding: "16px",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: statusConfig.badgeColor,
              }}
            />
          </div>
          <span
            style={{
              color: "white",
              fontSize: "12px",
              fontWeight: 600,
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
            }}
          >
            PROFIL PENGGUNA
          </span>
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            backgroundColor: statusConfig.backgroundColor,
            border: `1px solid ${statusConfig.borderColor}`,
            borderRadius: "12px",
            padding: "2px 8px",
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: statusConfig.badgeColor,
            }}
          />
          <span
            style={{
              fontSize: "10px",
              fontWeight: 600,
              color: statusConfig.badgeColor,
            }}
          >
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          padding: "16px",
          backgroundColor: "#FFFFFF",
        }}
      >
        <ContentInformation status={user?.status_kepegawaian} userId={userId} />
      </div>
    </div>
  );

  return (
    <Popover
      overlayStyle={{
        width: 280,
        padding: 0,
      }}
      overlayInnerStyle={{
        padding: 0,
        borderRadius: "8px",
        overflow: "hidden",
      }}
      content={popoverContent}
      trigger="hover"
      placement="bottom"
      mouseEnterDelay={0.3}
      mouseLeaveDelay={0.1}
    >
      <div
        style={{
          position: "relative",
          display: "inline-block",
          cursor: "pointer",
          transition: "transform 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <Avatar
          style={{
            border: `2px solid ${statusConfig.borderColor}`,
            boxShadow: `0 2px 8px ${statusConfig.borderColor}20`,
            transition: "all 0.2s ease",
          }}
          size="large"
          {...props}
        />

        {/* Status indicator */}
        <div
          style={{
            position: "absolute",
            bottom: "-2px",
            right: "-2px",
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: statusConfig.badgeColor,
            border: "2px solid #FFFFFF",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
          }}
        />
      </div>
    </Popover>
  );
}

export default AvatarUser;
