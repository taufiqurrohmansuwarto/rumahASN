import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  Modal,
  List,
  Checkbox,
  Tag,
  Typography,
  Space,
  Spin,
  Alert,
  Flex,
  Divider,
} from "antd";
import {
  IconSparkles,
  IconWand,
  IconFlag,
  IconClock,
  IconListCheck,
} from "@tabler/icons-react";
import { aiTaskAssist } from "../../../services/kanban.services";

const { Text, Paragraph } = Typography;

const priorityLabels = {
  low: { label: "Rendah", color: "green" },
  medium: { label: "Sedang", color: "blue" },
  high: { label: "Tinggi", color: "orange" },
  urgent: { label: "Mendesak", color: "red" },
};

function AITaskAssist({ title, description, onApply, disabled }) {
  const [open, setOpen] = useState(false);
  const [selectedSubtasks, setSelectedSubtasks] = useState([]);

  const { mutate, isLoading, data, error, reset } = useMutation(
    () => aiTaskAssist({ title, description }),
    {
      onSuccess: (result) => {
        if (result?.data?.subtasks) {
          setSelectedSubtasks(result.data.subtasks.map((_, i) => i));
        }
      },
    }
  );

  const handleOpen = () => {
    if (!title?.trim()) return;
    setOpen(true);
    mutate();
  };

  const handleClose = () => {
    setOpen(false);
    reset();
    setSelectedSubtasks([]);
  };

  const handleApply = () => {
    const result = data?.data;
    if (!result) return;

    const appliedSubtasks = selectedSubtasks.map((i) => result.subtasks[i]);

    onApply?.({
      subtasks: appliedSubtasks,
      priority: result.priority,
      estimated_hours: result.estimated_hours,
    });

    handleClose();
  };

  const toggleSubtask = (index) => {
    setSelectedSubtasks((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const result = data?.data;

  return (
    <>
      <Button
        type="text"
        size="small"
        icon={<IconSparkles size={14} />}
        onClick={handleOpen}
        disabled={disabled || !title?.trim()}
        style={{
          color: "#fa541c",
          fontSize: 12,
        }}
      >
        Bantu AI
      </Button>

      <Modal
        title={
          <Flex gap={8} align="center">
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, #fa541c 0%, #ff7a45 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconWand size={18} color="#fff" />
            </div>
            <span>Saran AI</span>
          </Flex>
        }
        open={open}
        onCancel={handleClose}
        footer={
          result ? (
            <Flex justify="flex-end" gap={8}>
              <Button onClick={handleClose}>Batal</Button>
              <Button
                type="primary"
                onClick={handleApply}
                disabled={selectedSubtasks.length === 0}
                style={{
                  backgroundColor: "#fa541c",
                  borderColor: "#fa541c",
                }}
              >
                Terapkan Saran
              </Button>
            </Flex>
          ) : null
        }
        width={500}
        centered
      >
        {isLoading && (
          <Flex
            vertical
            align="center"
            justify="center"
            gap={16}
            style={{ padding: 40 }}
          >
            <Spin size="large" />
            <Text type="secondary">AI sedang menganalisis task...</Text>
          </Flex>
        )}

        {error && (
          <Alert
            type="error"
            message="Gagal mendapatkan saran AI"
            description={error?.response?.data?.message || "Terjadi kesalahan"}
            showIcon
          />
        )}

        {result && (
          <div>
            {/* Priority & Estimated Hours */}
            <Flex gap={16} style={{ marginBottom: 16 }}>
              <div
                style={{
                  flex: 1,
                  padding: 12,
                  backgroundColor: "#fafafa",
                  borderRadius: 8,
                }}
              >
                <Flex gap={8} align="center">
                  <IconFlag size={16} color="#fa541c" />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Prioritas
                  </Text>
                </Flex>
                <Tag
                  color={priorityLabels[result.priority]?.color}
                  style={{ marginTop: 8 }}
                >
                  {priorityLabels[result.priority]?.label || result.priority}
                </Tag>
              </div>

              <div
                style={{
                  flex: 1,
                  padding: 12,
                  backgroundColor: "#fafafa",
                  borderRadius: 8,
                }}
              >
                <Flex gap={8} align="center">
                  <IconClock size={16} color="#fa541c" />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Estimasi
                  </Text>
                </Flex>
                <Text strong style={{ display: "block", marginTop: 8 }}>
                  {result.estimated_hours
                    ? `${result.estimated_hours} jam`
                    : "-"}
                </Text>
              </div>
            </Flex>

            <Divider style={{ margin: "16px 0" }} />

            {/* Subtasks */}
            <Flex gap={8} align="center" style={{ marginBottom: 12 }}>
              <IconListCheck size={16} color="#fa541c" />
              <Text strong>Subtask yang Disarankan</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                ({selectedSubtasks.length}/{result.subtasks?.length || 0}{" "}
                dipilih)
              </Text>
            </Flex>

            <List
              size="small"
              dataSource={result.subtasks || []}
              renderItem={(subtask, index) => (
                <List.Item
                  style={{
                    padding: "8px 12px",
                    backgroundColor: selectedSubtasks.includes(index)
                      ? "#fff7e6"
                      : "transparent",
                    borderRadius: 6,
                    marginBottom: 4,
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onClick={() => toggleSubtask(index)}
                >
                  <Checkbox
                    checked={selectedSubtasks.includes(index)}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={{ fontSize: 13 }}>{subtask}</Text>
                </List.Item>
              )}
            />

            {/* Reasoning */}
            {result.reasoning && (
              <>
                <Divider style={{ margin: "16px 0" }} />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  💡 {result.reasoning}
                </Text>
              </>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

export default AITaskAssist;

