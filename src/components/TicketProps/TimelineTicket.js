import { formatDateFromNow } from "@/utils/client-utils";
import {
  LockOutlined,
  EditOutlined,
  AuditOutlined,
  UserSwitchOutlined,
  PushpinOutlined,
} from "@ant-design/icons";
import { Avatar, Typography, Grid, Flex } from "antd";
import Link from "next/link";
import { useMemo } from "react";

const { useBreakpoint } = Grid;
const { Text } = Typography;

const getIconConfig = (status) => {
  const baseStyle = {
    fontSize: 12,
    padding: 6,
    borderRadius: "50%",
    border: "2px solid",
    background: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 24,
    minHeight: 24,
  };

  const configs = {
    edited: {
      icon: <EditOutlined />,
      color: "#1890ff",
      borderColor: "#1890ff",
      bgColor: "#f0f9ff",
    },
    status_changed: {
      icon: <AuditOutlined />,
      color: "#52c41a",
      borderColor: "#52c41a",
      bgColor: "#f6ffed",
    },
    change_agent: {
      icon: <UserSwitchOutlined />,
      color: "#fa8c16",
      borderColor: "#fa8c16",
      bgColor: "#fff7e6",
    },
    pinned: {
      icon: <PushpinOutlined />,
      color: "#722ed1",
      borderColor: "#722ed1",
      bgColor: "#f9f0ff",
    },
    default: {
      icon: <LockOutlined />,
      color: "#8c8c8c",
      borderColor: "#d9d9d9",
      bgColor: "#fafafa",
    },
  };

  const config = configs[status] || configs.default;

  return {
    ...baseStyle,
    color: config.color,
    borderColor: config.borderColor,
    background: config.bgColor,
    icon: config.icon,
  };
};

const TimelineTicket = ({ timelineItems }) => {
  const screens = useBreakpoint();

  // Memoize responsive config
  const responsiveConfig = useMemo(() => {
    const isMobile = !screens.md;

    return {
      isMobile,
      avatarSize: isMobile ? 20 : 24,
      fontSize: isMobile ? 11 : 12,
      spacing: isMobile ? 8 : 12,
      leftPadding: isMobile ? 16 : 20,
    };
  }, [screens.md]);

  if (!timelineItems?.length) return null;

  return (
    <div
      style={{
        marginTop: 16,
        position: "relative",
        paddingLeft: 32,
      }}
    >
      {/* Main vertical line */}
      <div
        style={{
          position: "absolute",
          left: 11,
          top: 0,
          bottom: 0,
          width: 2,
          background: "#d1d9e0",
          zIndex: 1,
        }}
      />

      {timelineItems?.map((timeline, index) => {
        const iconConfig = getIconConfig(timeline?.status);
        const isLast = index === timelineItems.length - 1;

        return (
          <div
            key={timeline.custom_id}
            style={{
              position: "relative",
              paddingBottom: isLast ? 8 : 16,
              display: "flex",
              alignItems: "flex-start",
              minHeight: 32,
            }}
          >
            {/* Icon */}
            <div
              style={{
                position: "absolute",
                left: -1,
                top: 0,
                zIndex: 2,
                ...iconConfig,
              }}
            >
              {iconConfig.icon}
            </div>

            {/* Content */}
            <div
              style={{
                flex: 1,
                paddingTop: 2,
                marginLeft: 32,
              }}
            >
              <Flex
                align="center"
                gap={responsiveConfig.spacing}
                wrap="wrap"
                style={{
                  marginBottom: 6,
                }}
              >
                <Link href={`/users/${timeline?.user?.custom_id}`}>
                  <Avatar
                    size={responsiveConfig.avatarSize}
                    src={timeline?.user?.image}
                    style={{
                      border: "1px solid #e8e8e8",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#1890ff";
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e8e8e8";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  />
                </Link>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={{
                      fontSize: responsiveConfig.fontSize,
                      lineHeight: 1.5,
                      color: "#262626",
                    }}
                  >
                    <Link href={`/users/${timeline?.user?.custom_id}`}>
                      <Typography.Link
                        style={{
                          fontWeight: 600,
                          fontSize: responsiveConfig.fontSize,
                          color: "#1890ff",
                        }}
                      >
                        {timeline?.user?.username}
                      </Typography.Link>
                    </Link>{" "}
                    <span style={{ color: "#595959" }}>
                      {timeline?.comment}
                    </span>{" "}
                    <Text
                      type="secondary"
                      style={{
                        fontSize: responsiveConfig.fontSize - 1,
                        color: "#8c8c8c",
                      }}
                    >
                      {formatDateFromNow(timeline?.created_at)}
                    </Text>
                  </Text>
                </div>
              </Flex>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TimelineTicket;
