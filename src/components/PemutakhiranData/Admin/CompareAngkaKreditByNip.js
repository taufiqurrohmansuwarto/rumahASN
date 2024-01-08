import { rwAngkakreditMasterByNip } from "@/services/master.services";
import {
  deleteAkByNip,
  getRwAngkakreditByNip,
  getTokenSIASNService,
  postRwAngkakreditByNip,
} from "@/services/siasn-services";
import { FileAddOutlined } from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { API_URL } from "@/utils/client-utils";
import {
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Table,
  Typography,
  Upload,
} from "antd";
import axios from "axios";
import moment from "moment";
import { useState } from "react";
import FormRiwayatJabatanByNip from "../FormRiwayatJabatanByNip";

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

        await postRwAngkakreditByNip({
          data: postData,
          nip,
        });

        queryClient.invalidateQueries("angka-kredit");
        setLoading(false);
        onCancel();
        setFileList([]);
      } else {
        await postRwAngkakreditByNip({
          data,
          nip,
        });

        queryClient.invalidateQueries("angka-kredit");
        setLoading(false);
        onCancel();
        setFileList([]);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
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
        <FormRiwayatJabatanByNip nip={nip} name="rwJabatanId" />
      </Form>
    </Modal>
  );
};

function CompareAngkaKreditByNip({ nip }) {
  const { data, isLoading } = useQuery(["angka-kredit", nip], () =>
    getRwAngkakreditByNip(nip)
  );

  const { data: dataRwAngkakredit, isLoading: isLoadingAngkaKredit } = useQuery(
    ["angkat-kredit-master-by-nip", nip],
    () => rwAngkakreditMasterByNip(nip)
  );

  const { mutateAsync: hapusAk, isLoading: isLoadingRemoveAk } = useMutation(
    (data) => deleteAkByNip(data),
    {
      onSuccess: () => {
        message.success("Berhasil menghapus angka kredit");
      },
      onError: () => {
        message.error("Gagal menghapus angka kredit");
      },
      onSettled: () => queryClient.invalidateQueries(["angka-kredit", nip]),
    }
  );

  const handleHapus = (row) => {
    alert(JSON.stringify(row));
  };

  const [visible, setVisible] = useState(false);

  const handleVisible = () => setVisible(true);
  const handleCancel = () => setVisible(false);

  const columns = [
    {
      title: "File",
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
    },
    {
      title: "Bulan Mulai Penilaian",
      dataIndex: "bulanMulaiPenailan",
    },
    {
      title: "Tahun Mulai Penilaian",
      dataIndex: "tahunMulaiPenailan",
    },
    {
      title: "Bulan Selesai Penilaian",
      dataIndex: "bulanSelesaiPenailan",
    },
    {
      title: "Tahun Selesai Penilaian",
      dataIndex: "tahunSelesaiPenailan",
    },
    {
      title: "Kredit Utama Baru",
      dataIndex: "kreditUtamaBaru",
    },
    {
      title: "Kredit Penunjang Baru",
      dataIndex: "kreditPenunjangBaru",
    },
    {
      title: "Kredit Baru Total",
      dataIndex: "kreditBaruTotal",
    },
    {
      title: "Nama Jabatan",
      dataIndex: "namaJabatan",
    },
    {
      title: "Hapus",
      key: "hapus",
      render: (_, record) => {
        return (
          <Button type="primary" danger onClick={() => handleHapus(record?.id)}>
            Hapus
          </Button>
        );
      },
    },
  ];

  const columnsMaster = [
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
    },
    {
      title: "Nomor SK",
      dataIndex: "no_sk",
    },
    {
      title: "Kredit Utama Baru",
      dataIndex: "nilai_unsur_utama_baru",
    },
    {
      title: "Kredit Unsur Penunjang",
      dataIndex: "nilai_unsur_penunjang_baru",
    },

    {
      title: "Kredit Baru Total",
      dataIndex: "nilai_pak",
    },

    {
      title: "Tgl SK",
      dataIndex: "tgl_sk",
    },
    {
      title: "Periode Awal",
      key: "tgl_awal",
      render: (_, record) => {
        return <>{moment(record?.periode_awal).format("YYYY-MM")}</>;
      },
    },
    {
      title: "Periode Akhir",
      key: "tgl_akhir",
      render: (_, record) => {
        return <>{moment(record?.periode_akhir).format("YYYY-MM")}</>;
      },
    },
  ];

  return (
    <Card title="Komparasi Angka Kredit">
      <FormAngkaKredit visible={visible} onCancel={handleCancel} nip={nip} />
      <Button onClick={handleVisible}>Tambah Angka Kredit</Button>
      <Stack>
        <Table
          columns={columns}
          rowKey={(record) => record.id}
          pagination={false}
          loading={isLoading}
          dataSource={data}
        />
        <Table
          title={() => <Typography.Text>Angka Kredit SIMASTER</Typography.Text>}
          columns={columnsMaster}
          rowKey={(record) => record.pak_id}
          pagination={false}
          loading={isLoadingAngkaKredit}
          dataSource={dataRwAngkakredit}
        />
      </Stack>
    </Card>
  );
}

export default CompareAngkaKreditByNip;
