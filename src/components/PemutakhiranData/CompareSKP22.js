import { rwSkpMaster } from "@/services/master.services";
import {
  getRwSkp22,
  getTokenSIASNService,
  postRwSkp22,
} from "@/services/siasn-services";
import { API_URL } from "@/utils/client-utils";
import { FileAddOutlined, PlusOutlined } from "@ant-design/icons";
import { Alert, Stack, Text } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Descriptions,
  FloatButton,
  Form,
  Modal,
  Select,
  Skeleton,
  Space,
  Table,
  Upload,
  message,
} from "antd";
import axios from "axios";
import { useState } from "react";
import FormCariPNSKinerja from "./FormCariPNSKinerja";
import UploadDokumen from "./UploadDokumen";
import ModalTransferSKP22Personal from "./Admin/ModalTransferSKP22Personal";
import { urlToPdf } from "@/services/master.services";
import FormCariAtasanKinerja from "./FormCariAtasanKinerja";

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
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (info) => {
    let fileList = [...info.fileList];

    fileList = fileList.slice(-1);

    fileList = fileList.map((file) => {
      if (file.response) {
        file.url = file.response.url;
      }
      return file;
    });

    setFileList(fileList);
  };

  const handleFinish = async () => {
    try {
      setLoading(true);
      const data = await form.validateFields();

      const currentFile = fileList[0]?.originFileObj;

      if (currentFile) {
        const result = await getTokenSIASNService();

        const wso2 = result?.accessToken?.wso2;
        const sso = result?.accessToken?.sso;

        const formData = new FormData();

        const dataSkp = await postRwSkp22({
          nip,
          data,
        });

        const idRiwayat = dataSkp?.id;

        formData.append("file", currentFile);
        formData.append("id_ref_dokumen", "891");
        formData.append("id_riwayat", idRiwayat);

        await axios.post(`${API_URL}/upload-dok-rw`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${wso2}`,
            Auth: `bearer ${sso}`,
          },
        });

        message.success("Berhasil menambahkan SKP");
        setFileList([]);
        onCancel();
        setLoading(false);
        queryClient.invalidateQueries(["data-skp-22"]);
      } else {
        await postRwSkp22({
          nip,
          data,
        });

        message.success("Berhasil menambahkan SKP");
        setFileList([]);
        onCancel();
        setLoading(false);
        queryClient.invalidateQueries(["data-skp-22"]);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleConfirmModal = async () => {
    try {
      const result = await form.validateFields();
      Modal.confirm({
        centered: true,
        title: "Apakah anda yakin?",
        content: `Mohon pastikan semua data dan dokumen yang Anda masukkan selalu terkini dan akurat. Ketidaksesuaian informasi bisa berdampak pada proses layanan kepegawaian pegawai. Ingat, setiap entri data akan dicatat dan dipertanggungjawabkan melalui sistem log Rumah ASN.`,
        okText: "Ya",
        cancelText: "Tidak",
        onOk: async () => await handleFinish(),
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal
      title="Tambah Kinerja SIASN"
      centered
      open={visible}
      confirmLoading={loading}
      onCancel={onCancel}
      onOk={handleConfirmModal}
      width={1000}
    >
      <Upload
        beforeUpload={() => false}
        maxCount={1}
        accept=".pdf"
        onChange={handleChange}
        fileList={fileList}
      >
        <Button icon={<FileAddOutlined />}>Upload</Button>
      </Upload>
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
            <Select.Option value="2025">TAHUN PENILAIAN 2025</Select.Option>
            <Select.Option value="2025">TAHUN PENILAIAN 2024</Select.Option>
            <Select.Option value="2024">TAHUN PENILAIAN 2024</Select.Option>
            <Select.Option value="2023">TAHUN PENILAIAN 2023</Select.Option>
            <Select.Option value="2022">TAHUN PENILAIAN 2022</Select.Option>
          </Select>
        </Form.Item>
        {/* <FormCariPNSKinerja
          help="ketik NIP Tanpa Spasi dan tunggu..."
          label="Atasan Penilai"
          name="pns_penilai"
        /> */}
        <FormCariAtasanKinerja
          help="Ketik Nama Atasan Penilai lalu tunggu..."
          label="Atasan Penilai"
          name="pns_penilai"
        />
      </Form>
    </Modal>
  );
};

function CompareSKP22({ nip, id }) {
  const [visible, setVisible] = useState(false);
  const [openTransfer, setOpenTransfer] = useState(false);
  const [dataTransfer, setDataTransfer] = useState(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [file, setFile] = useState(null);

  const handleModalTransfer = async (data) => {
    setLoadingFile(true);
    try {
      const currentFile = data?.file_skp;

      if (!currentFile) {
        setOpenTransfer(true);
        setDataTransfer(data);
      } else {
        const response = await urlToPdf({ url: currentFile });
        const file = new File([response], "file.pdf", {
          type: "application/pdf",
        });
        setFile(file);
        setOpenTransfer(true);
        setDataTransfer(data);
      }
      setLoadingFile(false);
    } catch (error) {
      console.log(error);
      setLoadingFile(false);
    }
  };

  const handleCloseModalTransfer = () => {
    setOpenTransfer(false);
    setDataTransfer(null);
    setFile(null);
  };

  const handleVisible = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const { data, isLoading } = useQuery(["data-skp-22"], () => getRwSkp22());

  const { data: dataMaster, isLoading: isLoadingMaster } = useQuery(
    ["data-master-skp"],
    () => rwSkpMaster()
  );

  const columns = [
    {
      title: "SKP",
      key: "skp",
      responsive: ["xs"],
      render: (_, record) => {
        return (
          <Descriptions size="small" layout="vertical">
            <Descriptions.Item label="File">
              {record?.path?.["890"] && (
                <a
                  href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.["890"]?.dok_uri}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  File
                </a>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Tahun">{record?.tahun}</Descriptions.Item>
            <Descriptions.Item label="Hasil Kinerja">
              {record?.hasilKinerja}
            </Descriptions.Item>
            <Descriptions.Item label="Kuadran Kinerja">
              {record?.kuadranKinerja}
            </Descriptions.Item>
            <Descriptions.Item label="NIP Penilai">
              {record?.nipNrpPenilai}
            </Descriptions.Item>
            <Descriptions.Item label="Nama Penilai">
              {record?.namaPenilai}
            </Descriptions.Item>
            <Descriptions.Item label="Unor Penilai">
              {record?.penilaiUnorNm}
            </Descriptions.Item>
            <Descriptions.Item label="Status Penilai">
              {record?.statusPenilai}
            </Descriptions.Item>
            <Descriptions.Item label="Perilaku Kerja">
              {record?.perilakuKerja}
            </Descriptions.Item>
          </Descriptions>
        );
      },
    },
    {
      title: "File",
      key: "file",
      render: (_, record) => {
        return (
          <>
            {record?.path?.["890"] && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.["890"]?.dok_uri}`}
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
      title: "Tahun",
      dataIndex: "tahun",
      responsive: ["sm"],
    },
    {
      title: "Hasil Kerja",
      dataIndex: "hasilKinerja",
      responsive: ["sm"],
    },
    {
      title: "Perilaku Kerja",
      dataIndex: "perilakuKerja",
      responsive: ["sm"],
    },

    {
      title: "Penilai",
      key: "penilai",
      // width: 200,
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          {row?.namaPenilai} {row?.penilaiUnorNm}
        </Space>
      ),
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, row) => (
        <Space direction="horizontal">
          <UploadDokumen
            id={row?.id}
            idRefDokumen={"890"}
            invalidateQueries={["data-skp-22"]}
            nama={"SKP"}
          />
        </Space>
      ),
    },
  ];

  const columnMaster = [
    {
      title: "SKP",
      key: "skp_xs",
      responsive: ["xs"],
      render: (_, record) => {
        return (
          <Descriptions size="small" layout="vertical">
            <Descriptions.Item label="File">
              <a href={record?.file_skp} target="_blank" rel="noreferrer">
                File
              </a>
            </Descriptions.Item>
            <Descriptions.Item label="Tahun">{record?.tahun}</Descriptions.Item>
            <Descriptions.Item label="Hasil Kerja">
              {record?.hasil_kerja}
            </Descriptions.Item>
            <Descriptions.Item label="Perilaku Kerja">
              {record?.perilaku}
            </Descriptions.Item>
          </Descriptions>
        );
      },
    },
    {
      title: "File",
      key: "file_skp",
      render: (_, record) => (
        <a href={record?.file_skp} target="_blank" rel="noreferrer">
          File
        </a>
      ),
      width: 100,
      responsive: ["sm"],
    },
    {
      title: "Tahun",
      dataIndex: "tahun",
      responsive: ["sm"],
    },
    {
      title: "Hasil Kerja",
      key: "hasil_kerja",
      render: (_, row) => row?.hasil_kerja?.toUpperCase(),
      responsive: ["sm"],
    },
    {
      title: "Perilaku Kerja",
      key: "perilaku",
      render: (_, row) => row?.perilaku?.toUpperCase(),
      responsive: ["sm"],
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, row) => {
        const tahunAktif =
          row?.tahun === 2024 ||
          row?.tahun === 2023 ||
          row?.tahun === 2022 ||
          row?.tahun === 2025;

        if (tahunAktif) {
          return <a onClick={() => handleModalTransfer(row)}>Transfer SIASN</a>;
        }
      },
    },
  ];

  return (
    <Skeleton loading={isLoading || isLoadingMaster}>
      <ModalTransferSKP22Personal
        open={openTransfer}
        onCancel={handleCloseModalTransfer}
        data={dataTransfer}
        loadingFile={loadingFile}
        file={file}
      />
      <FloatButton.BackTop />
      <Alert
        color="blue"
        title="Harap diperhatikan"
        icon={<IconAlertCircle />}
        style={{ marginBottom: 16 }}
      >
        Jika terjadi kesalahan pada data SKP SIASN, gunakan tahun yang sama
        dengan data yang baru.
      </Alert>

      <Button onClick={handleVisible} type="primary" icon={<PlusOutlined />}>
        Kinerja SIASN
      </Button>
      <Stack>
        <FormSKP22 nip={nip} visible={visible} onCancel={handleCancel} />
        <Table
          title={() => <Text fw="bold">SIMASTER</Text>}
          pagination={false}
          columns={columnMaster}
          loading={isLoadingMaster}
          rowKey={(row) => row?.skp_id}
          dataSource={dataMaster}
        />
        <Table
          title={() => <Text fw="bold">SIASN</Text>}
          pagination={false}
          columns={columns}
          loading={isLoading}
          rowKey={(row) => row?.id}
          dataSource={data}
        />
      </Stack>
    </Skeleton>
  );
}

export default CompareSKP22;
