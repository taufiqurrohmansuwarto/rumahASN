import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  Table,
  Typography,
  message,
  Flex,
  Empty,
  Spin,
  Space,
  Tooltip,
  Card,
} from "antd";
import {
  IconSparkles,
  IconCopy,
  IconFileText,
  IconRefresh,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { aiTaskLaporan } from "../../../services/kanban.services";

const { Text } = Typography;

function TaskLaporan({ task }) {
  const [data, setData] = useState(null);

  const { mutate: generate, isLoading } = useMutation(
    () => aiTaskLaporan(task?.id),
    {
      onSuccess: (result) => {
        setData(result?.data);
        message.success("Laporan kegiatan berhasil dibuat");
      },
      onError: (error) => {
        message.error(
          error?.response?.data?.message || "Gagal membuat laporan"
        );
      },
    }
  );

  const columns = [
    {
      title: "Tanggal",
      dataIndex: "tanggal",
      width: 100,
      render: (val) => <Text style={{ fontSize: 12 }}>{val}</Text>,
    },
    {
      title: "Uraian Kegiatan",
      dataIndex: "kegiatan",
      render: (val) => <Text style={{ fontSize: 12 }}>{val}</Text>,
    },
  ];

  // Copy as tab-separated (for Excel/Word table)
  const handleCopyTable = () => {
    if (!data?.kegiatan || data.kegiatan.length === 0) return;

    const header = "Tanggal\tUraian Kegiatan";
    const rows = data.kegiatan
      .map((item) => `${item.tanggal}\t${item.kegiatan}`)
      .join("\n");
    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    message.success("Berhasil disalin (format tabel)");
  };

  // Copy as plain text list
  const handleCopyText = () => {
    if (!data?.kegiatan || data.kegiatan.length === 0) return;

    const rows = data.kegiatan
      .map((item) => `${item.tanggal} - ${item.kegiatan}`)
      .join("\n");

    navigator.clipboard.writeText(rows);
    message.success("Berhasil disalin (format teks)");
  };

  // Check if task has data to generate
  const hasData =
    task?.subtasks?.length > 0 ||
    task?.time_entries?.length > 0 ||
    task?.activities?.length > 0;

  return (
    <div style={{ padding: "12px 16px 24px 16px" }}>
      {/* Header */}
      <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
        <Flex align="center" gap={6}>
          <IconFileText size={16} color="#fa541c" />
          <Text strong style={{ fontSize: 13 }}>
            Laporan Kegiatan Task
          </Text>
        </Flex>

        {data && (
          <Space size={4}>
            <Tooltip title="Salin format tabel">
              <Button
                size="small"
                icon={<IconCopy size={12} />}
                onClick={handleCopyTable}
              >
                Copy
              </Button>
            </Tooltip>
            <Tooltip title="Generate ulang">
              <Button
                size="small"
                icon={<IconRefresh size={12} />}
                onClick={() => generate()}
                loading={isLoading}
              />
            </Tooltip>
          </Space>
        )}
      </Flex>

      {/* Content */}
      {isLoading ? (
        <Flex vertical align="center" justify="center" style={{ padding: 40 }}>
          <Spin />
          <Text type="secondary" style={{ marginTop: 12, fontSize: 12 }}>
            AI sedang merangkum kegiatan...
          </Text>
        </Flex>
      ) : data ? (
        <div>
          {/* Info */}
          <Card
            size="small"
            style={{
              marginBottom: 12,
              backgroundColor: "#fff7e6",
              border: "1px solid #ffd591",
            }}
          >
            <Text style={{ fontSize: 12 }}>
              <strong>Task:</strong> {task?.title}
            </Text>
            {data.periode && (
              <Text
                type="secondary"
                style={{ fontSize: 11, display: "block", marginTop: 4 }}
              >
                Periode: {data.periode.start} s/d {data.periode.end}
              </Text>
            )}
          </Card>

          {/* Table */}
          <Table
            dataSource={data.kegiatan}
            columns={columns}
            rowKey={(_, idx) => idx}
            pagination={false}
            size="small"
            bordered
          />

          {/* Copy Buttons */}
          <Flex gap={8} style={{ marginTop: 12 }}>
            <Button
              size="small"
              icon={<IconCopy size={12} />}
              onClick={handleCopyTable}
              style={{ flex: 1 }}
            >
              Copy Tabel (Excel/Word)
            </Button>
            <Button
              size="small"
              icon={<IconCopy size={12} />}
              onClick={handleCopyText}
              style={{ flex: 1 }}
            >
              Copy Teks
            </Button>
          </Flex>

          <Text
            type="secondary"
            style={{ fontSize: 10, display: "block", marginTop: 8 }}
          >
            Dibuat: {dayjs(data.generated_at).format("DD MMM YYYY HH:mm")}
          </Text>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <IconFileText size={36} color="#d9d9d9" />
          <Text
            type="secondary"
            style={{
              display: "block",
              marginTop: 8,
              marginBottom: 12,
              fontSize: 12,
            }}
          >
            {hasData
              ? "Generate laporan kegiatan dari subtask & aktivitas"
              : "Tidak ada data untuk di-generate"}
          </Text>
          {hasData && (
            <Button
              type="primary"
              size="small"
              icon={<IconSparkles size={14} />}
              onClick={() => generate()}
              loading={isLoading}
              style={{ backgroundColor: "#fa541c", borderColor: "#fa541c" }}
            >
              Generate dengan AI
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default TaskLaporan;
