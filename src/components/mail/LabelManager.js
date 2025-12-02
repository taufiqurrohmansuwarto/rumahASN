import {
  useCreateLabel,
  useDeleteLabel,
  useUpdateLabel,
  useUserLabels,
} from "@/hooks/useEmails";
import { Group, Paper, Stack, Text } from "@mantine/core";
import { IconPencil, IconPlus, IconTag, IconTrash } from "@tabler/icons-react";
import {
  Button,
  ColorPicker,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Tag,
  Tooltip,
} from "antd";
import { useState } from "react";

const LabelManager = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const [editingLabel, setEditingLabel] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data: labelsData, isLoading } = useUserLabels();
  const createMutation = useCreateLabel();
  const updateMutation = useUpdateLabel();
  const deleteMutation = useDeleteLabel();

  const labels = labelsData?.data || [];
  const systemLabels = labels.filter((label) => label.is_system);
  const customLabels = labels.filter((label) => !label.is_system);

  const handleCreate = async (values) => {
    const color = typeof values.color === "string" ? values.color : values.color?.toHexString?.() || "#1890ff";
    try {
      await createMutation.mutateAsync({ ...values, color });
      form.resetFields();
      setIsCreating(false);
    } catch (error) {}
  };

  const handleUpdate = async (values) => {
    const color = typeof values.color === "string" ? values.color : values.color?.toHexString?.() || "#1890ff";
    try {
      await updateMutation.mutateAsync({
        labelId: editingLabel.id,
        ...values,
        color,
      });
      form.resetFields();
      setEditingLabel(null);
    } catch (error) {}
  };

  const handleDelete = async (labelId) => {
    try {
      await deleteMutation.mutateAsync(labelId);
    } catch (error) {}
  };

  const handleEdit = (label) => {
    setEditingLabel(label);
    setIsCreating(true);
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

  const LabelItem = ({ label }) => (
    <Group
      justify="space-between"
      py={6}
      px={8}
      style={{
        borderRadius: 4,
        "&:hover": { backgroundColor: "#f8f9fa" },
      }}
    >
      <Group gap={8}>
        <IconTag size={14} style={{ color: label.color }} />
        <Text size="xs">{label.name}</Text>
        {label.is_system && (
          <Tag color="default" style={{ fontSize: 10, padding: "0 4px", margin: 0 }}>
            System
          </Tag>
        )}
      </Group>
      {!label.is_system && (
        <Group gap={4}>
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<IconPencil size={12} />}
              onClick={() => handleEdit(label)}
              style={{ padding: 4, height: 22, width: 22 }}
            />
          </Tooltip>
          <Popconfirm
            title="Hapus label?"
            onConfirm={() => handleDelete(label.id)}
            okText="Ya"
            cancelText="Batal"
          >
            <Tooltip title="Hapus">
              <Button
                type="text"
                size="small"
                danger
                icon={<IconTrash size={12} />}
                style={{ padding: 4, height: 22, width: 22 }}
              />
            </Tooltip>
          </Popconfirm>
        </Group>
      )}
    </Group>
  );

  return (
    <Modal
      title={
        <Space size={8}>
          <IconTag size={16} />
          <span>Kelola Label</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={400}
      footer={
        <Space>
          <Button size="small" onClick={onClose}>
            Tutup
          </Button>
        </Space>
      }
    >
      <Stack gap="sm">
        {/* Create/Edit Form */}
        {isCreating ? (
          <Paper p="sm" withBorder radius="sm" bg="gray.0">
            <Text size="xs" fw={500} mb={8}>
              {editingLabel ? "Edit Label" : "Buat Label"}
            </Text>
            <Form
              form={form}
              layout="vertical"
              size="small"
              onFinish={editingLabel ? handleUpdate : handleCreate}
            >
              <Group grow align="flex-start">
                <Form.Item
                  name="name"
                  rules={[{ required: true, message: "Wajib" }]}
                  style={{ marginBottom: 8 }}
                >
                  <Input placeholder="Nama label" />
                </Form.Item>
                <Form.Item
                  name="color"
                  initialValue="#1890ff"
                  style={{ marginBottom: 8, maxWidth: 100 }}
                >
                  <ColorPicker
                    size="small"
                    format="hex"
                    presets={[
                      {
                        label: "Warna",
                        colors: [
                          "#ff4d4f",
                          "#fa8c16",
                          "#52c41a",
                          "#1890ff",
                          "#722ed1",
                          "#eb2f96",
                        ],
                      },
                    ]}
                  />
                </Form.Item>
              </Group>
              <Space>
                <Button
                  size="small"
                  type="primary"
                  htmlType="submit"
                  loading={createMutation.isLoading || updateMutation.isLoading}
                >
                  {editingLabel ? "Simpan" : "Buat"}
                </Button>
                <Button size="small" onClick={handleCancel}>
                  Batal
                </Button>
              </Space>
            </Form>
          </Paper>
        ) : (
          <Button
            size="small"
            icon={<IconPlus size={14} />}
            onClick={() => setIsCreating(true)}
            block
          >
            Buat Label
          </Button>
        )}

        {/* Labels List */}
        <Paper withBorder radius="sm" p={0} style={{ maxHeight: 300, overflowY: "auto" }}>
          {systemLabels.length > 0 && (
            <>
              <Text size="xs" c="dimmed" px={8} pt={8} pb={4}>
                SYSTEM
              </Text>
              {systemLabels.map((label) => (
                <LabelItem key={label.id} label={label} />
              ))}
            </>
          )}
          {customLabels.length > 0 && (
            <>
              <Text size="xs" c="dimmed" px={8} pt={8} pb={4}>
                CUSTOM
              </Text>
              {customLabels.map((label) => (
                <LabelItem key={label.id} label={label} />
              ))}
            </>
          )}
          {customLabels.length === 0 && systemLabels.length === 0 && (
            <Text size="xs" c="dimmed" ta="center" py="md">
              Belum ada label
            </Text>
          )}
        </Paper>
      </Stack>
    </Modal>
  );
};

export default LabelManager;
