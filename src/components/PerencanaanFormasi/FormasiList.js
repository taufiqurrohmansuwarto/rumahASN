import {
  deleteFormasi,
  deleteFormasiUsulan,
  getFormasi,
} from "@/services/perencanaan-formasi.services";
import {
  IconCheck,
  IconClock,
  IconEdit,
  IconEye,
  IconPlus,
  IconRefresh,
  IconTrash,
  IconX,
  IconDatabase
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Col,
  Grid,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import FormasiModal from "./FormasiModal";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// Pengajuan Status Badge
const PengajuanStatusBadge = ({ status }) => {
  const config = {
    draft: { color: "default", icon: IconEdit, label: "Draft" },
    menunggu: { color: "orange", icon: IconClock, label: "Menunggu" },
    disetujui: { color: "green", icon: IconCheck, label: "Disetujui" },
    ditolak: { color: "red", icon: IconX, label: "Ditolak" },
    perbaikan: { color: "blue", icon: IconEdit, label: "Perbaikan" },
  };
  const { color, icon: Icon, label } = config[status] || config.draft;
  return (
    <Tag color={color} style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <Icon size={12} />
      {label}
    </Tag>
  );
};

// Status Badge
const StatusBadge = ({ status }) => {
  const config = {
    aktif: { color: "green", label: "Aktif" },
    nonaktif: { color: "default", label: "Nonaktif" },
  };
  const { color, label } = config[status] || config.nonaktif;
  return <Tag color={color}>{label}</Tag>;
};

function FormasiList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [modal, setModal] = useState({ open: false, data: null });
  const [deletingId, setDeletingId] = useState(null);
  const [deletingPengajuanId, setDeletingPengajuanId] = useState(null);
  const { data: session } = useSession();
  const isAdmin = session?.user?.current_role === "admin";
  const screens = useBreakpoint();
  const isXs = !screens?.sm;

  // Get filters from URL
  const {
    page = 1,
    limit = 10,
    status = "",
    tahun = "",
    search = "",
  } = router.query;

  // Local state for search input (for debounce)
  const [searchInput, setSearchInput] = useState(search);
  const [debouncedSearch] = useDebouncedValue(searchInput, 400);

  // Sync debounced search to URL
  useEffect(() => {
    if (debouncedSearch !== search) {
      updateFilters({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch]);

  // Sync URL search to local state on mount
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Update URL params
  const updateFilters = useCallback(
    (newFilters) => {
      const query = { ...router.query, ...newFilters };
      // Remove empty values
      Object.keys(query).forEach((key) => {
        if (!query[key] || query[key] === "") delete query[key];
      });
      router.push({ pathname: router.pathname, query }, undefined, {
        shallow: true,
      });
    },
    [router]
  );

  // Filters object for query
  const filters = {
    page: Number(page),
    limit: Number(limit),
    status,
    tahun,
    search,
  };

  // Fetch data
  const { data, isLoading, refetch, isFetching } = useQuery(
    ["perencanaan-formasi", filters],
    () => getFormasi(filters),
    { keepPreviousData: true }
  );

  // Delete formasi mutation (admin only)
  const { mutate: hapusFormasi } = useMutation(
    (id) => deleteFormasi(id),
    {
      onMutate: (id) => {
        setDeletingId(id);
      },
      onSuccess: () => {
        message.success("Formasi berhasil dihapus");
        queryClient.invalidateQueries(["perencanaan-formasi"]);
      },
      onError: (error) => {
        message.error(
          error?.response?.data?.message || "Gagal menghapus formasi"
        );
      },
      onSettled: () => {
        setDeletingId(null);
      },
    }
  );

  // Delete pengajuan mutation (user's own)
  const { mutate: hapusPengajuan } = useMutation(
    (id) => deleteFormasiUsulan(id),
    {
      onMutate: (id) => {
        setDeletingPengajuanId(id);
      },
      onSuccess: () => {
        message.success("Pengajuan berhasil dihapus");
        queryClient.invalidateQueries(["perencanaan-formasi"]);
      },
      onError: (error) => {
        message.error(
          error?.response?.data?.message || "Gagal menghapus pengajuan"
        );
      },
      onSettled: () => {
        setDeletingPengajuanId(null);
      },
    }
  );

  // Stats
  const total = data?.rekap?.total || data?.meta?.total || 0;
  const aktif =
    data?.rekap?.aktif ||
    data?.data?.filter((item) => item.status === "aktif").length ||
    0;

  // Base columns for all users
  const baseColumns = [
    {
      title: "Judul",
      dataIndex: "deskripsi",
      key: "deskripsi",
      ellipsis: true,
      render: (val) => (
        <Text strong>
          {val || "-"}
        </Text>
      ),
    },
    {
      title: "Tahun",
      dataIndex: "tahun",
      key: "tahun",
      width: 80,
      align: "center",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  // Admin columns
  const adminColumns = [
    {
      title: "Dibuat oleh",
      dataIndex: "dibuatOleh",
      key: "dibuatOleh",
      width: 150,
      render: (val) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {val?.username || "-"}
        </Text>
      ),
    },
    {
      title: "Dibuat pada",
      dataIndex: "dibuat_pada",
      key: "dibuat_pada",
      width: 140,
      render: (val) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {dayjs(val).format("DD/MM/YYYY HH:mm")}
        </Text>
      ),
    },
  ];

  // Non-admin columns (show user's own pengajuan)
  const userColumns = [
    {
      title: "Pengajuan Saya",
      key: "pengajuan_saya",
      width: 200,
      render: (_, record) => {
        const pengajuan = record.pengajuan_saya;
        if (!pengajuan) {
          return <Text type="secondary" style={{ fontSize: 12 }}>Belum ada pengajuan</Text>;
        }
        return (
          <Space direction="vertical" size={0}>
            <PengajuanStatusBadge status={pengajuan.status} />
            <Text type="secondary" style={{ fontSize: 11 }}>
              Update: {dayjs(pengajuan.diperbarui_pada).format("DD/MM/YY HH:mm")}
            </Text>
          </Space>
        );
      },
    },
    {
      title: "Operator / Perangkat Daerah",
      key: "operator",
      width: 220,
      render: (_, record) => {
        const pengajuan = record.pengajuan_saya;
        if (!pengajuan?.pembuat) {
          return <Text type="secondary">-</Text>;
        }
        const pembuat = pengajuan.pembuat;
        return (
          <Space>
            <Avatar src={pembuat.image} size="small">
              {pembuat.username?.[0]?.toUpperCase() || "?"}
            </Avatar>
            <Space direction="vertical" size={0} style={{ lineHeight: 1.2 }}>
              <Text strong style={{ fontSize: 12 }}>{pembuat.username || "-"}</Text>
              <Tooltip title={pembuat.perangkat_daerah_detail || "-"}>
                <Text type="secondary" style={{ fontSize: 11, maxWidth: 150 }} ellipsis>
                  {pembuat.perangkat_daerah_detail || "-"}
                </Text>
              </Tooltip>
            </Space>
          </Space>
        );
      },
    },
  ];

  // Action column
  const actionColumn = {
    title: "Aksi",
    key: "action",
    width: isAdmin ? 130 : 100,
    align: "center",
    render: (_, record) => {
      const pengajuan = record.pengajuan_saya;
      const canDeletePengajuan = !isAdmin && pengajuan && pengajuan.status === "draft";

      return (
        <Space size="small">
          <Tooltip title="Detail">
            <Button
              type="text"
              icon={<IconEye size={16} />}
              style={{ color: "#1890ff" }}
              onClick={() =>
                router.push(`/perencanaan/formasi/${record.formasi_id}`)
              }
            />
          </Tooltip>
          {isAdmin && (
            <Tooltip title="Edit">
              <Button
                type="text"
                icon={<IconEdit size={16} />}
                style={{ color: "#52c41a" }}
                onClick={() => setModal({ open: true, data: record })}
              />
            </Tooltip>
          )}
          {isAdmin && (
            <Popconfirm
              title="Hapus formasi?"
              description="Formasi yang memiliki usulan tidak dapat dihapus"
              onConfirm={() => hapusFormasi(record.formasi_id)}
              okText="Ya, Hapus"
              cancelText="Batal"
            >
              <Tooltip title="Hapus Formasi">
                <Button
                  type="text"
                  icon={<IconTrash size={16} />}
                  danger
                  loading={deletingId === record.formasi_id}
                />
              </Tooltip>
            </Popconfirm>
          )}
          {canDeletePengajuan && (
            <Popconfirm
              title="Hapus pengajuan?"
              description="Semua data usulan di dalamnya akan hilang."
              onConfirm={() => hapusPengajuan(pengajuan.formasi_usulan_id)}
              okText="Ya, Hapus"
              cancelText="Batal"
            >
              <Tooltip title="Hapus Pengajuan Saya">
                <Button
                  type="text"
                  icon={<IconTrash size={16} />}
                  danger
                  loading={deletingPengajuanId === pengajuan.formasi_usulan_id}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      );
    },
  };

  // Combine columns based on role
  const columns = isAdmin
    ? [...baseColumns, ...adminColumns, actionColumn]
    : [...baseColumns, ...userColumns, actionColumn];

  const tableData = data?.data || [];

  return (
    <div>
      <div style={{ maxWidth: "100%" }}>
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            border: "none",
          }}
        >
          {/* Header Section */}
          <div
            style={{
              background: "#FF4500",
              color: "white",
              padding: "24px",
              textAlign: "center",
              borderRadius: "12px 12px 0 0",
              margin: "-24px -24px 0 -24px",
            }}
          >
            <IconDatabase size={32} style={{ marginBottom: 8 }} />
            <Title level={3} style={{ color: "white", margin: 0 }}>
              Daftar Formasi
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px" }}>
              Manajemen Data Perencanaan Formasi
            </Text>
          </div>

          {/* Filter and Actions Section */}
          <div style={{ padding: "20px 0 16px 0", borderBottom: "1px solid #f0f0f0" }}>
            <Row gutter={[12, 12]} align="middle" justify="space-between">
              <Col xs={24} md={16}>
                <Row gutter={[8, 8]} align="middle">
                  <Col xs={24} sm={12} md={8}>
                    <Input.Search
                        size="small"
                        placeholder="Cari judul..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        allowClear
                        style={{ width: "100%" }}
                    />
                  </Col>
                  <Col xs={12} sm={6} md={4}>
                    <InputNumber
                        size="small"
                        placeholder="Tahun"
                        value={tahun || undefined}
                        onChange={(val) => updateFilters({ tahun: val || "", page: 1 })}
                        style={{ width: "100%" }}
                        min={2020}
                        max={2100}
                    />
                  </Col>
                  <Col xs={12} sm={6} md={6}>
                    <Select
                        placeholder="Status"
                        size="small"
                        value={status || undefined}
                        onChange={(val) => updateFilters({ status: val || "", page: 1 })}
                        style={{ width: "100%" }}
                        allowClear
                    >
                        <Select.Option value="aktif">Aktif</Select.Option>
                        <Select.Option value="nonaktif">Nonaktif</Select.Option>
                    </Select>
                  </Col>
                </Row>
              </Col>
              <Col xs={24} md={8} style={{ display: "flex", justifyContent: isXs ? "flex-start" : "flex-end" }}>
                <Space wrap>
                  <Button
                    loading={isLoading || isFetching}
                    onClick={() => refetch()}
                    icon={<IconRefresh size={16} />}
                  >
                    Refresh
                  </Button>
                  {isAdmin && (
                    <Button
                        type="primary"
                        icon={<IconPlus size={16} />}
                        onClick={() => setModal({ open: true, data: null })}
                    >
                        Buat Formasi
                    </Button>
                  )}
                </Space>
              </Col>
            </Row>
          </div>

          {/* Table Section */}
          <div style={{ marginTop: "16px" }}>
            <Table
              columns={columns}
              dataSource={tableData}
              rowKey="formasi_id"
              loading={isLoading || isFetching}
              scroll={{ x: 800 }}
              size="middle"
              pagination={{
                position: ["bottomRight"],
                total: data?.meta?.total || 0,
                pageSize: parseInt(limit),
                current: parseInt(page),
                showSizeChanger: true,
                onChange: (p, l) => updateFilters({ page: p, limit: l }),
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} dari ${total} formasi`,
              }}
            />
          </div>
        </Card>
      </div>

      {/* Modal */}
      <FormasiModal
        open={modal.open}
        onClose={() => setModal({ open: false, data: null })}
        data={modal.data}
      />
    </div>
  );
}

export default FormasiList;