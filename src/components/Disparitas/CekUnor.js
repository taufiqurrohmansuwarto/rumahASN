import { cekUnor } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Modal,
  Card,
  Typography,
  Divider,
  List,
  Tag,
  Space,
  Spin,
  Alert,
  Grid,
  Collapse,
} from "antd";
import {
  IdcardOutlined,
  BankOutlined,
  InfoCircleOutlined,
  TeamOutlined,
  SelectOutlined,
} from "@ant-design/icons";
import React, { useState } from "react";

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const CekUnorModal = ({ unorId, open, onCancel }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const { data, isLoading, error } = useQuery(
    ["cek-unor", unorId],
    () => cekUnor(unorId),
    {
      enabled: !!unorId,
      refetchOnWindowFocus: false,
    }
  );

  if (isLoading) {
    return (
      <Modal
        open={open}
        onCancel={onCancel}
        title="Cek Unor"
        footer={null}
        width={isMobile ? "95%" : 900}
      >
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Memuat data unit organisasi...</Text>
          </div>
        </div>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal
        open={open}
        onCancel={onCancel}
        title="Cek Unor"
        footer={null}
        width={isMobile ? "95%" : 900}
      >
        <Alert
          message="Error"
          description="Gagal memuat data unit organisasi"
          type="error"
          showIcon
        />
      </Modal>
    );
  }

  const renderSimilarUnor = (item, index) => (
    <List.Item
      key={item.id}
      style={{
        padding: isMobile ? "8px 0" : "12px 0",
        borderBottom:
          index === data?.similar_unor?.length - 1
            ? "none"
            : "1px solid #f0f0f0",
      }}
    >
      <List.Item.Meta
        avatar={
          <div
            style={{
              backgroundColor: "#f6f6f6",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BankOutlined style={{ color: "#1890ff", fontSize: 14 }} />
          </div>
        }
        title={
          <Space direction="vertical" size={2}>
            <Text strong style={{ fontSize: isMobile ? 13 : 14 }}>
              {item.nama_unor}
            </Text>
            <Tag color="blue" style={{ fontSize: 10 }}>
              {item.id}
            </Tag>
          </Space>
        }
        description={
          <Paragraph
            style={{
              margin: 0,
              fontSize: isMobile ? 11 : 12,
              color: "#666",
            }}
            ellipsis={{ rows: 2, expandable: true }}
          >
            {item.detail_unor}
          </Paragraph>
        }
      />
    </List.Item>
  );

  const collapseItems = [
    {
      key: "similar-units",
      label: (
        <Space>
          <TeamOutlined style={{ color: "#ff4500" }} />
          <Text strong style={{ color: "#262626" }}>
            Unit Organisasi Serupa ({data?.similar_unor?.length || 0})
          </Text>
        </Space>
      ),
      children: (
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          <List
            dataSource={data?.similar_unor}
            renderItem={renderSimilarUnor}
            style={{ padding: 0 }}
            size="small"
          />
        </div>
      ),
    },
  ];

  return (
    <>
      {data && (
        <Modal
          open={open}
          onCancel={onCancel}
          title={
            <Space>
              <InfoCircleOutlined />
              <span>Informasi Unit Organisasi</span>
            </Space>
          }
          footer={null}
          width={isMobile ? "95%" : 900}
          styles={{
            body: { padding: isMobile ? "16px" : "24px" },
          }}
        >
          <Space direction="vertical" size={20} style={{ width: "100%" }}>
            {/* Main Unit Info */}
            <Card
              size="small"
              style={{
                borderRadius: 8,
                border: "1px solid #d9d9d9",
              }}
            >
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      backgroundColor: "#ff4500",
                      borderRadius: "50%",
                      width: 48,
                      height: 48,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IdcardOutlined style={{ color: "white", fontSize: 20 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Title
                      level={isMobile ? 5 : 4}
                      style={{ margin: 0, color: "#262626" }}
                    >
                      Unit Organisasi Utama
                    </Title>
                  </div>
                </div>

                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      ID Unit:
                    </Text>
                    <br />
                    <Tag color="processing" style={{ fontFamily: "monospace" }}>
                      {data.id}
                    </Tag>
                  </div>

                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Nama Unit:
                    </Text>
                    <br />
                    <Text strong style={{ fontSize: isMobile ? 14 : 16 }}>
                      {data.nama_unor}
                    </Text>
                  </div>

                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Detail Lengkap:
                    </Text>
                    <br />
                    <Paragraph
                      style={{
                        margin: 0,
                        fontSize: isMobile ? 13 : 14,
                        color: "#595959",
                      }}
                    >
                      {data.detail_unor_nama}
                    </Paragraph>
                  </div>
                </Space>
              </Space>
            </Card>

            {/* Similar Units - Collapsible */}
            {data?.similar_unor && data?.similar_unor?.length > 0 && (
              <Collapse
                items={collapseItems}
                size="small"
                style={{
                  backgroundColor: "#fafafa",
                  border: "1px solid #d9d9d9",
                  borderRadius: 8,
                }}
              />
            )}
          </Space>
        </Modal>
      )}
    </>
  );
};

function CekUnor({ unorId }) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleCancel = () => {
    setOpen(false);
  };
  return (
    <div>
      <Button
        icon={<SelectOutlined />}
        onClick={handleOpen}
        type="link"
        style={{ padding: 0 }}
      />
      <CekUnorModal open={open} onCancel={handleCancel} unorId={unorId} />
    </div>
  );
}

export default CekUnor;
