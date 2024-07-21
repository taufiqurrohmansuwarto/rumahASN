import { getStandarLayanan } from "@/services/layanan.services";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Descriptions, Tabs, Tag, Card, Input, Grid } from "antd";
import { useState, useMemo } from "react";
import ReactMarkdownCustom from "../MarkdownEditor/ReactMarkdownCustom";

const { TabPane } = Tabs;
const { Search } = Input;

const LayananDetailTab = ({ layanan }) => (
  <Tabs defaultActiveKey="1" style={{ height: "100%" }}>
    <TabPane tab="Definisi" key="5">
      <Card>
        <ReactMarkdownCustom>{layanan.definisi || ""}</ReactMarkdownCustom>
      </Card>
    </TabPane>
    <TabPane tab="Persyaratan" key="1">
      <Card>
        <ReactMarkdownCustom>{layanan.persyaratan || ""}</ReactMarkdownCustom>
      </Card>
    </TabPane>
    <TabPane tab="Mekanisme" key="2">
      <Card>
        <ReactMarkdownCustom>{layanan.mekanisme || ""}</ReactMarkdownCustom>
      </Card>
    </TabPane>
    <TabPane tab="Dasar Hukum" key="3">
      <Card>
        <ReactMarkdownCustom>{layanan.dasar_hukum || ""}</ReactMarkdownCustom>
      </Card>
    </TabPane>
    <TabPane tab="Waktu" key="4">
      <Card>
        <ReactMarkdownCustom>{layanan.waktu || ""}</ReactMarkdownCustom>
      </Card>
    </TabPane>
    <TabPane tab="Biaya" key="6">
      <Card>
        <ReactMarkdownCustom>{layanan.biaya || ""}</ReactMarkdownCustom>
      </Card>
    </TabPane>
  </Tabs>
);

const DaftarLayananUI = ({ dataLayanan }) => {
  const [activeLayanan, setActiveLayanan] = useState(dataLayanan[0]?.id);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLayanan = useMemo(() => {
    return dataLayanan.filter((layanan) =>
      layanan.nama_pelayanan.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [dataLayanan, searchTerm]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (filteredLayanan.length > 0) {
      setActiveLayanan(filteredLayanan[0].id);
    }
  };

  const breakPoint = Grid.useBreakpoint();

  return (
    <Card title="Daftar Layanan" style={{ width: "100%", minHeight: "60vh" }}>
      <Search
        placeholder="Cari layanan..."
        onSearch={handleSearch}
        allowClear
        onChange={(e) => handleSearch(e.target.value)}
        style={{ marginBottom: 16 }}
        prefix={<SearchOutlined />}
      />
      <Tabs
        tabPosition={breakPoint.xs ? "top" : "left"}
        onChange={setActiveLayanan}
        activeKey={activeLayanan}
      >
        {filteredLayanan.map((layanan) => (
          <TabPane
            tab={<span>{layanan.nama_pelayanan} </span>}
            key={layanan.id}
          >
            <LayananDetailTab layanan={layanan} />
          </TabPane>
        ))}
      </Tabs>
      {filteredLayanan.length === 0 && (
        <p>
          Tidak ada layanan yang sesuai dengan pencarian &quot;{searchTerm}
          &quot;
        </p>
      )}
    </Card>
  );
};

function InformasiDaftarLayanan() {
  const contohDataLayanan = [
    {
      id: "8bc4NsJK",
      nama_pelayanan: "Perbaikan Nama",
      persyaratan: "1. Surat Pengantar Dari Instansi\n",
      mekanisme:
        "1. Mengajukan permohonan\n2. Verifikasi dokumen\n3. Proses perbaikan\n4. Pengambilan dokumen",
      dasar_hukum: "UU No. 24 Tahun 2013 tentang Administrasi Kependudukan",
      waktu: "3 hari kerja",
      definisi:
        "Layanan untuk memperbaiki kesalahan penulisan nama pada dokumen resmi",
      biaya: "Gratis",
      user_id: "master|56543",
      created_at: "2024-07-21T09:55:04.780Z",
      updated_at: "2024-07-21T10:30:15.123Z",
      is_active: true,
    },
  ];

  const { data, isLoading } = useQuery(
    ["standar-pelayanan"],
    () => getStandarLayanan(),
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <>
      <DaftarLayananUI dataLayanan={data} />;
    </>
  );
}

export default InformasiDaftarLayanan;
