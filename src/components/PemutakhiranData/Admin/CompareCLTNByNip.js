import { cltnByNip } from "@/services/siasn-services";
import { Badge as MantineBadge, Text as MantineText } from "@mantine/core";
import { IconClock, IconFileText, IconRefresh } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Space, Table, Tooltip } from "antd";
import React from "react";

function CompareCLTNByNip({ nip }) {
  const {
    data,
    isLoading,
    refetch,
    isFetching,
  } = useQuery(["cltn", nip], () => cltnByNip(nip), {
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
            {record?.path?.[884] && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.[884]?.dok_uri}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button size="small" icon={<IconFileText size={14} />}>
                  SK
                </Button>
              </a>
            )}
            {record?.path?.[885] && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.[885]?.dok_uri}`}
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
      title: "Nomor & Tanggal SK",
      key: "nomor_tgl_sk",
      render: (_, record) => (
        <Tooltip
          title={`Nomor: ${record?.skNomor || "-"} | Tanggal: ${record?.skTanggal || "-"}`}
        >
          <div>
            <MantineText size="sm" fw={500} lineClamp={1}>
              {record?.skNomor || "-"}
            </MantineText>
            <MantineText size="xs" c="dimmed">
              {record?.skTanggal || "-"}
            </MantineText>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Periode CLTN",
      key: "periode",
      render: (_, record) => (
        <Tooltip
          title={`Awal: ${record?.tanggalAwal || "-"} | Akhir: ${record?.tanggalAkhir || "-"}`}
        >
          <div>
            <MantineText size="xs">
              {record?.tanggalAwal || "-"}
            </MantineText>
            <MantineText size="xs" c="dimmed">
              s/d {record?.tanggalAkhir || "-"}
            </MantineText>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Tanggal Aktif",
      dataIndex: "tanggalAktif",
      render: (tanggal) => (
        <MantineBadge size="sm" color="green">
          {tanggal || "-"}
        </MantineBadge>
      ),
    },
    {
      title: "Nomor Letter BKN",
      dataIndex: "nomorLetterBkn",
      render: (nomor) => (
        <MantineText size="sm">{nomor || "-"}</MantineText>
      ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <IconClock size={20} />
          <span>CLTN (Cuti di Luar Tanggungan Negara)</span>
          <MantineBadge size="sm" color="blue">
            {data?.length || 0} Data
          </MantineBadge>
        </Space>
      }
      extra={
        <Tooltip title="Refresh data CLTN">
          <Button
            size="small"
            icon={<IconRefresh size={14} />}
            onClick={() => refetch()}
            loading={isFetching}
          />
        </Tooltip>
      }
    >
      <Table
        columns={columns}
        pagination={false}
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

export default CompareCLTNByNip;
