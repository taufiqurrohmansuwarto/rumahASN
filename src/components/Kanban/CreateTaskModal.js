import { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  message,
  Space,
  Divider,
  Flex,
  Tag,
} from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconPlus,
  IconFileDescription,
  IconLayoutKanban,
  IconFlag,
  IconCalendar,
  IconUser,
  IconTags,
  IconClock,
  IconClipboardList,
} from "@tabler/icons-react";
import { createTask } from "../../../services/kanban.services";
import AITaskAssist from "./AITaskAssist";

const { TextArea } = Input;

function CreateTaskModal({
  open,
  onClose,
  projectId,
  columnId,
  columns,
  members,
  labels,
}) {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [aiSubtasks, setAiSubtasks] = useState([]);

  const handleAIApply = (aiResult) => {
    // Apply AI suggestions
    if (aiResult.priority) {
      form.setFieldValue("priority", aiResult.priority);
    }
    if (aiResult.estimated_hours) {
      form.setFieldValue("estimated_hours", aiResult.estimated_hours);
    }
    if (aiResult.subtasks?.length > 0) {
      setAiSubtasks(aiResult.subtasks);
      message.success(
        `${aiResult.subtasks.length} subtask akan ditambahkan setelah task dibuat`
      );
    }
  };

  const { mutate, isLoading } = useMutation(
    (data) => createTask({ projectId, ...data }),
    {
      onSuccess: () => {
        const subtaskCount = aiSubtasks.length;
        message.success(
          subtaskCount > 0
            ? `Task berhasil dibuat dengan ${subtaskCount} subtask`
            : "Task berhasil dibuat"
        );
        queryClient.invalidateQueries(["kanban-tasks", projectId]);
        form.resetFields();
        setAiSubtasks([]);
        onClose();
      },
      onError: (error) => {
        message.error(error?.response?.data?.message || "Gagal membuat task");
      },
    }
  );

  const handleSubmit = (values) => {
    mutate({
      ...values,
      column_id: values.column_id || columnId,
      due_date: values.due_date?.format("YYYY-MM-DD"),
      label_ids: values.label_ids || [],
      ai_subtasks: aiSubtasks, // Will be used to create subtasks after task created
    });
  };

  const handleClose = () => {
    form.resetFields();
    setAiSubtasks([]);
    onClose();
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
            <IconClipboardList size={18} color="#fa541c" />
          </div>
          <span>Tambah Task Baru</span>
        </Flex>
      }
      open={open}
      onCancel={handleClose}
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
          column_id: columnId,
          priority: "medium",
        }}
        size="middle"
      >
        <Form.Item
          name="title"
          label={
            <Flex
              justify="space-between"
              align="center"
              style={{ width: "100%" }}
            >
              <Space size={4}>
                <IconClipboardList size={14} color="#fa541c" />
                <span>Judul Task</span>
              </Space>
              <AITaskAssist
                title={form.getFieldValue("title")}
                description={form.getFieldValue("description")}
                onApply={handleAIApply}
                disabled={!form.getFieldValue("title")}
              />
            </Flex>
          }
          rules={[{ required: true, message: "Judul task wajib diisi" }]}
        >
          <Input placeholder="Apa yang perlu dikerjakan?" />
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
            placeholder="Detail task..."
            showCount
            maxLength={1000}
          />
        </Form.Item>

        <Flex gap={16}>
          <Form.Item
            name="column_id"
            label={
              <Space size={4}>
                <IconLayoutKanban size={14} color="#fa541c" />
                <span>Kolom</span>
              </Space>
            }
            rules={[{ required: true, message: "Kolom wajib dipilih" }]}
            style={{ flex: 1 }}
          >
            <Select
              options={columns?.map((col) => ({
                value: col.id,
                label: (
                  <Flex gap={8} align="center">
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 3,
                        backgroundColor: col.color || "#8c8c8c",
                      }}
                    />
                    <span>{col.name}</span>
                  </Flex>
                ),
              }))}
            />
          </Form.Item>

          <Form.Item
            name="priority"
            label={
              <Space size={4}>
                <IconFlag size={14} color="#fa541c" />
                <span>Prioritas</span>
              </Space>
            }
            style={{ flex: 1 }}
          >
            <Select
              options={[
                { value: "low", label: "🟢 Rendah" },
                { value: "medium", label: "🟡 Sedang" },
                { value: "high", label: "🟠 Tinggi" },
                { value: "urgent", label: "🔴 Urgent" },
              ]}
            />
          </Form.Item>
        </Flex>

        <Flex gap={16}>
          <Form.Item
            name="due_date"
            label={
              <Space size={4}>
                <IconCalendar size={14} color="#fa541c" />
                <span>Deadline</span>
              </Space>
            }
            style={{ flex: 1 }}
          >
            <DatePicker
              style={{ width: "100%" }}
              placeholder="Pilih tanggal"
              format="DD MMM YYYY"
            />
          </Form.Item>

          <Form.Item
            name="assignee_ids"
            label={
              <Space size={4}>
                <IconUser size={14} color="#fa541c" />
                <span>Ditugaskan ke</span>
              </Space>
            }
            style={{ flex: 1 }}
          >
            <Select
              mode="multiple"
              allowClear
              showSearch
              placeholder="Pilih anggota"
              maxTagCount={2}
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={members?.map((m) => ({
                value: m.user?.custom_id,
                label: m.user?.username,
              }))}
            />
          </Form.Item>
        </Flex>

        <Form.Item
          name="label_ids"
          label={
            <Space size={4}>
              <IconTags size={14} color="#fa541c" />
              <span>Label</span>
            </Space>
          }
        >
          <Select
            mode="multiple"
            placeholder="Pilih label"
            options={labels?.map((l) => ({
              value: l.id,
              label: (
                <Flex gap={8} align="center">
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 3,
                      backgroundColor: l.color || "#8c8c8c",
                    }}
                  />
                  <span>{l.name}</span>
                </Flex>
              ),
            }))}
          />
        </Form.Item>

        <Form.Item
          name="estimated_hours"
          label={
            <Space size={4}>
              <IconClock size={14} color="#fa541c" />
              <span>Estimasi Waktu (jam)</span>
            </Space>
          }
        >
          <InputNumber
            min={0}
            step={0.5}
            placeholder="Contoh: 4"
            style={{ width: "100%" }}
          />
        </Form.Item>

        {/* AI Subtasks Preview */}
        {aiSubtasks.length > 0 && (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              backgroundColor: "#fff7e6",
              borderRadius: 8,
              border: "1px dashed #ffd591",
            }}
          >
            <Flex
              justify="space-between"
              align="center"
              style={{ marginBottom: 8 }}
            >
              <Space size={4}>
                <IconClipboardList size={14} color="#fa541c" />
                <span style={{ fontSize: 12, fontWeight: 500 }}>
                  Subtask dari AI ({aiSubtasks.length})
                </span>
              </Space>
              <Button
                type="text"
                size="small"
                danger
                onClick={() => setAiSubtasks([])}
                style={{ fontSize: 11 }}
              >
                Hapus semua
              </Button>
            </Flex>
            <Flex gap={4} wrap="wrap">
              {aiSubtasks.map((subtask, i) => (
                <Tag
                  key={i}
                  closable
                  onClose={() => {
                    setAiSubtasks((prev) => prev.filter((_, idx) => idx !== i));
                  }}
                >
                  {subtask.length > 30
                    ? subtask.substring(0, 30) + "..."
                    : subtask}
                </Tag>
              ))}
            </Flex>
          </div>
        )}

        <Divider style={{ margin: "16px 0" }} />

        <Flex justify="flex-end" gap={8}>
          <Button onClick={handleClose}>Batal</Button>
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
            Buat Task
          </Button>
        </Flex>
      </Form>
    </Modal>
  );
}

export default CreateTaskModal;
