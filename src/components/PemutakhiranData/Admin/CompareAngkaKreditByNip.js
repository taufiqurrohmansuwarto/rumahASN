import { rwAngkakreditMasterByNip } from "@/services/master.services";
import {
  dataUtamSIASNByNip,
  deleteAkByNip,
  getRwAngkakreditByNip,
  getTokenSIASNService,
  postRwAngkakreditByNip,
} from "@/services/siasn-services";
import { FileAddOutlined } from "@ant-design/icons";
import { Stack, Text } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { API_URL, checkKonversiIntegrasiPertama } from "@/utils/client-utils";
import {
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Radio,
  Row,
  Skeleton,
  Table,
  Typography,
  Upload,
  message,
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
        message.success("Berhasil menambahkan angka kredit");
      } else {
        await postRwAngkakreditByNip({
          data,
          nip,
        });

        queryClient.invalidateQueries("angka-kredit");
        setLoading(false);
        onCancel();
        setFileList([]);
        message.success("Berhasil menambahkan angka kredit");
      }
    } catch (error) {
      setLoading(false);
      message.error(error?.response?.data?.message);
      console.log(error);
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
        onOk: async () => await onFinish(),
      });
    } catch (error) {}
  };

  return (
    <Modal
      confirmLoading={loading}
      title="Tambah Angka Kredit"
      centered
      visible={visible}
      width={800}
      onCancel={onCancel}
      onOk={handleConfirmModal}
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
        {/* <Form.Item name="status">
          <Radio.Group>
            <Radio.Button value="angkaKreditPertama">
              Angka Kredit Pertama
            </Radio.Button>
            <Radio.Button value="integrasi">Integrasi</Radio.Button>
            <Radio.Button value="konversi">Konversi</Radio.Button>
          </Radio.Group>
        </Form.Item> */}
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
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(["angka-kredit", nip], () =>
    getRwAngkakreditByNip(nip)
  );

  const { data: dataSiasn, isLoading: loadingDataSiasn } = useQuery(
    ["data-utama-siasn", nip],
    () => dataUtamSIASNByNip(nip)
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

  const handleHapus = async (row) => {
    try {
      await hapusAk({
        nip,
        id: row?.id,
      });
    } catch (error) {
      console.log(error);
    }
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
      title: "Jenis AK",
      key: "jenis_ak",
      render: (_, row) => {
        return <>{checkKonversiIntegrasiPertama(row)}</>;
      },
    },
    {
      title: "Sumber",
      dataIndex: "Sumber",
    },
    {
      title: "Nama Jabatan",
      dataIndex: "namaJabatan",
    },
    {
      title: "Hapus",
      key: "hapus",
      render: (_, row) => {
        return (
          <Popconfirm
            title="Apakah kamu ingin menghapus data riwayat angka kredit?"
            onConfirm={async () => await handleHapus(row)}
          >
            <a>Hapus</a>
          </Popconfirm>
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
      <Skeleton loading={loadingDataSiasn}>
        {dataSiasn?.jenisJabatanId !== "2" ||
        dataSiasn?.kedudukanPnsNama === "PPPK Aktif" ? (
          <Empty description="Tidak dapat mengentri AK karena pegawai PPPK / Bukan JFT" />
        ) : (
          <>
            <FormAngkaKredit
              visible={visible}
              onCancel={handleCancel}
              nip={nip}
            />
            <Button
              icon={<FileAddOutlined />}
              style={{
                marginBottom: 10,
              }}
              type="primary"
              onClick={handleVisible}
            >
              Angka Kredit
            </Button>
            <Stack>
              <Table
                title={() => <Text fw="bold">SIASN</Text>}
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
          </>
        )}
      </Skeleton>
    </Card>
  );
}

export default CompareAngkaKreditByNip;
