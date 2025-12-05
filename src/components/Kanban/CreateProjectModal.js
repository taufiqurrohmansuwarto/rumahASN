import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  message,
  Space,
  Typography,
  Divider,
  Flex,
  Tag,
} from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconFolder,
  IconFileDescription,
  IconPalette,
  IconMoodSmile,
  IconEye,
  IconPlus,
  IconInfoCircle,
} from "@tabler/icons-react";
import { createProject } from "../../../services/kanban.services";

const { TextArea } = Input;
const { Text } = Typography;

const colorOptions = [
  { value: "#fa541c", label: "Orange", color: "#fa541c" },
  { value: "#3B82F6", label: "Biru", color: "#3B82F6" },
  { value: "#10B981", label: "Hijau", color: "#10B981" },
  { value: "#F59E0B", label: "Kuning", color: "#F59E0B" },
  { value: "#EF4444", label: "Merah", color: "#EF4444" },
  { value: "#8B5CF6", label: "Ungu", color: "#8B5CF6" },
  { value: "#EC4899", label: "Pink", color: "#EC4899" },
  { value: "#06B6D4", label: "Cyan", color: "#06B6D4" },
];

const iconOptions = [
  "📋",
  "🚀",
  "💼",
  "📊",
  "🎯",
  "⭐",
  "🔥",
  "💡",
  "📝",
  "🎨",
  "🛠️",
  "📦",
  "🏛️",
  "📑",
  "🗂️",
  "📁",
];

function CreateProjectModal({ open, onClose }) {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation(createProject, {
    onSuccess: () => {
      message.success("Project berhasil dibuat");
      queryClient.invalidateQueries(["kanban-projects"]);
      form.resetFields();
      onClose();
    },
    onError: (error) => {
      message.error(error?.response?.data?.message || "Gagal membuat project");
    },
  });

  const handleSubmit = (values) => {
    mutate(values);
  };

  return (
    <Modal
      title={
        <Flex gap={8} align="center">
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: "#fff7e6",
              border: "1px solid #ffd591",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconPlus size={18} color="#fa541c" />
          </div>
          <span>Buat Project Baru</span>
        </Flex>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={520}
      centered
    >
      <Divider style={{ margin: "16px 0" }} />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          icon: "📋",
          color: "#fa541c",
          visibility: "private",
        }}
        size="middle"
      >
        <Form.Item
          name="name"
          label={
            <Space size={4}>
              <IconFolder size={14} color="#fa541c" />
              <span>Nama Project</span>
            </Space>
          }
          rules={[{ required: true, message: "Nama project wajib diisi" }]}
        >
          <Input placeholder="Contoh: Pengembangan Aplikasi SIASN" />
        </Form.Item>

        <Form.Item
          name="description"
          label={
            <Space size={4}>
              <IconFileDescription size={14} color="#fa541c" />
              <span>Deskripsi</span>
            </Space>
          }
        >
          <TextArea
            rows={3}
            placeholder="Deskripsi singkat tentang project ini..."
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Flex gap={16}>
          <Form.Item
            name="icon"
            label={
              <Space size={4}>
                <IconMoodSmile size={14} color="#fa541c" />
                <span>Icon</span>
              </Space>
            }
            style={{ flex: 1 }}
          >
            <Select
              options={iconOptions.map((icon) => ({
                value: icon,
                label: <span style={{ fontSize: 20 }}>{icon}</span>,
              }))}
              optionLabelProp="label"
            />
          </Form.Item>

          <Form.Item
            name="color"
            label={
              <Space size={4}>
                <IconPalette size={14} color="#fa541c" />
                <span>Warna</span>
              </Space>
            }
            style={{ flex: 1 }}
          >
            <Select
              options={colorOptions.map((opt) => ({
                value: opt.value,
                label: (
                  <Flex gap={8} align="center">
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        backgroundColor: opt.color,
                      }}
                    />
                    <span>{opt.label}</span>
                  </Flex>
                ),
              }))}
            />
          </Form.Item>
        </Flex>

        <Form.Item
          name="visibility"
          label={
            <Space size={4}>
              <IconEye size={14} color="#fa541c" />
              <span>Visibilitas</span>
            </Space>
          }
        >
          <Select
            options={[
              {
                value: "private",
                label: "Private - Hanya anggota yang bisa akses",
              },
              {
                value: "team",
                label: "Team - Semua anggota tim bisa lihat",
              },
            ]}
          />
        </Form.Item>

        <div
          style={{
            padding: 12,
            backgroundColor: "#fffbe6",
            borderRadius: 8,
            border: "1px solid #ffe58f",
            marginBottom: 16,
          }}
        >
          <Flex gap={8} align="flex-start">
            <IconInfoCircle size={16} color="#faad14" style={{ marginTop: 2 }} />
            <div>
              <Text style={{ fontSize: 12 }}>
                Project akan dibuat dengan kolom default:{" "}
              </Text>
              <div style={{ marginTop: 4 }}>
                <Space size={4} wrap>
                  <Tag color="default">Rencana</Tag>
                  <Tag color="blue">Penugasan</Tag>
                  <Tag color="orange">Pelaksanaan</Tag>
                  <Tag color="purple">Pemeriksaan</Tag>
                  <Tag color="green">Selesai</Tag>
                </Space>
              </div>
              <Text type="secondary" style={{ fontSize: 11 }}>
                Anda dapat mengubahnya di menu Pengaturan.
              </Text>
            </div>
          </Flex>
        </div>

        <Flex justify="flex-end" gap={8}>
          <Button onClick={onClose}>Batal</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            icon={<IconPlus size={14} />}
            style={{
              backgroundColor: "#fa541c",
              borderColor: "#fa541c",
            }}
          >
            Buat Project
          </Button>
        </Flex>
      </Form>
    </Modal>
  );
}

export default CreateProjectModal;
