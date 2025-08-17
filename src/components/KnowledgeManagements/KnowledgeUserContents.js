import {
  getKnowledgeContents,
  deleteKnowledgeContent,
} from "@/services/knowledge-management.services";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  List,
  Button,
  Tag,
  Space,
  Typography,
  Avatar,
  Divider,
  Modal,
  message,
  Tooltip,
  Row,
  Col,
  Input,
  Select,
  Empty,
  Skeleton,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileOutlined,
  LikeOutlined,
  MessageOutlined,
  SearchOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import moment from "moment";
import KnowledgeFormUserContents from "./KnowledgeFormUserContents";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

const KnowledgeUserContents = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery(
    ["fetch-knowledge-user-contents", { search, status }],
    () => getKnowledgeContents({ search, status }),
    {
      keepPreviousData: true,
    }
  );

  const { mutate: deleteMutation } = useMutation(
    (id) => deleteKnowledgeContent(id),
    {
      onSuccess: () => {
        message.success("Konten berhasil dihapus!");
        queryClient.invalidateQueries(["fetch-knowledge-user-contents"]);
      },
      onError: (error) => {
        message.error("Gagal menghapus konten: " + error.message);
      },
    }
  );

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = (item) => {
    Modal.confirm({
      title: "Hapus Konten",
      content: `Apakah Anda yakin ingin menghapus "${item.title}"?`,
      okText: "Hapus",
      okType: "danger",
      cancelText: "Batal",
      onOk: () => deleteMutation(item.id),
    });
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "green";
      case "pending":
        return "orange";
      case "draft":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "published":
        return "Dipublikasi";
      case "pending":
        return "Menunggu Review";
      case "draft":
        return "Draft";
      default:
        return status;
    }
  };

  const renderContent = (content) => {
    // Strip HTML tags for preview
    const stripped = content.replace(/<[^>]*>/g, "");
    return stripped.length > 150
      ? stripped.substring(0, 150) + "..."
      : stripped;
  };

  if (showForm) {
    return (
      <KnowledgeFormUserContents
        initialData={editingItem}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <div>
      <Card>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 16 }}
        >
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              Konten Knowledge Saya
            </Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowForm(true)}
            >
              Buat Konten Baru
            </Button>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} md={12} lg={8}>
            <Search
              placeholder="Cari konten..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onSearch={setSearch}
              enterButton={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Select
              placeholder="Filter status"
              value={status}
              onChange={setStatus}
              style={{ width: "100%" }}
              allowClear
            >
              <Option value="">Semua Status</Option>
              <Option value="draft">Draft</Option>
              <Option value="pending">Menunggu Review</Option>
              <Option value="published">Dipublikasi</Option>
            </Select>
          </Col>
        </Row>

        <Divider />

        {isLoading ? (
          <List
            itemLayout="vertical"
            dataSource={[1, 2, 3]}
            renderItem={() => (
              <List.Item>
                <Skeleton active avatar paragraph={{ rows: 2 }} />
              </List.Item>
            )}
          />
        ) : error ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Text type="danger">Gagal memuat data: {error.message}</Text>
          </div>
        ) : !data?.data || data.data.length === 0 ? (
          <Empty
            description="Belum ada konten knowledge"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => setShowForm(true)}>
              Buat Konten Pertama
            </Button>
          </Empty>
        ) : (
          <List
            itemLayout="vertical"
            dataSource={data.data}
            pagination={{
              current: data.pagination?.page || 1,
              total: data.pagination?.total || 0,
              pageSize: data.pagination?.limit || 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} dari ${total} item`,
            }}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                actions={[
                  <Space key="actions">
                    <Tooltip title="Lihat">
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => {
                          // Implementasi view detail
                          console.log("View:", item.id);
                        }}
                      />
                    </Tooltip>
                    <Tooltip title="Edit">
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(item)}
                      />
                    </Tooltip>
                    <Tooltip title="Hapus">
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(item)}
                      />
                    </Tooltip>
                  </Space>,
                ]}
                extra={
                  item.file_url && (
                    <Tooltip title="Ada file lampiran">
                      <FileOutlined
                        style={{ fontSize: 16, color: "#1890ff" }}
                      />
                    </Tooltip>
                  )
                }
              >
                <List.Item.Meta
                  avatar={
                    <Avatar size="large" style={{ backgroundColor: "#1890ff" }}>
                      {item.title.charAt(0).toUpperCase()}
                    </Avatar>
                  }
                  title={
                    <Space direction="vertical" size={4}>
                      <Space>
                        <Text strong style={{ fontSize: 16 }}>
                          {item.title}
                        </Text>
                        <Tag color={getStatusColor(item.status)}>
                          {getStatusText(item.status)}
                        </Tag>
                      </Space>
                      <Space size={16}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {moment(item.created_at).format("DD MMM YYYY, HH:mm")}
                        </Text>
                        {item.category && (
                          <Tag color="blue" style={{ fontSize: 11 }}>
                            {item.category.name}
                          </Tag>
                        )}
                      </Space>
                    </Space>
                  }
                  description={
                    <div>
                      <Paragraph
                        style={{ margin: "8px 0", color: "#666" }}
                        ellipsis={{ rows: 2 }}
                      >
                        {renderContent(item.content)}
                      </Paragraph>

                      {item.tags && item.tags.length > 0 && (
                        <div style={{ marginBottom: 8 }}>
                          {item.tags.map((tag, index) => (
                            <Tag
                              key={index}
                              size="small"
                              style={{ margin: "2px" }}
                            >
                              {tag}
                            </Tag>
                          ))}
                        </div>
                      )}

                      <Space>
                        <Space size={4}>
                          <EyeOutlined style={{ color: "#666" }} />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {item.views_count || 0}
                          </Text>
                        </Space>
                        <Space size={4}>
                          <LikeOutlined style={{ color: "#666" }} />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {item.likes_count || 0}
                          </Text>
                        </Space>
                        <Space size={4}>
                          <MessageOutlined style={{ color: "#666" }} />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {item.comments_count || 0}
                          </Text>
                        </Space>
                      </Space>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default KnowledgeUserContents;
