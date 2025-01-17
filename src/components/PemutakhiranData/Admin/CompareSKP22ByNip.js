import { rwSkpMasterByNip, urlToPdf } from "@/services/master.services";
import {
  getRwSkp22ByNip,
  postRwSkp22ByNip,
  uploadDokRiwayat,
} from "@/services/siasn-services";
import useFileStore from "@/store/useFileStore";
import { PlusOutlined, SendOutlined } from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  Flex,
  Form,
  Modal,
  Select,
  Table,
  Typography,
  message,
  Tooltip,
} from "antd";
import { useState } from "react";
import FileUploadSIASN from "../FileUploadSIASN";
import FormCariPNSKinerja from "../FormCariPNSKinerja";
import UploadDokumen from "../UploadDokumen";
import ModalTransferSKP22 from "./ModalTransferSKP22";

// const data = {
//     hasilKinerjaNilai: 0,
//     id: "string",
//     kuadranKinerjaNilai: 0,
//     path: [
//         {
//             dok_id: "string",
//             dok_nama: "string",
//             dok_uri: "string",
//             object: "string",
//             slug: "string"
//         }
//     ],
//     penilaiGolongan: "string",
//     penilaiJabatan: "string",
//     penilaiNama: "string",
//     penilaiNipNrp: "string",
//     penilaiUnorNama: "string",
//     perilakuKerjaNilai: 0,
//     pnsDinilaiOrang: "string",
//     statusPenilai: "string",
//     tahun: 0
// };

const FormSKP22 = ({ visible, onCancel, nip }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const fileList = useFileStore((state) => state.fileList);

  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    try {
      setLoading(true);
      const data = await form.validateFields();

      const payload = {
        nip,
        data,
      };

      const file = fileList?.[0]?.originFileObj;

      if (file) {
        const responseSkp = await postRwSkp22ByNip(payload);
        const idSkp = responseSkp?.id;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("id_ref_dokumen", "890");
        formData.append("id_riwayat", idSkp);
        await uploadDokRiwayat(formData);
        message.success("Berhasil menambahkan SKP");
        queryClient.invalidateQueries(["data-skp-22", nip]);
        onCancel();
      } else {
        await postRwSkp22ByNip(payload);
        message.success("Berhasil menambahkan SKP");
        queryClient.invalidateQueries(["data-skp-22", nip]);
        onCancel();
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleConfirmModal = async () => {
    try {
      await form.validateFields();
      Modal.confirm({
        centered: true,
        title: "Apakah anda yakin?",
        content: `Mohon pastikan semua data dan dokumen yang Anda masukkan selalu terkini dan akurat. Ketidaksesuaian informasi bisa berdampak pada proses layanan kepegawaian pegawai. Ingat, setiap entri data akan dicatat dan dipertanggungjawabkan melalui sistem log Rumah ASN.`,
        okText: "Ya",
        cancelText: "Tidak",
        onOk: async () => await handleFinish(),
      });
    } catch (error) {}
  };

  return (
    <Modal
      title="Tambah SKP SIASN"
      centered
      open={visible}
      confirmLoading={loading}
      onCancel={onCancel}
      onOk={handleConfirmModal}
      width={1000}
    >
      <FileUploadSIASN />
      <Form layout="vertical" form={form}>
        <Form.Item name="hasilKinerjaNilai" label="Hasil Kerja Nilai" required>
          <Select>
            <Select.Option value="1">DIATAS EKSPETASI</Select.Option>
            <Select.Option value="2">SESUAI EKSPETASI</Select.Option>
            <Select.Option value="3">DIBAWAH EKSPETASI</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="perilakuKerjaNilai"
          label="Perilaku Kerja Nilai"
          required
        >
          <Select>
            <Select.Option value="1">DIATAS EKSPETASI</Select.Option>
            <Select.Option value="2">SESUAI EKSPETASI</Select.Option>
            <Select.Option value="3">DIBAWAH EKSPETASI</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="tahun" label="Tahun Penilaian" required>
          <Select>
            <Select.Option value="2024">TAHUN PENILAIAN 2024</Select.Option>
            <Select.Option value="2023">TAHUN PENILAIAN 2023</Select.Option>
            <Select.Option value="2022">TAHUN PENILAIAN 2022</Select.Option>
          </Select>
        </Form.Item>
        <FormCariPNSKinerja
          help="ketik NIP Tanpa Spasi dan tunggu..."
          label="Atasan Penilai"
          name="pns_penilai"
        />
      </Form>
    </Modal>
  );
};

function CompareSKP22ByNip({ nip }) {
  const [visible, setVisible] = useState(false);

  const [openTransfer, setOpenTransfer] = useState(false);
  const [currentData, setCurrentData] = useState(null);
  const [file, setFile] = useState(null);
  const [loadingFile, setLoadingFile] = useState(false);

  const handleOpenTransfer = async (data) => {
    setLoadingFile(true);
    try {
      const currentFile = data?.file_skp;

      if (!currentFile) {
        setOpenTransfer(true);
        setCurrentData(data);
      } else {
        const response = await urlToPdf({ url: currentFile });
        const file = new File([response], "file.pdf", {
          type: "application/pdf",
        });
        setFile(file);
        setOpenTransfer(true);
        setCurrentData(data);
      }
      setLoadingFile(false);
    } catch (error) {
      setLoadingFile(false);
    }
  };

  const handleCloseTransfer = () => {
    setOpenTransfer(false);
    setCurrentData(null);
  };

  const handleVisible = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const { data, isLoading } = useQuery(
    ["data-skp-22", nip],
    () => getRwSkp22ByNip(nip),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: dataMaster, isLoading: isLoadingMaster } = useQuery(
    ["data-master-skp-by-nip", nip],
    () => rwSkpMasterByNip(nip),
    {
      refetchOnWindowFocus: false,
    }
  );

  const columns = [
    {
      title: "File",
      key: "file",
      render: (_, record) => {
        return (
          <>
            {record?.path?.[890] && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.[890]?.dok_uri}`}
                target="_blank"
                rel="noreferrer"
              >
                File
              </a>
            )}
          </>
        );
      },
    },
    {
      title: "Hasil Kinerja",
      dataIndex: "hasilKinerja",
    },
    {
      title: "Hasil Kinerja Nilai",
      dataIndex: "hasilKinerjaNilai",
    },
    {
      title: "Kuadran Kinerja",
      dataIndex: "kuadranKinerja",
    },
    {
      title: "Nama Penilai",
      dataIndex: "namaPenilai",
    },
    {
      title: "NIP Penilai",
      dataIndex: "nipNrpPenilai",
      responsive: ["sm"],
    },
    {
      title: "Unor Penilai",
      dataIndex: "penilaiUnorNm",
    },
    {
      title: "Perilaku Kerja",
      dataIndex: "perilakuKerja",
    },
    {
      title: "Perilaku Kerja Nilai",
      dataIndex: "PerilakuKerjaNilai",
    },
    {
      title: "Status Penilai",
      dataIndex: "statusPenilai",
    },
    {
      title: "Tahun",
      dataIndex: "tahun",
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, row) => {
        return (
          <UploadDokumen
            id={row?.id}
            idRefDokumen={"890"}
            invalidateQueries={["data-skp-22"]}
            nama="Kinerja"
          />
        );
      },
    },
  ];

  const columnMaster = [
    {
      title: "File",
      key: "file_skp",
      render: (_, record) => (
        <a href={record?.file_skp} target="_blank" rel="noreferrer">
          File
        </a>
      ),
      width: 100,
    },
    {
      title: "Tahun",
      dataIndex: "tahun",
    },
    {
      title: "Hasil Kerja",
      dataIndex: "hasil_kerja",
    },
    {
      title: "Perilaku Kerja",
      dataIndex: "perilaku",
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, row) => {
        const tahun = row?.tahun;
        const tahunTransfer =
          tahun === 2024 || tahun === 2023 || tahun === 2022;

        if (tahunTransfer) {
          return (
            <Tooltip title="Transfer">
              <a onClick={() => handleOpenTransfer(row)}>
                <SendOutlined />
              </a>
            </Tooltip>
          );
        } else {
          return null;
        }
      },
    },
  ];

  return (
    <Card title="Komparasi Kinerja" id="kinerja">
      <ModalTransferSKP22
        open={openTransfer}
        data={currentData}
        onCancel={handleCloseTransfer}
        file={file}
        loadingFile={loadingFile}
        // onOk={handleTransfer}
      />
      <Stack>
        <FormSKP22 visible={visible} onCancel={handleCancel} nip={nip} />
        <div id="kinerja-siasn">
          <Alert
            showIcon
            type="info"
            description="Jika terjadi kesalahan pada data SKP SIASN, gunakan tahun yang sama dengan data yang baru. Data yang lama akan direplace dengan data yang baru."
            style={{ marginBottom: 12 }}
          />
          <Flex justify="space-between">
            <div>
              <Typography.Title level={5} strong>
                SKP (KINERJA) SIASN{" "}
              </Typography.Title>
            </div>
            <Button
              icon={<PlusOutlined />}
              type="primary"
              onClick={handleVisible}
            >
              Tambah
            </Button>
          </Flex>
          <Table
            style={{
              marginTop: 20,
            }}
            pagination={false}
            columns={columns}
            loading={isLoading}
            rowKey={(row) => row?.id}
            dataSource={data}
          />
        </div>
        <div id="kinerja-simaster">
          <Flex justify="start">
            <div>
              <Typography.Title level={5} strong>
                SKP SIMASTER
              </Typography.Title>
            </div>
          </Flex>
          <Table
            pagination={false}
            columns={columnMaster}
            loading={isLoadingMaster}
            rowKey={(row) => row?.skp_id}
            dataSource={dataMaster}
          />
        </div>
      </Stack>
    </Card>
  );
}

export default CompareSKP22ByNip;
