import { rwAngkakreditMasterByNip, urlToPdf } from "@/services/master.services";
import {
  dataUtamSIASNByNip,
  deleteAkByNip,
  getRwAngkakreditByNip,
  postRwAngkakreditByNip,
  uploadDokRiwayat,
} from "@/services/siasn-services";
import {
  DeleteOutlined,
  FileAddOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import { Stack, Text } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.locale("id");
dayjs.extend(relativeTime);

import { checkKonversiIntegrasiPertama } from "@/utils/client-utils";
import {
  Button,
  Card,
  DatePicker,
  Divider,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Radio,
  Skeleton,
  Space,
  Table,
  Tooltip,
  Upload,
  message,
} from "antd";
import { useState } from "react";
import FormRiwayatJabatanByNip from "../FormRiwayatJabatanByNip";
import UploadDokumen from "../UploadDokumen";
import TransferAngkaKredit from "./TransferAngkaKredit";

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
        tahun: rest?.tahun?.format("YYYY") || "",
        kreditUtamaBaru: rest?.kreditUtamaBaru || 0,
        kreditPenunjangBaru: rest?.kreditPenunjangBaru || 0,
        bulanMulaiPenailan: mulaiPenilaian.format("M"),
        bulanSelesaiPenailan: selesaiPenilaian.format("M"),
        tahunMulaiPenailan: mulaiPenilaian.format("YYYY"),
        tahunSelesaiPenailan: selesaiPenilaian.format("YYYY"),
        isAngkaKreditPertama:
          rest?.jenisAngkaKredit === "isAngkaKreditPertama" ? "1" : "0",
        isIntegrasi: rest?.jenisAngkaKredit === "isIntegrasi" ? "1" : "0",
        isKonversi: rest?.jenisAngkaKredit === "isKonversi" ? "1" : "0",
        tanggalSk: rest?.tanggalSk.format("DD-MM-YYYY"),
      };

      const currentFile = fileList[0]?.originFileObj;

      if (currentFile) {
        const angkaKredit = await postRwAngkakreditByNip({
          data,
          nip,
        });

        const formData = new FormData();
        formData.append("file", currentFile);
        formData.append("id_ref_dokumen", "879");
        formData.append("id_riwayat", angkaKredit?.id);
        await uploadDokRiwayat(formData);
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
      message.error(
        error?.response?.data?.message || "Gagal menambahkan angka kredit"
      );
      console.log(error);
    }
  };

  const handleConfirmModal = () => {
    Modal.confirm({
      centered: true,
      title: "Apakah anda yakin?",
      content: `Mohon pastikan semua data dan dokumen yang Anda masukkan selalu terkini dan akurat. Ketidaksesuaian informasi bisa berdampak pada proses layanan kepegawaian pegawai. Ingat, setiap entri data akan dicatat dan dipertanggungjawabkan melalui sistem log Rumah ASN.`,
      okText: "Ya",
      cancelText: "Tidak",
      onOk: async () => await onFinish(),
    });
  };

  const [showFieldAngkaKredit, setShowFieldAngkaKredit] = useState(true);
  const [showTahun, setShowTahun] = useState(false);

  return (
    <Modal
      confirmLoading={loading}
      title="Tambah Angka Kredit"
      centered
      open={visible}
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
          <Button icon={<FileAddOutlined />} style={{ marginBottom: 10 }}>
            Upload
          </Button>
        </Upload>
        <Form.Item
          name={"jenisAngkaKredit"}
          label={"Jenis Angka Kredit"}
          required
          rules={[
            {
              required: true,
              message: "Pilih Jenis Angka Kredit",
            },
          ]}
        >
          <Radio.Group
            onChange={(e) => {
              const value = e.target.value;
              if (value === "isKonversi") {
                setShowFieldAngkaKredit(false);
                setShowTahun(true);
                form.setFieldsValue({
                  kreditUtamaBaru: "",
                  kreditPenunjangBaru: "",
                });
              } else if (value === "isIntegrasi") {
                setShowTahun(false);
                setShowFieldAngkaKredit(false);
                form.setFieldsValue({
                  tahun: "",
                  kreditUtamaBaru: "",
                  kreditPenunjangBaru: "",
                });
              } else {
                setShowTahun(false);
                setShowFieldAngkaKredit(true);
                form.setFieldsValue({
                  tahun: "",
                });
              }
            }}
          >
            <Radio.Button value="isAngkaKreditPertama">
              Angka Kredit Pertama?
            </Radio.Button>
            <Radio.Button value="isIntegrasi">Integrasi</Radio.Button>
            <Radio.Button value="isKonversi">Konversi</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item required name="nomorSk" label="Nomor SK">
          <Input />
        </Form.Item>
        {showTahun ? (
          <Form.Item required name="tahun" label="Tahun">
            <DatePicker picker="year" />
          </Form.Item>
        ) : null}
        <Form.Item required name="tanggalSk" label="Tanggal SK">
          <DatePicker format={"DD-MM-YYYY"} />
        </Form.Item>
        <Form.Item required name="mulaiPenilaian" label="Mulai Penilaian">
          <DatePicker picker="month" />
        </Form.Item>
        <Form.Item required name="selesaiPenilaian" label="Selesai Penilaian">
          <DatePicker picker="month" />
        </Form.Item>
        {showFieldAngkaKredit ? (
          <>
            <Form.Item
              required
              name="kreditUtamaBaru"
              label="Kredit Utama Baru"
            >
              <InputNumber />
            </Form.Item>
            <Form.Item
              name="kreditPenunjangBaru"
              label="Kredit Penunjang Baru"
              required
            >
              <InputNumber />
            </Form.Item>
          </>
        ) : null}
        <Form.Item
          required
          name="kreditBaruTotal"
          label="Kredit Baru Total"
          help="Untuk Konversi entri Jumlah nilai PAK Konversi (lembar/lampiran ke-2)"
        >
          <InputNumber />
        </Form.Item>
        <FormRiwayatJabatanByNip nip={nip} name="rwJabatanId" />
      </Form>
    </Modal>
  );
};

function CompareAngkaKreditByNip({ nip }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ["angka-kredit", nip],
    () => getRwAngkakreditByNip(nip),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 500000,
    }
  );

  const { data: dataSiasn, isLoading: loadingDataSiasn } = useQuery(
    ["data-utama-siasn", nip],
    () => dataUtamSIASNByNip(nip),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 500000,
    }
  );

  const { data: dataRwAngkakredit, isLoading: isLoadingAngkaKredit } = useQuery(
    ["angkat-kredit-master-by-nip", nip],
    () => rwAngkakreditMasterByNip(nip),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 500000,
    }
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
          <Space>
            <Tooltip title="SK PAK">
              {record?.path?.[880] && (
                <a
                  href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.[880]?.dok_uri}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FilePdfOutlined />
                </a>
              )}
            </Tooltip>
            <Tooltip title="Dok PAK">
              {record?.path?.[879] && (
                <a
                  href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.[879]?.dok_uri}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FilePdfOutlined />
                </a>
              )}
            </Tooltip>
          </Space>
        );
      },
      responsive: ["sm"],
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
      title: "Jenis AK",
      key: "jenis_ak",
      render: (_, row) => {
        return <>{checkKonversiIntegrasiPertama(row)}</>;
      },
      responsive: ["sm"],
    },
    {
      title: "Sumber",
      dataIndex: "Sumber",
      responsive: ["sm"],
    },
    {
      title: "Nama Jabatan",
      dataIndex: "namaJabatan",
      responsive: ["sm"],
    },
    {
      title: "Hapus",
      key: "hapus",
      render: (_, row) => {
        return (
          <Space direction="horizontal">
            <Popconfirm
              title="Apakah kamu ingin menghapus data riwayat angka kredit?"
              onConfirm={async () => await handleHapus(row)}
            >
              <Tooltip title="Hapus">
                <a>
                  <DeleteOutlined />
                </a>
              </Tooltip>
            </Popconfirm>
            <Divider type="vertical" />
            <UploadDokumen
              id={row?.id}
              invalidateQueries={["angka-kredit", nip]}
              idRefDokumen="879"
              nama="PAK"
            />
            <Divider type="vertical" />
            <UploadDokumen
              id={row?.id}
              invalidateQueries={["angka-kredit", nip]}
              idRefDokumen="880"
              nama="SK PAK"
            />
          </Space>
        );
      },
      responsive: ["sm"],
    },
  ];

  const [visibleTransfer, setVisibleTransfer] = useState(false);
  const [dataTransfer, setDataTransfer] = useState(null);
  const [file, setFile] = useState(null);
  const [loadingFile, setLoadingFile] = useState(false);

  const handleVisibleTransfer = async (record) => {
    setLoadingFile(true);
    try {
      const currentFile = record?.file_pak;

      if (!currentFile) {
        setVisibleTransfer(true);
        setDataTransfer(record);
      } else {
        const response = await urlToPdf({ url: currentFile });
        const file = new File([response], "file.pdf", {
          type: "application/pdf",
        });
        setFile(file);
        setVisibleTransfer(true);
        setDataTransfer(record);
      }
      setLoadingFile(false);
    } catch (error) {
      setLoadingFile(false);
    }
  };

  const handleCancelTransfer = () => {
    setVisibleTransfer(false);
    setDataTransfer(null);
    setFile(null);
  };

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
      responsive: ["sm"],
    },
    {
      title: "Nomor SK",
      dataIndex: "no_sk",
      responsive: ["sm"],
    },
    {
      title: "Jenis AK",
      dataIndex: "jenis_ak",
      render: (_, record) => {
        return <>{record?.jenisPak?.jenis_pak}</>;
      },
      responsive: ["sm"],
    },
    {
      title: "Kredit Utama Baru",
      dataIndex: "nilai_unsur_utama_baru",
      responsive: ["sm"],
    },
    {
      title: "Kredit Unsur Penunjang",
      dataIndex: "nilai_unsur_penunjang_baru",
      responsive: ["sm"],
    },
    {
      title: "Kredit Baru Total",
      dataIndex: "nilai_pak",
      responsive: ["sm"],
    },
    {
      title: "Tgl SK",
      dataIndex: "tgl_sk",
      responsive: ["sm"],
    },
    {
      title: "Periode Awal / Akhir",
      key: "periode",
      render: (_, record) => {
        return (
          <>
            {record?.periode_awal} / {record?.periode_akhir}
          </>
        );
      },
      responsive: ["sm"],
    },
    {
      title: "Aksi",
      key: "transfer",
      render: (_, record) => {
        return (
          <>
            {record?.jenis_pak_id === 3 || record?.jenis_pak_id === 4 ? (
              <a onClick={() => handleVisibleTransfer(record)}>Tranfer</a>
            ) : null}
          </>
        );
      },
    },
  ];

  return (
    <Card title="Komparasi Angka Kredit">
      <TransferAngkaKredit
        data={dataTransfer}
        file={file}
        onCancel={handleCancelTransfer}
        nip={nip}
        open={visibleTransfer}
        loadingFile={loadingFile}
      />
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
