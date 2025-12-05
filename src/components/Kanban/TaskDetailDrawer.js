import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Drawer,
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Tabs,
  Tag,
  Space,
  Avatar,
  Spin,
  Typography,
  Popconfirm,
  Flex,
  Divider,
  Tooltip,
} from "antd";
import {
  IconX,
  IconCalendar,
  IconUser,
  IconFlag,
  IconTag,
  IconTrash,
  IconSubtask,
  IconMessage,
  IconPaperclip,
  IconClock,
  IconEdit,
  IconCheck,
  IconHistory,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import {
  getTask,
  updateTask,
  deleteTask,
  getLabels,
} from "../../../services/kanban.services";
import PriorityBadge from "./PriorityBadge";
import LabelBadge from "./LabelBadge";
import DueDateBadge from "./DueDateBadge";
import TaskSubtasks from "./TaskSubtasks";
import TaskComments from "./TaskComments";
import TaskAttachments from "./TaskAttachments";
import TaskTimeEntries from "./TaskTimeEntries";
import TaskActivities from "./TaskActivities";

const { TextArea } = Input;
const { Text, Title } = Typography;

function TaskDetailDrawer({ taskId, projectId, open, onClose, members }) {
  const [activeTab, setActiveTab] = useState("subtasks");
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: task, isLoading } = useQuery(
    ["kanban-task", taskId],
    () => getTask(taskId),
    { enabled: !!taskId && open }
  );

  const { data: labels } = useQuery(
    ["kanban-labels", projectId],
    () => getLabels(projectId),
    { enabled: !!projectId && open }
  );

  // Reset form when task changes
  useEffect(() => {
    if (task && isEditing) {
      form.setFieldsValue({
        title: task.title,
        description: task.description,
        priority: task.priority,
        due_date: task.due_date ? dayjs(task.due_date) : null,
        assignee_ids: task.assignees?.map((a) => a.custom_id) || [],
        label_ids: task.labels?.map((l) => l.id) || [],
      });
    }
  }, [task, isEditing, form]);

  const { mutate: update, isLoading: isUpdating } = useMutation(
    (data) => updateTask({ taskId, ...data }),
    {
      onSuccess: () => {
        message.success("Task berhasil diupdate");
        queryClient.invalidateQueries(["kanban-task", taskId]);
        queryClient.invalidateQueries(["kanban-tasks"]);
        setIsEditing(false);
      },
      onError: () => message.error("Gagal mengupdate task"),
    }
  );

  const { mutate: remove, isLoading: isDeleting } = useMutation(
    () => deleteTask(taskId),
    {
      onSuccess: () => {
        message.success("Task berhasil dihapus");
        queryClient.invalidateQueries(["kanban-tasks"]);
        onClose();
      },
      onError: () => message.error("Gagal menghapus task"),
    }
  );

  const handleUpdate = (values) => {
    update({
      ...values,
      due_date: values.due_date?.format("YYYY-MM-DD"),
      label_ids: values.label_ids || [],
    });
  };

  if (!taskId) return null;

  const tabItems = [
    {
      key: "subtasks",
      label: (
        <Space size={4}>
          <IconSubtask size={14} />
          <span>Subtask ({task?.subtasks?.length || 0})</span>
        </Space>
      ),
      children: (
        <TaskSubtasks taskId={taskId} subtasks={task?.subtasks || []} />
      ),
    },
    {
      key: "comments",
      label: (
        <Space size={4}>
          <IconMessage size={14} />
          <span>Komentar</span>
        </Space>
      ),
      children: <TaskComments taskId={taskId} />,
    },
    {
      key: "attachments",
      label: (
        <Space size={4}>
          <IconPaperclip size={14} />
          <span>Lampiran ({task?.attachments?.length || 0})</span>
        </Space>
      ),
      children: (
        <TaskAttachments
          taskId={taskId}
          attachments={task?.attachments || []}
        />
      ),
    },
    {
      key: "time",
      label: (
        <Space size={4}>
          <IconClock size={14} />
          <span>Waktu</span>
        </Space>
      ),
      children: (
        <TaskTimeEntries
          taskId={taskId}
          timeEntries={task?.time_entries || []}
          estimatedHours={task?.estimated_hours}
          actualHours={task?.actual_hours}
        />
      ),
    },
    {
      key: "activities",
      label: (
        <Space size={4}>
          <IconHistory size={14} />
          <span>Aktivitas</span>
        </Space>
      ),
      children: (
        <TaskActivities taskId={taskId} activities={task?.activities || []} />
      ),
    },
  ];

  return (
    <Drawer
      title={null}
      placement="right"
      width={560}
      open={open}
      onClose={onClose}
      closable={false}
      styles={{ body: { padding: 0 } }}
    >
      {isLoading ? (
        <Flex justify="center" align="center" style={{ height: 200 }}>
          <Spin size="large" />
        </Flex>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          {/* Header */}
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <Flex justify="space-between" align="center">
              <Space size={8}>
                <Tag>{task?.task_number}</Tag>
                {task?.column && (
                  <Tag color={task.column.color}>{task.column.name}</Tag>
                )}
              </Space>
              <Space size={4}>
                <Popconfirm
                  title="Hapus task?"
                  description="Task yang dihapus tidak dapat dikembalikan"
                  onConfirm={() => remove()}
                  okText="Hapus"
                  cancelText="Batal"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    type="text"
                    danger
                    icon={<IconTrash size={16} />}
                    loading={isDeleting}
                    size="small"
                  />
                </Popconfirm>
                <Button
                  type="text"
                  icon={<IconX size={18} />}
                  onClick={onClose}
                  size="small"
                />
              </Space>
            </Flex>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            <div style={{ padding: 16 }}>
              {isEditing ? (
                /* Edit Mode */
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleUpdate}
                  size="small"
                >
                  <Form.Item
                    name="title"
                    label="Judul Task"
                    rules={[{ required: true, message: "Judul wajib diisi" }]}
                  >
                    <Input placeholder="Judul task" />
                  </Form.Item>

                  <Form.Item name="description" label="Deskripsi">
                    <TextArea
                      rows={3}
                      placeholder="Deskripsi task..."
                      autoSize={{ minRows: 2, maxRows: 5 }}
                    />
                  </Form.Item>

                  <Flex gap={12} wrap="wrap">
                    <Form.Item
                      name="priority"
                      label="Prioritas"
                      style={{ marginBottom: 12, minWidth: 120 }}
                    >
                      <Select
                        placeholder="Pilih"
                        options={[
                          { value: "low", label: "Rendah" },
                          { value: "medium", label: "Sedang" },
                          { value: "high", label: "Tinggi" },
                          { value: "urgent", label: "Mendesak" },
                        ]}
                      />
                    </Form.Item>

                    <Form.Item
                      name="due_date"
                      label="Deadline"
                      style={{ marginBottom: 12, minWidth: 140 }}
                    >
                      <DatePicker
                        placeholder="Pilih tanggal"
                        format="DD MMM YYYY"
                        style={{ width: "100%" }}
                      />
                    </Form.Item>

                    <Form.Item
                      name="assignee_ids"
                      label="Ditugaskan"
                      style={{ marginBottom: 12, minWidth: 200, flex: 1 }}
                    >
                      <Select
                        mode="multiple"
                        placeholder="Pilih anggota"
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        maxTagCount={2}
                        options={members?.map((m) => ({
                          value: m.user?.custom_id,
                          label: m.user?.username,
                        }))}
                      />
                    </Form.Item>
                  </Flex>

                  <Form.Item name="label_ids" label="Label">
                    <Select
                      mode="multiple"
                      placeholder="Pilih label"
                      options={labels?.map((l) => ({
                        value: l.id,
                        label: (
                          <Flex align="center" gap={6}>
                            <div
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: 2,
                                backgroundColor: l.color,
                              }}
                            />
                            {l.name}
                          </Flex>
                        ),
                      }))}
                    />
                  </Form.Item>

                  <Flex gap={8} justify="flex-end">
                    <Button onClick={() => setIsEditing(false)}>Batal</Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isUpdating}
                      icon={<IconCheck size={14} />}
                      style={{
                        backgroundColor: "#fa541c",
                        borderColor: "#fa541c",
                      }}
                    >
                      Simpan
                    </Button>
                  </Flex>
                </Form>
              ) : (
                /* View Mode */
                <div>
                  <Flex justify="space-between" align="flex-start" gap={12}>
                    <Title level={5} style={{ marginBottom: 0, flex: 1 }}>
                      {task?.title}
                    </Title>
                    <Button
                      size="small"
                      icon={<IconEdit size={14} />}
                      onClick={() => setIsEditing(true)}
                      style={{ flexShrink: 0 }}
                    >
                      Edit
                    </Button>
                  </Flex>

                  {task?.description && (
                    <Text
                      type="secondary"
                      style={{
                        display: "block",
                        marginTop: 8,
                        marginBottom: 16,
                        whiteSpace: "pre-wrap",
                        fontSize: 13,
                        lineHeight: 1.6,
                      }}
                    >
                      {task.description}
                    </Text>
                  )}

                  <Divider style={{ margin: "12px 0" }} />

                  {/* Info Grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "12px 24px",
                      marginBottom: 16,
                    }}
                  >
                    {/* Priority */}
                    <Flex align="center" gap={8}>
                      <IconFlag size={14} color="#8c8c8c" />
                      <Text
                        type="secondary"
                        style={{ fontSize: 12, minWidth: 60 }}
                      >
                        Prioritas
                      </Text>
                      <PriorityBadge priority={task?.priority} />
                    </Flex>

                    {/* Due Date */}
                    <Flex align="center" gap={8}>
                      <IconCalendar size={14} color="#8c8c8c" />
                      <Text
                        type="secondary"
                        style={{ fontSize: 12, minWidth: 60 }}
                      >
                        Deadline
                      </Text>
                      {task?.due_date ? (
                        <DueDateBadge
                          dueDate={task.due_date}
                          completedAt={task.completed_at}
                        />
                      ) : (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          -
                        </Text>
                      )}
                    </Flex>

                    {/* Assignees */}
                    <Flex
                      align="center"
                      gap={8}
                      style={{ gridColumn: "span 2" }}
                    >
                      <IconUser size={14} color="#8c8c8c" />
                      <Text
                        type="secondary"
                        style={{ fontSize: 12, minWidth: 60 }}
                      >
                        Ditugaskan
                      </Text>
                      {task?.assignees?.length > 0 ? (
                        <Avatar.Group max={{ count: 5 }} size={24}>
                          {task.assignees.map((assignee) => (
                            <Tooltip
                              key={assignee.custom_id}
                              title={assignee.username}
                            >
                              <Avatar src={assignee.image} size={24}>
                                {assignee.username?.charAt(0)?.toUpperCase()}
                              </Avatar>
                            </Tooltip>
                          ))}
                        </Avatar.Group>
                      ) : task?.assignee ? (
                        <Tooltip title={task.assignee.username}>
                          <Avatar src={task.assignee.image} size={24}>
                            {task.assignee.username?.charAt(0)?.toUpperCase()}
                          </Avatar>
                        </Tooltip>
                      ) : (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Belum ditugaskan
                        </Text>
                      )}
                    </Flex>
                  </div>

                  {/* Labels */}
                  {task?.labels?.length > 0 && (
                    <Flex align="center" gap={8} wrap="wrap">
                      <IconTag size={14} color="#8c8c8c" />
                      <Text
                        type="secondary"
                        style={{ fontSize: 12, minWidth: 60 }}
                      >
                        Label
                      </Text>
                      <Flex gap={4} wrap="wrap">
                        {task.labels.map((label) => (
                          <LabelBadge key={label.id} label={label} />
                        ))}
                      </Flex>
                    </Flex>
                  )}
                </div>
              )}
            </div>

            <Divider style={{ margin: 0 }} />

            {/* Tabs */}
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
              style={{ padding: "0 16px" }}
              size="small"
            />
          </div>
        </div>
      )}
    </Drawer>
  );
}

export default TaskDetailDrawer;
