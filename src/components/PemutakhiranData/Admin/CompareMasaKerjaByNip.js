import { dataRiwayatMasaKerja } from "@/services/siasn-services";
import { Badge as MantineBadge, Text as MantineText } from "@mantine/core";
import {
  IconBriefcase,
  IconFileText,
  IconRefresh,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Space, Table, Tooltip } from "antd";

function CompareMasaKerjaByNip({ nip }) {
  const {
    data,
    isLoading,
    refetch,
    isFetching,
  } = useQuery(["rw-masa-kerja", nip], () => dataRiwayatMasaKerja(nip), {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    enabled: !!nip,
  });

  const columns = [
    {
      title: "Dok",
      key: "file",
      width: 80,
      align: "center",
      render: (_, record) => {
        return (
          <Space direction="vertical" size={4}>
              {record?.path?.[1643] && (
                <a
                  href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.[1643]?.dok_uri}`}
                  target="_blank"
                  rel="noreferrer"
                >
                <Button size="small" icon={<IconFileText size={14} />}>
                  Pertek
                </Button>
                </a>
              )}
              {record?.path?.[1644] && (
                <a
                  href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.[1644]?.dok_uri}`}
                  target="_blank"
                  rel="noreferrer"
                >
                <Button size="small" icon={<IconFileText size={14} />}>
                  SK
                </Button>
                </a>
              )}
          </Space>
        );
      },
    },
    {
      title: "Pengalaman",
      dataIndex: "pengalaman",
      render: (pengalaman) => (
        <MantineText size="sm" lineClamp={2}>
          {pengalaman || "-"}
        </MantineText>
      ),
    },
    {
      title: "Periode Kerja",
      key: "periode",
      render: (_, row) => (
        <Tooltip
          title={`Mulai: ${row?.tanggalAwal || "-"} | Selesai: ${row?.tanggalSelesai || "-"}`}
        >
          <div>
            <MantineText size="xs">{row?.tanggalAwal || "-"}</MantineText>
            <MantineText size="xs" c="dimmed">
              s/d {row?.tanggalSelesai || "-"}
            </MantineText>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Nomor & Tanggal SK",
      key: "nomor_tgl_sk",
      render: (_, row) => (
        <Tooltip
          title={`Nomor: ${row?.nomorSk || "-"} | Tanggal: ${row?.tanggalSk || "-"}`}
        >
          <div>
            <MantineText size="sm" fw={500} lineClamp={1}>
              {row?.nomorSk || "-"}
            </MantineText>
            <MantineText size="xs" c="dimmed">
              {row?.tanggalSk || "-"}
            </MantineText>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Masa Kerja",
      key: "masakerja",
      render: (_, row) => (
        <MantineBadge size="sm" color="blue">
          {row?.masaKerjaTahun || 0} th {row?.masaKerjaBulan || 0} bl
        </MantineBadge>
      ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <IconBriefcase size={20} />
          <span>Riwayat Masa Kerja</span>
          <MantineBadge size="sm" color="blue">
            {data?.length || 0} Data
          </MantineBadge>
        </Space>
      }
      extra={
        <Tooltip title="Refresh data Masa Kerja">
          <Button
            size="small"
            icon={<IconRefresh size={14} />}
            onClick={() => refetch()}
            loading={isFetching}
          />
        </Tooltip>
      }
      style={{ marginTop: 16 }}
    >
      <Table
        pagination={false}
        columns={columns}
        dataSource={data}
        loading={isLoading || isFetching}
        rowKey={(row) => row?.id}
        rowClassName={(_, index) =>
          index % 2 === 0 ? "table-row-light" : "table-row-dark"
        }
        size="small"
        scroll={{ x: "max-content" }}
      />
    </Card>
  );
}

export default CompareMasaKerjaByNip;
