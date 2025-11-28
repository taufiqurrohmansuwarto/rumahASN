import { getFileByNip, urlToPdf } from "@/services/master.services";
import {
  dataUtamSIASNByNip,
  getCVProxyByNip,
  uploadDokumenSiasnBaru,
} from "@/services/siasn-services";
import { Alert, Text, Stack, Flex, SimpleGrid } from "@mantine/core";
import { IconInfoCircle, IconRefresh } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Modal, Spin, message, Tooltip, notification } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";

// Import dari folder DokumenPendukung
import {
  dokumenPenting,
  dokumenLainnya,
  getFileUrl,
  base64ToFile,
  parsePathData,
  getIdRiwayat as getIdRiwayatUtil,
  DokumenItem,
  DRHItem,
  PertekItem,
  FilePreviewModal,
} from "./DokumenPendukung";

function DokumenPendukungNip() {
  const router = useRouter();
  const nip = router.query.nip;
  const queryClient = useQueryClient();

  // States
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [transferringDocs, setTransferringDocs] = useState({});
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });

  // Queries
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

  // Mutation
  const { mutate: transferDokumen } = useMutation(
    (formData) => uploadDokumenSiasnBaru(formData),
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

  // Helpers
  const getIdRiwayat = () => getIdRiwayatUtil(siasn);
  const getPathData = () => parsePathData(siasn);

  // Handlers
  const handlePreview = (file) => {
    setSelectedFile(file);
    setModalOpen(true);
  };

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

  const handleTransferFromUrl = async (dok, fileUrl, loadingKey = null) => {
    const idRiwayat = getIdRiwayat();
    if (!idRiwayat) {
      message.error("ID riwayat tidak ditemukan");
      return;
    }

    const keyToUse = loadingKey || dok.key;
    setTransferringDocs((prev) => ({ ...prev, [keyToUse]: true }));

    try {
      const response = await urlToPdf({ url: fileUrl });
      const file = new File([response], `${nip}_${dok.label}.pdf`, {
        type: "application/pdf",
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("id_riwayat", idRiwayat);
      formData.append("id_ref_dokumen", dok.siasnCode);
      formData.dokKey = keyToUse;

      transferDokumen(formData);
    } catch (error) {
      message.error(error?.message || "Gagal transfer");
      setTransferringDocs((prev) => ({ ...prev, [keyToUse]: false }));
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
          const file = base64ToFile(cvData.data, `${nip}_DRH.pdf`);
          if (!file) {
            throw new Error("Gagal convert CV");
          }

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

  // Sync All Handler
  const handleSyncAllDokumenPenting = async () => {
    const idRiwayat = getIdRiwayat();
    if (!idRiwayat) {
      message.error("ID riwayat tidak ditemukan");
      return;
    }

    const pathData = getPathData();
    const docsToSync = dokumenPenting.filter((dok) => {
      const siasnDoc = pathData?.[dok.siasnCode];
      if (siasnDoc) return false;

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
              ⚠️ Proses akan berjalan di background. Anda dapat meninggalkan
              halaman ini dan kembali lagi nanti.
            </Text>
          </Alert>
        </Stack>
      ),
      okText: "Ya, Sinkronkan Semua",
      cancelText: "Batal",
      onOk: () => {
        // Langsung jalankan sync tanpa menunggu, modal akan tertutup otomatis
        runSyncAll(docsToSync, idRiwayat);
      },
    });
  };

  const runSyncAll = async (docsToSync, idRiwayat) => {
    setIsSyncingAll(true);
    setSyncProgress({ current: 0, total: docsToSync.length });

    // Tampilkan notifikasi bahwa proses dimulai
    const notificationKey = `sync-all-${Date.now()}`;
    notification.info({
      key: notificationKey,
      message: "Sinkronisasi Dimulai",
      description: `Menyinkronkan ${docsToSync.length} dokumen ke SIASN...`,
      duration: 0, // Tidak auto close
      placement: "bottomRight",
    });

    const results = [];

    for (let i = 0; i < docsToSync.length; i++) {
      const dok = docsToSync[i];
      setSyncProgress({ current: i + 1, total: docsToSync.length });

      // Update notifikasi dengan progress
      notification.info({
        key: notificationKey,
        message: "Sinkronisasi Berjalan",
        description: `Memproses ${i + 1}/${docsToSync.length}: ${dok.label}...`,
        duration: 0,
        placement: "bottomRight",
      });

      try {
        let file;

        if (dok.useCVProxy && cvData?.data) {
          file = base64ToFile(cvData.data, `${nip}_${dok.label}.pdf`);
        } else if (dok.sourceOptions) {
          const availableSource = dok.sourceOptions.find(
            (src) => !!data?.[src.key]
          );
          if (availableSource) {
            const srcUrl = data[availableSource.key];
            const fullUrl = getFileUrl(srcUrl);
            const response = await urlToPdf({ url: fullUrl });
            file = new File([response], `${nip}_${dok.label}.pdf`, {
              type: "application/pdf",
            });
          }
        } else if (data?.[dok.key]) {
          const fileUrl = data[dok.key];
          const fullUrl = getFileUrl(fileUrl);
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
          results.push({ label: dok.label, status: "success" });
        } else {
          results.push({
            label: dok.label,
            status: "error",
            message: "File tidak ditemukan",
          });
        }
      } catch (error) {
        console.error(`Gagal sync ${dok.label}:`, error);
        results.push({
          label: dok.label,
          status: "error",
          message: error?.message || "Gagal upload",
        });
      }
    }

    setIsSyncingAll(false);
    setSyncProgress({ current: 0, total: 0 });
    queryClient.invalidateQueries(["data-utama-siasn", nip]);

    const successCount = results.filter((r) => r.status === "success").length;
    const failCount = results.filter((r) => r.status === "error").length;

    // Tampilkan notifikasi hasil akhir
    if (successCount > 0 && failCount === 0) {
      notification.success({
        key: notificationKey,
        message: "Sinkronisasi Selesai",
        description: `✅ Berhasil menyinkronkan ${successCount} dokumen ke SIASN.`,
        duration: 5,
        placement: "bottomRight",
      });
    } else if (successCount > 0 && failCount > 0) {
      const failedDocs = results
        .filter((r) => r.status === "error")
        .map((r) => r.label)
        .join(", ");
      notification.warning({
        key: notificationKey,
        message: "Sinkronisasi Selesai (Sebagian)",
        description: `✅ ${successCount} berhasil, ❌ ${failCount} gagal: ${failedDocs}`,
        duration: 10,
        placement: "bottomRight",
      });
    } else if (failCount > 0) {
      notification.error({
        key: notificationKey,
        message: "Sinkronisasi Gagal",
        description: "Semua dokumen gagal disinkronisasi. Silakan coba lagi.",
        duration: 10,
        placement: "bottomRight",
      });
    }
  };

  // Loading state
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

  // Render item berdasarkan tipe dokumen
  const renderItem = (dok) => {
    if (dok.useCVProxy) {
      return (
        <DRHItem
          key={dok.key}
          dok={dok}
          pathData={pathData}
          cvData={cvData}
          transferringDocs={transferringDocs}
          onPreview={handlePreview}
          onTransferCV={handleTransferCV}
          onUploadManual={handleUploadManual}
        />
      );
    }
    if (dok.sourceOptions) {
      return (
        <PertekItem
          key={dok.key}
          dok={dok}
          data={data}
          pathData={pathData}
          transferringDocs={transferringDocs}
          onPreview={handlePreview}
          onTransfer={handleTransferFromUrl}
        />
      );
    }
    return (
      <DokumenItem
        key={dok.key}
        dok={dok}
        data={data}
        pathData={pathData}
        transferringDocs={transferringDocs}
        onPreview={handlePreview}
        onTransfer={handleTransferFromUrl}
      />
    );
  };

  // Hitung dokumen penting yang belum ada di SIASN
  const missingDocs = dokumenPenting.filter(
    (dok) => !pathData?.[dok.siasnCode]
  );
  const missingCount = missingDocs.length;
  const missingLabels = missingDocs.map((d) => d.label);

  return (
    <Stack gap="sm">
      {/* Alert Status */}
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

      {/* Dokumen Penting */}
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

      {/* Dokumen Lainnya */}
      <div>
        <Text size="xs" fw={600} c="dimmed" mb={6}>
          Dokumen Lainnya
        </Text>
        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="xs">
          {dokumenLainnya.map((dok) => (
            <DokumenItem
              key={dok.key}
              dok={dok}
              data={data}
              pathData={pathData}
              transferringDocs={transferringDocs}
              onPreview={handlePreview}
              onTransfer={handleTransferFromUrl}
            />
          ))}
        </SimpleGrid>
      </div>

      {/* Modal Preview File */}
      <FilePreviewModal
        open={modalOpen}
        file={selectedFile}
        onClose={() => setModalOpen(false)}
      />
    </Stack>
  );
}

export default DokumenPendukungNip;
