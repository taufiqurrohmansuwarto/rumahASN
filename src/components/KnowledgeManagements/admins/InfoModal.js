import { UserOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { Avatar, Divider, Flex, Modal, Space, Tag, Tooltip, Typography } from "antd";
import dayjs from "dayjs";

const { Text } = Typography;

const InfoModal = ({ visible, onCancel, content }) => {
  return (
    <Modal
      title={
        <Space>
          <InfoCircleOutlined style={{ color: "#FF4500" }} />
          <span>Informasi Tim & Versi</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {/* Author Info */}
        <div
          style={{
            padding: "12px",
            backgroundColor: "#f8f9fa",
            borderRadius: "6px",
          }}
        >
          <Text
            strong
            style={{
              fontSize: "14px",
              color: "#1A1A1B",
              marginBottom: "8px",
              display: "block",
            }}
          >
            👤 Penulis
          </Text>
          <Flex align="center" gap="middle">
            <Avatar
              src={content.author?.image}
              icon={<UserOutlined />}
              size="large"
            />
            <div style={{ flex: 1 }}>
              <Text strong style={{ fontSize: "15px", display: "block" }}>
                {content.author?.username}
              </Text>
              {content.author?.nama_jabatan && (
                <Tooltip title={content.author?.perangkat_daerah_detail}>
                  <Text
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      cursor: "help",
                      display: "block",
                    }}
                  >
                    {content.author?.nama_jabatan}
                  </Text>
                </Tooltip>
              )}
              <Text
                style={{ fontSize: "11px", color: "#999", display: "block" }}
              >
                Dibuat pada{" "}
                {dayjs(content.created_at).format("DD MMMM YYYY, HH:mm")}
              </Text>
            </div>
          </Flex>
        </div>

        {/* Verifier Info */}
        {content.verified_by && content.user_verified && (
          <div
            style={{
              padding: "12px",
              backgroundColor: "#f8f9fa",
              borderRadius: "6px",
            }}
          >
            <Text
              strong
              style={{
                fontSize: "14px",
                color: "#1A1A1B",
                marginBottom: "8px",
                display: "block",
              }}
            >
              ✅ Verifikator
            </Text>
            <Flex align="center" gap="middle">
              <Avatar
                src={content.user_verified?.image}
                icon={<UserOutlined />}
                size="large"
              />
              <div style={{ flex: 1 }}>
                <Text strong style={{ fontSize: "15px", display: "block" }}>
                  {content.user_verified?.username}
                </Text>
                {content.user_verified?.nama_jabatan && (
                  <Tooltip
                    title={content.user_verified?.perangkat_daerah_detail}
                  >
                    <Text
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        cursor: "help",
                        display: "block",
                      }}
                    >
                      {content.user_verified?.nama_jabatan}
                    </Text>
                  </Tooltip>
                )}
                <Text
                  style={{
                    fontSize: "11px",
                    color: "#999",
                    display: "block",
                  }}
                >
                  Diverifikasi pada{" "}
                  {dayjs(content.verified_at).format("DD MMMM YYYY, HH:mm")}
                </Text>
              </div>
            </Flex>
            {content.reason && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "8px 12px",
                  backgroundColor: "#f6ffed",
                  borderRadius: "6px",
                  border: "1px solid #d9f7be",
                }}
              >
                <Text style={{ fontSize: "12px", color: "#52c41a" }}>
                  <strong>Catatan Verifikasi:</strong> {content.reason}
                </Text>
              </div>
            )}
          </div>
        )}

        {/* Versions Info */}
        {content.versions && content.versions.length > 0 && (
          <div
            style={{
              padding: "12px",
              backgroundColor: "#f8f9fa",
              borderRadius: "6px",
            }}
          >
            <Text
              strong
              style={{
                fontSize: "14px",
                color: "#1A1A1B",
                marginBottom: "12px",
                display: "block",
              }}
            >
              📝 Riwayat Versi ({content.versions.length})
            </Text>
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                {content.versions.map((version) => (
                  <div
                    key={version.id}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "white",
                      borderRadius: "4px",
                      border: "1px solid #e9ecef",
                    }}
                  >
                    <Flex align="center" justify="space-between">
                      <Flex align="center" gap="middle">
                        <Avatar
                          src={version.user_updated?.image}
                          icon={<UserOutlined />}
                          size="small"
                        />
                        <div>
                          <Space size="small">
                            <Tag color="orange">v{version.version}</Tag>
                            <Text strong style={{ fontSize: "13px" }}>
                              {version.user_updated?.username}
                            </Text>
                          </Space>
                        </div>
                      </Flex>
                      <Text style={{ fontSize: "11px", color: "#999" }}>
                        {dayjs(version.created_at).format("DD/MM/YY HH:mm")}
                      </Text>
                    </Flex>
                  </div>
                ))}
              </Space>
            </div>
          </div>
        )}
      </Space>
    </Modal>
  );
};

export default InfoModal;