import { getFileByNip, urlToPdf } from "@/services/master.services";
import {
  dataUtamSIASNByNip,
  getCVProxyByNip,
  uploadDokumenSiasnBaru,
} from "@/services/siasn-services";
import {
  Alert,
  Text,
  Badge,
  Stack,
  Flex,
  Group,
  SimpleGrid,
  Center,
} from "@mantine/core";
import {
  IconInfoCircle,
  IconArrowRight,
  IconEye,
  IconExternalLink,
  IconUpload,
  IconFileText,
  IconAlertTriangle,
  IconCircleCheck,
  IconRefresh,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Modal, Spin, message, Tooltip, Upload } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";

// Helper component untuk badge dengan icon yang sejajar
const StatusBadge = ({ isAvailable, label, colorAvailable = "green" }) => (
  <Badge
    size="xs"
    color={isAvailable ? colorAvailable : "red"}
    variant={isAvailable ? "filled" : "light"}
    leftSection={
      <Center style={{ width: 10, height: 10 }}>
        {isAvailable ? (
          <IconCircleCheck size={10} style={{ display: "block" }} />
        ) : (
          <IconAlertTriangle size={10} style={{ display: "block" }} />
        )}
      </Center>
    }
    styles={{
      root: { paddingLeft: 6 },
      section: { marginRight: 4 },
    }}
  >
    {label}
  </Badge>
);

const dokumenPenting = [
  {
    key: "drh",
    label: "Daftar Riwayat Hidup",
    siasnCode: "24",
    useCVProxy: true,
  },
  { key: "file_pns", label: "SK PNS", siasnCode: "887" },
  { key: "file_spmt_cpns", label: "SPMT", siasnCode: "888" },
  { key: "file_cpns", label: "SK CPNS", siasnCode: "889" },
  {
    key: "file_pertek",
    label: "Pertimbangan Teknis BKN",
    siasnCode: "2",
    sourceOptions: [
      { key: "file_nota_persetujuan_bkn", label: "Nota BKN" },
      { key: "file_cpns", label: "SK CPNS" },
    ],
  },
];

const dokumenLainnya = [
  { key: "file_foto", label: "Foto" },
  { key: "file_foto_full", label: "Foto Full" },
  { key: "file_akta_kelahiran", label: "Akta Kelahiran" },
  { key: "file_ktp", label: "KTP" },
  { key: "file_ksk", label: "Kartu Keluarga" },
  { key: "file_karpeg", label: "Karpeg" },
  { key: "file_kpe", label: "KPE" },
  { key: "file_askes_bpjs", label: "BPJS Kesehatan" },
  { key: "file_taspen", label: "Taspen" },
  { key: "file_karis_karsu", label: "Karis/Karsu" },
  { key: "file_npwp", label: "NPWP" },
  { key: "file_konversi_nip", label: "Konversi NIP" },
  { key: "file_sumpah_pns", label: "Sumpah PNS" },
  { key: "file_nota_persetujuan_bkn", label: "Nota BKN" },
  { key: "file_kartu_taspen", label: "Kartu Taspen" },
  { key: "file_kartu_asn_virtual", label: "Kartu ASN Virtual" },
];

function DokumenPendukungNip() {
  const router = useRouter();
  const nip = router.query.nip;
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [transferringDocs, setTransferringDocs] = useState({});
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  const queryClient = useQueryClient();

  const { data: siasn, isLoading: loadingSiasn } = useQuery(
    ["data-utama-siasn", nip],
    () => dataUtamSIASNByNip(nip),
    { enabled: !!nip, refetchOnWindowFocus: false, staleTime: 500000 }
  );

  const { data, isLoading } = useQuery(
    ["dokumen-pendukung", nip],
    () => getFileByNip(nip),
    { enabled: !!nip, refetchOnWindowFocus: false, staleTime: 500000 }
  );

  const { data: cvData } = useQuery(
    ["cv-proxy", nip],
    () => getCVProxyByNip(nip),
    { enabled: !!nip, refetchOnWindowFocus: false, staleTime: 500000 }
  );

  const { mutate: transferDokumen } = useMutation(
    (data) => uploadDokumenSiasnBaru(data),
    {
      onSuccess: (_, variables) => {
        message.success("Berhasil upload ke SIASN");
        queryClient.invalidateQueries(["data-utama-siasn", nip]);
        setTransferringDocs((prev) => ({ ...prev, [variables.dokKey]: false }));
      },
      onError: (error, variables) => {
        message.error(error?.response?.data?.message || "Gagal upload");
        setTransferringDocs((prev) => ({ ...prev, [variables.dokKey]: false }));
      },
    }
  );

  const getIdRiwayat = () =>
    siasn?.data?.data?.id || siasn?.data?.id || siasn?.id;

  const handleUploadManual = async (file, dok) => {
    const idRiwayat = getIdRiwayat();
    if (!idRiwayat) {
      message.error("ID riwayat tidak ditemukan");
      return false;
    }

    setTransferringDocs((prev) => ({ ...prev, [dok.key]: true }));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("id_riwayat", idRiwayat);
    formData.append("id_ref_dokumen", dok.siasnCode);
    formData.dokKey = dok.key;

    transferDokumen(formData);
    return false;
  };

  const handleTransferFromUrl = async (dok, fileUrl) => {
    const idRiwayat = getIdRiwayat();
    if (!idRiwayat) {
      message.error("ID riwayat tidak ditemukan");
      return;
    }

    setTransferringDocs((prev) => ({ ...prev, [dok.key]: true }));

    try {
      const response = await urlToPdf({ url: fileUrl });
      const file = new File([response], `${nip}_${dok.label}.pdf`, {
        type: "application/pdf",
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("id_riwayat", idRiwayat);
      formData.append("id_ref_dokumen", dok.siasnCode);
      formData.dokKey = dok.key;

      transferDokumen(formData);
    } catch (error) {
      message.error(error?.message || "Gagal transfer");
      setTransferringDocs((prev) => ({ ...prev, [dok.key]: false }));
    }
  };

  const handleTransferCV = async (dok) => {
    const idRiwayat = getIdRiwayat();
    if (!idRiwayat) {
      message.error("ID riwayat tidak ditemukan");
      return;
    }

    if (!cvData?.data) {
      message.error("CV SIASN tidak tersedia");
      return;
    }

    Modal.confirm({
      title: "Transfer DRH dari CV SIASN",
      content:
        "Pastikan data CV SIASN sudah benar dan sesuai. Jika belum benar, ubah data di SIASN terlebih dahulu sebelum transfer.",
      okText: "Ya, Transfer",
      cancelText: "Batal",
      onOk: async () => {
        setTransferringDocs((prev) => ({ ...prev, [dok.key]: true }));

        try {
          const base64Data = cvData.data.split(",")[1];
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: "application/pdf" });
          const file = new File([blob], `${nip}_DRH.pdf`, {
            type: "application/pdf",
          });

          const formData = new FormData();
          formData.append("file", file);
          formData.append("id_riwayat", idRiwayat);
          formData.append("id_ref_dokumen", dok.siasnCode);
          formData.dokKey = dok.key;

          transferDokumen(formData);
        } catch (error) {
          message.error("Gagal transfer CV");
          setTransferringDocs((prev) => ({ ...prev, [dok.key]: false }));
        }
      },
    });
  };

  // Fungsi untuk sync semua dokumen penting sekaligus
  const handleSyncAllDokumenPenting = async () => {
    const idRiwayat = getIdRiwayat();
    if (!idRiwayat) {
      message.error("ID riwayat tidak ditemukan");
      return;
    }

    const pathData = getPathData();

    // Filter dokumen yang belum ada di SIASN dan memiliki sumber
    const docsToSync = dokumenPenting.filter((dok) => {
      const siasnDoc = pathData?.[dok.siasnCode];
      if (siasnDoc) return false; // Sudah ada di SIASN

      // Cek apakah ada sumber untuk transfer
      if (dok.useCVProxy) return !!cvData?.data;
      if (dok.sourceOptions) {
        return dok.sourceOptions.some((src) => !!data?.[src.key]);
      }
      return !!data?.[dok.key];
    });

    if (docsToSync.length === 0) {
      message.info("Tidak ada dokumen yang perlu disinkronkan");
      return;
    }

    // Tampilkan konfirmasi dengan detail dokumen yang akan disync
    const docLabels = docsToSync.map((d) => d.label).join(", ");

    Modal.confirm({
      title: "Sinkronisasi Semua Dokumen Penting",
      width: 500,
      content: (
        <Stack gap="xs">
          <Text size="sm">
            Akan mentransfer <strong>{docsToSync.length} dokumen</strong> ke
            SIASN:
          </Text>
          <Text size="xs" c="dimmed">
            {docLabels}
          </Text>
          <Alert color="orange" variant="light" p="xs" mt="xs">
            <Text size="xs">
              ⚠️ Pastikan semua data sudah benar sebelum transfer. Proses ini
              akan berjalan secara berurutan.
            </Text>
          </Alert>
        </Stack>
      ),
      okText: "Ya, Sinkronkan Semua",
      cancelText: "Batal",
      onOk: async () => {
        setIsSyncingAll(true);
        setSyncProgress({ current: 0, total: docsToSync.length });

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < docsToSync.length; i++) {
          const dok = docsToSync[i];
          setSyncProgress({ current: i + 1, total: docsToSync.length });

          try {
            let file;

            if (dok.useCVProxy && cvData?.data) {
              // Transfer dari CV SIASN
              const base64Data = cvData.data.split(",")[1];
              const byteCharacters = atob(base64Data);
              const byteNumbers = new Array(byteCharacters.length);
              for (let j = 0; j < byteCharacters.length; j++) {
                byteNumbers[j] = byteCharacters.charCodeAt(j);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], { type: "application/pdf" });
              file = new File([blob], `${nip}_${dok.label}.pdf`, {
                type: "application/pdf",
              });
            } else if (dok.sourceOptions) {
              // Transfer dari source option pertama yang tersedia
              const availableSource = dok.sourceOptions.find(
                (src) => !!data?.[src.key]
              );
              if (availableSource) {
                const srcUrl = data[availableSource.key];
                const fullUrl = srcUrl.startsWith("http")
                  ? srcUrl
                  : `https://master.bkd.jatimprov.go.id/files_jatimprov/${srcUrl}`;
                const response = await urlToPdf({ url: fullUrl });
                file = new File([response], `${nip}_${dok.label}.pdf`, {
                  type: "application/pdf",
                });
              }
            } else if (data?.[dok.key]) {
              // Transfer dari SIMASTER
              const fileUrl = data[dok.key];
              const fullUrl = fileUrl.startsWith("http")
                ? fileUrl
                : `https://master.bkd.jatimprov.go.id/files_jatimprov/${fileUrl}`;
              const response = await urlToPdf({ url: fullUrl });
              file = new File([response], `${nip}_${dok.label}.pdf`, {
                type: "application/pdf",
              });
            }

            if (file) {
              const formData = new FormData();
              formData.append("file", file);
              formData.append("id_riwayat", idRiwayat);
              formData.append("id_ref_dokumen", dok.siasnCode);

              await uploadDokumenSiasnBaru(formData);
              successCount++;
            }
          } catch (error) {
            console.error(`Gagal sync ${dok.label}:`, error);
            failCount++;
          }
        }

        setIsSyncingAll(false);
        setSyncProgress({ current: 0, total: 0 });
        queryClient.invalidateQueries(["data-utama-siasn", nip]);

        if (successCount > 0 && failCount === 0) {
          message.success(`Berhasil sinkronisasi ${successCount} dokumen`);
        } else if (successCount > 0 && failCount > 0) {
          message.warning(
            `${successCount} berhasil, ${failCount} gagal disinkronisasi`
          );
        } else {
          message.error("Gagal menyinkronisasi dokumen");
        }
      },
    });
  };

  const getFileUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `https://master.bkd.jatimprov.go.id/files_jatimprov/${url}`;
  };

  const getPathData = () => {
    let pathData = siasn?.data?.path || siasn?.path || siasn?.data?.data?.path;
    if (typeof pathData === "string") {
      try {
        pathData = JSON.parse(pathData);
      } catch {
        pathData = null;
      }
    }
    return pathData;
  };

  const isImage = (url) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url || "");
  const isPdf = (url) => /\.pdf$/i.test(url || "");

  if (isLoading || loadingSiasn) {
    return (
      <Flex align="center" justify="center" py={40}>
        <Spin size="small" />
        <Text size="xs" c="dimmed" ml={8}>
          Loading...
        </Text>
      </Flex>
    );
  }

  const pathData = getPathData();

  // DRH Item Component
  const DRHItem = ({ dok }) => {
    const siasnDoc = pathData?.[dok.siasnCode];
    const siasnUrl = siasnDoc?.dok_uri
      ? `/helpdesk/api/siasn/ws/download?filePath=${siasnDoc.dok_uri}`
      : null;
    const hasCVData = !!cvData?.data;

    return (
      <Stack
        gap={4}
        py={8}
        px={10}
        style={{
          border: "1px solid #e9ecef",
          borderRadius: 6,
          backgroundColor: siasnDoc ? "#fff" : "#f8f9fa",
        }}
      >
        <Flex
          direction={{ base: "column", sm: "row" }}
          align={{ base: "stretch", sm: "center" }}
          justify="space-between"
          gap={8}
        >
          <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
            <Text size="xs" fw={500}>
              {dok.label}
            </Text>
            <Group gap={4}>
              <StatusBadge
                isAvailable={hasCVData}
                label="CV SIASN"
                colorAvailable="blue"
              />
              <StatusBadge isAvailable={!!siasnDoc} label="SIASN" />
            </Group>
          </Stack>

          <Group gap={4} wrap="nowrap">
            {hasCVData && (
              <Tooltip title="Lihat CV SIASN">
                <Button
                  size="small"
                  type="text"
                  icon={<IconFileText size={14} />}
                  onClick={() => {
                    setSelectedFile({ label: "CV SIASN", url: cvData.data });
                    setModalOpen(true);
                  }}
                />
              </Tooltip>
            )}
            {siasnDoc && (
              <Tooltip title="Lihat SIASN">
                <Button
                  size="small"
                  type="text"
                  href={siasnUrl}
                  target="_blank"
                  icon={<IconExternalLink size={14} />}
                />
              </Tooltip>
            )}
            {!siasnDoc && (
              <>
                {hasCVData ? (
                  <Tooltip title="Transfer CV ke SIASN">
                    <Button
                      size="small"
                      type="primary"
                      loading={transferringDocs[dok.key]}
                      icon={<IconArrowRight size={14} />}
                      onClick={() => handleTransferCV(dok)}
                    />
                  </Tooltip>
                ) : (
                  <Upload
                    accept=".pdf"
                    showUploadList={false}
                    beforeUpload={(file) => handleUploadManual(file, dok)}
                  >
                    <Tooltip title="Upload Manual">
                      <Button
                        size="small"
                        type="primary"
                        loading={transferringDocs[dok.key]}
                        icon={<IconUpload size={14} />}
                      />
                    </Tooltip>
                  </Upload>
                )}
              </>
            )}
          </Group>
        </Flex>
        <Text size={10} c="dimmed" fs="italic">
          DRH dapat menggunakan CV SIMASTER atau transfer dari CV SIASN.
          Pastikan data sudah benar sebelum transfer.
        </Text>
      </Stack>
    );
  };

  // Pertek Item Component
  const PertekItem = ({ dok }) => {
    const fileUrl = data?.[dok.key];
    const fullUrl = getFileUrl(fileUrl);
    const siasnDoc = pathData?.[dok.siasnCode];
    const siasnUrl = siasnDoc?.dok_uri
      ? `/helpdesk/api/siasn/ws/download?filePath=${siasnDoc.dok_uri}`
      : null;

    const handleTransferWithSource = (sourceKey, sourceLabel) => {
      const srcFileUrl = data?.[sourceKey];
      const srcFullUrl = getFileUrl(srcFileUrl);

      if (!srcFileUrl) {
        message.error(`File ${sourceLabel} tidak tersedia`);
        return;
      }

      Modal.confirm({
        title: `Transfer ${dok.label}`,
        content: `Transfer dari ${sourceLabel} ke SIASN dengan kode dokumen ${dok.siasnCode}?`,
        okText: "Ya, Transfer",
        cancelText: "Batal",
        onOk: () => handleTransferFromUrl(dok, srcFullUrl),
      });
    };

    return (
      <Stack
        gap={4}
        py={8}
        px={10}
        style={{
          border: "1px solid #e9ecef",
          borderRadius: 6,
          backgroundColor: fileUrl || siasnDoc ? "#fff" : "#f8f9fa",
        }}
      >
        <Flex
          direction={{ base: "column", sm: "row" }}
          align={{ base: "stretch", sm: "center" }}
          justify="space-between"
          gap={8}
        >
          <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
            <Text size="xs" fw={500}>
              {dok.label}
            </Text>
            <Group gap={4}>
              <StatusBadge isAvailable={!!fileUrl} label="SIMASTER" />
              {dok.sourceOptions?.map((src) => (
                <StatusBadge
                  key={src.key}
                  isAvailable={!!data?.[src.key]}
                  label={src.label}
                />
              ))}
              <StatusBadge isAvailable={!!siasnDoc} label="SIASN" />
            </Group>
          </Stack>

          <Group gap={4} wrap="nowrap">
            <Tooltip title="Lihat SIMASTER">
              <Button
                size="small"
                type="text"
                disabled={!fileUrl}
                onClick={() => {
                  setSelectedFile({ label: dok.label, url: fullUrl });
                  setModalOpen(true);
                }}
                icon={<IconEye size={14} />}
              />
            </Tooltip>
            {siasnDoc ? (
              <Tooltip title="Lihat SIASN">
                <Button
                  size="small"
                  type="text"
                  href={siasnUrl}
                  target="_blank"
                  icon={<IconExternalLink size={14} />}
                />
              </Tooltip>
            ) : (
              <>
                {dok.sourceOptions?.map((src) => (
                  <Tooltip key={src.key} title={`Transfer dari ${src.label}`}>
                    <Button
                      size="small"
                      type={src.key === "file_cpns" ? "primary" : "default"}
                      disabled={!data?.[src.key] || transferringDocs[dok.key]}
                      loading={transferringDocs[dok.key]}
                      icon={<IconArrowRight size={14} />}
                      onClick={() =>
                        handleTransferWithSource(src.key, src.label)
                      }
                    />
                  </Tooltip>
                ))}
              </>
            )}
          </Group>
        </Flex>
        <Text size={10} c="dimmed" fs="italic">
          Jika tidak ada Pertek, dapat diganti dengan SK CPNS yang memuat Pertek
        </Text>
      </Stack>
    );
  };

  // Standard Document Item
  const DokumenItem = ({ dok }) => {
    const fileUrl = data?.[dok.key];
    const fullUrl = getFileUrl(fileUrl);
    const siasnDoc = dok.siasnCode ? pathData?.[dok.siasnCode] : null;
    const siasnUrl = siasnDoc?.dok_uri
      ? `/helpdesk/api/siasn/ws/download?filePath=${siasnDoc.dok_uri}`
      : null;

    return (
      <Flex
        direction={{ base: "column", sm: "row" }}
        align={{ base: "stretch", sm: "center" }}
        justify="space-between"
        gap={8}
        py={8}
        px={10}
        style={{
          border: "1px solid #e9ecef",
          borderRadius: 6,
          backgroundColor: fileUrl || siasnDoc ? "#fff" : "#f8f9fa",
        }}
      >
        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
          <Text size="xs" fw={500}>
            {dok.label}
          </Text>
          <Group gap={4}>
            <StatusBadge isAvailable={!!fileUrl} label="SIMASTER" />
            {dok.siasnCode && (
              <StatusBadge isAvailable={!!siasnDoc} label="SIASN" />
            )}
          </Group>
        </Stack>

        <Group gap={4} wrap="nowrap">
          <Tooltip title="Lihat SIMASTER">
            <Button
              size="small"
              type="text"
              disabled={!fileUrl}
              onClick={() => {
                setSelectedFile({ label: dok.label, url: fullUrl });
                setModalOpen(true);
              }}
              icon={<IconEye size={14} />}
            />
          </Tooltip>
          {dok.siasnCode && (
            <>
              <Tooltip title="Lihat SIASN">
                <Button
                  size="small"
                  type="text"
                  disabled={!siasnDoc}
                  href={siasnUrl}
                  target="_blank"
                  icon={<IconExternalLink size={14} />}
                />
              </Tooltip>
              {!siasnDoc && (
                <Tooltip title="Transfer ke SIASN">
                  <Button
                    size="small"
                    type="primary"
                    disabled={!fileUrl || transferringDocs[dok.key]}
                    loading={transferringDocs[dok.key]}
                    onClick={() => handleTransferFromUrl(dok, fullUrl)}
                    icon={<IconArrowRight size={14} />}
                  />
                </Tooltip>
              )}
            </>
          )}
        </Group>
      </Flex>
    );
  };

  const renderItem = (dok) => {
    if (dok.useCVProxy) return <DRHItem key={dok.key} dok={dok} />;
    if (dok.sourceOptions) return <PertekItem key={dok.key} dok={dok} />;
    return <DokumenItem key={dok.key} dok={dok} />;
  };

  // Hitung dokumen penting yang belum ada di SIASN
  const missingDocs = dokumenPenting.filter(
    (dok) => !pathData?.[dok.siasnCode]
  );
  const missingCount = missingDocs.length;
  const missingLabels = missingDocs.map((d) => d.label);

  return (
    <Stack gap="sm">
      {missingCount > 0 ? (
        <Alert
          icon={<IconInfoCircle size={14} />}
          color="red"
          variant="filled"
          p="xs"
          radius="sm"
        >
          <Text size="xs" fw={600}>
            ⚠️ {missingCount} dari 5 Dokumen Penting belum ada di SIASN:{" "}
            {missingLabels.join(", ")}
          </Text>
          <Text size="xs" mt={4}>
            Segera lengkapi dokumen untuk kelengkapan data kepegawaian sebelum
            proses kenaikan pangkat, mutasi, atau layanan lainnya.
          </Text>
        </Alert>
      ) : (
        <Alert
          icon={<IconInfoCircle size={14} />}
          color="green"
          variant="light"
          p="xs"
          radius="sm"
        >
          <Text size="xs" fw={500}>
            ✅ Semua 5 Dokumen Penting sudah lengkap di SIASN.
          </Text>
        </Alert>
      )}

      <div>
        <Flex justify="space-between" align="center" mb={8}>
          <Text size="xs" fw={600} c={missingCount > 0 ? "red" : "green"}>
            {missingCount > 0
              ? `⚠️ Dokumen Penting (${missingCount} belum lengkap)`
              : "✅ Dokumen Penting (Lengkap)"}
          </Text>
          {missingCount > 0 && (
            <Tooltip
              title={
                isSyncingAll
                  ? `Menyinkronkan ${syncProgress.current}/${syncProgress.total}...`
                  : "Sinkronkan semua dokumen penting yang belum ada di SIASN sekaligus"
              }
            >
              <Button
                size="small"
                type="primary"
                icon={<IconRefresh size={14} />}
                loading={isSyncingAll}
                onClick={handleSyncAllDokumenPenting}
              >
                {isSyncingAll
                  ? `Sync ${syncProgress.current}/${syncProgress.total}`
                  : "Sync Semua"}
              </Button>
            </Tooltip>
          )}
        </Flex>
        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="xs">
          {dokumenPenting.map(renderItem)}
        </SimpleGrid>
      </div>

      <div>
        <Text size="xs" fw={600} c="dimmed" mb={6}>
          Dokumen Lainnya
        </Text>
        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="xs">
          {dokumenLainnya.map((dok) => (
            <DokumenItem key={dok.key} dok={dok} />
          ))}
        </SimpleGrid>
      </div>

      <Modal
        title={selectedFile?.label}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={800}
        centered
      >
        {selectedFile?.url && (
          <div style={{ textAlign: "center" }}>
            {selectedFile.url.startsWith("data:application/pdf") ? (
              <iframe
                src={selectedFile.url}
                style={{ width: "100%", height: "70vh", border: "none" }}
                title={selectedFile.label}
              />
            ) : isImage(selectedFile.url) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedFile.url}
                alt={selectedFile.label}
                style={{ maxWidth: "100%", maxHeight: "70vh" }}
              />
            ) : isPdf(selectedFile.url) ? (
              <iframe
                src={selectedFile.url}
                style={{ width: "100%", height: "70vh", border: "none" }}
                title={selectedFile.label}
              />
            ) : (
              <Stack align="center" gap="sm">
                <Text size="sm" c="dimmed">
                  Preview tidak tersedia
                </Text>
                <Button type="primary" href={selectedFile.url} target="_blank">
                  Buka File
                </Button>
              </Stack>
            )}
          </div>
        )}
      </Modal>
    </Stack>
  );
}

export default DokumenPendukungNip;
