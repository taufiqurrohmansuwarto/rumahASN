import { rwAngkakreditMaster } from "@/services/master.services";
import {
  dataUtamaSIASN,
  deleteAk,
  getRwAngkakredit,
  getTokenSIASNService,
  postRwAngkakredit,
} from "@/services/siasn-services";
import { API_URL } from "@/utils/client-utils";
import { FileAddOutlined } from "@ant-design/icons";
import { Alert, Stack, Text } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Skeleton,
  Space,
  Table,
  Upload,
  message,
} from "antd";
import axios from "axios";
import { useState } from "react";
import FormRiwayatJabatan from "./FormRiwayatJabatan";

// const data = {
//     bulanMulaiPenilaian: "string",
//     bulanSelesaiPenilaian: "string",
//     id: "string",
//     isAngkaKreditPertama: "string",
//     kreditBaruTotal: "string",
//     kreditPenunjangBaru: "string",
//     kreditUtamaBaru: "string",
//     nomorSk: "string",
//     path: [
//         {
//             dok_id: "string",
//             dok_nama: "string",
//             dok_uri: "string",
//             object: "string",
//             slug: "string"
//         }
//     ],
//     pnsId: "string",
//     pnsUserId: "string",
//     rwJabatanId: "string",
//     tahunMulaiPenilaian: "string",
//     tahunSelesaiPenilaian: "string",
//     tanggalSk: "string"
// };

const FormAngkaKredit = ({ visible, onCancel, nip }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const queryClient = useQueryClient();

  const [fileList, setFileList] = useState([]);

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

  const onFinish = async () => {
    setLoading(true);
    try {
      const result = await form.validateFields();
      const { selesaiPenilaian, mulaiPenilaian, ...rest } = result;
      const data = {
        ...rest,
        bulanMulaiPenailan: mulaiPenilaian.format("M"),
        bulanSelesaiPenailan: selesaiPenilaian.format("M"),
        tahunMulaiPenailan: mulaiPenilaian.format("YYYY"),
        tahunSelesaiPenailan: selesaiPenilaian.format("YYYY"),
        isAngkaKreditPertama: rest?.isAngkaKreditPertama ? "1" : "0",
        isIntegrasi: rest?.isIntegrasi ? "1" : "0",
        isKonversi: rest?.isKonversi ? "1" : "0",
        tanggalSk: rest?.tanggalSk.format("DD-MM-YYYY"),
      };

      const currentFile = fileList[0]?.originFileObj;

      if (currentFile) {
        const result = await getTokenSIASNService();

        const wso2 = result?.accessToken?.wso2;
        const sso = result?.accessToken?.sso;

        const formData = new FormData();

        formData.append("file", currentFile);
        formData.append("id_ref_dokumen", "879");
        const hasil = await axios.post(`${API_URL}/upload-dok`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${wso2}`,
            Auth: `bearer ${sso}`,
          },
        });

        const postData = {
          ...data,
          path: [hasil?.data?.data],
        };

        await postRwAngkakredit({
          data: postData,
        });

        queryClient.invalidateQueries("angka-kredit");
        setLoading(false);
        onCancel();
        setFileList([]);
        message.success("Berhasil menambahkan angka kredit");
      } else {
        await postRwAngkakredit({
          data,
        });

        queryClient.invalidateQueries("angka-kredit");
        setLoading(false);
        onCancel();
        setFileList([]);
        message.success("Berhasil menambahkan angka kredit");
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      message.error("Gagal menambahkan angka kredit");
    }
  };

  return (
    <Modal
      confirmLoading={loading}
      title="Tambah Angka Kredit"
      centered
      visible={visible}
      width={800}
      onCancel={onCancel}
      onOk={onFinish}
    >
      <Form form={form} layout="vertical">
        <Upload
          beforeUpload={() => false}
          maxCount={1}
          accept=".pdf"
          onChange={handleChange}
          fileList={fileList}
        >
          <Button icon={<FileAddOutlined />}>Upload</Button>
        </Upload>
        <Form.Item required name="nomorSk" label="Nomor SK">
          <Input />
        </Form.Item>
        <Form.Item required name="tanggalSk" label="Tanggal SK">
          <DatePicker format={"DD-MM-YYYY"} />
        </Form.Item>
        <Row>
          <Col span={12}>
            <Form.Item required name="mulaiPenilaian" label="Mulai Penilaian">
              <DatePicker picker="month" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              required
              name="selesaiPenilaian"
              label="Selesai Penilaian"
            >
              <DatePicker picker="month" />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item
              required
              name="kreditUtamaBaru"
              label="Kredit Utama Baru"
            >
              <InputNumber />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="kreditPenunjangBaru"
              label="Kredit Penunjang Baru"
              required
            >
              <InputNumber />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              required
              name="kreditBaruTotal"
              label="Kredit Baru Total"
            >
              <InputNumber />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          valuePropName="checked"
          name="isAngkaKreditPertama"
          lable="Angka Kredit Pertama"
        >
          <Checkbox>Angka Kredit Pertama?</Checkbox>
        </Form.Item>
        <Form.Item
          valuePropName="checked"
          name="isIntegrasi"
          lable="Integrasi?"
        >
          <Checkbox>Integrasi</Checkbox>
        </Form.Item>
        <Form.Item valuePropName="checked" name="isKonversi" lable="Konversi?">
          <Checkbox>Konversi</Checkbox>
        </Form.Item>
        <FormRiwayatJabatan nip={nip} name="rwJabatanId" />
      </Form>
    </Modal>
  );
};

function CompareAngkaKredit() {
  const { data, isLoading } = useQuery(["angka-kredit"], () =>
    getRwAngkakredit()
  );

  const { data: dataUtama, isLoading: isLoadingDataUtama } = useQuery(
    ["data-utama-siasn"],
    () => dataUtamaSIASN(),
    {}
  );

  const { data: dataRwAngkakredit, isLoading: isLoadingAngkaKredit } = useQuery(
    ["angkat-kredit-master"],
    () => rwAngkakreditMaster()
  );

  const queryClient = useQueryClient();

  const { mutateAsync: hapus, isLoading: isLoadingHapus } = useMutation(
    (id) => deleteAk(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("angka-kredit");
        message.success("Berhasil menghapus data angka kredit");
      },
      onError: () => {
        message.error("Gagal menghapus data angka kredit");
      },
    }
  );

  const handleHapus = async (row) => {
    await hapus(row?.id);
  };

  const [visible, setVisible] = useState(false);

  const handleVisible = () => setVisible(true);
  const handleCancel = () => setVisible(false);

  const columns = [
    {
      title: "Data",
      responsive: ["xs"],
      key: "data",
      render: (_, record) => {
        return (
          <Space direction="vertical">
            <div>
              {record?.path?.[879] && (
                <a
                  href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.[879]?.dok_uri}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  File
                </a>
              )}
            </div>
            <Text>Nomor SK : {record?.nomorSk}</Text>
            <Text>
              Bulan Mulai Penilaian
              {record?.bulanMulaiPenailan} {record?.tahunMulaiPenilaian} -{" "}
              {record?.bulanSelesaiPenailan} {record?.tahunSelesaiPenilaian}
            </Text>
            <Text>Kredit Utama Baru : {record?.kreditUtamaBaru}</Text>
            <Text>Kredit Penunjang Baru : {record?.kreditPenunjangBaru}</Text>
            <Text>Kredit Baru Total : {record?.kreditBaruTotal}</Text>
            <Text>Kredit Nama Jabatan : {record?.namaJabatan}</Text>
          </Space>
        );
      },
    },
    {
      title: "File",
      responsive: ["sm"],
      key: "path",
      render: (_, record) => {
        return (
          <>
            {record?.path?.[879] && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.[879]?.dok_uri}`}
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
      title: "Nomor SK",
      dataIndex: "nomorSk",
      responsive: ["sm"],
    },
    {
      title: "Bulan Mulai Penilaian",
      dataIndex: "bulanMulaiPenailan",
      responsive: ["sm"],
    },
    {
      title: "Tahun Mulai Penilaian",
      dataIndex: "tahunMulaiPenailan",
      responsive: ["sm"],
    },
    {
      title: "Bulan Selesai Penilaian",
      dataIndex: "bulanSelesaiPenailan",
      responsive: ["sm"],
    },
    {
      title: "Tahun Selesai Penilaian",
      dataIndex: "tahunSelesaiPenailan",
      responsive: ["sm"],
    },
    {
      title: "Kredit Utama Baru",
      dataIndex: "kreditUtamaBaru",
      responsive: ["sm"],
    },
    {
      title: "Kredit Penunjang Baru",
      dataIndex: "kreditPenunjangBaru",
      responsive: ["sm"],
    },
    {
      title: "Kredit Baru Total",
      dataIndex: "kreditBaruTotal",
      responsive: ["sm"],
    },
    {
      title: "Nama Jabatan",
      dataIndex: "namaJabatan",
      responsive: ["sm"],
    },
    // {
    //   title: "Hapus",
    //   key: "hapus",
    //   render: (_, row) => {
    //     return (
    //       <Popconfirm
    //         title="Apakah kamu ingin menghapus data riwayat angka kredit?"
    //         onConfirm={async () => await handleHapus(row)}
    //       >
    //         Hapus
    //       </Popconfirm>
    //     );
    //   },
    // },
  ];

  const columnsMaster = [
    {
      title: "Data",
      key: "data",
      render: (_, record) => {
        return (
          <Space direction="vertical">
            <div>
              <a href={record?.file_pak} target="_blank" rel="noreferrer">
                File
              </a>
            </div>
            <Text>Nomor SK : {record?.no_sk}</Text>
            <Text> Kredit Utama Baru : {record?.nilai_unsur_utama_baru}</Text>
            <Text>Nilai PAK : {record?.nilai_pak}</Text>
          </Space>
        );
      },
    },
    {
      title: "File",
      key: "file",
      render: (_, record) => {
        return (
          <a href={record?.file_pak} target="_blank" rel="noreferrer">
            File
          </a>
        );
      },
      responsive: ["sm"],
    },
    {
      title: "Nomor SK",
      dataIndex: "no_sk",
      responsive: ["sm"],
    },
    {
      title: "Kredit Utama Baru",
      dataIndex: "nilai_unsur_utama_baru",
      responsive: ["sm"],
    },

    {
      title: "Kredit Baru Total",
      dataIndex: "nilai_pak",
      responsive: ["sm"],
    },
  ];

  return (
    <Skeleton loading={isLoading || isLoadingAngkaKredit || isLoadingDataUtama}>
      {dataUtama?.jenisJabatanId !== "2" ||
      dataUtama?.kedudukanPnsNama === "PPPK Aktif" ? (
        <Empty description="Tidak ada isian Angka Kredit karena Jabatan Anda Bukan JFT" />
      ) : (
        <Stack>
          <FormAngkaKredit visible={visible} onCancel={handleCancel} />
          <Alert
            color="red"
            title="Harap diperhatikan"
            icon={<IconAlertCircle />}
          >
            Layanan Penambahan Angka Kredit SIASN secara personal dihentikan
            sementara, silahkan hubungi fasilitator kepegawaian anda untuk
            melakukan penambahan Angka Kredit.
          </Alert>
          <Table
            title={() => <Text fw="bold">SIASN</Text>}
            // title={() => (
            //   <Button
            //     onClick={handleVisible}
            //     icon={<FileAddOutlined />}
            //     type="primary"
            //   >
            //     Angka Kredit SIASN
            //   </Button>
            // )}
            columns={columns}
            rowKey={(record) => record.id}
            pagination={false}
            loading={isLoading}
            dataSource={data}
          />
          <Table
            title={() => <Text fw="bold">SIMASTER</Text>}
            columns={columnsMaster}
            rowKey={(record) => record.pak_id}
            pagination={false}
            loading={isLoadingAngkaKredit}
            dataSource={dataRwAngkakredit}
          />
        </Stack>
      )}
    </Skeleton>
  );
}

export default CompareAngkaKredit;
