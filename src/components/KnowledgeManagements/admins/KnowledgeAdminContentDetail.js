import React, { useState } from "react";
import {
  Card,
  Flex,
  Grid,
  Typography,
  Tag,
  Avatar,
  Space,
  Button,
  Select,
  Spin,
  Empty,
} from "antd";
import {
  EditOutlined,
  EyeOutlined,
  UserOutlined,
  CalendarOutlined,
  EyeFilled,
  LikeFilled,
  MessageFilled,
  BookOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import {
  useAdminContentDetail,
  useUpdateContentStatus,
} from "@/hooks/knowledge-management/useAdminContentDetail";
import KnowledgeFormUserContents from "../forms/KnowledgeFormUserContents";
import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const KnowledgeAdminContentDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [editContentMode, setEditContentMode] = useState(false);
  const [editStatusMode, setEditStatusMode] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);

  // Responsive breakpoints
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Hooks
  const { data: content, isLoading, isError } = useAdminContentDetail(id);
  const updateStatusMutation = useUpdateContentStatus();

  // Status options
  const statusOptions = [
    { value: "draft", label: "Draft", color: "#d9d9d9" },
    { value: "published", label: "Published", color: "#52c41a" },
    { value: "rejected", label: "Rejected", color: "#ff4d4f" },
    { value: "archived", label: "Archived", color: "#fa8c16" },
  ];

  const getStatusInfo = (status) => {
    return (
      statusOptions.find((opt) => opt.value === status) || statusOptions[0]
    );
  };

  const handleStatusUpdate = async () => {
    if (selectedStatus && selectedStatus !== content.status) {
      await updateStatusMutation.mutateAsync({
        id: content.id,
        status: selectedStatus,
      });
      setEditStatusMode(false);
      setSelectedStatus(null);
    }
  };

  const handleEditContentToggle = () => {
    setEditContentMode(!editContentMode);
  };

  const handleEditStatusToggle = () => {
    if (editStatusMode) {
      setSelectedStatus(null);
    } else {
      setSelectedStatus(content?.status);
    }
    setEditStatusMode(!editStatusMode);
  };

  const handleContentUpdateSuccess = () => {
    setEditContentMode(false);
  };


  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !content) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <Empty description="Konten tidak ditemukan atau gagal dimuat" />
      </div>
    );
  }

  return (
    <>
      <div style={{ padding: isMobile ? "12px" : "16px" }}>
        <Card
          style={{
            marginBottom: isMobile ? "16px" : "24px",
            borderRadius: isMobile ? "8px" : "12px",
            border: "1px solid #EDEFF1",
          }}
          styles={{ body: { padding: 0 } }}
        >
          <Flex>
            {/* Icon Section - sama seperti KnowledgeFormUserContents */}
            {!isMobile && (
              <div
                style={{
                  width: "40px",
                  backgroundColor: "#F8F9FA",
                  borderRight: "1px solid #EDEFF1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: editContentMode ? "700px" : "500px",
                }}
              >
                <BookOutlined style={{ color: "#FF4500", fontSize: "18px" }} />
              </div>
            )}

            {/* Content Section */}
            <div style={{ flex: 1, padding: isMobile ? "12px" : "16px" }}>
              <div style={{ marginBottom: isMobile ? "16px" : "20px" }}>
                <Title
                  level={isMobile ? 5 : 4}
                  style={{
                    margin: 0,
                    color: "#1A1A1B",
                    lineHeight: isMobile ? "1.3" : "1.4",
                  }}
                >
                  📋 {editContentMode ? "Edit Konten Knowledge" : "Detail Konten Knowledge"}
                </Title>
                <Text
                  style={{
                    color: "#787C7E",
                    fontSize: isMobile ? "12px" : "14px",
                    lineHeight: isMobile ? "1.3" : "1.4",
                  }}
                >
                  {editContentMode 
                    ? "Perbarui informasi konten knowledge" 
                    : "Informasi lengkap konten knowledge"}
                </Text>
              </div>

              {editContentMode ? (
                <div>
                  <Flex justify="space-between" align="center" style={{ marginBottom: "16px" }}>
                    <Text strong>Mode Edit</Text>
                    <Button onClick={handleEditContentToggle}>
                      Batal Edit
                    </Button>
                  </Flex>
                  <KnowledgeFormUserContents
                    initialData={content}
                    onSuccess={handleContentUpdateSuccess}
                    onCancel={handleEditContentToggle}
                  />
                </div>
              ) : (
                <div>
                  <Flex justify="space-between" align="center" style={{ marginBottom: "24px" }}>
                    <div>
                      <Text strong>Mode Baca</Text>
                      <br />
                      <Tag color={getStatusInfo(content.status).color} style={{ marginTop: "4px" }}>
                        {getStatusInfo(content.status).label}
                      </Tag>
                    </div>
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={handleEditContentToggle}
                      style={{ 
                        backgroundColor: "#FF4500", 
                        borderColor: "#FF4500",
                        borderRadius: "6px"
                      }}
                    >
                      {!isMobile && "Edit Konten"}
                    </Button>
                  </Flex>
                  <Space
                    direction="vertical"
                    size="large"
                    style={{ width: "100%" }}
                  >
                    {/* Title */}
                    <Title
                      level={isMobile ? 3 : 2}
                      style={{
                        margin: 0,
                        color: "#1A1A1B",
                        lineHeight: "1.4",
                      }}
                    >
                      {content.title}
                    </Title>

                    {/* Author & Meta Info */}
                    <Flex
                      justify="space-between"
                      align={isMobile ? "flex-start" : "center"}
                      vertical={isMobile}
                      gap="middle"
                    >
                      <Flex align="center" gap="middle">
                        <div style={{ position: "relative" }}>
                          <Avatar
                            size={isMobile ? 40 : 48}
                            src={content.author?.image}
                            icon={<UserOutlined />}
                            style={{ border: "2px solid #f0f0f0" }}
                          />
                          {content.author?.is_online && (
                            <div
                              style={{
                                position: "absolute",
                                bottom: "2px",
                                right: "2px",
                                width: "12px",
                                height: "12px",
                                backgroundColor: "#52c41a",
                                border: "2px solid white",
                                borderRadius: "50%",
                              }}
                            />
                          )}
                        </div>
                        <div>
                          <Text
                            strong
                            style={{ fontSize: "16px", color: "#1A1A1B" }}
                          >
                            {content.author?.username}
                          </Text>
                          <br />
                          <Text style={{ color: "#8c8c8c", fontSize: "14px" }}>
                            <CalendarOutlined style={{ marginRight: "4px" }} />
                            {dayjs(content.created_at).format("DD MMM YYYY, HH:mm")}
                          </Text>
                        </div>
                      </Flex>

                      {/* Stats */}
                      <Space size="large">
                        <Flex align="center" gap="small">
                          <EyeFilled style={{ color: "#1890ff" }} />
                          <Text strong>{content.views_count || 0}</Text>
                        </Flex>
                        <Flex align="center" gap="small">
                          <LikeFilled style={{ color: "#52c41a" }} />
                          <Text strong>{content.likes_count || 0}</Text>
                        </Flex>
                        <Flex align="center" gap="small">
                          <MessageFilled style={{ color: "#fa8c16" }} />
                          <Text strong>{content.comments_count || 0}</Text>
                        </Flex>
                      </Space>
                    </Flex>

                    {/* Category */}
                    {content.category && (
                      <div>
                        <Tag
                          style={{
                            backgroundColor: "#FF4500",
                            color: "white",
                            border: "none",
                            borderRadius: "12px",
                            fontSize: "13px",
                            padding: "4px 12px",
                          }}
                        >
                          {content.category.name}
                        </Tag>
                      </div>
                    )}

                    {/* Content */}
                    {content.content && (
                      <div
                        style={{
                          padding: isMobile ? "16px" : "24px",
                          backgroundColor: "#fafafa",
                          borderRadius: "8px",
                          border: "1px solid #f0f0f0",
                        }}
                      >
                        <ReactMarkdownCustom>{content.content}</ReactMarkdownCustom>
                      </div>
                    )}

                    {/* Tags */}
                    {content.tags && content.tags.length > 0 && (
                      <div>
                        <Text
                          strong
                          style={{ marginBottom: "8px", display: "block" }}
                        >
                          Tags:
                        </Text>
                        <Space wrap>
                          {content.tags.map((tag, index) => (
                            <Tag
                              key={index}
                              style={{
                                borderRadius: "12px",
                                backgroundColor: "#f5f5f5",
                                border: "1px solid #e8e8e8",
                                color: "#595959",
                              }}
                            >
                              {tag}
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    )}
                  </Space>
                </div>
              )}
            </div>
          </Flex>
        </Card>

        {/* Status Management Section - sama seperti KnowledgeFormUserContents */}
        <Card
          style={{
            marginBottom: isMobile ? "16px" : "24px",
            borderRadius: isMobile ? "8px" : "12px",
            border: "1px solid #EDEFF1",
          }}
          styles={{ body: { padding: 0 } }}
        >
          <Flex>
            {!isMobile && (
              <div
                style={{
                  width: "40px",
                  backgroundColor: "#F8F9FA",
                  borderRight: "1px solid #EDEFF1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "200px",
                }}
              >
                <EyeOutlined style={{ color: "#FF4500", fontSize: "18px" }} />
              </div>
            )}

            <div style={{ flex: 1, padding: isMobile ? "12px" : "16px" }}>
              <div style={{ marginBottom: isMobile ? "16px" : "20px" }}>
                <Title
                  level={isMobile ? 5 : 4}
                  style={{
                    margin: 0,
                    color: "#1A1A1B",
                    lineHeight: isMobile ? "1.3" : "1.4",
                  }}
                >
                  ⚙️ Manajemen Status
                </Title>
                <Text
                  style={{
                    color: "#787C7E",
                    fontSize: isMobile ? "12px" : "14px",
                    lineHeight: isMobile ? "1.3" : "1.4",
                  }}
                >
                  Kelola status publikasi konten knowledge
                </Text>
              </div>

              {editStatusMode ? (
                <div>
                  <Flex justify="space-between" align="center" style={{ marginBottom: "16px" }}>
                    <Text strong>Mode Edit Status</Text>
                    <Button onClick={handleEditStatusToggle}>
                      Batal Edit
                    </Button>
                  </Flex>
                  
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <div>
                      <Text style={{ display: "block", marginBottom: "8px", color: "#666" }}>
                        Status saat ini: <Tag color={getStatusInfo(content.status).color}>{getStatusInfo(content.status).label}</Tag>
                      </Text>
                      <Text style={{ display: "block", marginBottom: "8px" }}>Pilih status baru:</Text>
                      <Select
                        value={selectedStatus}
                        onChange={setSelectedStatus}
                        style={{ width: "100%", maxWidth: "300px" }}
                        size="large"
                        placeholder="Pilih status baru"
                        options={statusOptions.map((option) => ({
                          ...option,
                          label: (
                            <span>
                              <Tag color={option.color} size="small" style={{ marginRight: "8px" }}>●</Tag>
                              {option.label}
                            </span>
                          ),
                        }))}
                      />
                    </div>
                    
                    <Button
                      type="primary"
                      onClick={handleStatusUpdate}
                      loading={updateStatusMutation.isPending}
                      disabled={!selectedStatus || selectedStatus === content.status}
                      style={{
                        backgroundColor: "#52c41a",
                        borderColor: "#52c41a",
                        borderRadius: "6px"
                      }}
                    >
                      Simpan Status
                    </Button>
                  </Space>
                </div>
              ) : (
                <div>
                  <Flex justify="space-between" align="center" style={{ marginBottom: "16px" }}>
                    <div>
                      <Text strong>Mode Baca</Text>
                      <br />
                      <Tag color={getStatusInfo(content.status).color} style={{ marginTop: "4px" }}>
                        {getStatusInfo(content.status).label}
                      </Tag>
                    </div>
                    <Button
                      type="primary"
                      onClick={handleEditStatusToggle}
                      style={{ 
                        backgroundColor: "#FF4500", 
                        borderColor: "#FF4500",
                        borderRadius: "6px"
                      }}
                    >
                      {!isMobile && "Ubah Status"}
                    </Button>
                  </Flex>
                  
                  <Text style={{ color: "#787C7E", fontSize: isMobile ? "12px" : "14px" }}>
                    Status konten ini adalah <strong>{getStatusInfo(content.status).label.toLowerCase()}</strong>. 
                    Klik tombol "Ubah Status" untuk mengubah status publikasi.
                  </Text>
                </div>
              )}
            </div>
          </Flex>
        </Card>
      </div>

      <style jsx global>{`
        .ant-card {
          transition: all 0.3s ease !important;
          overflow: hidden !important;
          border-radius: 8px !important;
        }

        .ant-card:hover {
          border-color: #ff4500 !important;
          box-shadow: 0 2px 8px rgba(255, 69, 0, 0.15) !important;
        }

        .ant-card .ant-card-body {
          padding: 0 !important;
          border-radius: inherit !important;
        }

        .ant-card .ant-card-body > div:first-child {
          border-top-left-radius: inherit !important;
          border-bottom-left-radius: inherit !important;
        }

        .ant-card .ant-card-body > div:first-child > div:last-child {
          border-top-right-radius: inherit !important;
          border-bottom-right-radius: inherit !important;
        }

        .ant-input:focus,
        .ant-input-focused {
          border-color: #ff4500 !important;
          box-shadow: 0 0 0 2px rgba(255, 69, 0, 0.2) !important;
        }

        .ant-input:hover {
          border-color: #ff4500 !important;
        }
      `}</style>
    </>
  );
};

export default KnowledgeAdminContentDetail;
