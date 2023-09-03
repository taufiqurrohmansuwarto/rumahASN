import { dataDiklat } from "@/services/siasn-services";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Skeleton, Table, Typography } from "antd";

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
      title: "Nama Kursus, Jenis, Penyelenggara",
      key: "kursusJenisPenyelenggara",
      responsive: ["xs"],
      render: (text) => {
        return (
          <Stack>
            <div>{text?.namaKursus}</div>
            <div>{text?.jenisKursusSertifikat}</div>
            <div>{text?.institusiPenyelenggara}</div>
          </Stack>
        );
      },
    },
    {
      title: "Nama Kursus",
      dataIndex: "namaKursus",
      responsive: ["sm"],
    },
    {
      title: "Jenis",
      dataIndex: "jenisKursusSertifikat",
      responsive: ["sm"],
    },
    {
      title: "Penyelenggara",
      dataIndex: "institusiPenyelenggara",
      responsive: ["sm"],
    },
    {
      title: "Jumlah Jam",
      dataIndex: "jumlahJam",
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
      <Skeleton loading={isLoading}>
        <TableKursus data={data?.kursus} />
        <TableDiklat data={data?.diklat} />
      </Skeleton>
    </Stack>
  );
}

export default CompareDataDiklat;
