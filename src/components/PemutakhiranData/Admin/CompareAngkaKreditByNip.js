import { rwAngkakreditMasterByNip, urlToPdf } from "@/services/master.services";
import {
  dataUtamSIASNByNip,
  deleteAkByNip,
  getRwAngkakreditByNip,
} from "@/services/siasn-services";
import {
  Badge as MantineBadge,
  Stack,
  Text as MantineText,
} from "@mantine/core";
import {
  IconAward,
  IconFileText,
  IconPlus,
  IconRefresh,
  IconSend,
  IconTrash,
} from "@tabler/icons-react";
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
                  <a
                    href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.[880]?.dok_uri}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button size="small" icon={<IconFileText size={14} />}>
                      SK PAK
                    </Button>
                  </a>
                )}
                {record?.path?.[879] && (
                  <a
                    href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.[879]?.dok_uri}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button size="small" icon={<IconFileText size={14} />}>
                      Dok PAK
                    </Button>
                  </a>
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
                    <Button
                      size="small"
                      danger
                      icon={<IconTrash size={14} />}
                    />
                  </Tooltip>
                </Popconfirm>
                <UploadDokumen
                  id={record?.id}
                  invalidateQueries={["angka-kredit", nip]}
                  idRefDokumen="879"
                  nama="PAK"
                />
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
      title: "Dok",
      key: "path",
      width: 100,
      align: "center",
      render: (_, record) => {
        return (
          <Space size="small">
            {record?.path?.[880] && (
              <Tooltip title="SK PAK">
                <a
                  href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.[880]?.dok_uri}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button
                    size="small"
                    type="link"
                    icon={<IconFileText size={14} />}
                  />
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
                  <Button
                    size="small"
                    type="link"
                    icon={<IconFileText size={14} />}
                  />
                </a>
              </Tooltip>
            )}
          </Space>
        );
      },
      responsive: ["sm"],
    },
    {
      title: "SK & Jabatan",
      key: "sk_jabatan",
      width: 180,
      render: (_, record) => (
        <Tooltip title={record?.nomorSk}>
          <div>
            <MantineText size="xs" fw={500} lineClamp={1}>
              {record?.nomorSk}
            </MantineText>
            {record?.namaJabatan && (
              <MantineText size="xs" c="dimmed" lineClamp={1}>
                {record?.namaJabatan}
              </MantineText>
            )}
          </div>
        </Tooltip>
      ),
      responsive: ["sm"],
    },
    {
      title: "Periode",
      key: "periode",
      width: 100,
      render: (_, record) => (
        <div>
          <MantineText size="xs">
            {record?.bulanMulaiPenailan}/{record?.tahunMulaiPenailan}
          </MantineText>
          <MantineText size="xs" c="dimmed">
            {record?.bulanSelesaiPenilaian}/{record?.tahunSelesaiPenilaian}
          </MantineText>
        </div>
      ),
      responsive: ["sm"],
    },
    {
      title: "AK",
      key: "kredit",
      width: 100,
      render: (_, record) => (
        <Tooltip
          title={`Utama: ${record?.kreditUtamaBaru} | Penunjang: ${record?.kreditPenunjangBaru} | Total: ${record?.kreditBaruTotal}`}
        >
          <div>
            <MantineText size="xs">
              U: <strong>{record?.kreditUtamaBaru}</strong>
            </MantineText>
            <MantineText size="xs">
              P: <strong>{record?.kreditPenunjangBaru}</strong>
            </MantineText>
            <MantineText size="xs" fw={600}>
              Σ: {record?.kreditBaruTotal}
            </MantineText>
          </div>
        </Tooltip>
      ),
      responsive: ["sm"],
    },
    {
      title: "Jenis & Sumber",
      key: "jenis_sumber",
      width: 150,
      render: (_, row) => (
        <Tooltip
          title={`${checkKonversiIntegrasiPertama(row)} - ${row?.Sumber}`}
        >
          <div>
            <MantineBadge
              size="xs"
              color="blue"
              tt="none"
              style={{ marginBottom: 4 }}
            >
              {checkKonversiIntegrasiPertama(row)}
            </MantineBadge>
            <MantineText size="xs" c="dimmed" lineClamp={1}>
              {row?.Sumber}
            </MantineText>
          </div>
        </Tooltip>
      ),
      responsive: ["sm"],
    },
    {
      title: "Aksi",
      key: "aksi",
      width: 120,
      align: "center",
      render: (_, row) => {
        return (
          <Space size="small">
            {row?.Sumber !== "Pencantuman Gelar PAK" && (
              <Popconfirm
                title="Hapus riwayat angka kredit?"
                onConfirm={async () => await handleHapus(row)}
                disabled={row?.sumber === "Pencantuman Gelar PAK"}
              >
                <Tooltip title="Hapus">
                  <Button
                    size="small"
                    danger
                    icon={<IconTrash size={14} />}
                    loading={isLoadingRemoveAk}
                  />
                </Tooltip>
              </Popconfirm>
            )}
            <UploadDokumen
              id={row?.id}
              invalidateQueries={["angka-kredit", nip]}
              idRefDokumen="879"
              nama="PAK"
            />
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
  const [loadingPakId, setLoadingPakId] = useState(null);

  const { mutate: loadPdfFile, isLoading: loadingFile } = useMutation({
    mutationFn: (record) => {
      setLoadingPakId(record?.pak_id);
      return urlToPdf({ url: record?.file_pak });
    },
    onSuccess: (data, record) => {
      const jenisPak = record?.jenis_pak_id;
      const isKonversi = jenisPak === 4 || jenisPak === "4";

      // Prepare record data untuk konversi
      const preparedRecord = isKonversi
        ? { ...record, nilai_pak: null }
        : record;

      // Set modal state
      setVisibleTransfer(true);
      setDataTransfer(preparedRecord);

      // Set file
      const pdfFile = new File([data], "file.pdf", {
        type: "application/pdf",
      });
      setFile(pdfFile);
      setLoadingPakId(null);
    },
    onError: (error) => {
      console.error("Error loading PDF:", error);
      message.error("Gagal memuat file PDF");
      setLoadingPakId(null);
    },
  });

  const handleVisibleTransfer = (record) => {
    const currentFile = record?.file_pak;
    const jenisPak = record?.jenis_pak_id;
    const isKonversi = jenisPak === 4 || jenisPak === "4";

    if (currentFile) {
      loadPdfFile(record);
    } else {
      // Jika tidak ada file, langsung buka modal
      const preparedRecord = isKonversi
        ? { ...record, nilai_pak: null }
        : record;

      setVisibleTransfer(true);
      setDataTransfer(preparedRecord);
    }
  };

  const handleCancelTransfer = () => {
    setVisibleTransfer(false);
    setDataTransfer(null);
    setFile(null);
    setLoadingPakId(null);
  };

  const handleRefreshSiasn = () => {
    queryClient.invalidateQueries(["angka-kredit", nip]);
  };

  const handleRefreshMaster = () => {
    queryClient.invalidateQueries(["angkat-kredit-master-by-nip", nip]);
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
              {record?.file_pak && (
                <a href={record?.file_pak} target="_blank" rel="noreferrer">
                  <Button size="small" icon={<IconFileText size={14} />}>
                    SK PAK
                  </Button>
                </a>
              )}
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
                <Tooltip title="Transfer">
                  <Button
                    size="small"
                    type="primary"
                    icon={<IconSend size={14} />}
                    onClick={() => handleVisibleTransfer(record)}
                    loading={loadingFile && loadingPakId === record?.pak_id}
                  />
                </Tooltip>
              ) : null}
            </Descriptions.Item>
          </Descriptions>
        );
      },
    },
    {
      title: "Dok",
      key: "file",
      width: 80,
      align: "center",
      render: (_, record) => {
        return (
          <>
            {record?.file_pak && (
              <Tooltip title="SK PAK">
                <a href={record?.file_pak} target="_blank" rel="noreferrer">
                  <Button
                    size="small"
                    type="link"
                    icon={<IconFileText size={14} />}
                  />
                </a>
              </Tooltip>
            )}
          </>
        );
      },
      responsive: ["sm"],
    },
    {
      title: "SK & Tanggal",
      key: "sk_tgl",
      width: 160,
      render: (_, record) => (
        <Tooltip title={record?.no_sk}>
          <div>
            <MantineText size="xs" fw={500} lineClamp={1}>
              {record?.no_sk}
            </MantineText>
            <MantineText size="xs" c="dimmed">
              {record?.tgl_sk}
            </MantineText>
          </div>
        </Tooltip>
      ),
      responsive: ["sm"],
    },
    {
      title: "Jenis AK",
      key: "jenis_ak",
      width: 130,
      render: (_, record) => (
        <Tooltip title={record?.jenisPak?.jenis_pak}>
          <MantineBadge size="xs" color="blue" tt="none">
            {record?.jenisPak?.jenis_pak}
          </MantineBadge>
        </Tooltip>
      ),
      responsive: ["sm"],
    },
    {
      title: "AK",
      key: "kredit",
      width: 90,
      render: (_, record) => (
        <Tooltip
          title={`Utama: ${record?.nilai_unsur_utama_baru} | Total: ${record?.nilai_pak}`}
        >
          <div>
            <MantineText size="xs">
              U: <strong>{record?.nilai_unsur_utama_baru}</strong>
            </MantineText>
            <MantineText size="xs" fw={600}>
              Σ: {record?.nilai_pak}
            </MantineText>
          </div>
        </Tooltip>
      ),
      responsive: ["sm"],
    },
    {
      title: "Periode",
      key: "periode",
      width: 100,
      render: (_, record) => (
        <div>
          <MantineText size="xs">{record?.periode_awal}</MantineText>
          <MantineText size="xs" c="dimmed">
            {record?.periode_akhir}
          </MantineText>
        </div>
      ),
      responsive: ["sm"],
    },
    {
      title: "Aksi",
      key: "transfer",
      width: 80,
      align: "center",
      render: (_, record) => {
        return (
          <>
            {record?.jenis_pak_id === 3 || record?.jenis_pak_id === 4 ? (
              <Tooltip title="Transfer">
                <Button
                  size="small"
                  type="primary"
                  icon={<IconSend size={14} />}
                  onClick={() => handleVisibleTransfer(record)}
                  loading={loadingFile && loadingPakId === record?.pak_id}
                />
              </Tooltip>
            ) : null}
          </>
        );
      },
      responsive: ["sm"],
    },
  ];

  return (
    <Card
      title={
        <Space>
          <IconAward size={20} />
          <span>Komparasi Angka Kredit</span>
          <MantineBadge size="sm" color="blue">
            SIASN: {data?.length || 0}
          </MantineBadge>
          <MantineBadge size="sm" color="green">
            SIMASTER: {dataRwAngkakredit?.length || 0}
          </MantineBadge>
        </Space>
      }
    >
      <BasicFormTransferAngkaKredit
        data={dataTransfer}
        file={file}
        onCancel={handleCancelTransfer}
        nip={nip}
        open={visibleTransfer}
        loadingFile={loadingFile}
      />
      <Skeleton loading={loadingDataSiasn}>
        {dataSiasn?.kedudukanPnsNama === "PPPK Aktif" ? (
          <Empty description="Tidak dapat mengentri AK karena pegawai PPPK / Bukan JFT" />
        ) : (
          <>
            <BasicFormAngkaKredit
              visible={visible}
              onCancel={handleCancel}
              nip={nip}
            />
            <Button
              icon={<IconPlus size={16} />}
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
                title={() => (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <MantineText fw="bold">SIASN</MantineText>
                    <Tooltip title="Refresh data SIASN">
                      <Button
                        size="small"
                        icon={<IconRefresh size={14} />}
                        onClick={handleRefreshSiasn}
                        loading={isLoading}
                      />
                    </Tooltip>
                  </div>
                )}
                columns={columns}
                rowKey={(record) => record.id}
                pagination={false}
                loading={isLoading}
                dataSource={data}
                rowClassName={(_, index) =>
                  index % 2 === 0 ? "table-row-light" : "table-row-dark"
                }
                scroll={{ x: 800 }}
                size="small"
              />
              <Table
                title={() => (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <MantineText fw="bold">SIMASTER</MantineText>
                    <Tooltip title="Refresh data SIMASTER">
                      <Button
                        size="small"
                        icon={<IconRefresh size={14} />}
                        onClick={handleRefreshMaster}
                        loading={isLoadingAngkaKredit}
                      />
                    </Tooltip>
                  </div>
                )}
                columns={columnsMaster}
                rowKey={(record) => record.pak_id}
                pagination={false}
                loading={isLoadingAngkaKredit}
                dataSource={dataRwAngkakredit}
                rowClassName={(_, index) =>
                  index % 2 === 0 ? "table-row-light" : "table-row-dark"
                }
                scroll={{ x: 700 }}
                size="small"
              />
            </Stack>
          </>
        )}
      </Skeleton>
    </Card>
  );
}

export default CompareAngkaKreditByNip;
