import { rwKedudukanHukumByNip } from "@/services/master.services";
import {
  Badge as MantineBadge,
  Stack,
  Text as MantineText,
} from "@mantine/core";
import {
  IconFileText,
  IconGavel,
  IconRefresh,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Space, Table, Tooltip } from "antd";
import ComparePemberhentianByNip from "./ComparePemberhentianByNip";

function CompareKedudukanHukumByNip({ nip }) {
  const {
    data,
    isLoading,
    refetch,
    isFetching,
  } = useQuery(["kedudukan-hukum", nip], () => rwKedudukanHukumByNip(nip), {
    enabled: !!nip,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

  const columns = [
    {
      title: "Dok",
      key: "file_sk",
      width: 60,
      align: "center",
      render: (_, record) => {
        return (
          <>
            {record?.file_kedudukan_hukum && (
              <a
                href={record?.file_kedudukan_hukum}
                target="_blank"
                rel="noreferrer"
              >
                <Button size="small" icon={<IconFileText size={14} />} />
              </a>
            )}
          </>
        );
      },
    },
    {
      title: "Kedudukan Hukum",
      key: "kedudukan_hukum",
      render: (_, row) => (
        <MantineBadge size="sm" color="blue" tt="none">
          {row?.kedudukan_hukum?.kedudukan_hukum || "-"}
        </MantineBadge>
      ),
    },
    {
      title: "Nomor & Tanggal SK",
      key: "nomor_tgl_sk",
      render: (_, row) => (
        <Tooltip
          title={`Nomor: ${row?.no_sk || "-"} | Tanggal: ${row?.tgl_sk || "-"}`}
        >
          <div>
            <MantineText size="sm" fw={500} lineClamp={1}>
              {row?.no_sk || "-"}
            </MantineText>
            <MantineText size="xs" c="dimmed">
              {row?.tgl_sk || "-"}
            </MantineText>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Keterangan Instansi",
      dataIndex: "keterangan_instansi",
      render: (ket) => (
        <MantineText size="xs" lineClamp={2}>
          {ket || "-"}
        </MantineText>
      ),
    },
    {
      title: "Last Update",
      key: "last_update",
      render: (_, row) => (
        <Tooltip title={`Tanggal: ${row?.tgl_edit || "-"} | Jam: ${row?.jam_edit || "-"}`}>
          <div>
            <MantineText size="xs">{row?.tgl_edit || "-"}</MantineText>
            <MantineText size="xs" c="dimmed">
              {row?.jam_edit || "-"}
            </MantineText>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      dataIndex: "aktif",
      render: (aktif) => (
        <MantineBadge size="sm" color={aktif === "Y" ? "green" : "gray"}>
          {aktif === "Y" ? "Aktif" : "Tidak Aktif"}
        </MantineBadge>
      ),
    },
  ];

  return (
    <Stack>
      <Card
        title={
          <Space>
            <IconGavel size={20} />
            <span>Kedudukan Hukum</span>
            <MantineBadge size="sm" color="blue">
              {data?.length || 0} Data
            </MantineBadge>
          </Space>
        }
        extra={
          <Tooltip title="Refresh data Kedudukan Hukum">
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
          columns={columns}
          rowKey={(row) => row?.kedudukan_hukum_id}
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
      <ComparePemberhentianByNip nip={nip} />
    </Stack>
  );
}

export default CompareKedudukanHukumByNip;
