import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Input,
  InputNumber,
  DatePicker,
  Button,
  List,
  Typography,
  message,
  Progress,
  Tag,
  Space,
  Card,
  Empty,
  Popconfirm,
  Flex,
} from "antd";
import { IconPlus, IconTrash, IconClock, IconHourglass } from "@tabler/icons-react";
import dayjs from "dayjs";
import {
  logTimeEntry,
  deleteTimeEntry,
} from "../../../services/kanban.services";

const { Text } = Typography;

function TaskTimeEntries({
  taskId,
  timeEntries,
  estimatedHours,
  actualHours,
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [hours, setHours] = useState(null);
  const [description, setDescription] = useState("");
  const [loggedDate, setLoggedDate] = useState(dayjs());
  const queryClient = useQueryClient();

  const { mutate: logTime, isLoading: isLogging } = useMutation(
    (data) => logTimeEntry({ taskId, ...data }),
    {
      onSuccess: () => {
        setHours(null);
        setDescription("");
        setLoggedDate(dayjs());
        setIsAdding(false);
        queryClient.invalidateQueries(["kanban-task", taskId]);
        message.success("Waktu berhasil dicatat");
      },
      onError: (error) => {
        console.error("Time entry error:", error);
        message.error("Gagal mencatat waktu");
      },
    }
  );

  const { mutate: remove } = useMutation(
    (entryId) => deleteTimeEntry({ taskId, entryId }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["kanban-task", taskId]);
        message.success("Catatan waktu dihapus");
      },
      onError: () => message.error("Gagal menghapus"),
    }
  );

  const handleSubmit = () => {
    if (hours && hours > 0) {
      logTime({
        hours: parseFloat(hours),
        description: description || "",
        logged_date: loggedDate ? loggedDate.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
      });
    }
  };

  const progress = estimatedHours
    ? Math.min((actualHours / estimatedHours) * 100, 100)
    : 0;
  const isOverEstimate = estimatedHours && actualHours > estimatedHours;

  return (
    <div>
      {/* Time Summary */}
      <Card size="small" style={{ marginBottom: 16, backgroundColor: "#fafafa" }}>
        <Flex justify="space-between" align="center" style={{ marginBottom: estimatedHours > 0 ? 12 : 0 }}>
          <Space size={4}>
            <IconHourglass size={16} color="#8c8c8c" />
            <Text strong style={{ fontSize: 13 }}>Waktu Tercatat</Text>
          </Space>
          <Space size={8}>
            <Tag color="blue" style={{ margin: 0 }}>{actualHours || 0} jam</Tag>
            {estimatedHours && (
              <>
                <Text type="secondary">/</Text>
                <Tag style={{ margin: 0 }}>{estimatedHours} jam estimasi</Tag>
              </>
            )}
          </Space>
        </Flex>

        {estimatedHours > 0 && (
          <div>
            <Progress
              percent={Math.round(progress)}
              size="small"
              status={isOverEstimate ? "exception" : progress > 80 ? "active" : "normal"}
              strokeColor={isOverEstimate ? "#ff4d4f" : progress > 80 ? "#faad14" : "#1890ff"}
            />
            {isOverEstimate && (
              <Text type="danger" style={{ fontSize: 11 }}>
                Melebihi estimasi {(actualHours - estimatedHours).toFixed(1)} jam
              </Text>
            )}
          </div>
        )}
      </Card>

      {/* Add Time Entry */}
      {isAdding ? (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Flex gap={8} wrap="wrap" style={{ marginBottom: 12 }}>
            <InputNumber
              placeholder="Jam"
              min={0.25}
              step={0.25}
              value={hours}
              onChange={setHours}
              style={{ width: 100 }}
              size="small"
              prefix={<IconClock size={14} color="#bfbfbf" />}
            />
            <DatePicker
              value={loggedDate}
              onChange={setLoggedDate}
              placeholder="Tanggal"
              size="small"
              style={{ width: 140 }}
            />
          </Flex>
          <Input
            placeholder="Deskripsi (opsional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            size="small"
            style={{ marginBottom: 12 }}
          />
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<IconPlus size={14} />}
              onClick={handleSubmit}
              loading={isLogging}
              disabled={!hours || hours <= 0}
            >
              Simpan
            </Button>
            <Button size="small" onClick={() => setIsAdding(false)}>
              Batal
            </Button>
          </Space>
        </Card>
      ) : (
        <Button
          type="dashed"
          size="small"
          icon={<IconPlus size={14} />}
          onClick={() => setIsAdding(true)}
          block
          style={{ marginBottom: 16 }}
        >
          Catat waktu
        </Button>
      )}

      {/* Time Entry List */}
      {timeEntries.length === 0 ? (
        <Empty
          image={<IconClock size={40} color="#d9d9d9" />}
          imageStyle={{ height: 40 }}
          description={<Text type="secondary">Belum ada catatan waktu</Text>}
        />
      ) : (
        <List
          dataSource={timeEntries}
          renderItem={(entry) => (
            <Card size="small" style={{ marginBottom: 8 }} bodyStyle={{ padding: 12 }}>
              <Flex justify="space-between" align="center">
                <Flex gap={12} align="center" style={{ flex: 1 }}>
                  <IconClock size={16} color="#8c8c8c" />
                  <div>
                    <Space size={8} style={{ marginBottom: 4 }}>
                      <Tag color="blue" style={{ margin: 0 }}>{entry.hours} jam</Tag>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {dayjs(entry.logged_date).format("DD MMM YYYY")}
                      </Text>
                    </Space>
                    {entry.description && (
                      <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                        {entry.description}
                      </Text>
                    )}
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      oleh {entry.user?.username}
                    </Text>
                  </div>
                </Flex>
                <Popconfirm
                  title="Hapus catatan waktu?"
                  onConfirm={() => remove(entry.id)}
                  okText="Hapus"
                  cancelText="Batal"
                  okButtonProps={{ danger: true, size: "small" }}
                  cancelButtonProps={{ size: "small" }}
                >
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<IconTrash size={14} />}
                  />
                </Popconfirm>
              </Flex>
            </Card>
          )}
        />
      )}
    </div>
  );
}

export default TaskTimeEntries;
