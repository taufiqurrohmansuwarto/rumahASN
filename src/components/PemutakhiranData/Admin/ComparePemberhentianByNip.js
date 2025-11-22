import { rwPemberhentianByNip } from "@/services/siasn-services";
import { Badge as MantineBadge, Text as MantineText } from "@mantine/core";
import { IconFileText, IconLogout, IconRefresh } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Space, Table, Tooltip } from "antd";

function ComparePemberhentianByNip({ nip }) {
  const {
    data,
    isLoading,
    refetch,
    isFetching,
  } = useQuery(["rw-pemberhentian", nip], () => rwPemberhentianByNip(nip), {
      enabled: !!nip,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
  });

  const columns = [
    {
      title: "Dok",
      key: "file",
      width: 80,
      align: "center",
      render: (_, row) => {
        return (
          <Space direction="vertical" size={4}>
            {row?.pathSkPreview && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${row?.pathSkPreview}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button size="small" icon={<IconFileText size={14} />}>
                  SK
                </Button>
              </a>
            )}
            {row?.pathPertek && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${row?.pathPertek}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button size="small" icon={<IconFileText size={14} />}>
                  Pertek
                </Button>
              </a>
            )}
          </Space>
        );
      },
    },
    {
      title: "Jenis Pensiun",
      dataIndex: "detailLayananNama",
      render: (jenis) => (
        <MantineBadge size="sm" color="orange" tt="none">
          {jenis || "-"}
        </MantineBadge>
      ),
    },
    {
      title: "Nomor & Tanggal SK",
      key: "nomor_tgl_sk",
      render: (_, row) => (
        <Tooltip
          title={`Nomor: ${row?.skNomor || "-"} | Tanggal: ${row?.skTgl || "-"}`}
        >
          <div>
            <MantineText size="sm" fw={500} lineClamp={1}>
              {row?.skNomor || "-"}
            </MantineText>
            <MantineText size="xs" c="dimmed">
              {row?.skTgl || "-"}
            </MantineText>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "TMT Pensiun",
      dataIndex: "tmtPensiun",
      render: (tmt) => (
        <MantineBadge size="sm" color="red">
          {tmt || "-"}
        </MantineBadge>
      ),
    },
    {
      title: "Status Usulan",
      dataIndex: "statusUsulanNama",
      render: (status) => (
        <MantineBadge size="sm" color="blue" tt="none">
          {status || "-"}
        </MantineBadge>
      ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <IconLogout size={20} />
          <span>Riwayat Pemberhentian</span>
          <MantineBadge size="sm" color="blue">
            {data?.length || 0} Data
          </MantineBadge>
        </Space>
      }
      extra={
        <Tooltip title="Refresh data Pemberhentian">
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
        rowKey={(row) => row?.id}
        dataSource={data}
        loading={isLoading || isFetching}
        rowClassName={(_, index) =>
          index % 2 === 0 ? "table-row-light" : "table-row-dark"
        }
        size="small"
        scroll={{ x: "max-content" }}
      />
    </Card>
  );
}

export default ComparePemberhentianByNip;
