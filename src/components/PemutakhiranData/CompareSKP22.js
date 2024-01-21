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
  Form,
  Modal,
  Select,
  Skeleton,
  Table,
  Upload,
  message,
} from "antd";
import axios from "axios";
import { useState } from "react";
import FormCariPNSKinerja from "./FormCariPNSKinerja";

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

        await postRwSkp22({
          nip,
          data: hasilAkhir,
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

function CompareSKP22({ nip, id }) {
  const [visible, setVisible] = useState(false);

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
          <Stack spacing="xs">
            <div>
              {record?.path?.[873] && (
                <a
                  href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.[873]?.dok_uri}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  File
                </a>
              )}
            </div>
            <Text>{record?.tahun}</Text>
            <Text>Hasil Kerja : {record?.hasilKinerja}</Text>
            <Text>Kuadran : {record?.kuadranKinerja}</Text>
            <Text>
              {record?.namaPenilai} - {record?.penilaiUnorNm} -{" "}
              {record?.statusPenilai}
            </Text>
            <Text>
              Perilaku Kerja : {record?.perilakuKerja} -{" "}
              {record?.PerilakuKerjaNilai}
            </Text>
          </Stack>
        );
      },
    },
    {
      title: "File",
      key: "file",
      render: (_, record) => {
        return (
          <>
            {record?.path?.[873] && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.[873]?.dok_uri}`}
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
      title: "Hasil Kinerja",
      dataIndex: "hasilKinerja",
      responsive: ["sm"],
    },
    {
      title: "Hasil Kinerja Nilai",
      dataIndex: "hasilKinerjaNilai",
      responsive: ["sm"],
    },
    {
      title: "Kuadran Kinerja",
      dataIndex: "kuadranKinerja",
      responsive: ["sm"],
    },
    {
      title: "NIP Penilai",
      dataIndex: "nipNrpPenilai",
      responsive: ["sm"],
    },
    {
      title: "Nama Penilai",
      dataIndex: "namaPenilai",
      responsive: ["sm"],
    },
    {
      title: "Unor Penilai",
      dataIndex: "penilaiUnorNm",
      responsive: ["sm"],
    },
    {
      title: "Perilaku Kerja",
      dataIndex: "perilakuKerja",
      responsive: ["sm"],
    },
    {
      title: "Perilaku Kerja Nilai",
      dataIndex: "PerilakuKerjaNilai",
      responsive: ["sm"],
    },
    {
      title: "Status Penilai",
      dataIndex: "statusPenilai",
      responsive: ["sm"],
    },
    {
      title: "Tahun",
      dataIndex: "tahun",
      responsive: ["sm"],
    },
  ];

  const columnMaster = [
    {
      title: "SKP",
      key: "skp_xs",
      responsive: ["xs"],
      render: (_, record) => {
        return (
          <Stack spacing="xs">
            <div>
              <a href={record?.file_skp} target="_blank" rel="noreferrer">
                File
              </a>
            </div>
            <Text>{record?.tahun}</Text>
            <Text>Hasil Kerja : {record?.hasil_kerja}</Text>
            <Text>Perilaku : {record?.perilaku}</Text>
          </Stack>
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
      dataIndex: "hasil_kerja",
      responsive: ["sm"],
    },
    {
      title: "Perilaku Kerja",
      dataIndex: "perilaku",
      responsive: ["sm"],
    },
  ];

  return (
    <Skeleton loading={isLoading || isLoadingMaster}>
      <Alert
        color="yellow"
        title="Harap diperhatikan"
        icon={<IconAlertCircle />}
        style={{ marginBottom: 16 }}
      >
        Gunakan data dukung dari SIMASTER yang sesuai untuk melakukan
        pengentrian Kinerja SIASN. Jangan Lupa untuk mengupload file Kinerja
      </Alert>

      <Button onClick={handleVisible} type="primary" icon={<PlusOutlined />}>
        Kinerja SIASN
      </Button>
      <Stack>
        <FormSKP22 nip={nip} visible={visible} onCancel={handleCancel} />
        <Table
          title={() => <Text fw="bold">SIASN</Text>}
          pagination={false}
          columns={columns}
          loading={isLoading}
          rowKey={(row) => row?.id}
          dataSource={data}
        />
        <Table
          title={() => <Text fw="bold">SIMASTER</Text>}
          pagination={false}
          columns={columnMaster}
          loading={isLoadingMaster}
          rowKey={(row) => row?.skp_id}
          dataSource={dataMaster}
        />
      </Stack>
    </Skeleton>
  );
}

export default CompareSKP22;
