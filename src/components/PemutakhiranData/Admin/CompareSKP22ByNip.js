import { rwSkpMasterByNip } from "@/services/master.services";
import {
  getRwSkp22ByNip,
  getTokenSIASNService,
  postRwSkp22ByNip,
} from "@/services/siasn-services";
import { API_URL } from "@/utils/client-utils";
import { FileAddOutlined, PlusOutlined } from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Flex,
  Form,
  Modal,
  Select,
  Table,
  Typography,
  Upload,
  message,
} from "antd";
import axios from "axios";
import { useState } from "react";
import FormCariPNSKinerja from "../FormCariPNSKinerja";
import UploadDokumen from "../UploadDokumen";

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

        formData.append("file", currentFile);
        formData.append("id_ref_dokumen", "873");

        const hasil = await axios.post(`${API_URL}/upload-dok`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${wso2}`,
            Auth: `bearer ${sso}`,
          },
        });

        const hasilAkhir = {
          ...data,
          path: [hasil?.data?.data],
        };

        await postRwSkp22ByNip({
          nip,
          data: hasilAkhir,
        });

        message.success("Berhasil menambahkan SKP ");
        setFileList([]);
        onCancel();
        setLoading(false);
        queryClient.invalidateQueries(["data-skp-22"]);
      } else {
        await postRwSkp22ByNip({
          nip,
          data,
        });

        message.success("Berhasil menambahkan SKP ");
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
            <Select.Option value="2022">TAHUN PENILAIAN 2022</Select.Option>
            <Select.Option value="2023">TAHUN PENILAIAN 2023</Select.Option>
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
            idRefDokumen={"891"}
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
  ];

  return (
    <Card title="Komparasi Kinerja" id="kinerja">
      <Stack>
        <FormSKP22 visible={visible} onCancel={handleCancel} nip={nip} />
        <div id="kinerja-siasn">
          <Flex justify="space-between">
            <div>
              <Typography.Title level={5} strong>
                SKP SIASN
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
