import { dataDiklat } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Table, Typography } from "antd";
import { Stack } from "@mantine/core";

const TableDiklat = ({ data }) => {
  const columns = [
    {
      title: "Nama Diklat",
      dataIndex: "latihanStrukturalNama",
    },
    {
      title: "Nomor",
      dataIndex: "nomor",
    },
    {
      title: "Penyelenggara",
      dataIndex: "institusiPenyelenggara",
    },
    {
      title: "Tgl. Selesai",
      dataIndex: "tanggalSelesai",
    },
    {
      title: "Jumlah Jam",
      dataIndex: "jumlahJam",
    },
  ];
  return (
    <Table
      title={() => <Typography.Text strong>Data Diklat</Typography.Text>}
      columns={columns}
      pagination={false}
      dataSource={data}
    />
  );
};

const TableKursus = ({ data }) => {
  const columns = [
    {
      title: "Jenis",
      dataIndex: "jenisKursusSertifikat",
    },
    {
      title: "Penyelenggara",
      dataIndex: "institusiPenyelenggara",
    },
    {
      title: "Jumlah Jam",
      dataIndex: "jumlahJam",
    },
    {
      title: "Nama Kursus",
      dataIndex: "namaKursus",
    },
  ];
  return (
    <Table
      title={() => <Typography.Text strong>Data Kursus</Typography.Text>}
      pagination={false}
      columns={columns}
      dataSource={data}
    />
  );
};

function CompareDataDiklat() {
  const { data, isLoading } = useQuery(
    ["riwayat-diklat"],
    () => dataDiklat(),
    {}
  );

  return (
    <Stack>
      <TableKursus data={data?.kursus} />
      <TableDiklat data={data?.diklat} />
    </Stack>
  );
}

export default CompareDataDiklat;
