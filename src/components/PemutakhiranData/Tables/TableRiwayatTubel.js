import { Button, Flex, Space, Table, Tooltip } from "antd";
import {
  ReloadOutlined,
  FilePdfOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import FormTugasBelajar from "@/components/PemutakhiranData/Forms/FormTugasBelajar";
import { useState } from "react";

const TableRiwayatTubel = ({
  data,
  loading,
  refetch,
  onFinishCreate,
  enableCreate = false,
}) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  // Konfigurasi file dokumen untuk tooltip dan download
  const fileConfigs = {
    1619: "Surat Keterangan Universitas",
    1620: "Surat Keterangan Akreditasi Program Studi",
    1621: "Surat Rekomendasi Jurusan",
  };

  // Render komponen file dengan tooltip
  const renderFileLink = (record, fileId, title) => {
    const filePath = record?.path?.[fileId];
    if (!filePath) return null;

    return (
      <div>
        <Tooltip title={title}>
          <a
            href={`/helpdesk/api/siasn/ws/download?filePath=${filePath.dok_uri}`}
            target="_blank"
            rel="noreferrer"
          >
            <FilePdfOutlined style={{ color: "#d32f2f", fontSize: "16px" }} />
          </a>
        </Tooltip>
      </div>
    );
  };

  // Konfigurasi kolom tabel
  const columns = [
    {
      title: "File",
      key: "file",
      render: (_, record) => (
        <Space>
          {Object.entries(fileConfigs).map(([fileId, title]) =>
            renderFileLink(record, fileId, title)
          )}
        </Space>
      ),
    },
    {
      title: "Sekolah",
      dataIndex: "namaSekolah",
      key: "namaSekolah",
    },
    {
      title: "Mulai",
      dataIndex: "tglMulai",
      key: "tglMulai",
    },
    {
      title: "Selesai",
      dataIndex: "tglSelesai",
      key: "tglSelesai",
    },
    {
      title: "Gelar Depan",
      dataIndex: "gelarDepan",
      key: "gelarDepan",
    },
    {
      title: "Gelar Belakang",
      dataIndex: "gelarBelakang",
      key: "gelarBelakang",
    },
    {
      title: "Akreditasi",
      dataIndex: "predikatAkreditasiJurusan",
      key: "predikatAkreditasiJurusan",
    },
    {
      title: "No. Akreditasi",
      dataIndex: "noAkreditasiJurusan",
      key: "noAkreditasiJurusan",
    },
    {
      title: "Dibuat",
      dataIndex: "createdAt",
      key: "createdAt",
    },
  ];

  return (
    <>
      <FormTugasBelajar
        open={open}
        onCancel={handleCancel}
        onFinish={onFinishCreate}
      />
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        {enableCreate && (
          <Button type="primary" onClick={handleOpen} icon={<PlusOutlined />}>
            Tugas Belajar
          </Button>
        )}
        <Button
          loading={loading}
          disabled={loading}
          type="text"
          onClick={refetch}
          icon={<ReloadOutlined />}
        >
          Refresh
        </Button>
      </Flex>
      <Table
        pagination={false}
        loading={loading}
        rowKey={(record) => record?.id}
        columns={columns}
        dataSource={data}
      />
    </>
  );
};

export default TableRiwayatTubel;
