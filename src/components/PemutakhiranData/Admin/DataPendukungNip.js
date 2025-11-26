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
} from "@mantine/core";
import {
  IconInfoCircle,
  IconArrowRight,
  IconEye,
  IconExternalLink,
  IconUpload,
  IconFileText,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Modal, Spin, message, Tooltip, Upload } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";

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
          <Group gap={4}>
            {hasCVData && (
              <Badge size="xs" color="blue" variant="filled">
                CV SIASN
              </Badge>
            )}
            <Badge
              size="xs"
              color={siasnDoc ? "green" : "gray"}
              variant="filled"
            >
              SIASN
            </Badge>
          </Group>
        </Flex>

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
    );
  };

  // Pertek Item Component
  const PertekItem = ({ dok }) => {
    const siasnDoc = pathData?.[dok.siasnCode];
    const siasnUrl = siasnDoc?.dok_uri
      ? `/helpdesk/api/siasn/ws/download?filePath=${siasnDoc.dok_uri}`
      : null;

    const handleTransferWithSource = (sourceKey, sourceLabel) => {
      const fileUrl = data?.[sourceKey];
      const fullUrl = getFileUrl(fileUrl);

      if (!fileUrl) {
        message.error(`File ${sourceLabel} tidak tersedia`);
        return;
      }

      Modal.confirm({
        title: `Transfer ${dok.label}`,
        content: `Transfer dari ${sourceLabel} ke SIASN dengan kode dokumen ${dok.siasnCode}?`,
        okText: "Ya, Transfer",
        cancelText: "Batal",
        onOk: () => handleTransferFromUrl(dok, fullUrl),
      });
    };

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
          <Group gap={4}>
            {dok.sourceOptions?.map((src) => (
              <Badge
                key={src.key}
                size="xs"
                color={data?.[src.key] ? "green" : "gray"}
                variant="light"
              >
                {src.label}
              </Badge>
            ))}
            <Badge
              size="xs"
              color={siasnDoc ? "green" : "gray"}
              variant="filled"
            >
              SIASN
            </Badge>
          </Group>
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
            <>
              {dok.sourceOptions?.map((src) => (
                <Tooltip key={src.key} title={`Transfer dari ${src.label}`}>
                  <Button
                    size="small"
                    type={src.key === "file_cpns" ? "primary" : "default"}
                    disabled={!data?.[src.key] || transferringDocs[dok.key]}
                    loading={transferringDocs[dok.key]}
                    icon={<IconArrowRight size={14} />}
                    onClick={() => handleTransferWithSource(src.key, src.label)}
                  />
                </Tooltip>
              ))}
            </>
          )}
        </Group>
      </Flex>
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
          Transfer dokumen dari SIMASTER/CV SIASN ke dokumen SIASN untuk
          sinkronisasi data
        </Text>
      </Alert>

      <div>
        <Text size="xs" fw={600} c="blue" mb={6}>
          Dokumen Penting
        </Text>
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
