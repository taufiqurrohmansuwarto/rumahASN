import {
  useCreateLabel,
  useDeleteLabel,
  useUpdateLabel,
  useUserLabels,
} from "@/hooks/useEmails";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  TagOutlined,
} from "@ant-design/icons";
import {
  Button,
  ColorPicker,
  Empty,
  Form,
  Input,
  List,
  Modal,
  Popconfirm,
  Space,
  Tag,
  Typography,
} from "antd";
import { useState } from "react";

const { Text } = Typography;

const LabelManager = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const [editingLabel, setEditingLabel] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Hooks
  const { data: labelsData, isLoading } = useUserLabels();
  const createMutation = useCreateLabel();
  const updateMutation = useUpdateLabel();
  const deleteMutation = useDeleteLabel();

  const labels = labelsData?.data || [];
  const systemLabels = labels.filter((label) => label.is_system);
  const customLabels = labels.filter((label) => !label.is_system);

  const handleCreate = async (values) => {
    try {
      await createMutation.mutateAsync(values);
      form.resetFields();
      setIsCreating(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleUpdate = async (values) => {
    try {
      await updateMutation.mutateAsync({
        labelId: editingLabel.id,
        ...values,
      });
      form.resetFields();
      setEditingLabel(null);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = async (labelId) => {
    try {
      await deleteMutation.mutateAsync(labelId);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleEdit = (label) => {
    setEditingLabel(label);
    form.setFieldsValue({
      name: label.name,
      color: label.color,
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setEditingLabel(null);
    setIsCreating(false);
  };

  const renderLabelItem = (label) => (
    <List.Item
      key={label.id}
      actions={
        !label.is_system
          ? [
              <Button
                key="edit"
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEdit(label)}
                title="Edit label"
              />,
              <Popconfirm
                key="delete"
                title="Hapus label ini?"
                description="Label akan dihapus dari semua email"
                onConfirm={() => handleDelete(label.id)}
                okText="Ya"
                cancelText="Batal"
              >
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  danger
                  title="Hapus label"
                />
              </Popconfirm>,
            ]
          : [
              <Text key="system" type="secondary" style={{ fontSize: "12px" }}>
                System
              </Text>,
            ]
      }
    >
      <List.Item.Meta
        avatar={
          <TagOutlined style={{ color: label.color, fontSize: "16px" }} />
        }
        title={
          <Space>
            <Text strong>{label.name}</Text>
            {label.is_system && (
              <Tag size="small" color="blue">
                System
              </Tag>
            )}
          </Space>
        }
        description={
          <Space>
            <div
              style={{
                width: "16px",
                height: "16px",
                backgroundColor: label.color,
                borderRadius: "3px",
                border: "1px solid #d9d9d9",
              }}
            />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {label.color}
            </Text>
          </Space>
        }
      />
    </List.Item>
  );

  return (
    <Modal
      title="Kelola Label"
      open={visible}
      onCancel={onClose}
      width={600}
      footer={[
        <Button key="close" onClick={onClose}>
          Tutup
        </Button>,
      ]}
    >
      <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
        {/* Create/Edit Form */}
        {(isCreating || editingLabel) && (
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          >
            <Text
              strong
              style={{
                fontSize: "16px",
                marginBottom: "12px",
                display: "block",
              }}
            >
              {editingLabel ? "Edit Label" : "Buat Label Baru"}
            </Text>

            <Form
              form={form}
              layout="vertical"
              onFinish={editingLabel ? handleUpdate : handleCreate}
            >
              <Form.Item
                name="name"
                label="Nama Label"
                rules={[
                  { required: true, message: "Nama label harus diisi" },
                  { min: 2, message: "Nama label minimal 2 karakter" },
                  { max: 50, message: "Nama label maksimal 50 karakter" },
                ]}
              >
                <Input placeholder="Masukkan nama label..." />
              </Form.Item>

              <Form.Item
                name="color"
                label="Warna Label"
                initialValue="#1890ff"
              >
                <ColorPicker
                  showText
                  format="hex"
                  presets={[
                    {
                      label: "Recommended",
                      colors: [
                        "#ff4d4f", // Red
                        "#fa8c16", // Orange
                        "#faad14", // Gold
                        "#52c41a", // Green
                        "#1890ff", // Blue
                        "#722ed1", // Purple
                        "#eb2f96", // Magenta
                        "#13c2c2", // Cyan
                      ],
                    },
                  ]}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={
                      createMutation.isLoading || updateMutation.isLoading
                    }
                  >
                    {editingLabel ? "Perbarui" : "Buat"}
                  </Button>
                  <Button onClick={handleCancel}>Batal</Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}

        {/* Create Button */}
        {!isCreating && !editingLabel && (
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => setIsCreating(true)}
            block
            style={{ marginBottom: "16px" }}
          >
            Buat Label Baru
          </Button>
        )}

        {/* System Labels */}
        {systemLabels.length > 0 && (
          <>
            <Text strong style={{ fontSize: "14px", color: "#8c8c8c" }}>
              LABEL SYSTEM
            </Text>
            <List
              size="small"
              dataSource={systemLabels}
              renderItem={renderLabelItem}
              style={{ marginBottom: "16px" }}
            />
          </>
        )}

        {/* Custom Labels */}
        <Text strong style={{ fontSize: "14px", color: "#8c8c8c" }}>
          LABEL CUSTOM
        </Text>
        {customLabels.length > 0 ? (
          <List
            size="small"
            dataSource={customLabels}
            renderItem={renderLabelItem}
            loading={isLoading}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Belum ada label custom"
            style={{ margin: "20px 0" }}
          />
        )}
      </div>
    </Modal>
  );
};

export default LabelManager;
