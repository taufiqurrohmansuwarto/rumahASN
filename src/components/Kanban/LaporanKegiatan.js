import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Card,
  DatePicker,
  Button,
  Table,
  Typography,
  message,
  Flex,
  Empty,
  Spin,
  Space,
  Tooltip,
} from "antd";
import {
  IconSparkles,
  IconCopy,
  IconFileExport,
  IconCalendar,
  IconRefresh,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { aiLaporanKegiatan } from "../../../services/kanban.services";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

function LaporanKegiatan({ projectId }) {
  const [dateRange, setDateRange] = useState([
    dayjs().startOf("month"),
    dayjs(),
  ]);
  const [data, setData] = useState(null);

  const startDate = dateRange?.[0]?.format("YYYY-MM-DD");
  const endDate = dateRange?.[1]?.format("YYYY-MM-DD");

  const { mutate: generate, isLoading } = useMutation(
    () => aiLaporanKegiatan({ projectId, startDate, endDate }),
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
      title: "No",
      dataIndex: "no",
      width: 50,
      align: "center",
    },
    {
      title: "Tanggal",
      dataIndex: "tanggal",
      width: 120,
    },
    {
      title: "Kegiatan Tugas Jabatan",
      dataIndex: "kegiatan",
    },
    {
      title: "Jam",
      dataIndex: "jam",
      width: 60,
      align: "center",
    },
  ];

  const handleCopy = () => {
    if (!data?.kegiatan || data.kegiatan.length === 0) return;

    // Format as tab-separated for paste to Excel/Word
    const header = "No\tTanggal\tKegiatan Tugas Jabatan\tJam";
    const rows = data.kegiatan
      .map(
        (item) => `${item.no}\t${item.tanggal}\t${item.kegiatan}\t${item.jam}`
      )
      .join("\n");
    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    message.success("Berhasil disalin ke clipboard");
  };

  const handleCopyPlain = () => {
    if (!data?.kegiatan || data.kegiatan.length === 0) return;

    // Format as plain text list
    const rows = data.kegiatan
      .map(
        (item) =>
          `${item.no}. ${item.tanggal} - ${item.kegiatan} (${item.jam} jam)`
      )
      .join("\n");

    navigator.clipboard.writeText(rows);
    message.success("Berhasil disalin ke clipboard");
  };

  return (
    <div style={{ padding: "12px 0" }}>
      {/* Header & Filter */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
          <Flex align="center" gap={8}>
            <IconCalendar size={18} color="#fa541c" />
            <Text strong>Periode:</Text>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="DD MMM YYYY"
              size="small"
              allowClear={false}
              presets={[
                {
                  label: "Minggu Ini",
                  value: [dayjs().startOf("week"), dayjs()],
                },
                {
                  label: "Bulan Ini",
                  value: [dayjs().startOf("month"), dayjs()],
                },
                {
                  label: "Bulan Lalu",
                  value: [
                    dayjs().subtract(1, "month").startOf("month"),
                    dayjs().subtract(1, "month").endOf("month"),
                  ],
                },
              ]}
            />
          </Flex>

          <Button
            type="primary"
            icon={<IconSparkles size={14} />}
            onClick={() => generate()}
            loading={isLoading}
            style={{ backgroundColor: "#fa541c", borderColor: "#fa541c" }}
          >
            Generate dengan AI
          </Button>
        </Flex>
      </Card>

      {/* Result */}
      {isLoading ? (
        <Card>
          <Flex
            vertical
            align="center"
            justify="center"
            style={{ padding: 60 }}
          >
            <Spin size="large" />
            <Text type="secondary" style={{ marginTop: 16 }}>
              AI sedang membuat laporan kegiatan...
            </Text>
          </Flex>
        </Card>
      ) : data ? (
        <Card
          title={
            <Flex justify="space-between" align="center">
              <Text strong>Laporan Kegiatan Tugas Jabatan</Text>
              <Space>
                <Tooltip title="Salin sebagai tabel (untuk Excel)">
                  <Button
                    size="small"
                    icon={<IconCopy size={14} />}
                    onClick={handleCopy}
                  >
                    Copy Tabel
                  </Button>
                </Tooltip>
                <Tooltip title="Salin sebagai teks">
                  <Button
                    size="small"
                    icon={<IconFileExport size={14} />}
                    onClick={handleCopyPlain}
                  >
                    Copy Teks
                  </Button>
                </Tooltip>
                <Tooltip title="Generate ulang">
                  <Button
                    size="small"
                    icon={<IconRefresh size={14} />}
                    onClick={() => generate()}
                  />
                </Tooltip>
              </Space>
            </Flex>
          }
          size="small"
        >
          {/* Summary */}
          {data.ringkasan && (
            <div
              style={{
                padding: 12,
                backgroundColor: "#fff7e6",
                borderRadius: 8,
                marginBottom: 16,
                border: "1px solid #ffd591",
              }}
            >
              <Flex align="center" gap={8}>
                <IconSparkles size={16} color="#fa541c" />
                <Text style={{ fontSize: 13 }}>{data.ringkasan}</Text>
              </Flex>
            </div>
          )}

          {/* Table */}
          <Table
            dataSource={data.kegiatan}
            columns={columns}
            rowKey="no"
            pagination={false}
            size="small"
            bordered
          />

          {/* Footer Info */}
          <Flex justify="space-between" style={{ marginTop: 12 }}>
            <Text type="secondary" style={{ fontSize: 11 }}>
              Periode: {startDate} s/d {endDate}
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              Total: {data.kegiatan?.length || 0} kegiatan,{" "}
              {data.total_jam || 0} jam
            </Text>
          </Flex>
        </Card>
      ) : (
        <Card>
          <Empty
            image={<IconSparkles size={48} color="#d9d9d9" />}
            imageStyle={{ height: 60 }}
            description={
              <div>
                <Text type="secondary" style={{ display: "block" }}>
                  Belum ada laporan kegiatan
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Pilih periode dan klik "Generate dengan AI"
                </Text>
              </div>
            }
          />
        </Card>
      )}
    </div>
  );
}

export default LaporanKegiatan;
