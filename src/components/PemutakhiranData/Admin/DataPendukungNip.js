import { getFileByNip, urlToPdf } from "@/services/master.services";
import {
  dataUtamSIASNByNip,
  uploadDokumenSiasnBaru,
} from "@/services/siasn-services";
import { Alert, Text, Badge as MantineBadge } from "@mantine/core";
import { IconInfoCircle, IconArrowRight } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Modal, Space, Spin, message } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";

const dokumenPenting = [
  { key: "file_pns", label: "SK PNS", siasnCode: "887" },
  { key: "file_spmt_cpns", label: "SPMT", siasnCode: "888" },
  { key: "file_cpns", label: "SK CPNS", siasnCode: "889" },
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
  { key: "file_nota_persetujuan_bkn", label: "Nota Persetujuan BKN" },
  { key: "file_kartu_taspen", label: "Kartu Taspen" },
  { key: "file_kartu_asn_virtual", label: "Kartu ASN Virtual" },
];

function DokumenPendukungNip() {
  const router = useRouter();
  const nip = router.query.nip;
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [transferringDocs, setTransferringDocs] = useState({});
  const queryClient = useQueryClient();

  const { data: siasn, isLoading: loadingSiasn } = useQuery(
    ["data-utama-siasn", nip],
    () => dataUtamSIASNByNip(nip),
    {
      enabled: !!nip,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 500000,
    }
  );

  const { data, isLoading } = useQuery(
    ["dokumen-pendukung", nip],
    () => getFileByNip(nip),
    {
      refetchOnWindowFocus: false,
      enabled: !!nip,
      staleTime: 500000,
      keepPreviousData: true,
    }
  );

  const { mutate: transferDokumen } = useMutation(
    (data) => uploadDokumenSiasnBaru(data),
    {
      onSuccess: (data, variables) => {
        message.success("Berhasil transfer dokumen ke SIASN");
        queryClient.invalidateQueries(["data-utama-siasn", nip]);
        // Clear loading state untuk dokumen ini
        setTransferringDocs((prev) => ({
          ...prev,
          [variables.dokKey]: false,
        }));
      },
      onError: (error, variables) => {
        console.error("Transfer error:", error);
        message.error(
          error?.response?.data?.message || "Gagal transfer dokumen"
        );
        // Clear loading state untuk dokumen ini
        setTransferringDocs((prev) => ({
          ...prev,
          [variables.dokKey]: false,
        }));
      },
    }
  );

  const handleTransfer = async (dok, fileUrl) => {
    // Get ID from various possible structures
    const idRiwayat = siasn?.data?.data?.id || siasn?.data?.id || siasn?.id;

    if (!idRiwayat) {
      message.error("ID riwayat tidak ditemukan");
      return;
    }

    // Set loading state untuk dokumen ini
    setTransferringDocs((prev) => ({
      ...prev,
      [dok.key]: true,
    }));

    try {
      // Fetch file menggunakan urlToPdf service
      const response = await urlToPdf({ url: fileUrl });

      // Convert blob response ke File object
      const file = new File([response], `${nip}_${dok.label}.pdf`, {
        type: "application/pdf",
      });

      // Create FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("id_riwayat", idRiwayat);
      formData.append("id_ref_dokumen", dok.siasnCode);

      // Add dokKey untuk tracking di mutation
      formData.dokKey = dok.key;

      console.log("Transfer data:", {
        fileName: file.name,
        fileSize: file.size,
        id_riwayat: idRiwayat,
        id_ref_dokumen: dok.siasnCode,
      });

      transferDokumen(formData);
    } catch (error) {
      console.error("Handle transfer error:", error);
      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Gagal memproses transfer"
      );
      // Clear loading state jika error
      setTransferringDocs((prev) => ({
        ...prev,
        [dok.key]: false,
      }));
    }
  };

  const handleView = (file) => {
    setSelectedFile(file);
    setModalOpen(true);
  };

  const getFileUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `https://master.bkd.jatimprov.go.id/files_jatimprov/${url}`;
  };

  const isImage = (url) => {
    if (!url) return false;
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  const isPdf = (url) => {
    if (!url) return false;
    return /\.pdf$/i.test(url);
  };

  if (isLoading || loadingSiasn) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <Spin size="large" />
        <Text size="xs" color="dimmed" style={{ marginTop: 8 }}>
          {isLoading && "Loading SIMASTER..."}
          {loadingSiasn && " Loading SIASN..."}
        </Text>
      </div>
    );
  }

  const renderDokumen = (dokList) => {
    return dokList.map((dok) => {
      const fileUrl = data?.[dok.key];
      const fullUrl = getFileUrl(fileUrl);
      const tglEdit = data?.[`tgl_edit_${dok.key}`];

      // Check SIASN document - parse if string
      // Try different path structures
      let pathData =
        siasn?.data?.path || siasn?.path || siasn?.data?.data?.path;

      if (typeof pathData === "string") {
        try {
          pathData = JSON.parse(pathData);
        } catch (e) {
          pathData = null;
        }
      }

      const siasnDoc = dok.siasnCode ? pathData?.[dok.siasnCode] : null;
      const siasnUrl = siasnDoc?.dok_uri
        ? `/helpdesk/api/siasn/ws/download?filePath=${siasnDoc.dok_uri}`
        : null;

      return (
        <div
          key={dok.key}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 12px",
            border: "1px solid #e9ecef",
            borderRadius: "6px",
            backgroundColor: fileUrl || siasnDoc ? "#fff" : "#f8f9fa",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div>
              <Text size="xs" weight={500}>
                {dok.label}
              </Text>
            </div>
            <Space size={8} style={{ marginTop: 4 }}>
              <MantineBadge
                size="sm"
                color={fileUrl ? "green" : "red"}
                variant="filled"
              >
                SIMASTER
              </MantineBadge>
              {dok.siasnCode && (
                <MantineBadge
                  size="sm"
                  color={siasnDoc ? "green" : "red"}
                  variant="filled"
                >
                  SIASN
                </MantineBadge>
              )}
            </Space>
            {tglEdit && (
              <Text size="xs" color="dimmed" style={{ marginTop: 2 }}>
                {tglEdit}
              </Text>
            )}
          </div>
          <Space size={6}>
            <Button
              size="small"
              type="default"
              disabled={!fileUrl}
              onClick={() => handleView({ label: dok.label, url: fullUrl })}
            >
              Lihat SIMASTER
            </Button>
            {dok.siasnCode && (
              <>
                <Button
                  size="small"
                  type="default"
                  disabled={!siasnDoc}
                  href={siasnUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Lihat SIASN
                </Button>
                <Button
                  size="small"
                  type="primary"
                  disabled={!fileUrl || transferringDocs[dok.key]}
                  loading={transferringDocs[dok.key]}
                  onClick={() => handleTransfer(dok, fullUrl)}
                  icon={<IconArrowRight size={14} />}
                >
                  Transfer
                </Button>
              </>
            )}
          </Space>
        </div>
      );
    });
  };

  return (
    <>
      <Alert
        icon={<IconInfoCircle size={16} />}
        title="Informasi Upload Dokumen"
        color="blue"
        style={{ marginBottom: "16px" }}
      >
        Dokumen pendukung dapat diunggah melalui Aplikasi SIMASTER. Pastikan
        file dalam format yang sesuai (PDF, JPG, PNG) dan ukuran maksimal 2MB.
      </Alert>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Dokumen Penting */}
        <div>
          <Text size="sm" weight={600} mb={8} color="blue">
            Dokumen Penting
          </Text>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {renderDokumen(dokumenPenting)}
          </div>
        </div>

        {/* Dokumen Lainnya */}
        <div>
          <Text size="sm" weight={600} mb={8} color="dimmed">
            Dokumen Lainnya
          </Text>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {renderDokumen(dokumenLainnya)}
          </div>
        </div>
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
            {isImage(selectedFile.url) ? (
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
              <div>
                <Text size="sm" color="dimmed" mb="md">
                  Preview tidak tersedia
                </Text>
                <Button type="primary" href={selectedFile.url} target="_blank">
                  Buka File
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

export default DokumenPendukungNip;
