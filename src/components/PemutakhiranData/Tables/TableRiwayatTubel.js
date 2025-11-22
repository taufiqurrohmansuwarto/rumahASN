import { Badge as MantineBadge, Text as MantineText } from "@mantine/core";
import {
  IconFileText,
  IconPlus,
  IconRefresh,
  IconSchool,
} from "@tabler/icons-react";
import { Button, Card, Space, Table, Tooltip } from "antd";
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

  const columns = [
    {
      title: "Dok",
      key: "file",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          {record?.path?.[1619] && (
            <Tooltip title="Surat Keterangan Universitas">
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.[1619]?.dok_uri}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button size="small" icon={<IconFileText size={14} />}>
                  Univ
                </Button>
              </a>
            </Tooltip>
          )}
          {record?.path?.[1620] && (
            <Tooltip title="Surat Keterangan Akreditasi Program Studi">
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.[1620]?.dok_uri}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button size="small" icon={<IconFileText size={14} />}>
                  Akred
                </Button>
              </a>
            </Tooltip>
          )}
          {record?.path?.[1621] && (
            <Tooltip title="Surat Rekomendasi Jurusan">
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.[1621]?.dok_uri}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button size="small" icon={<IconFileText size={14} />}>
                  Rekom
                </Button>
              </a>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: "Sekolah & Gelar",
      key: "sekolah_gelar",
      render: (_, record) => (
        <Tooltip
          title={`Sekolah: ${record?.namaSekolah || "-"} | Gelar: ${record?.gelarDepan || ""} ${record?.gelarBelakang || ""}`}
        >
          <div>
            <MantineText size="sm" fw={500} lineClamp={2}>
              {record?.namaSekolah || "-"}
            </MantineText>
            <Space size={4} style={{ marginTop: 4 }}>
              {record?.gelarDepan && (
                <MantineBadge size="xs" color="cyan" tt="none">
                  {record?.gelarDepan}
                </MantineBadge>
              )}
              {record?.gelarBelakang && (
                <MantineBadge size="xs" color="grape" tt="none">
                  {record?.gelarBelakang}
                </MantineBadge>
              )}
            </Space>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Periode",
      key: "periode",
      render: (_, record) => (
        <Tooltip
          title={`Mulai: ${record?.tglMulai || "-"} | Selesai: ${record?.tglSelesai || "-"}`}
        >
          <div>
            <MantineText size="xs">{record?.tglMulai || "-"}</MantineText>
            <MantineText size="xs" c="dimmed">
              s/d {record?.tglSelesai || "-"}
            </MantineText>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Akreditasi",
      key: "akreditasi",
      render: (_, record) => (
        <Tooltip
          title={`Predikat: ${record?.predikatAkreditasiJurusan || "-"} | Nomor: ${record?.noAkreditasiJurusan || "-"}`}
        >
          <div>
            <MantineBadge size="sm" color="green" tt="none">
              {record?.predikatAkreditasiJurusan || "-"}
            </MantineBadge>
            <MantineText size="xs" style={{ marginTop: 4 }}>
              {record?.noAkreditasiJurusan || "-"}
            </MantineText>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Dibuat",
      dataIndex: "createdAt",
      render: (date) => (
        <MantineText size="xs" c="dimmed">
          {date || "-"}
        </MantineText>
      ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <IconSchool size={20} />
          <span>Riwayat Tugas Belajar</span>
          <MantineBadge size="sm" color="blue">
            {data?.length || 0} Data
          </MantineBadge>
        </Space>
      }
      extra={
        <Space>
          {enableCreate && (
            <Button
              type="primary"
              onClick={handleOpen}
              icon={<IconPlus size={14} />}
              size="small"
            >
              Tambah
            </Button>
          )}
          <Tooltip title="Refresh data Tugas Belajar">
            <Button
              size="small"
              icon={<IconRefresh size={14} />}
              onClick={refetch}
              loading={loading}
            />
          </Tooltip>
        </Space>
      }
      style={{ marginTop: 16 }}
    >
      <FormTugasBelajar
        open={open}
        onCancel={handleCancel}
        onFinish={onFinishCreate}
      />
      <Table
        pagination={false}
        loading={loading}
        rowKey={(record) => record?.id}
        columns={columns}
        dataSource={data}
        rowClassName={(_, index) =>
          index % 2 === 0 ? "table-row-light" : "table-row-dark"
        }
        size="small"
        scroll={{ x: "max-content" }}
      />
    </Card>
  );
};

export default TableRiwayatTubel;
