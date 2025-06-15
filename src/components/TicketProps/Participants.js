import { Avatar, Space, Tooltip, Typography, Flex, Grid } from "antd";
import { UserOutlined, TeamOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import { useMemo } from "react";

const { Text } = Typography;
const { useBreakpoint } = Grid;

function Participants({ item }) {
  const router = useRouter();
  const screens = useBreakpoint();

  // Memoize responsive config
  const responsiveConfig = useMemo(() => {
    const isMobile = !screens.md;

    return {
      isMobile,
      maxDisplay: isMobile ? 3 : 5,
    };
  }, [screens.md]);

  const gotoDetailUser = (id) => {
    router.push(`/users/${id}`);
  };

  const participantCount = item?.participants?.length || 0;
  const hasParticipants = participantCount > 0;

  return (
    <Flex
      vertical
      gap={8}
      style={{
        padding: "12px 16px",
        borderRadius: 8,
        marginBottom: 16,
      }}
    >
      <Flex align="center" gap={8}>
        <TeamOutlined style={{ color: "#1890ff" }} />
        <Text strong style={{ color: "#1890ff" }}>
          👥 Peserta ({participantCount})
        </Text>
      </Flex>

      {hasParticipants ? (
        <Flex align="center" gap={12} wrap="wrap">
          <Avatar.Group
            maxCount={responsiveConfig.maxDisplay}
            maxStyle={{
              color: "#1890ff",
              backgroundColor: "#e6f7ff",
              cursor: "pointer",
              fontWeight: 600,
            }}
            size="default"
          >
            {item?.participants?.map((participant) => (
              <Tooltip
                title={
                  <Flex vertical gap={4}>
                    <Text style={{ color: "white", fontWeight: 600 }}>
                      {participant?.username || "User"}
                    </Text>
                    <Text style={{ color: "#d9d9d9", fontSize: 12 }}>
                      Klik untuk lihat profil
                    </Text>
                  </Flex>
                }
                key={participant?.custom_id}
                placement="top"
              >
                <Avatar
                  onClick={() => gotoDetailUser(participant?.custom_id)}
                  style={{
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  src={participant?.image}
                  icon={<UserOutlined />}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(24, 144, 255, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </Tooltip>
            ))}
          </Avatar.Group>

          {participantCount > responsiveConfig.maxDisplay && (
            <Text
              type="secondary"
              style={{
                fontSize: 12,
                fontStyle: "italic",
                color: "#8c8c8c",
              }}
            >
              dan {participantCount - responsiveConfig.maxDisplay} lainnya
            </Text>
          )}
        </Flex>
      ) : (
        <Flex
          justify="center"
          style={{
            padding: "16px 0",
            color: "#8c8c8c",
          }}
        >
          <Text type="secondary" style={{ fontSize: 12 }}>
            🤷‍♂️ Belum ada peserta
          </Text>
        </Flex>
      )}
    </Flex>
  );
}

export default Participants;
