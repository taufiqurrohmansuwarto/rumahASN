import {
  dataDiklat,
  deleteDiklat,
  deleteKursus,
} from "@/services/siasn-services";
import { Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Descriptions,
  FloatButton,
  Popconfirm,
  Skeleton,
  Table,
  Tabs,
  Typography,
  message,
} from "antd";
import CompareDataDiklatMaster from "./CompareDataDiklatMaster";
import FormDiklat from "./FormDiklat";

const TableDiklat = ({ data }) => {
  const queryClient = useQueryClient();
  const { mutateAsync: hapus, isLoading } = useMutation(
    (id) => deleteDiklat(id),
    {
      onSuccess: () => {
        message.success("Data berhasil dihapus");
      },
      onError: (error) => {
        console.log(error);
        message.error(error?.response?.data?.message);
      },
      onSettled: () => {
        queryClient.invalidateQueries("riwayat-diklat");
      },
    }
  );

  const columns = [
    {
      title: "Data",
      key: "file",
      render: (_, row) => {
        return (
          <Descriptions layout="vertical">
            <Descriptions.Item label="File">
              {row?.path?.[874] && (
                <a
                  href={`/helpdesk/api/siasn/ws/download?filePath=${row?.path?.[874]?.dok_uri}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  File
                </a>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Nama">
              {row?.latihanStrukturalNama}
            </Descriptions.Item>
            <Descriptions.Item label="Nomor">{row?.nomor}</Descriptions.Item>
            <Descriptions.Item label="Penyelenggara">
              {row?.institusiPenyelenggara}
            </Descriptions.Item>
            <Descriptions.Item label="Tgl. Selesai">
              {row?.tanggalSelesai}
            </Descriptions.Item>
            <Descriptions.Item label="Jumlah Jam">
              {row?.jumlahJam}
            </Descriptions.Item>
            <Descriptions.Item label="Aksi">
              <Popconfirm
                onConfirm={async () => await hapus(row?.id)}
                title="Apakah anda yakin ingin menghapus data?"
              >
                <a>Hapus</a>
              </Popconfirm>
            </Descriptions.Item>
          </Descriptions>
        );
      },
    },
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
      responsive: ["sm"],
    },
    {
      title: "Nomor",
      dataIndex: "nomor",
      responsive: ["sm"],
    },
    {
      title: "Penyelenggara",
      dataIndex: "institusiPenyelenggara",
      responsive: ["sm"],
    },
    {
      title: "Tgl. Selesai",
      dataIndex: "tanggalSelesai",
      responsive: ["sm"],
    },
    {
      title: "Jumlah Jam",
      dataIndex: "jumlahJam",
      responsive: ["sm"],
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, row) => {
        return (
          <Popconfirm
            onConfirm={async () => await hapus(row?.id)}
            title="Apakah anda yakin ingin menghapus data?"
          >
            <a>Hapus</a>
          </Popconfirm>
        );
      },
      responsive: ["sm"],
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
  const queryClient = useQueryClient();
  const { mutateAsync: hapus, isLoading } = useMutation(
    (id) => deleteKursus(id),
    {
      onSuccess: () => {
        message.success("Data berhasil dihapus");
      },
      onError: (error) => {
        console.log(error);
        message.error(error?.response?.data?.message);
      },
      onSettled: () => {
        queryClient.invalidateQueries("riwayat-diklat");
      },
    }
  );
  const columns = [
    {
      title: "Data",
      key: "data",
      responsive: ["xs"],
      render: (_, row) => {
        return (
          <Descriptions layout="vertical">
            <Descriptions.Item label="File">
              {row?.path?.[881] && (
                <a
                  href={`/helpdesk/api/siasn/ws/download?filePath=${row?.path?.[881]?.dok_uri}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  File
                </a>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Nama Kursus">
              {row?.namaKursus}
            </Descriptions.Item>
            <Descriptions.Item label="Tahun Kursus">
              {row?.tahunKursus}
            </Descriptions.Item>
            <Descriptions.Item label="Nomer Sertifikat">
              {row?.noSertipikat}
            </Descriptions.Item>
            <Descriptions.Item label="Tanggal Kursus">
              {row?.tanggalKursus}
            </Descriptions.Item>
            <Descriptions.Item label="Tanggal Selesai Kursus">
              {row?.tanggalSelesaiKursus}
            </Descriptions.Item>
            <Descriptions.Item label="Jenis">
              {row?.jenisKursusSertifikat}
            </Descriptions.Item>
            <Descriptions.Item label="Penyelenggara">
              {row?.institusiPenyelenggara}
            </Descriptions.Item>
            <Descriptions.Item label="Jumlah Jam">
              {row?.jumlahJam}
            </Descriptions.Item>
            <Descriptions.Item label="Aksi">
              <Popconfirm
                onConfirm={async () => await hapus(row?.id)}
                title="Apakah anda yakin ingin menghapus data?"
              >
                <a>Hapus</a>
              </Popconfirm>
            </Descriptions.Item>
          </Descriptions>
        );
      },
    },
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
      title: "Nama Kursus",
      dataIndex: "namaKursus",
      responsive: ["sm"],
    },
    {
      title: "Tahun Kursus",
      dataIndex: "tahunKursus",
      responsive: ["sm"],
    },
    {
      title: "Nomer Sertifikat",
      dataIndex: "noSertipikat",
      responsive: ["sm"],
    },
    {
      title: "Tanggal Kursus",
      dataIndex: "tanggalKursus",
      responsive: ["sm"],
    },
    {
      title: "Tanggal Selesai Kursus",
      dataIndex: "tanggalSelesaiKursus",
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
      responsive: ["sm"],
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, row) => {
        return (
          <Popconfirm
            onConfirm={async () => await hapus(row?.id)}
            title="Apakah anda yakin ingin menghapus data?"
          >
            <a>Hapus</a>
          </Popconfirm>
        );
      },
      responsive: ["sm"],
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
      <FloatButton.BackTop />
      <FormDiklat />
      <Tabs
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
