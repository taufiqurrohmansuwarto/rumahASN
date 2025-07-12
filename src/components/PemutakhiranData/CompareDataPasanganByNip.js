import { rwPasanganByNip } from "@/services/master.services";
import { dataPasanganByNip } from "@/services/siasn-services";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
  EyeOutlined,
  FileTextOutlined,
  HeartOutlined,
  HomeOutlined,
  IdcardOutlined,
  SyncOutlined,
  TeamOutlined,
  UserOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { IconTransferIn } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Grid,
  Image,
  Row,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useState } from "react";
import CompareAnakByNip from "./CompareAnakByNip";
import FormAnakByNip from "./FormAnakByNip";
import ModalPasangan from "./FormPasanganByNip";

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

const DetailPasanganModal = ({
  showModal,
  handleCloseModal,
  dataModal,
  nip,
}) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  if (!dataModal) return null;

  return (
    <ModalPasangan
      dataPasangan={dataModal}
      isModalOpen={showModal}
      handleCancel={handleCloseModal}
      nip={nip}
      isEdit={true}
    />
  );
};

const DataCard = ({ title, data, loading, error, columns, icon, color }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const getStatusInfo = () => {
    if (loading)
      return {
        color: "blue",
        text: "Memuat data...",
        icon: <SyncOutlined spin />,
      };
    if (error)
      return { color: "red", text: "Gagal memuat", icon: <WarningOutlined /> };
    if (data && data.length > 0)
      return {
        color: "green",
        text: `${data.length} data`,
        icon: <CheckCircleOutlined />,
      };
    return {
      color: "orange",
      text: "Tidak ada data",
      icon: <WarningOutlined />,
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <Card
      title={
        <Row align="middle" justify="space-between">
          <Col>
            <Space>
              {icon}
              <Text strong style={{ color: color }}>
                {title}
              </Text>
            </Space>
          </Col>
          <Col>
            <Tag color={statusInfo.color} icon={statusInfo.icon}>
              {statusInfo.text}
            </Tag>
          </Col>
        </Row>
      }
      style={{ marginBottom: 16 }}
      headStyle={{ backgroundColor: "#f8f9fa" }}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Memuat data {title.toLowerCase()}...</Text>
          </div>
        </div>
      ) : error ? (
        <Alert
          message="Gagal Memuat Data"
          description={`Terjadi kesalahan saat memuat data ${title.toLowerCase()}. Silakan coba lagi.`}
          type="error"
          showIcon
        />
      ) : !data || data.length === 0 ? (
        <Empty
          description={`Tidak ada data ${title.toLowerCase()}`}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          scroll={{ x: isMobile ? 800 : "auto" }}
          size={isMobile ? "small" : "middle"}
          rowKey={(record, index) => record?.id || index}
          rowClassName={(record, index) =>
            index % 2 === 0 ? "table-row-light" : "table-row-dark"
          }
        />
      )}
    </Card>
  );
};

function CompareDataPasanganByNip({ nip }) {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [showModal, setShowModal] = useState(false);
  const [dataModal, setDataModal] = useState(null);

  const handleShowModal = (data) => {
    setShowModal(true);
    setDataModal(data);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setDataModal(null);
  };

  const {
    data: dataPasanganMaster,
    isLoading: isLoadingPasanganMaster,
    error: errorPasanganMaster,
  } = useQuery(["data-pasangan-master", nip], () => rwPasanganByNip(nip), {
    enabled: !!nip,
    refetchOnWindowFocus: false,
  });

  const {
    data: dataPasanganSiasn,
    isLoading: isLoadingPasanganSiasn,
    isFetching: isFetchingPasanganSiasn,
    error: errorPasanganSiasn,
  } = useQuery(["data-pasangan-siasn", nip], () => dataPasanganByNip(nip), {
    enabled: !!nip,
    refetchOnWindowFocus: false,
  });

  const columnsMaster = [
    {
      title: (
        <Space>
          <UserOutlined style={{ color: "#1890ff" }} />
          <Text strong>Pasangan</Text>
        </Space>
      ),
      dataIndex: "suami_istri_ke",
      width: isMobile ? 80 : 100,
      align: "center",
      render: (value) => (
        <Tag
          color="blue"
          icon={<UserOutlined />}
          style={{
            borderRadius: "12px",
            fontSize: isMobile ? "10px" : "12px",
            padding: "2px 8px",
            fontWeight: 500,
          }}
        >
          Ke-{value}
        </Tag>
      ),
    },
    {
      title: (
        <Space>
          <FileTextOutlined style={{ color: "#1890ff" }} />
          <Text strong>Foto & Dokumen</Text>
        </Space>
      ),
      key: "foto",
      width: isMobile ? 100 : 140,
      align: "center",
      render: (_, row) => (
        <Space direction="vertical" size="small">
          <Image
            alt="Foto Pasangan"
            src={row?.file_foto_suami_istri}
            width={isMobile ? 40 : 60}
            height={isMobile ? 40 : 60}
            style={{ borderRadius: 8, objectFit: "cover" }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
          />
          <Image
            alt="KTP Pasangan"
            src={row?.file_ktp_suami_istri}
            width={isMobile ? 40 : 60}
            height={isMobile ? 20 : 30}
            style={{ borderRadius: 4, objectFit: "cover" }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
          />
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <IdcardOutlined style={{ color: "#1890ff" }} />
          <Text strong>Informasi Personal</Text>
        </Space>
      ),
      key: "personal",
      width: isMobile ? 180 : 250,
      render: (_, row) => (
        <Space direction="vertical" size="small">
          <Text strong style={{ fontSize: isMobile ? "12px" : "14px" }}>
            {row?.nama_suami_istri}
          </Text>
          <Space size="small">
            <IdcardOutlined style={{ color: "#666", fontSize: "12px" }} />
            <Text
              type="secondary"
              style={{ fontSize: isMobile ? "10px" : "12px" }}
            >
              {row?.nik}
            </Text>
          </Space>
          <Space size="small">
            <CalendarOutlined style={{ color: "#666", fontSize: "12px" }} />
            <Text
              type="secondary"
              style={{ fontSize: isMobile ? "10px" : "12px" }}
            >
              {row?.tempat_lahir}, {row?.tgl_lahir}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <HomeOutlined style={{ color: "#1890ff" }} />
          <Text strong>Pekerjaan & Instansi</Text>
        </Space>
      ),
      key: "pekerjaan",
      width: isMobile ? 160 : 220,
      render: (_, row) => (
        <Space direction="vertical" size="small">
          <Text style={{ fontSize: isMobile ? "11px" : "13px" }}>
            {row?.ref_pekerjaan?.pekerjaan || "Tidak tersedia"}
          </Text>
          <Space size="small">
            <IdcardOutlined style={{ color: "#666", fontSize: "12px" }} />
            <Text
              type="secondary"
              style={{ fontSize: isMobile ? "10px" : "12px" }}
            >
              {row?.nip_nrp || "Tidak ada"}
            </Text>
          </Space>
          <Space size="small">
            <HomeOutlined style={{ color: "#666", fontSize: "12px" }} />
            <Text
              type="secondary"
              style={{ fontSize: isMobile ? "10px" : "12px" }}
            >
              {row?.instansi || "Tidak tersedia"}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <CheckCircleOutlined style={{ color: "#1890ff" }} />
          <Text strong>Tunjangan</Text>
        </Space>
      ),
      dataIndex: "tunjangan",
      width: isMobile ? 90 : 120,
      align: "center",
      render: (value) => (
        <Tag
          color={value === "Ya" ? "success" : "error"}
          style={{
            borderRadius: "12px",
            fontSize: isMobile ? "10px" : "12px",
            padding: "2px 8px",
            fontWeight: 500,
          }}
        >
          {value || "Tidak tersedia"}
        </Tag>
      ),
    },
    {
      title: (
        <Space>
          <EyeOutlined style={{ color: "#1890ff" }} />
          <Text strong>Aksi</Text>
        </Space>
      ),
      key: "aksi",
      width: isMobile ? 80 : 120,
      align: "center",
      render: (_, row) => (
        <Tooltip title="Transfer data pasangan dari SIMASTER ke SIASN">
          <Button
            type="primary"
            icon={<IconTransferIn />}
            onClick={() => handleShowModal(row)}
          >
            {!isMobile && "SIASN"}
          </Button>
        </Tooltip>
      ),
    },
  ];

  /**{
    statusNikah: 'Menikah',
    id: 'e9c50c33-a595-42f8-b497-15c1b42562fb',
    created_at: '2025-07-12T07:17:38.927408Z',
    ayahId: null,
    ibuId: null,
    nama: 'RALFATH RITO FARREL ',
    namaKtp: '',
    gelarDepan: '',
    gelarBlk: '',
    tempatLahir: '',
    tglLahir: '28-09-1998',
    aktaMeninggal: '',
    tglMeninggal: null,
    jenisKelamin: 'M',
    jenisAnak: null,
    StatusHidup: '1',
    JenisKawinId: '1',
    karisKarsu: '',
    karisKarsuVirtual: '',
    orangId: 'd0b7f30e-21f0-489a-9aa2-2b3e0b8e197e',
    pnsOrangId: 'AC1FA8A199207D99E050640A2903373A',
    tgglMenikah: '26-02-2023',
    aktaMenikah: '1571011022023044',
    tgglCerai: null,
    aktaCerai: null,
    posisi: 1,
    status: '1',
    isPns: false,
    noSkPensiun: null
  } */
  const columnsSiasn = [
    {
      title: (
        <Space>
          <UserOutlined style={{ color: "#52c41a" }} />
          <Text strong>Pasangan</Text>
        </Space>
      ),
      dataIndex: "posisi",
      width: isMobile ? 80 : 100,
      align: "center",
      render: (value) => (
        <Tag
          color="green"
          icon={<UserOutlined />}
          style={{
            borderRadius: "12px",
            fontSize: isMobile ? "10px" : "12px",
            padding: "2px 8px",
            fontWeight: 500,
          }}
        >
          Ke-{value}
        </Tag>
      ),
    },
    {
      title: (
        <Space>
          <IdcardOutlined style={{ color: "#52c41a" }} />
          <Text strong>Informasi Personal</Text>
        </Space>
      ),
      key: "personal",
      width: isMobile ? 160 : 220,
      render: (_, row) => (
        <Space direction="vertical" size="small">
          <Text strong style={{ fontSize: isMobile ? "12px" : "14px" }}>
            {row?.nama}
          </Text>
          <Space size="small">
            <CalendarOutlined style={{ color: "#666", fontSize: "12px" }} />
            <Text
              type="secondary"
              style={{ fontSize: isMobile ? "10px" : "12px" }}
            >
              {row?.tglLahir}
            </Text>
          </Space>
          <Space size="small">
            <HomeOutlined style={{ color: "#666", fontSize: "12px" }} />
            <Text
              type="secondary"
              style={{ fontSize: isMobile ? "10px" : "12px" }}
            >
              {row?.tempatLahir || "Tidak tersedia"}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <HeartOutlined style={{ color: "#52c41a" }} />
          <Text strong>Status Pernikahan</Text>
        </Space>
      ),
      key: "status",
      width: isMobile ? 140 : 180,
      render: (_, row) => (
        <Space direction="vertical" size="small">
          <Tag
            color="blue"
            style={{
              borderRadius: "12px",
              fontSize: isMobile ? "10px" : "12px",
              padding: "2px 8px",
              fontWeight: 500,
            }}
          >
            {row?.statusNikah}
          </Tag>
          <Space size="small">
            <HeartOutlined style={{ color: "#666", fontSize: "12px" }} />
            <Text
              type="secondary"
              style={{ fontSize: isMobile ? "10px" : "12px" }}
            >
              {row?.tgglMenikah}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <FileTextOutlined style={{ color: "#52c41a" }} />
          <Text strong>Akta Menikah</Text>
        </Space>
      ),
      dataIndex: "aktaMenikah",
      width: isMobile ? 120 : 160,
      render: (value) => (
        <Space>
          <FileTextOutlined style={{ color: "#666", fontSize: "12px" }} />
          <Text style={{ fontSize: isMobile ? "11px" : "13px" }}>
            {value || "Tidak tersedia"}
          </Text>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <CheckCircleOutlined style={{ color: "#52c41a" }} />
          <Text strong>Status Hidup</Text>
        </Space>
      ),
      dataIndex: "StatusHidup",
      width: isMobile ? 90 : 120,
      align: "center",
      render: (value) => (
        <Tag
          color={value === "1" ? "success" : "error"}
          style={{
            borderRadius: "12px",
            fontSize: isMobile ? "10px" : "12px",
            padding: "2px 8px",
            fontWeight: 500,
          }}
        >
          {value === "1" ? "Hidup" : "Meninggal"}
        </Tag>
      ),
    },
    {
      title: (
        <Space>
          <TeamOutlined style={{ color: "#52c41a" }} />
          <Text strong>Aksi</Text>
        </Space>
      ),
      key: "aksi",
      width: isMobile ? 100 : 140,
      align: "center",
      render: (_, row) => <FormAnakByNip nip={nip} pasangan={row} />,
    },
  ];

  if (!nip) {
    return (
      <Alert
        message="NIP tidak ditemukan"
        description="Silakan periksa kembali NIP atau kembali ke halaman sebelumnya."
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />
    );
  }

  return (
    <div style={{ padding: isMobile ? "16px 0" : "24px 0" }}>
      {/* Header */}
      <Card style={{ marginBottom: 16 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
              Perbandingan Data Pasangan
            </Title>
            <Text type="secondary">NIP: {nip}</Text>
          </Col>
          <Col>
            <Space>
              <Tag color="blue" icon={<DatabaseOutlined />}>
                SIMASTER
              </Tag>
              <Tag color="green" icon={<DatabaseOutlined />}>
                SIASN
              </Tag>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Info Panel */}
      <Alert
        message="Informasi"
        description="Bandingkan data pasangan dari SIMASTER dan SIASN. Pastikan data sudah sesuai dan lengkap."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* Data Comparison */}
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <DataCard
          title="Data SIMASTER"
          data={dataPasanganMaster}
          loading={isLoadingPasanganMaster}
          error={errorPasanganMaster}
          columns={columnsMaster}
          icon={<DatabaseOutlined style={{ color: "#1890ff" }} />}
          color="#1890ff"
        />

        <DataCard
          title="Data SIASN"
          data={dataPasanganSiasn}
          loading={isLoadingPasanganSiasn || isFetchingPasanganSiasn}
          error={errorPasanganSiasn}
          columns={columnsSiasn}
          icon={<DatabaseOutlined style={{ color: "#52c41a" }} />}
          color="#52c41a"
        />
      </Space>

      {/* Children Data Section */}
      <Card
        title={
          <Space>
            <TeamOutlined style={{ color: "#722ed1" }} />
            <Text strong>Data Anak</Text>
          </Space>
        }
        style={{ marginTop: 16 }}
        headStyle={{ backgroundColor: "#f9f0ff" }}
      >
        <CompareAnakByNip nip={nip} />
      </Card>

      {/* Modal */}
      <DetailPasanganModal
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        dataModal={dataModal}
        nip={nip}
      />

      <style jsx global>{`
        .ant-table-thead > tr > th {
          background: #ffffff !important;
          color: #1a1a1a !important;
          font-weight: 600 !important;
          border-bottom: 2px solid #ff4500 !important;
          padding: ${isMobile ? "12px 8px" : "16px 12px"} !important;
          font-size: ${isMobile ? "11px" : "14px"} !important;
        }

        .ant-table-thead > tr > th:first-child {
          border-top-left-radius: 8px !important;
        }

        .ant-table-thead > tr > th:last-child {
          border-top-right-radius: 8px !important;
        }

        .table-row-light {
          background-color: #ffffff !important;
        }

        .table-row-dark {
          background-color: #fafafa !important;
        }

        .ant-table-tbody > tr:hover > td {
          background-color: #fff7e6 !important;
          transition: all 0.2s ease !important;
        }

        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f0f0f0 !important;
          padding: ${isMobile ? "8px 6px" : "12px"} !important;
          transition: all 0.2s ease !important;
        }

        .ant-table-container {
          border-radius: 8px !important;
          overflow: hidden !important;
        }

        .ant-card {
          transition: all 0.3s ease !important;
        }

        .ant-card:hover {
          border-color: #ff4500 !important;
        }

        @media (max-width: 768px) {
          .ant-table-pagination {
            text-align: center !important;
          }
        }
      `}</style>
    </div>
  );
}

export default CompareDataPasanganByNip;
