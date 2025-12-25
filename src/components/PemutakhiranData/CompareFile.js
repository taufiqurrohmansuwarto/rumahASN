import { getFilePersonalServices, urlToPdf } from "@/services/master.services";
import {
  dataUtamaSIASN,
  uploadDokumenSiasnBaru,
  getCVProxyPersonal,
} from "@/services/siasn-services";
import {
  FileOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  SendOutlined,
  EyeOutlined,
  ExportOutlined,
  LoadingOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  FilePptOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  Empty,
  Image,
  Input,
  List,
  Modal,
  Radio,
  Skeleton,
  Space,
  Spin,
  Tag,
  Typography,
  Tooltip,
  notification,
  message,
} from "antd";
import { useState, useMemo } from "react";

const { Search } = Input;
const { Text } = Typography;

// 5 Dokumen Penting SIASN
const DOKUMEN_PENTING = [
  {
    key: "drh",
    label: "Daftar Riwayat Hidup (CV)",
    siasnCode: "24",
    useCVProxy: true,
    keterangan: "DRH dapat ditransfer dari CV SIASN. Pastikan data CV sudah benar sebelum transfer.",
  },
  {
    key: "file_pns",
    label: "SK PNS",
    siasnCode: "887",
    keterangan: "Surat Keputusan pengangkatan menjadi Pegawai Negeri Sipil.",
  },
  {
    key: "file_cpns",
    label: "SK CPNS",
    siasnCode: "889",
    keterangan: "Surat Keputusan pengangkatan menjadi Calon Pegawai Negeri Sipil.",
  },
  {
    key: "file_spmt_cpns",
    label: "SPMT",
    siasnCode: "888",
    keterangan: "Surat Pernyataan Melaksanakan Tugas sebagai CPNS.",
  },
  {
    key: "file_pertek",
    label: "Pertimbangan Teknis BKN",
    siasnCode: "2",
    sourceOptions: [
      { key: "file_nota_persetujuan_bkn", label: "Nota BKN" },
      { key: "file_cpns", label: "SK CPNS" },
    ],
    keterangan: "Jika tidak ada Pertek, dapat diganti dengan SK CPNS yang memuat Pertek.",
  },
];

// Dokumen Lainnya
const DOKUMEN_LAINNYA = [
  { key: "file_foto", label: "Foto Pegawai" },
  { key: "file_foto_full", label: "Foto Full Body" },
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
  { key: "file_medical_checkup_cpns", label: "Medical Check Up CPNS" },
  { key: "file_suket_bebas_narkoba_cpns", label: "Surat Bebas Narkoba CPNS" },
  { key: "file_medical_checkup_pns", label: "Medical Check Up PNS" },
  { key: "file_suket_bebas_narkoba_pns", label: "Surat Bebas Narkoba PNS" },
];

// Helper functions
const getFileUrl = (fileValue) => {
  if (!fileValue || fileValue === "") return null;
  if (fileValue.startsWith("http")) return fileValue;
  return `https://master.bkd.jatimprov.go.id/files_jatimprov/${fileValue}`;
};

const isImageFile = (url) => {
  if (!url) return false;
  return [".jpg", ".jpeg", ".png", ".gif", ".webp"].some((e) =>
    url.toLowerCase().includes(e)
  );
};

const isPdfFile = (url) => {
  if (!url) return false;
  return url.toLowerCase().includes(".pdf") || url.startsWith("data:application/pdf");
};

const getFileTypeIcon = (url) => {
  if (!url) return null;
  if (isImageFile(url))
    return <FileImageOutlined style={{ color: "#1890ff", fontSize: 14 }} />;
  if (isPdfFile(url))
    return <FilePdfOutlined style={{ color: "#f5222d", fontSize: 14 }} />;
  return <FileOutlined style={{ color: "#8c8c8c", fontSize: 14 }} />;
};

const getSiasnDownloadUrl = (dokUri) => {
  if (!dokUri) return null;
  return `/helpdesk/api/siasn/ws/download?filePath=${dokUri}`;
};

const parsePathData = (siasn) => {
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

const getIdRiwayat = (siasn) =>
  siasn?.data?.data?.id || siasn?.data?.id || siasn?.id;

const base64ToFile = (base64Data, fileName) => {
  try {
    const base64Content = base64Data.split(",")[1];
    const byteCharacters = atob(base64Content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });
    return new File([blob], fileName, { type: "application/pdf" });
  } catch (error) {
    console.error("Error converting base64 to file:", error);
    return null;
  }
};

// Komponen Item Dokumen Penting
const DokumenPentingItem = ({
  dok,
  data,
  pathData,
  cvData,
  loadingSiasn,
  transferringDocs,
  onPreview,
  onTransfer,
  onTransferCV,
  onTransferPertek,
}) => {
  const siasnDoc = pathData?.[dok.siasnCode];
  const siasnUrl = getSiasnDownloadUrl(siasnDoc?.dok_uri);

  // Untuk DRH/CV
  if (dok.useCVProxy) {
    const hasCvData = !!cvData?.data;
    return (
      <Card
        size="small"
        style={{ marginBottom: 8, backgroundColor: siasnDoc ? "#fff" : "#fafafa" }}
      >
        <Space direction="vertical" style={{ width: "100%" }} size={4}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <Space wrap>
              <Text strong style={{ fontSize: 13 }}>{dok.label}</Text>
              <Tag color={hasCvData ? "blue" : "default"} style={{ fontSize: 10 }}>
                CV SIASN: {hasCvData ? "Ada" : "Kosong"}
              </Tag>
              {loadingSiasn ? (
                <Tag icon={<LoadingOutlined />} style={{ fontSize: 10 }}>SIASN</Tag>
              ) : (
                <Tag color={siasnDoc ? "green" : "red"} style={{ fontSize: 10 }}>
                  SIASN: {siasnDoc ? "Ada" : "Kosong"}
                </Tag>
              )}
            </Space>
            <Space size={4}>
              {/* Tombol Lihat CV */}
              {hasCvData && (
                <Tooltip title="Lihat CV SIASN">
                  <Button
                    size="small"
                    type="text"
                    icon={<FilePptOutlined />}
                    onClick={() => onPreview({ label: "CV SIASN", url: cvData.data })}
                  />
                </Tooltip>
              )}
              {/* Tombol Lihat di SIASN */}
              {siasnDoc && (
                <Tooltip title="Lihat di SIASN">
                  <Button size="small" type="text" icon={<ExportOutlined />} href={siasnUrl} target="_blank" />
                </Tooltip>
              )}
              {/* Tombol Transfer */}
              {!siasnDoc && !loadingSiasn && (
                <Tooltip title={hasCvData ? "Transfer CV ke SIASN" : "CV tidak tersedia"}>
                  <Button
                    size="small"
                    type="primary"
                    icon={<SendOutlined />}
                    disabled={!hasCvData}
                    loading={transferringDocs[dok.key]}
                    onClick={() => onTransferCV(dok)}
                  >
                    Transfer
                  </Button>
                </Tooltip>
              )}
            </Space>
          </div>
          <Text type="secondary" style={{ fontSize: 11, fontStyle: "italic" }}>
            {dok.keterangan}
          </Text>
        </Space>
      </Card>
    );
  }

  // Untuk Pertek (pilih source)
  if (dok.sourceOptions) {
    const availableSource = dok.sourceOptions.find((src) => !!data?.[src.key]);
    const hasSource = !!availableSource;
    const sourceUrl = hasSource ? getFileUrl(data[availableSource.key]) : null;

    return (
      <Card
        size="small"
        style={{ marginBottom: 8, backgroundColor: siasnDoc ? "#fff" : "#fafafa" }}
      >
        <Space direction="vertical" style={{ width: "100%" }} size={4}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <Space wrap>
              <Text strong style={{ fontSize: 13 }}>{dok.label}</Text>
              {dok.sourceOptions.map((src) => (
                <Tag
                  key={src.key}
                  color={data?.[src.key] ? "green" : "default"}
                  style={{ fontSize: 10 }}
                >
                  {src.label}: {data?.[src.key] ? "Ada" : "Kosong"}
                </Tag>
              ))}
              {loadingSiasn ? (
                <Tag icon={<LoadingOutlined />} style={{ fontSize: 10 }}>SIASN</Tag>
              ) : (
                <Tag color={siasnDoc ? "green" : "red"} style={{ fontSize: 10 }}>
                  SIASN: {siasnDoc ? "Ada" : "Kosong"}
                </Tag>
              )}
            </Space>
            <Space size={4}>
              {/* Tombol Lihat SIMASTER */}
              {hasSource && (
                <Tooltip title={`Lihat ${availableSource.label}`}>
                  <Button size="small" type="text" icon={<EyeOutlined />} onClick={() => onPreview({ label: availableSource.label, url: sourceUrl })} />
                </Tooltip>
              )}
              {/* Tombol Lihat di SIASN */}
              {siasnDoc && (
                <Tooltip title="Lihat di SIASN">
                  <Button size="small" type="text" icon={<ExportOutlined />} href={siasnUrl} target="_blank" />
                </Tooltip>
              )}
              {/* Tombol Transfer */}
              {!siasnDoc && !loadingSiasn && (
                <Space size={4}>
                  {dok.sourceOptions.map((src) => {
                    const srcUrl = getFileUrl(data?.[src.key]);
                    const hasSrc = !!srcUrl;
                    return (
                      <Tooltip key={src.key} title={hasSrc ? `Transfer dari ${src.label}` : `${src.label} tidak tersedia`}>
                        <Button
                          size="small"
                          type={src.key === "file_cpns" ? "primary" : "default"}
                          icon={<SendOutlined />}
                          disabled={!hasSrc}
                          loading={transferringDocs[`${dok.key}_${src.key}`]}
                          onClick={() => {
                            Modal.confirm({
                              title: `Transfer ${dok.label}`,
                              content: `Transfer dari ${src.label} ke SIASN?`,
                              okText: "Ya, Transfer",
                              cancelText: "Batal",
                              onOk: () => onTransferPertek({ ...dok, key: `${dok.key}_${src.key}` }, srcUrl),
                            });
                          }}
                        >
                          {src.label}
                        </Button>
                      </Tooltip>
                    );
                  })}
                </Space>
              )}
            </Space>
          </div>
          <Text type="secondary" style={{ fontSize: 11, fontStyle: "italic" }}>
            {dok.keterangan}
          </Text>
        </Space>
      </Card>
    );
  }

  // Untuk dokumen biasa (SK PNS, SK CPNS, SPMT)
  const fileValue = data?.[dok.key];
  const fileUrl = getFileUrl(fileValue);
  const hasFile = !!fileUrl;

  return (
    <Card
      size="small"
      style={{ marginBottom: 8, backgroundColor: siasnDoc ? "#fff" : "#fafafa" }}
    >
      <Space direction="vertical" style={{ width: "100%" }} size={4}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <Space wrap>
            <Text strong style={{ fontSize: 13 }}>{dok.label}</Text>
            <Tag color={hasFile ? "green" : "default"} style={{ fontSize: 10 }}>
              SIMASTER: {hasFile ? "Ada" : "Kosong"}
            </Tag>
            {loadingSiasn ? (
              <Tag icon={<LoadingOutlined />} style={{ fontSize: 10 }}>SIASN</Tag>
            ) : (
              <Tag color={siasnDoc ? "green" : "red"} style={{ fontSize: 10 }}>
                SIASN: {siasnDoc ? "Ada" : "Kosong"}
              </Tag>
            )}
          </Space>
          <Space size={4}>
            {/* Tombol Lihat SIMASTER */}
            {hasFile && (
              <Tooltip title="Lihat SIMASTER">
                <Button size="small" type="text" icon={<EyeOutlined />} onClick={() => onPreview({ label: dok.label, url: fileUrl })} />
              </Tooltip>
            )}
            {/* Tombol Lihat di SIASN */}
            {siasnDoc && (
              <Tooltip title="Lihat di SIASN">
                <Button size="small" type="text" icon={<ExportOutlined />} href={siasnUrl} target="_blank" />
              </Tooltip>
            )}
            {/* Tombol Transfer */}
            {!siasnDoc && !loadingSiasn && (
              <Tooltip title={hasFile ? "Transfer ke SIASN" : "File SIMASTER tidak tersedia"}>
                <Button
                  size="small"
                  type="primary"
                  icon={<SendOutlined />}
                  disabled={!hasFile}
                  loading={transferringDocs[dok.key]}
                  onClick={() => onTransfer(dok, fileUrl)}
                >
                  Transfer
                </Button>
              </Tooltip>
            )}
          </Space>
        </div>
        <Text type="secondary" style={{ fontSize: 11, fontStyle: "italic" }}>
          {dok.keterangan}
        </Text>
      </Space>
    </Card>
  );
};

function CompareFile() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState({ label: "", url: "" });
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [transferringDocs, setTransferringDocs] = useState({});

  // Query data SIMASTER (cepat)
  const { data, isLoading } = useQuery({
    queryKey: ["compare-file"],
    queryFn: () => getFilePersonalServices(),
    refetchOnWindowFocus: false,
  });

  // Query data SIASN (lambat, terpisah)
  const { data: siasn, isLoading: loadingSiasn } = useQuery({
    queryKey: ["data-utama-siasn-personal"],
    queryFn: () => dataUtamaSIASN(),
    refetchOnWindowFocus: false,
    staleTime: 500000,
  });

  // Query CV Proxy (terpisah)
  const { data: cvData, isLoading: loadingCV } = useQuery({
    queryKey: ["cv-proxy-personal"],
    queryFn: () => getCVProxyPersonal(),
    refetchOnWindowFocus: false,
    staleTime: 500000,
  });

  // Mutation transfer dokumen
  const { mutate: transferDokumen } = useMutation(
    (formData) => uploadDokumenSiasnBaru(formData),
    {
      onSuccess: (_, variables) => {
        notification.success({
          key: variables.notifKey,
          message: "Transfer Berhasil",
          description: `${variables.dokLabel} berhasil diupload ke SIASN.`,
          duration: 4,
          placement: "bottomRight",
        });
        queryClient.invalidateQueries(["data-utama-siasn-personal"]);
        setTransferringDocs((prev) => ({ ...prev, [variables.dokKey]: false }));
      },
      onError: (error, variables) => {
        notification.error({
          key: variables.notifKey,
          message: "Transfer Gagal",
          description: `${variables.dokLabel}: ${error?.response?.data?.message || "Gagal upload"}`,
          duration: 6,
          placement: "bottomRight",
        });
        setTransferringDocs((prev) => ({ ...prev, [variables.dokKey]: false }));
      },
    }
  );

  const pathData = parsePathData(siasn);
  const idRiwayat = getIdRiwayat(siasn);

  // Handlers
  const handlePreview = (file) => {
    setSelected(file);
    setModalOpen(true);
  };

  const handleTransfer = async (dok, fileUrl) => {
    if (!idRiwayat) {
      message.error("ID riwayat tidak ditemukan. Pastikan data SIASN sudah dimuat.");
      return;
    }

    const notifKey = `transfer-${dok.key}-${Date.now()}`;
    setTransferringDocs((prev) => ({ ...prev, [dok.key]: true }));

    notification.info({
      key: notifKey,
      message: "Transfer Dokumen",
      description: `Sedang mentransfer ${dok.label} ke SIASN...`,
      duration: 0,
      placement: "bottomRight",
    });

    try {
      const response = await urlToPdf({ url: fileUrl });
      const file = new File([response], `${dok.label}.pdf`, { type: "application/pdf" });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("id_riwayat", idRiwayat);
      formData.append("id_ref_dokumen", dok.siasnCode);
      formData.dokKey = dok.key;
      formData.dokLabel = dok.label;
      formData.notifKey = notifKey;

      transferDokumen(formData);
    } catch (error) {
      notification.error({
        key: notifKey,
        message: "Transfer Gagal",
        description: `${dok.label}: ${error?.message || "Gagal transfer"}`,
        duration: 6,
        placement: "bottomRight",
      });
      setTransferringDocs((prev) => ({ ...prev, [dok.key]: false }));
    }
  };

  const handleTransferCV = async (dok) => {
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
      content: "Pastikan data CV SIASN sudah benar. Proses akan berjalan di background.",
      okText: "Ya, Transfer",
      cancelText: "Batal",
      onOk: () => {
        const notifKey = `transfer-cv-${dok.key}-${Date.now()}`;
        setTransferringDocs((prev) => ({ ...prev, [dok.key]: true }));

        notification.info({
          key: notifKey,
          message: "Transfer DRH",
          description: `Sedang mentransfer ${dok.label} ke SIASN...`,
          duration: 0,
          placement: "bottomRight",
        });

        try {
          const file = base64ToFile(cvData.data, `DRH.pdf`);
          if (!file) throw new Error("Gagal convert CV");

          const formData = new FormData();
          formData.append("file", file);
          formData.append("id_riwayat", idRiwayat);
          formData.append("id_ref_dokumen", dok.siasnCode);
          formData.dokKey = dok.key;
          formData.dokLabel = dok.label;
          formData.notifKey = notifKey;

          transferDokumen(formData);
        } catch (error) {
          notification.error({
            key: notifKey,
            message: "Transfer Gagal",
            description: `${dok.label}: Gagal transfer CV`,
            duration: 6,
            placement: "bottomRight",
          });
          setTransferringDocs((prev) => ({ ...prev, [dok.key]: false }));
        }
      },
    });
  };

  // Stats
  const stats = useMemo(() => {
    if (!data) return { total: 0, uploaded: 0, empty: 0 };
    const uploaded = DOKUMEN_LAINNYA.filter((item) => getFileUrl(data?.[item.key])).length;
    return { total: DOKUMEN_LAINNYA.length, uploaded, empty: DOKUMEN_LAINNYA.length - uploaded };
  }, [data]);

  // Hitung dokumen penting yang belum ada di SIASN
  const missingDokPenting = useMemo(() => {
    if (loadingSiasn) return [];
    return DOKUMEN_PENTING.filter((dok) => !pathData?.[dok.siasnCode]);
  }, [pathData, loadingSiasn]);

  // Filter dokumen lainnya
  const filteredData = useMemo(() => {
    if (!data) return [];
    return DOKUMEN_LAINNYA.filter((item) => {
      const hasFile = !!getFileUrl(data?.[item.key]);
      const matchSearch = item.label.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      if (filter === "uploaded") return hasFile;
      if (filter === "empty") return !hasFile;
      return true;
    });
  }, [data, filter, search]);

  if (isLoading) return <Skeleton active />;
  if (!data) return <Empty description="Data tidak ditemukan" />;

  // Render content di modal - support base64 PDF
  const renderModalContent = () => {
    const url = selected.url;
    if (!url) return null;

    // Base64 PDF (dari CV)
    if (url.startsWith("data:application/pdf")) {
      return (
        <iframe
          src={url}
          width="100%"
          height="500px"
          style={{ border: "none" }}
          title={selected.label}
        />
      );
    }

    // Image file
    if (isImageFile(url)) {
      return <Image src={url} alt={selected.label} style={{ maxHeight: 400 }} />;
    }

    // PDF file
    if (isPdfFile(url)) {
      return (
        <iframe
          src={url}
          width="100%"
          height="500px"
          style={{ border: "1px solid #eee", borderRadius: 4 }}
          title={selected.label}
        />
      );
    }

    // Other file
    return (
      <div style={{ padding: 40 }}>
        <FileOutlined style={{ fontSize: 40, color: "#999" }} />
        <div style={{ marginTop: 12 }}>
          <Text type="secondary">Preview tidak tersedia</Text>
        </div>
      </div>
    );
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }} size={16}>
      {/* Alert Status Dokumen Penting */}
      {!loadingSiasn && (
        missingDokPenting.length > 0 ? (
          <Alert
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            message={`${missingDokPenting.length} dari 5 Dokumen Penting belum ada di SIASN`}
            description={
              <Text type="secondary" style={{ fontSize: 12 }}>
                {missingDokPenting.map((d) => d.label).join(", ")}. Segera lengkapi untuk keperluan kenaikan pangkat, mutasi, atau layanan lainnya.
              </Text>
            }
          />
        ) : (
          <Alert
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            message="Semua 5 Dokumen Penting sudah lengkap di SIASN"
          />
        )
      )}

      {/* Section Dokumen Penting */}
      <Card
        size="small"
        title={
          <Space>
            <Text strong>5 Dokumen Penting SIASN</Text>
            {(loadingSiasn || loadingCV) && <Spin size="small" />}
          </Space>
        }
        extra={
          !loadingSiasn && (
            <Tag color={missingDokPenting.length > 0 ? "red" : "green"}>
              {5 - missingDokPenting.length}/5 Lengkap
            </Tag>
          )
        }
      >
        {DOKUMEN_PENTING.map((dok) => (
          <DokumenPentingItem
            key={dok.key}
            dok={dok}
            data={data}
            pathData={pathData}
            cvData={cvData}
            loadingSiasn={loadingSiasn || loadingCV}
            transferringDocs={transferringDocs}
            onPreview={handlePreview}
            onTransfer={handleTransfer}
            onTransferCV={handleTransferCV}
            onTransferPertek={handleTransfer}
          />
        ))}
      </Card>

      {/* Section Dokumen Lainnya */}
      <Card
        size="small"
        title={<Text strong>Dokumen Lainnya</Text>}
        extra={
          <Space size={8}>
            <Tag color="blue">{stats.uploaded}/{stats.total}</Tag>
            <Tag color="green">{stats.uploaded} Ada</Tag>
            <Tag color="default">{stats.empty} Kosong</Tag>
          </Space>
        }
      >
        <Space direction="vertical" style={{ width: "100%", marginBottom: 12 }} size={8}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <Search
              placeholder="Cari nama file..."
              allowClear
              size="small"
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 250 }}
            />
            <Radio.Group value={filter} onChange={(e) => setFilter(e.target.value)} size="small">
              <Radio.Button value="all">Semua</Radio.Button>
              <Radio.Button value="uploaded">Ada</Radio.Button>
              <Radio.Button value="empty">Kosong</Radio.Button>
            </Radio.Group>
          </div>
        </Space>

        <List
          size="small"
          bordered
          dataSource={filteredData}
          renderItem={(item) => {
            const fileUrl = getFileUrl(data?.[item.key]);
            const hasFile = !!fileUrl;

            return (
              <List.Item
                style={{ padding: "6px 12px" }}
                actions={[
                  hasFile && getFileTypeIcon(fileUrl),
                  hasFile && (
                    <Tooltip key="view" title="Lihat File">
                      <Button
                        type="text"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handlePreview({ label: item.label, url: fileUrl })}
                      />
                    </Tooltip>
                  ),
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={
                    hasFile ? (
                      <CheckCircleFilled style={{ color: "#52c41a", fontSize: 14 }} />
                    ) : (
                      <CloseCircleFilled style={{ color: "#d9d9d9", fontSize: 14 }} />
                    )
                  }
                  title={<Text style={{ fontSize: 12 }}>{item.label}</Text>}
                />
              </List.Item>
            );
          }}
        />
      </Card>

      {/* Modal Preview */}
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        title={selected.label}
        footer={[
          <Button key="close" onClick={() => setModalOpen(false)}>Tutup</Button>,
          !selected.url?.startsWith("data:") && (
            <Button key="open" type="primary" onClick={() => window.open(selected.url, "_blank")}>
              Buka di Tab Baru
            </Button>
          ),
        ].filter(Boolean)}
        width={800}
        centered
        destroyOnClose
      >
        <div style={{ textAlign: "center" }}>
          {renderModalContent()}
        </div>
      </Modal>
    </Space>
  );
}

export default CompareFile;
