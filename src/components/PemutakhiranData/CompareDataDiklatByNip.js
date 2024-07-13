import {
  getRwDiklatByNip,
  removeDiklatKursusById,
} from "@/services/siasn-services";
import { DeleteOutlined } from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Divider,
  Popconfirm,
  Skeleton,
  Space,
  Table,
  Tabs,
  Tooltip,
  Typography,
  message,
} from "antd";
import { useRouter } from "next/router";
import CompareDataDiklatMasterByNip from "./CompareDataDiklatMasterByNip";
import UploadDokumen from "./UploadDokumen";

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
  const router = useRouter();
  const nip = router.query?.nip;

  const queryClient = useQueryClient();
  const { mutateAsync: hapus, isLoading: isLoadingHapus } = useMutation(
    (data) => removeDiklatKursusById(data),
    {
      onSuccess: () => {
        message.success("Berhasil menghapus data");
        queryClient.invalidateQueries(["riwayat-diklat-by-nip"]);
      },
      onSettled: () => {
        queryClient.invalidateQueries(["riwayat-diklat-by-nip"]);
      },
      onError: () => {
        message.error("Gagal menghapus data");
      },
    }
  );

  const handleHapus = async (data) => {
    const payload = {
      nip,
      id: data?.id,
    };
    await hapus(payload);
  };

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
      title: "Tahun",
      dataIndex: "tahunKursus",
    },
    {
      title: "Nomer Sertifikat",
      dataIndex: "noSertipikat",
    },
    {
      title: "Tanggal",
      key: "tgl",
      render: (_, row) => (
        <>
          {row?.tanggalKursus} s/d {row?.tanggalSelesaiKursus}
        </>
      ),
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
    {
      title: "Aksi",
      key: "aksi",
      render: (_, row) => {
        return (
          <Space direction="horizontal">
            <Tooltip title="Hapus">
              <Popconfirm
                title="Apakah anda yakin ingin menghapus data ini?"
                onConfirm={() => handleHapus(row)}
              >
                <a>
                  <DeleteOutlined />
                </a>
              </Popconfirm>
            </Tooltip>
            <Divider type="vertical" />
            <UploadDokumen
              id={row?.id}
              invalidateQueries={["riwayat-diklat-by-nip"]}
              idRefDokumen={"881"}
              nama={"Kursus"}
            />
          </Space>
        );
      },
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

function CompareDataDiklatByNip({ nip }) {
  const { data, isLoading } = useQuery(
    ["riwayat-diklat-by-nip", nip],
    () => getRwDiklatByNip(nip),
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <Card title="Data Riwayat Diklat dan Kursus SIASN">
      <Tabs
        type="card"
        style={{
          marginTop: 16,
        }}
      >
        <Tabs.TabPane key="diklat-master" tab="SIMASTER">
          <CompareDataDiklatMasterByNip nip={nip} />
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

export default CompareDataDiklatByNip;
