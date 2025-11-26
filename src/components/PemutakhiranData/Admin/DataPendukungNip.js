import { getFileByNip, urlToPdf } from "@/services/master.services";
import {
  dataUtamSIASNByNip,
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
} from "@mantine/core";
import {
  IconInfoCircle,
  IconArrowRight,
  IconEye,
  IconExternalLink,
  IconUpload,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Modal, Spin, message, Tooltip, Upload } from "antd";
import { useRouter } from "next/router";
import { useState, useRef } from "react";

const dokumenPenting = [
  {
    key: "drh",
    label: "Daftar Riwayat Hidup",
    siasnCode: "24",
    siasnOnly: true,
  },
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

  const handleUploadManual = async (file, dok) => {
    const idRiwayat = siasn?.data?.data?.id || siasn?.data?.id || siasn?.id;
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
    return false; // prevent default upload
  };

  const handleTransfer = async (dok, fileUrl) => {
    const idRiwayat = siasn?.data?.data?.id || siasn?.data?.id || siasn?.id;
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

  const getFileUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `https://master.bkd.jatimprov.go.id/files_jatimprov/${url}`;
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

  const DokumenItem = ({ dok }) => {
    const fileUrl = data?.[dok.key];
    const fullUrl = getFileUrl(fileUrl);

    let pathData = siasn?.data?.path || siasn?.path || siasn?.data?.data?.path;
    if (typeof pathData === "string") {
      try {
        pathData = JSON.parse(pathData);
      } catch {
        pathData = null;
      }
    }

    const siasnDoc = dok.siasnCode ? pathData?.[dok.siasnCode] : null;
    const siasnUrl = siasnDoc?.dok_uri
      ? `/helpdesk/api/siasn/ws/download?filePath=${siasnDoc.dok_uri}`
      : null;

    // Jika siasnOnly, hanya tampilkan status SIASN dan tombol lihat/upload SIASN
    if (dok.siasnOnly) {
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
            backgroundColor: siasnDoc ? "#fff" : "#f8f9fa",
          }}
        >
          <Flex
            direction={{ base: "column", xs: "row" }}
            align={{ base: "flex-start", xs: "center" }}
            gap={8}
            style={{ flex: 1, minWidth: 0 }}
          >
            <Text size="xs" fw={500} style={{ minWidth: 100 }}>
              {dok.label}
            </Text>
            <Badge
              size="xs"
              color={siasnDoc ? "green" : "gray"}
              variant="filled"
            >
              SIASN
            </Badge>
          </Flex>

          <Group gap={4} wrap="nowrap">
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
              <Upload
                accept=".pdf"
                showUploadList={false}
                beforeUpload={(file) => handleUploadManual(file, dok)}
              >
                <Tooltip title="Upload Manual ke SIASN">
                  <Button
                    size="small"
                    type="primary"
                    loading={transferringDocs[dok.key]}
                    icon={<IconUpload size={14} />}
                  >
                    Upload
                  </Button>
                </Tooltip>
              </Upload>
            )}
          </Group>
        </Flex>
      );
    }

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
        <Flex
          direction={{ base: "column", xs: "row" }}
          align={{ base: "flex-start", xs: "center" }}
          gap={8}
          style={{ flex: 1, minWidth: 0 }}
        >
          <Text size="xs" fw={500} style={{ minWidth: 100 }}>
            {dok.label}
          </Text>
          <Group gap={4}>
            <Badge
              size="xs"
              color={fileUrl ? "green" : "gray"}
              variant="filled"
            >
              SIMASTER
            </Badge>
            {dok.siasnCode && (
              <Badge
                size="xs"
                color={siasnDoc ? "green" : "gray"}
                variant="filled"
              >
                SIASN
              </Badge>
            )}
          </Group>
        </Flex>

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
              <Tooltip title="Transfer ke SIASN">
                <Button
                  size="small"
                  type="primary"
                  disabled={!fileUrl || transferringDocs[dok.key]}
                  loading={transferringDocs[dok.key]}
                  onClick={() => handleTransfer(dok, fullUrl)}
                  icon={<IconArrowRight size={14} />}
                />
              </Tooltip>
            </>
          )}
        </Group>
      </Flex>
    );
  };

  return (
    <Stack gap="sm">
      <Alert
        icon={<IconInfoCircle size={14} />}
        color="blue"
        variant="light"
        p="xs"
        radius="sm"
      >
        <Text size="xs">
          Gunakan fitur transfer dari SIMASTER untuk mempercepat sinkronisasi ke
          SIASN
        </Text>
      </Alert>

      <div>
        <Text size="xs" fw={600} c="blue" mb={6}>
          Dokumen Penting
        </Text>
        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="xs">
          {dokumenPenting.map((dok) => (
            <DokumenItem key={dok.key} dok={dok} />
          ))}
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
