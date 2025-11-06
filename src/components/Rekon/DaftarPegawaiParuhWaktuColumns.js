import { Badge, Text } from "@mantine/core";
import { EyeOutlined, UserOutlined } from "@ant-design/icons";
import { IconDownload, IconX } from "@tabler/icons-react";
import { Avatar, Button, Space, Tooltip } from "antd";

export const createColumns = (handleShowDetail) => [
  {
    title: "Pegawai",
    key: "pegawai",
    width: 180,
    render: (_, record) => (
      <Space size="small">
        <Avatar size={36} style={{ border: "2px solid #f0f0f0" }}>
          <UserOutlined />
        </Avatar>
        <div style={{ lineHeight: "1.2" }}>
          <div>
            <Text fw={600} size="xs">
              {record?.nama}
            </Text>
          </div>
          {record?.nip && (
            <div style={{ marginTop: "3px" }}>
              <Text size="10px" c="dimmed" ff="monospace">
                {record?.nip}
              </Text>
            </div>
          )}
          {record?.detail?.usulan_data?.data?.no_peserta && (
            <div style={{ marginTop: "3px" }}>
              <Badge
                variant="light"
                color="blue"
                size="xs"
                style={{ maxWidth: "180px" }}
              >
                <Text size="10px" truncate span>
                  No: {record?.detail?.usulan_data?.data?.no_peserta}
                </Text>
              </Badge>
            </div>
          )}
        </div>
      </Space>
    ),
  },
  {
    title: "Unit Organisasi",
    key: "unor",
    width: 180,
    render: (_, record) => (
      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        <div>
          <Text
            size="10px"
            c="purple"
            fw={600}
            style={{ display: "block", marginBottom: "3px" }}
          >
            SIMASTER
          </Text>
          <Text size="10px" ff="monospace" c="dimmed">
            {record?.unor_simaster || "-"}
          </Text>
        </div>
        <div>
          <Text
            size="10px"
            c="cyan"
            fw={600}
            style={{ display: "block", marginBottom: "3px" }}
          >
            SIASN
          </Text>
          <Tooltip title={record?.unor_siasn || "-"}>
            <Text
              size="10px"
              ff="monospace"
              c="dimmed"
              style={{
                display: "block",
                wordBreak: "break-all",
                lineHeight: "1.4",
                cursor: "help",
              }}
            >
              {record?.unor_siasn || "-"}
            </Text>
          </Tooltip>
        </div>
      </div>
    ),
  },
  {
    title: "Upah",
    key: "upah",
    width: 110,
    render: (_, record) => {
      const upah =
        record?.gaji || record?.detail?.usulan_data?.data?.gaji_pokok || "0";
      return (
        <Text size="10px" fw={600} c="green" ff="monospace">
          Rp {parseInt(upah).toLocaleString("id-ID")}
        </Text>
      );
    },
  },
  {
    title: "Status",
    key: "status",
    width: 90,
    render: (_, record) => {
      const status = record?.status_usulan?.nama;
      return (
        <Badge size="xs" variant="light">
          <Text size="10px" span>
            {status || "-"}
          </Text>
        </Badge>
      );
    },
  },
  {
    title: "Dokumen",
    key: "dokumen",
    width: 90,
    render: (_, record) => (
      <Space size={3} direction="vertical">
        {record?.detail?.path_ttd_pertek && (
          <Tooltip title="Unduh file Pertek">
            <a
              href={`/helpdesk/api/siasn/ws/download?filePath=${record.detail.path_ttd_pertek}`}
              target="_blank"
              rel="noreferrer"
            >
              <Badge
                color="orange"
                size="xs"
                style={{ cursor: "pointer" }}
                leftSection={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <IconDownload size={10} />
                  </div>
                }
                styles={{
                  section: { display: "flex", alignItems: "center" },
                  label: { display: "flex", alignItems: "center" },
                }}
              >
                <Text size="10px" span>
                  Pertek
                </Text>
              </Badge>
            </a>
          </Tooltip>
        )}
        {record?.detail?.path_ttd_sk && (
          <Tooltip title="Unduh file SK">
            <a
              href={`/helpdesk/api/siasn/ws/download?filePath=${record.detail.path_ttd_sk}`}
              target="_blank"
              rel="noreferrer"
            >
              <Badge
                color="blue"
                size="xs"
                style={{ cursor: "pointer" }}
                leftSection={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <IconDownload size={10} />
                  </div>
                }
                styles={{
                  section: { display: "flex", alignItems: "center" },
                  label: { display: "flex", alignItems: "center" },
                }}
              >
                <Text size="10px" span>
                  SK
                </Text>
              </Badge>
            </a>
          </Tooltip>
        )}
        {!record?.detail?.path_ttd_pertek && !record?.detail?.path_ttd_sk && (
          <Badge
            color="gray"
            size="xs"
            leftSection={
              <div style={{ display: "flex", alignItems: "center" }}>
                <IconX size={10} />
              </div>
            }
            styles={{
              section: { display: "flex", alignItems: "center" },
              label: { display: "flex", alignItems: "center" },
            }}
          >
            <Text size="10px" span>
              No File
            </Text>
          </Badge>
        )}
      </Space>
    ),
  },
  {
    title: "Aksi",
    key: "aksi",
    width: 80,
    align: "center",
    fixed: "right",
    render: (_, record) => (
      <Tooltip title="Kelola Data">
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleShowDetail(record)}
          style={{
            color: "#FF4500",
            padding: "0 8px",
            height: "auto",
          }}
        >
          <Text size="10px" span style={{ color: "#FF4500" }}>
            Aksi
          </Text>
        </Button>
      </Tooltip>
    ),
  },
];
