import { rwJabDokterByNip } from "@/services/master.services";
import { Badge as MantineBadge, Text as MantineText } from "@mantine/core";
import { IconStethoscope } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Card, Space, Table, Typography } from "antd";

function CompareJabatanDokterByNip({ nip }) {
  const { data, isLoading } = useQuery(
    ["rw-jabatan-dokter", nip],
    () => rwJabDokterByNip(nip),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 500000,
    }
  );

  const columns = [
    {
      title: "Jenis Dokter",
      key: "jenis_dokter",
      width: 150,
      render: (_, row) => (
        <MantineBadge size="sm" color="cyan" tt="none">
          {row?.jenis?.jenis_dokter}
        </MantineBadge>
      ),
    },
    {
      title: "Spesialis",
      key: "spesialis",
      width: 200,
      render: (_, row) => (
        <MantineText size="sm" fw={500}>
          {row?.spesialis?.spesialis_dokter}
        </MantineText>
      ),
    },
    {
      title: "Unit Kesehatan",
      key: "unit_kesehatan",
      width: 200,
      render: (_, row) => (
        <div>
          <MantineText size="sm" fw={500}>
            {row?.nama_unit_kesehatan}
          </MantineText>
          <MantineText size="xs" c="dimmed">
            {row?.unit?.unit_kesehatan}
          </MantineText>
        </div>
      ),
    },
    {
      title: "Jumlah Pasien",
      dataIndex: "jml_pasien",
      width: 120,
      align: "center",
      render: (jml_pasien) => (
        <MantineBadge size="sm" color="green">
          {jml_pasien || 0}
        </MantineBadge>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={
          <Space>
            <IconStethoscope size={20} color="#13c2c2" />
            <Typography.Title level={4} style={{ margin: 0 }}>
              Jabatan Dokter
            </Typography.Title>
          </Space>
        }
      >
        <Space style={{ marginBottom: 16 }}>
          <MantineText fw={600} size="sm">
            Data Jabatan Dokter
          </MantineText>
          <MantineBadge size="sm" variant="light" color="cyan">
            {data?.length || 0}
          </MantineBadge>
        </Space>
        <Table
          columns={columns}
          pagination={false}
          loading={isLoading}
          dataSource={data}
          rowKey={(row) => row?.pegawai_id}
          size="middle"
          scroll={{ x: 600 }}
          rowClassName={(record, index) =>
            index % 2 === 0 ? "table-row-light" : "table-row-dark"
          }
        />
      </Card>
    </div>
  );
}

export default CompareJabatanDokterByNip;
