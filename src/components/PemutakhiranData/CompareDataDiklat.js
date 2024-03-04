import { dataDiklat } from "@/services/siasn-services";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Card, Skeleton, Table, Tabs, Typography } from "antd";
import FormDiklat from "./FormDiklat";
import CompareDataDiklatMaster from "./CompareDataDiklatMaster";

const TableDiklat = ({ data }) => {
  const columns = [
    {
      title: "File",
      key: "file",
      render: (_, row) => {
        return (
          <>
            {row?.path?.[874] && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${row?.path?.[874]?.dok_uri}`}
                target="_blank"
                rel="noreferrer"
              >
                File
              </a>
            )}
          </>
        );
      },
      responsive: ["sm"],
    },
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
      rowKey={(row) => row?.id}
      dataSource={data}
    />
  );
};

const TableKursus = ({ data }) => {
  const columns = [
    {
      title: "File",
      key: "file",
      render: (_, row) => {
        return (
          <>
            {row?.path?.[881] && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${row?.path?.[881]?.dok_uri}`}
                target="_blank"
                rel="noreferrer"
              >
                File
              </a>
            )}
          </>
        );
      },
      responsive: ["sm"],
    },
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
      title: "Tahun Kursus",
      dataIndex: "tahunKursus",
    },
    {
      title: "Nomer Sertifikat",
      dataIndex: "noSertipikat",
    },
    {
      title: "Tanggal Kursus",
      dataIndex: "tanggalKursus",
    },
    {
      title: "Tanggal Selesai Kursus",
      dataIndex: "tanggalSelesaiKursus",
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
      rowKey={(row) => row?.id}
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
    <Card title="Data Riwayat Diklat dan Kursus SIASN">
      <FormDiklat />
      <Tabs
        type="card"
        style={{
          marginTop: 16,
        }}
      >
        <Tabs.TabPane key="diklat-master" tab="SIMASTER">
          <CompareDataDiklatMaster />
        </Tabs.TabPane>
        <Tabs.TabPane key="diklat-siasn" tab="SIASN">
          <Stack>
            <Skeleton loading={isLoading}>
              <TableKursus data={data?.kursus} />
              <TableDiklat data={data?.diklat} />
            </Skeleton>
          </Stack>
        </Tabs.TabPane>
      </Tabs>
    </Card>
  );
}

export default CompareDataDiklat;
