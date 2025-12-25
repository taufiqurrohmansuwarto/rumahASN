import { getFilePersonalServices } from "@/services/master.services";
import {
  FileOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Empty,
  Image,
  Input,
  List,
  Modal,
  Radio,
  Skeleton,
  Space,
  Tag,
  Typography,
} from "antd";
import { useState, useMemo } from "react";

const { Search } = Input;

const { Text } = Typography;

const FILE_CONFIG = [
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
  { key: "file_nota_persetujuan_bkn", label: "Nota Persetujuan BKN" },
  { key: "file_spmt_cpns", label: "SPMT CPNS" },
  { key: "file_kartu_taspen", label: "Kartu Taspen" },
  { key: "file_medical_checkup_cpns", label: "Medical Check Up CPNS" },
  { key: "file_suket_bebas_narkoba_cpns", label: "Surat Bebas Narkoba CPNS" },
  { key: "file_kartu_asn_virtual", label: "Kartu ASN Virtual" },
  { key: "file_medical_checkup_pns", label: "Medical Check Up PNS" },
  { key: "file_suket_bebas_narkoba_pns", label: "Surat Bebas Narkoba PNS" },
  { key: "file_pns", label: "SK PNS" },
  { key: "file_cpns", label: "SK CPNS" },
];

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
  return url.toLowerCase().includes(".pdf");
};

const getFileTypeIcon = (url) => {
  if (!url) return null;
  if (isImageFile(url))
    return <FileImageOutlined style={{ color: "#1890ff", fontSize: 14 }} />;
  if (isPdfFile(url))
    return <FilePdfOutlined style={{ color: "#f5222d", fontSize: 14 }} />;
  return <FileOutlined style={{ color: "#8c8c8c", fontSize: 14 }} />;
};

function CompareFile() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState({ label: "", url: "" });
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["compare-file"],
    queryFn: () => getFilePersonalServices(),
    refetchOnWindowFocus: false,
  });

  const handleClick = (label, url) => {
    setSelected({ label, url });
    setModalOpen(true);
  };

  const stats = useMemo(() => {
    if (!data) return { total: 0, uploaded: 0, empty: 0 };
    const uploaded = FILE_CONFIG.filter((item) =>
      getFileUrl(data?.[item.key])
    ).length;
    return {
      total: FILE_CONFIG.length,
      uploaded,
      empty: FILE_CONFIG.length - uploaded,
    };
  }, [data]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    return FILE_CONFIG.filter((item) => {
      const hasFile = !!getFileUrl(data?.[item.key]);
      const matchSearch = item.label
        .toLowerCase()
        .includes(search.toLowerCase());
      if (!matchSearch) return false;
      if (filter === "uploaded") return hasFile;
      if (filter === "empty") return !hasFile;
      return true;
    });
  }, [data, filter, search]);

  if (isLoading) return <Skeleton active />;
  if (!data) return <Empty description="Data tidak ditemukan" />;

  return (
    <>
      <Space
        direction="vertical"
        style={{ width: "100%", marginBottom: 12 }}
        size={8}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <Space size={8}>
            <Tag color="blue">
              {stats.uploaded}/{stats.total} File
            </Tag>
            <Tag color="green">{stats.uploaded} Lengkap</Tag>
            <Tag color="default">{stats.empty} Kosong</Tag>
          </Space>
          <Radio.Group
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            size="small"
          >
            <Radio.Button value="all">Semua</Radio.Button>
            <Radio.Button value="uploaded">Lengkap</Radio.Button>
            <Radio.Button value="empty">Kosong</Radio.Button>
          </Radio.Group>
        </div>
        <Search
          placeholder="Cari nama file..."
          allowClear
          size="small"
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 300 }}
        />
      </Space>

      <List
        size="small"
        bordered
        dataSource={filteredData}
        renderItem={(item) => {
          const url = getFileUrl(data?.[item.key]);
          const hasFile = !!url;
          return (
            <List.Item
              style={{ padding: "8px 12px" }}
              actions={[
                hasFile && getFileTypeIcon(url),
                hasFile && (
                  <Button
                    key="view"
                    type="link"
                    size="small"
                    onClick={() => handleClick(item.label, url)}
                  >
                    Lihat
                  </Button>
                ),
              ].filter(Boolean)}
            >
              <List.Item.Meta
                avatar={
                  hasFile ? (
                    <CheckCircleFilled
                      style={{ color: "#52c41a", fontSize: 16 }}
                    />
                  ) : (
                    <CloseCircleFilled
                      style={{ color: "#d9d9d9", fontSize: 16 }}
                    />
                  )
                }
                title={<Text style={{ fontSize: 13 }}>{item.label}</Text>}
              />
            </List.Item>
          );
        }}
      />

      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        title={selected.label}
        footer={[
          <Button key="close" onClick={() => setModalOpen(false)}>
            Tutup
          </Button>,
          <Button
            key="open"
            type="primary"
            onClick={() => window.open(selected.url, "_blank")}
          >
            Buka di Tab Baru
          </Button>,
        ]}
        width={isImageFile(selected.url) ? 500 : 800}
        centered
        destroyOnHidden
      >
        <div style={{ textAlign: "center" }}>
          {isImageFile(selected.url) ? (
            <Image
              src={selected.url}
              alt={selected.label}
              style={{ maxHeight: 400 }}
            />
          ) : isPdfFile(selected.url) ? (
            <iframe
              src={selected.url}
              width="100%"
              height="450px"
              style={{ border: "1px solid #eee", borderRadius: 4 }}
              title={selected.label}
            />
          ) : (
            <div style={{ padding: 40 }}>
              <FileOutlined style={{ fontSize: 40, color: "#999" }} />
              <div style={{ marginTop: 12 }}>
                <Text type="secondary">Preview tidak tersedia</Text>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

export default CompareFile;
