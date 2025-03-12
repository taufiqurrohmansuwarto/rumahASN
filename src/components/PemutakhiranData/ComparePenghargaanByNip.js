import { getRwSatyaLencanaByNip, urlToPdf } from "@/services/master.services";
import {
  createPenghargaanByNip,
  hapusPenghargaanByNip,
  penghargaanByNip,
} from "@/services/siasn-services";
import { DeleteOutlined, SendOutlined } from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Divider,
  Popconfirm,
  Space,
  Spin,
  Table,
  Tooltip,
  Typography,
  message,
} from "antd";
import CreatePenghargaan from "./CreatePenghargaan";
import UploadDokumen from "./UploadDokumen";
import ModalTransferPenghargaan from "./ModalTransferPenghargaan";
import { useState } from "react";
import dayjs from "dayjs";

const serializeSatyaLencanaId = (value) => {
  // jika 1 kembalian 201
  // jika 2 kembalian 202
  // jika 3 kembalian 203
  // yang lainnya
  switch (value) {
    case 1:
      return "201";
    case 2:
      return "202";
    case 3:
      return "203";
    default:
      return null;
  }
};

function ComparePenghargaanByNip({ nip }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ["riwayat-penghargaan-nip-siasn", nip],
    () => penghargaanByNip(nip),
    {}
  );

  const { data: dataMaster, isLoading: isLoadingMaster } = useQuery(
    ["riwayat-satyalencana-nip-master", nip],
    () => getRwSatyaLencanaByNip(nip),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 1000,
    }
  );

  const { mutateAsync: create, isLoading: isLoadingCreate } = useMutation(
    (data) => createPenghargaanByNip(data),
    {}
  );

  const { mutateAsync: hapus, isLoadsing: isLoadingHapus } = useMutation(
    (data) => hapusPenghargaanByNip(data),
    {
      onSuccess: () => {
        message.success("Berhasil menghapus penghargaan");
        queryClient.invalidateQueries(["riwayat-penghargaan-nip-siasn"]);
      },
      onError: (error) => {
        message.error(error?.response?.data?.message || error?.message);
      },
      onSettled: () =>
        queryClient.invalidateQueries(["riwayat-penghargaan-nip-siasn"]),
    }
  );

  const handleHapus = async (id) => {
    const payload = {
      nip,
      id,
    };
    await hapus(payload);
  };

  const columns = [
    {
      title: "File",
      key: "file",
      render: (_, record) => {
        return (
          <>
            {record?.path?.[892] && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.[892]?.dok_uri}`}
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
      title: "Nama Penghargaan",
      dataIndex: "hargaNama",
      responsive: ["sm"],
    },
    {
      title: "Nomor SK",
      dataIndex: "skNomor",
      responsive: ["sm"],
    },
    {
      title: "Tanggal SK",
      dataIndex: "skDate",
      responsive: ["sm"],
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (text) => {
        return (
          <Space direction="horizontal">
            <Popconfirm
              title="Apakah anda yakin ingin menghapus penghargaan ini?"
              onConfirm={async () => await handleHapus(text?.ID)}
            >
              <Tooltip title="Hapus">
                <a>
                  <DeleteOutlined />
                </a>
              </Tooltip>
            </Popconfirm>
            <Divider type="vertical" />
            <UploadDokumen
              id={text?.ID}
              idRefDokumen={"892"}
              invalidateQueries={["riwayat-penghargaan-nip-siasn"]}
              nama="Penghargaan"
            />
          </Space>
        );
      },
    },
  ];

  const [value, setValue] = useState();
  const [open, setOpen] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);
  const [file, setFile] = useState(null);

  const handleOpen = async (value) => {
    try {
      setLoadingFile(true);

      // Mengambil file PDF dari URL
      const response = await urlToPdf({ url: value?.file_satyalencana });

      // Membuat objek File dari response
      const file = new File([response], "file.pdf", {
        type: "application/pdf",
      });
      setFile(file);

      // Menyiapkan data yang akan digunakan
      const serializeValue = {
        hargaId: serializeSatyaLencanaId(
          value?.satyalencana?.jenis_satyalencana_id
        ),
        skDate: value?.tgl_sk,
        skNomor: value?.no_sk,
        tahun: value?.tgl_sk,
        file: value?.file_satyalencana,
      };

      // Mengatur state
      setValue(serializeValue);
      setOpen(true);
    } catch (error) {
      console.error("Error saat membuka file:", error);
    } finally {
      setLoadingFile(false);
    }
  };

  const handleClose = () => {
    setValue(null);
    setOpen(false);
    setFile(null);
  };

  const columnsMaster = [
    {
      title: "File",
      key: "file",
      render: (_, row) => (
        <>
          <a target="_blank" href={row?.file_satyalencana} rel="noreferrer">
            File
          </a>
        </>
      ),
    },
    {
      title: "Nama Penghargaan",
      key: "nama",
      render: (_, row) => <>{row?.satyalencana?.satyalencana}</>,
    },
    {
      title: "Nomor SK",
      key: "skNomor",
      render: (_, row) => <>{row?.no_sk}</>,
    },
    {
      title: "Tanggal SK",
      key: "skDate",
      render: (_, row) => <>{row?.tgl_sk}</>,
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, row) => (
        <div>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={async () => await handleOpen(row)}
            loading={loadingFile}
          >
            Transfer
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card title="Penghargaan">
      <Stack>
        <Table
          title={() => (
            <CreatePenghargaan
              loading={isLoadingCreate}
              nip={nip}
              onSubmit={create}
            />
          )}
          pagination={false}
          columns={columns}
          dataSource={data}
          loading={isLoading}
          rowKey={(row) => row?.id}
        />
        <Table
          title={() => <Typography.Text strong>SIMASTER</Typography.Text>}
          rowKey={(row) => row?.satylencana_id}
          pagination={false}
          columns={columnsMaster}
          dataSource={dataMaster}
          loading={isLoadingMaster}
        />
        <Spin spinning={loadingFile} fullscreen />
        <ModalTransferPenghargaan
          file={file}
          nip={nip}
          onSubmit={create}
          loading={isLoadingCreate}
          open={open}
          onCancel={handleClose}
          value={value}
        />
      </Stack>
    </Card>
  );
}

export default ComparePenghargaanByNip;
