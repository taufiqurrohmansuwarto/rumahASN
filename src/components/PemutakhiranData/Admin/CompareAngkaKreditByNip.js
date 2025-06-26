import { rwAngkakreditMasterByNip, urlToPdf } from "@/services/master.services";
import {
  dataUtamSIASNByNip,
  deleteAkByNip,
  getRwAngkakreditByNip,
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
  Descriptions,
  Divider,
  Empty,
  Popconfirm,
  Skeleton,
  Space,
  Table,
  Tooltip,
  message,
} from "antd";
import { useState } from "react";
import UploadDokumen from "../UploadDokumen";
import TransferAngkaKredit from "./TransferAngkaKredit";
import BasicFormAngkaKredit from "./BasicFormAngkaKredit";
import BasicFormTransferAngkaKredit from "./BasicFormTransferAngkaKredit";

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
      title: "Data",
      responsive: ["xs"],
      key: "data",
      render: (_, record) => {
        return (
          <Descriptions column={1} size="small" layout="vertical">
            <Descriptions.Item label="Nomor SK">
              {record?.nomorSk}
            </Descriptions.Item>
            <Descriptions.Item label="Bulan Mulai Penilaian">
              {record?.bulanMulaiPenailan}
            </Descriptions.Item>
            <Descriptions.Item label="Tahun Mulai Penilaian">
              {record?.tahunMulaiPenailan}
            </Descriptions.Item>
            <Descriptions.Item label="Bulan Selesai Penilaian">
              {record?.bulanSelesaiPenilaian}
            </Descriptions.Item>
            <Descriptions.Item label="Tahun Selesai Penilaian">
              {record?.tahunSelesaiPenilaian}
            </Descriptions.Item>
            <Descriptions.Item label="Kredit Utama Baru">
              {record?.kreditUtamaBaru}
            </Descriptions.Item>
            <Descriptions.Item label="Kredit Penunjang Baru">
              {record?.kreditPenunjangBaru}
            </Descriptions.Item>
            <Descriptions.Item label="Kredit Baru Total">
              {record?.kreditBaruTotal}
            </Descriptions.Item>
            <Descriptions.Item label="Jenis AK">
              {checkKonversiIntegrasiPertama(record)}
            </Descriptions.Item>
            <Descriptions.Item label="Sumber">
              {record?.Sumber}
            </Descriptions.Item>
            <Descriptions.Item label="Nama Jabatan">
              {record?.namaJabatan}
            </Descriptions.Item>
            <Descriptions.Item label="File">
              <Space>
                {record?.path?.[880] && (
                  <Tooltip title="SK PAK">
                    <a
                      href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.[880]?.dok_uri}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FilePdfOutlined />
                    </a>
                  </Tooltip>
                )}
                {record?.path?.[879] && (
                  <Tooltip title="Dok PAK">
                    <a
                      href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.[879]?.dok_uri}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FilePdfOutlined />
                    </a>
                  </Tooltip>
                )}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Aksi">
              <Space direction="horizontal">
                <Popconfirm
                  title="Apakah kamu ingin menghapus data riwayat angka kredit?"
                  onConfirm={async () => await handleHapus(record)}
                >
                  <Tooltip title="Hapus">
                    <a>
                      <DeleteOutlined />
                    </a>
                  </Tooltip>
                </Popconfirm>
                <Divider type="vertical" />
                <UploadDokumen
                  id={record?.id}
                  invalidateQueries={["angka-kredit", nip]}
                  idRefDokumen="879"
                  nama="PAK"
                />
                <Divider type="vertical" />
                <UploadDokumen
                  id={record?.id}
                  invalidateQueries={["angka-kredit", nip]}
                  idRefDokumen="880"
                  nama="SK PAK"
                />
              </Space>
            </Descriptions.Item>
          </Descriptions>
        );
      },
    },
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
            {row?.Sumber !== "Pencantuman Gelar PAK" && (
              <Popconfirm
                title="Apakah kamu ingin menghapus data riwayat angka kredit?"
                onConfirm={async () => await handleHapus(row)}
                disabled={row?.sumber === "Pencantuman Gelar PAK"}
              >
                <Tooltip title="Hapus">
                  <a>
                    <DeleteOutlined />
                  </a>
                </Tooltip>
              </Popconfirm>
            )}
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
      const jenisPak = record?.jenis_pak_id;
      const isKonversi = jenisPak === 4 || jenisPak === "4";

      // Prepare record data untuk konversi
      const preparedRecord = isKonversi
        ? { ...record, nilai_pak: null }
        : record;

      // Set modal state
      setVisibleTransfer(true);
      setDataTransfer(preparedRecord);

      // Handle file jika ada
      if (currentFile) {
        const response = await urlToPdf({ url: currentFile });
        const pdfFile = new File([response], "file.pdf", {
          type: "application/pdf",
        });
        setFile(pdfFile);
      }
    } catch (error) {
      console.error("Error handling transfer:", error);
    } finally {
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
      title: "Data",
      responsive: ["xs"],
      key: "data",
      render: (_, record) => {
        return (
          <Descriptions column={1} size="small" layout="vertical">
            <Descriptions.Item label="File">
              <a href={record?.file_pak} target="_blank" rel="noreferrer">
                File
              </a>
            </Descriptions.Item>
            <Descriptions.Item label="Nomor SK">
              {record?.no_sk}
            </Descriptions.Item>
            <Descriptions.Item label="Jenis AK">
              {record?.jenisPak?.jenis_pak}
            </Descriptions.Item>
            <Descriptions.Item label="Kredit Utama Baru">
              {record?.nilai_unsur_utama_baru}
            </Descriptions.Item>
            <Descriptions.Item label="Kredit Baru Total">
              {record?.nilai_pak}
            </Descriptions.Item>
            <Descriptions.Item label="Tgl SK">
              {record?.tgl_sk}
            </Descriptions.Item>
            <Descriptions.Item label="Periode Awal / Akhir">
              {record?.periode_awal} / {record?.periode_akhir}
            </Descriptions.Item>
            <Descriptions.Item label="Aksi">
              {record?.jenis_pak_id === 3 || record?.jenis_pak_id === 4 ? (
                <a onClick={() => handleVisibleTransfer(record)}>Tranfer</a>
              ) : null}
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
      responsive: ["sm"],
    },
  ];

  return (
    <Card title="Komparasi Angka Kredit">
      <BasicFormTransferAngkaKredit
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
            <BasicFormAngkaKredit
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
