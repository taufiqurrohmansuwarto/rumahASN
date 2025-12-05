import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Input,
  Button,
  Checkbox,
  Progress,
  Typography,
  message,
  Flex,
  Empty,
  Spin,
} from "antd";
import { IconPlus, IconTrash, IconSubtask, IconCheck, IconSparkles } from "@tabler/icons-react";
import {
  createSubtask,
  toggleSubtask,
  deleteSubtask,
  aiGenerateSubtasks,
} from "../../../services/kanban.services";

const { Text } = Typography;

function SubtaskItem({ subtask, onToggle, onDelete }) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        backgroundColor: subtask.is_completed ? "#fafafa" : "transparent",
        borderRadius: 6,
        marginBottom: 4,
        border: "1px solid #f0f0f0",
      }}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <Checkbox
        checked={subtask.is_completed}
        onChange={() => onToggle(subtask.id)}
        style={{ marginRight: 4 }}
      />
      <Text
        style={{
          flex: 1,
          textDecoration: subtask.is_completed ? "line-through" : "none",
          color: subtask.is_completed ? "#8c8c8c" : "#262626",
          fontSize: 13,
        }}
      >
        {subtask.title}
      </Text>
      <div style={{ opacity: showDelete ? 1 : 0, transition: "opacity 0.2s" }}>
        <Button
          type="text"
          danger
          size="small"
          icon={<IconTrash size={12} />}
          onClick={() => onDelete(subtask.id)}
          style={{ height: 20, width: 20, padding: 0 }}
        />
      </div>
    </div>
  );
}

function TaskSubtasks({ taskId, subtasks }) {
  const [newTitle, setNewTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries(["kanban-task", taskId]);
    queryClient.invalidateQueries(["kanban-tasks"]);
  };

  const { mutate: create, isLoading: isCreating } = useMutation(
    (title) => createSubtask({ taskId, title }),
    {
      onSuccess: () => {
        setNewTitle("");
        setIsAdding(false);
        invalidate();
        message.success("Subtask ditambahkan");
      },
      onError: (error) => {
        console.error("Subtask error:", error);
        message.error("Gagal menambah subtask");
      },
    }
  );

  const { mutate: toggle } = useMutation(
    (subtaskId) => toggleSubtask({ taskId, subtaskId }),
    {
      onSuccess: invalidate,
      onError: () => message.error("Gagal mengubah status"),
    }
  );

  const { mutate: remove } = useMutation(
    (subtaskId) => deleteSubtask({ taskId, subtaskId }),
    {
      onSuccess: invalidate,
      onError: () => message.error("Gagal menghapus subtask"),
    }
  );

  const { mutate: generateWithAI, isLoading: isGenerating } = useMutation(
    () => aiGenerateSubtasks(taskId),
    {
      onSuccess: (result) => {
        invalidate();
        message.success(`${result?.data?.length || 0} subtask berhasil dibuat dengan AI`);
      },
      onError: (error) => {
        message.error(error?.response?.data?.message || "Gagal generate subtask dengan AI");
      },
    }
  );

  const completedCount = subtasks.filter((s) => s.is_completed).length;
  const totalCount = subtasks.length;
  const progress =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div>
      {/* Progress */}
      {totalCount > 0 && (
        <div
          style={{
            padding: 12,
            backgroundColor: progress === 100 ? "#f6ffed" : "#fff7e6",
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          <Flex gap={8} align="center">
            <Progress
              percent={progress}
              size="small"
              showInfo={false}
              strokeColor={progress === 100 ? "#52c41a" : "#fa541c"}
              trailColor={progress === 100 ? "#b7eb8f" : "#ffd591"}
              style={{ flex: 1, margin: 0 }}
            />
            <Text
              strong
              style={{
                fontSize: 12,
                whiteSpace: "nowrap",
                color: progress === 100 ? "#52c41a" : "#fa541c",
              }}
            >
              {completedCount}/{totalCount}
            </Text>
            {progress === 100 && <IconCheck size={14} color="#52c41a" />}
          </Flex>
        </div>
      )}

      {/* Subtask List */}
      {subtasks.length === 0 ? (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <IconSubtask size={32} color="#d9d9d9" />
          <Text
            type="secondary"
            style={{ fontSize: 12, display: "block", marginTop: 8, marginBottom: 12 }}
          >
            Belum ada subtask
          </Text>
          <Button
            type="default"
            size="small"
            icon={isGenerating ? <Spin size="small" /> : <IconSparkles size={14} />}
            onClick={() => generateWithAI()}
            loading={isGenerating}
            style={{ borderColor: "#fa541c", color: "#fa541c" }}
          >
            Generate dengan AI
          </Button>
        </div>
      ) : (
        <div style={{ marginBottom: 12 }}>
          {subtasks.map((subtask) => (
            <SubtaskItem
              key={subtask.id}
              subtask={subtask}
              onToggle={toggle}
              onDelete={remove}
            />
          ))}
        </div>
      )}

      {/* Add Subtask */}
      {isAdding ? (
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: 10,
            backgroundColor: "#fafafa",
            borderRadius: 8,
          }}
        >
          <Input
            placeholder="Nama subtask..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onPressEnter={() => newTitle.trim() && create(newTitle.trim())}
            autoFocus
            size="small"
            style={{ flex: 1, border: "none", backgroundColor: "transparent" }}
          />
          <Button
            type="primary"
            size="small"
            icon={<IconPlus size={14} />}
            onClick={() => newTitle.trim() && create(newTitle.trim())}
            loading={isCreating}
            style={{ backgroundColor: "#fa541c", borderColor: "#fa541c" }}
          />
          <Button size="small" onClick={() => setIsAdding(false)}>
            Batal
          </Button>
        </div>
      ) : (
        <Button
          type="dashed"
          size="small"
          icon={<IconPlus size={14} />}
          onClick={() => setIsAdding(true)}
          block
          style={{ borderColor: "#fa541c", color: "#fa541c" }}
        >
          Tambah subtask
        </Button>
      )}
    </div>
  );
}

export default TaskSubtasks;
