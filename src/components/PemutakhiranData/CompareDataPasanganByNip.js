import { rwPasanganByNip } from "@/services/master.services";
import { dataPasanganByNip } from "@/services/siasn-services";
import {
  Badge as MantineBadge,
  Stack,
  Text as MantineText,
} from "@mantine/core";
import { IconRefresh, IconSend, IconUsers } from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  Table,
  Tooltip,
} from "antd";
import { useState } from "react";
import CompareAnakByNip from "./CompareAnakByNip";
import FormAnakByNip from "./FormAnakByNip";
import ModalPasangan from "./FormPasanganByNip";

const { useBreakpoint } = Grid;

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

const DataCard = ({
  title,
  data,
  loading,
  error,
  columns,
  icon,
  color,
  onRefresh,
}) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <Card style={{ marginBottom: 16 }}>
      {error ? (
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
          title={() => (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Space>
                {icon}
                <MantineText fw="bold" style={{ color }}>
                  {title}
                </MantineText>
                <MantineBadge
                  size="sm"
                  color={color === "#1890ff" ? "blue" : "green"}
                >
                  {data?.length || 0} data
                </MantineBadge>
              </Space>
              <Tooltip title={`Refresh data ${title}`}>
                <Button
                  size="small"
                  icon={<IconRefresh size={14} />}
                  onClick={onRefresh}
                  loading={loading}
                />
              </Tooltip>
            </div>
          )}
          columns={columns}
          dataSource={data}
          pagination={false}
          loading={loading}
          scroll={{ x: "max-content" }}
          size="small"
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
  const queryClient = useQueryClient();
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

  const handleRefreshMaster = () => {
    queryClient.invalidateQueries(["data-pasangan-master", nip]);
  };

  const handleRefreshSiasn = () => {
    queryClient.invalidateQueries(["data-pasangan-siasn", nip]);
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
      title: "Ke",
      dataIndex: "suami_istri_ke",
      align: "center",
      render: (value) => (
        <MantineBadge size="sm" color="blue">
          {value}
        </MantineBadge>
      ),
    },
    {
      title: "Foto",
      key: "foto",
      align: "center",
      render: (_, row) => (
        <Space size="small">
          <Tooltip title="Foto Pasangan">
            <Image
              alt="Foto"
              src={row?.file_foto_suami_istri}
              width={40}
              height={40}
              style={{ borderRadius: 8, objectFit: "cover" }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
            />
          </Tooltip>
          <Tooltip title="KTP Pasangan">
            <Image
              alt="KTP"
              src={row?.file_ktp_suami_istri}
              width={40}
              height={25}
              style={{ borderRadius: 4, objectFit: "cover" }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "Nama & NIK",
      key: "nama",
      render: (_, row) => (
        <Tooltip
          title={`${row?.nama_suami_istri} - NIK: ${row?.nik} - ${row?.tempat_lahir}, ${row?.tgl_lahir}`}
        >
          <div>
            <MantineText size="sm" fw={500} lineClamp={1}>
              {row?.nama_suami_istri}
            </MantineText>
            <MantineText size="xs" c="dimmed" lineClamp={1}>
              {row?.nik}
            </MantineText>
            <MantineText size="xs" c="dimmed" lineClamp={1}>
              {row?.tempat_lahir}, {row?.tgl_lahir}
            </MantineText>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Pekerjaan & Status",
      key: "pekerjaan",
      render: (_, row) => (
        <Tooltip
          title={`${row?.ref_pekerjaan?.pekerjaan || "Tidak tersedia"} - ${
            row?.instansi || "Tidak tersedia"
          } - NIP: ${row?.nip_nrp || "Tidak ada"}`}
        >
          <div>
            <MantineText size="xs" lineClamp={1}>
              {row?.ref_pekerjaan?.pekerjaan || "Tidak tersedia"}
            </MantineText>
            <MantineText size="xs" c="dimmed" lineClamp={1}>
              {row?.instansi || "Tidak tersedia"}
            </MantineText>
            <MantineBadge
              size="xs"
              color={row?.tunjangan === "Dapat" ? "green" : "red"}
              style={{ marginTop: 2 }}
            >
              {row?.tunjangan === "Dapat" ? "Tunjangan" : "Non-Tunjangan"}
            </MantineBadge>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Aksi",
      key: "aksi",
      align: "center",
      render: (_, row) => (
        <Tooltip title="Transfer ke SIASN">
          <Button
            size="small"
            type="primary"
            icon={<IconSend size={14} />}
            onClick={() => handleShowModal(row)}
          />
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
      title: "Ke",
      dataIndex: "posisi",
      align: "center",
      render: (value) => (
        <MantineBadge size="sm" color="green">
          {value}
        </MantineBadge>
      ),
    },
    {
      title: "Nama & Tempat Lahir",
      key: "personal",
      render: (_, row) => (
        <Tooltip
          title={`${row?.nama} - ${row?.tempatLahir || "Tidak tersedia"}, ${
            row?.tglLahir
          }`}
        >
          <div>
            <MantineText size="sm" fw={500} lineClamp={1}>
              {row?.nama}
            </MantineText>
            <MantineText size="xs" c="dimmed">
              {row?.tglLahir}
            </MantineText>
            <MantineText size="xs" c="dimmed" lineClamp={1}>
              {row?.tempatLahir || "Tidak tersedia"}
            </MantineText>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Status & Akta",
      key: "status",
      render: (_, row) => (
        <Tooltip
          title={`${row?.statusNikah} - ${row?.tgglMenikah} - Akta: ${
            row?.aktaMenikah || "Tidak tersedia"
          }`}
        >
          <div>
            <MantineBadge
              size="sm"
              color="blue"
              tt="none"
              style={{ marginBottom: 4 }}
            >
              {row?.statusNikah}
            </MantineBadge>
            <MantineText size="xs" c="dimmed" lineClamp={1}>
              {row?.tgglMenikah}
            </MantineText>
            <MantineText size="xs" c="dimmed" lineClamp={1}>
              {row?.aktaMenikah || "Tidak tersedia"}
            </MantineText>
            <MantineBadge
              size="xs"
              color={row?.StatusHidup === "1" ? "green" : "red"}
              style={{ marginTop: 2 }}
            >
              {row?.StatusHidup === "1" ? "Hidup" : "Meninggal"}
            </MantineBadge>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Aksi",
      key: "aksi",
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
          icon={<IconUsers size={16} />}
          color="#1890ff"
          onRefresh={handleRefreshMaster}
        />

        <DataCard
          title="Data SIASN"
          data={dataPasanganSiasn}
          loading={isLoadingPasanganSiasn || isFetchingPasanganSiasn}
          error={errorPasanganSiasn}
          columns={columnsSiasn}
          icon={<IconUsers size={16} />}
          color="#52c41a"
          onRefresh={handleRefreshSiasn}
        />
      </Space>

      <CompareAnakByNip nip={nip} />

      {/* Modal */}
      <DetailPasanganModal
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        dataModal={dataModal}
        nip={nip}
      />
    </div>
  );
}

export default CompareDataPasanganByNip;
