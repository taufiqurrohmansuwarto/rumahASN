import { rwPindahByNip } from "@/services/master.services";
import { getRwPindahInstansiByNip } from "@/services/siasn-services";
import {
  Badge as MantineBadge,
  Stack,
  Text as MantineText,
} from "@mantine/core";
import { IconBuilding, IconFileText, IconRefresh } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Divider, Flex, Space, Table, Typography } from "antd";

function ComparePindahInstansiByNip({ nip }) {
  const { data, isLoading, refetch, isFetching } = useQuery(
    ["rw-pindah-instansi", nip],
    () => getRwPindahInstansiByNip(nip),
    {
      enabled: !!nip,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 500000,
    }
  );

  const { data: pindahSimaster, isLoading: isLoadingPindahSimaster } = useQuery(
    ["rw-pindah-simaster", nip],
    () => rwPindahByNip(nip),
    {
      enabled: !!nip,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 500000,
    }
  );

  const columns = [
    {
      title: "Jenis",
      dataIndex: "jenisPi",
      width: 120,
      render: (jenisPi) => (
        <MantineBadge size="sm" color="blue" tt="none">
          {jenisPi}
        </MantineBadge>
      ),
    },
    {
      title: "SK BKN",
      key: "sk_bkn",
      width: 200,
      render: (_, record) => (
        <div>
          <MantineText size="sm" fw={500}>
            {record?.skBknNomor}
          </MantineText>
          <MantineText size="xs" c="dimmed">
            {record?.skBknTanggal}
          </MantineText>
        </div>
      ),
    },
    {
      title: "SK Asal",
      key: "sk_asal",
      width: 200,
      render: (_, record) => (
        <div>
          <MantineText size="sm" fw={500}>
            {record?.skAsalNomor}
          </MantineText>
          <MantineText size="xs" c="dimmed">
            {record?.skAsalTanggal}
          </MantineText>
        </div>
      ),
    },
    {
      title: "SK Tujuan",
      key: "sk_tujuan",
      width: 200,
      render: (_, record) => (
        <div>
          <MantineText size="sm" fw={500}>
            {record?.skTujuanNomor}
          </MantineText>
          <MantineText size="xs" c="dimmed">
            {record?.skTujuanTanggal}
          </MantineText>
        </div>
      ),
    },
    {
      title: "TMT Pindah",
      dataIndex: "tmtPi",
      width: 120,
      align: "center",
      render: (tmtPi) => (
        <MantineBadge size="sm" color="green">
          {tmtPi}
        </MantineBadge>
      ),
    },
  ];

  const masterColumn = [
    {
      title: "Jenis & Dokumen",
      key: "jenis_dokumen",
      width: 150,
      render: (_, record) => (
        <div>
          <MantineBadge
            size="sm"
            color="blue"
            tt="none"
            style={{ marginBottom: 8 }}
          >
            {record?.jenis_pindah?.jenis_pindah}
          </MantineBadge>
          {record?.file_pindah && (
            <div style={{ marginBottom: 4 }}>
              <a href={record.file_pindah} target="_blank" rel="noreferrer">
                <Button size="small" icon={<IconFileText size={14} />}>
                  Pindah
                </Button>
              </a>
            </div>
          )}
          {record?.file_spmt && (
            <div>
              <a href={record.file_spmt} target="_blank" rel="noreferrer">
                <Button size="small" icon={<IconFileText size={14} />}>
                  SPMT
                </Button>
              </a>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Asal",
      key: "asal",
      width: 250,
      render: (_, record) => (
        <div>
          <MantineText size="sm" fw={500}>
            {record?.instansi_asal}
          </MantineText>
          <MantineText size="xs" c="dimmed">
            {record?.induk_asal}
          </MantineText>
        </div>
      ),
    },
    {
      title: "Tujuan",
      key: "tujuan",
      width: 250,
      render: (_, record) => (
        <div>
          <MantineText size="sm" fw={500}>
            {record?.instansi_tujuan}
          </MantineText>
          <MantineText size="xs" c="dimmed">
            {record?.induk_tujuan}
          </MantineText>
        </div>
      ),
    },
    {
      title: "No. SK",
      dataIndex: "no_sk",
      width: 180,
      render: (no_sk, record) => (
        <div>
          <MantineText size="sm" fw={500}>
            {no_sk}
          </MantineText>
          <MantineText size="xs" c="dimmed">
            {record?.tgl_sk}
          </MantineText>
        </div>
      ),
    },
    {
      title: "TMT Pindah",
      dataIndex: "tmt_pindah",
      width: 120,
      align: "center",
      render: (tmt_pindah) => (
        <MantineBadge size="sm" color="green">
          {tmt_pindah}
        </MantineBadge>
      ),
    },
    {
      title: "Status",
      dataIndex: "aktif",
      width: 80,
      align: "center",
      render: (aktif) => (
        <MantineBadge
          size="sm"
          color={aktif === "Y" ? "green" : "gray"}
          tt="none"
        >
          {aktif === "Y" ? "Aktif" : "Tidak"}
        </MantineBadge>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={
          <Space>
            <IconBuilding size={20} color="#722ed1" />
            <Typography.Title level={4} style={{ margin: 0 }}>
              Komparasi Pindah Instansi
            </Typography.Title>
          </Space>
        }
      >
        <Stack>
          <Flex
            justify="space-between"
            align="center"
            style={{ marginBottom: 16 }}
          >
            <Space>
              <MantineText fw={600} size="sm">
                SIASN
              </MantineText>
              <MantineBadge size="sm" variant="light" color="blue">
                {data?.length || 0}
              </MantineBadge>
            </Space>
            <Button
              size="small"
              onClick={() => refetch()}
              icon={<IconRefresh size={16} />}
              loading={isFetching}
            >
              Refresh
            </Button>
          </Flex>

          <Table
            title={null}
            columns={columns}
            pagination={false}
            dataSource={data}
            loading={isLoading || isFetching}
            rowKey={(row) => row?.id}
            size="middle"
            scroll={{ x: 800 }}
            rowClassName={(record, index) =>
              index % 2 === 0 ? "table-row-light" : "table-row-dark"
            }
          />

          <Divider />

          <Space style={{ marginBottom: 16 }}>
            <MantineText fw={600} size="sm">
              SIMASTER
            </MantineText>
            <MantineBadge size="sm" variant="light" color="orange">
              {pindahSimaster?.length || 0}
            </MantineBadge>
          </Space>

          <Table
            title={null}
            columns={masterColumn}
            pagination={false}
            dataSource={pindahSimaster}
            loading={isLoadingPindahSimaster}
            rowKey={(row) => row?.pindah_id}
            size="middle"
            scroll={{ x: 800 }}
            rowClassName={(record, index) =>
              index % 2 === 0 ? "table-row-light" : "table-row-dark"
            }
          />
        </Stack>
      </Card>
    </div>
  );
}

export default ComparePindahInstansiByNip;
