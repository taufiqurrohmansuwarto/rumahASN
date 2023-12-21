import { getRiwayatKeluargaByNip } from "@/services/siasn-services";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Card, Table, Typography } from "antd";

const DataAnak = ({ data, isLoading }) => {
  const columns = [
    {
      title: "Nama",
      dataIndex: "nama",
    },
    {
      title: "Status Kawin",
      dataIndex: "jenis_kawin_nama",
    },
    {
      title: "Jenis Anak",
      dataIndex: "jenis_anak_nama",
    },
    {
      title: "Tanggal Lahir",
      dataIndex: "tgl_lhr",
    },
  ];

  return (
    <Table
      columns={columns}
      title={() => <Typography.Paragraph>Data Anak SIASN</Typography.Paragraph>}
      dataSource={data}
      loading={isLoading}
      pagination={false}
    />
  );
};

const DataIstri = ({ data, isLoading }) => {
  const columns = [
    {
      title: "Nama",
      dataIndex: "nama",
    },
    {
      title: "Status PNS",
      dataIndex: "is_pns_string",
    },
    {
      title: "NIP",
      dataIndex: "nip",
    },
    {
      title: "Status Hidup",
      dataIndex: "status_hidup",
    },
    {
      title: "Tanggal Lahir",
      dataIndex: "tgl_lhr",
    },
    {
      title: "Tanggal Meninggal",
      dataIndex: "tgl_meninggal",
    },
  ];

  return (
    <Table
      columns={columns}
      title={() => (
        <Typography.Paragraph>Data Istri SIASN</Typography.Paragraph>
      )}
      dataSource={data}
      loading={isLoading}
      pagination={false}
    />
  );
};

const DataOrtu = ({ data, isLoading }) => {
  const columns = [
    {
      title: "Nama",
      dataIndex: "nama",
    },
    {
      title: "Tanggal Lahir",
      dataIndex: "tgl_lhr",
    },
  ];

  return (
    <Table
      columns={columns}
      title={() => <Typography.Paragraph>Data Ortu SIASN</Typography.Paragraph>}
      dataSource={data}
      loading={isLoading}
      pagination={false}
    />
  );
};

function CompareKeluargaByNip({ nip }) {
  const { data, isLoading } = useQuery(
    ["pns-rw-keluarga", nip],
    () => getRiwayatKeluargaByNip(nip),
    { enabled: !!nip }
  );

  return (
    <Card title="Padanan Data Keluarga SIASN">
      <Stack>
        <DataAnak data={data?.anak} isLoading={isLoading} />
        <DataIstri data={data?.pasangan} isLoading={isLoading} />
        <DataOrtu data={data?.ortu} isLoading={isLoading} />
      </Stack>
    </Card>
  );
}

export default CompareKeluargaByNip;
