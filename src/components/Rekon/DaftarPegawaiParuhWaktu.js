import { getOpdFasilitator } from "@/services/master.services";
import { getPengadaanParuhWaktu } from "@/services/siasn-services";
import {
  DownloadOutlined,
  ReloadOutlined,
  UserOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Badge, Text } from "@mantine/core";
import { IconUsers, IconDownload, IconX } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Col,
  Grid,
  Input,
  message,
  Row,
  Space,
  Table,
  Tooltip,
  TreeSelect,
  Typography,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { saveAs } from "file-saver";
import { useRouter } from "next/router";
import { useState } from "react";
import * as XLSX from "xlsx";
import ModalDetailParuhWaktu from "./ModalDetailParuhWaktu";

const { Title } = Typography;
const { useBreakpoint } = Grid;
const { Search } = Input;

const DaftarPegawaiParuhWaktu = () => {
  const router = useRouter();
  const { page = 1, limit = 10, nama, nip, no_peserta, opd_id } = router.query;
  const screens = useBreakpoint();
  const isXs = !screens?.sm;

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const handleShowDetail = (record) => {
    setSelectedData(record);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedData(null);
  };

  const { data: unor, isLoading: isLoadingUnor } = useQuery(
    ["unor-fasilitator"],
    () => getOpdFasilitator(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data, isLoading, isFetching, refetch, isRefetching } = useQuery({
    queryKey: ["daftar-pegawai-paruh-waktu", router?.query],
    queryFn: () => getPengadaanParuhWaktu(router?.query),
    enabled: !!router?.query,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  const { mutate: downloadData, isLoading: isMutating } = useMutation({
    mutationFn: (queryParams) =>
      getPengadaanParuhWaktu({ ...queryParams, limit: -1 }),
    onSuccess: (result) => {
      const excelData =
        result?.data?.map((item, index) => ({
          No: index + 1,
          NIP: item.nip || "-",
          Nama: item.nama || "-",
          "No. Peserta": item.detail?.usulan_data?.data?.no_peserta || "-",
          "Unor SIMASTER": item.unor_simaster || "-",
          "Unor SIASN": item.unor_siasn || "-",
          Gaji: item.gaji || item.detail?.usulan_data?.data?.gaji_pokok || "0",
          "Tempat Lahir": item.detail?.usulan_data?.data?.tempat_lahir || "-",
          "Tanggal Lahir": item.detail?.usulan_data?.data?.tgl_lahir
            ? dayjs(item.detail.usulan_data.data.tgl_lahir).format("DD/MM/YYYY")
            : "-",
          "TMT CPNS": item.detail?.usulan_data?.data?.tmt_cpns
            ? dayjs(item.detail.usulan_data.data.tmt_cpns).format("DD/MM/YYYY")
            : "-",
          "No. Pertek": item.detail?.no_pertek || "-",
          "Tanggal Pertek": item.detail?.tgl_pertek
            ? dayjs(item.detail.tgl_pertek).format("DD/MM/YYYY")
            : "-",
          Status: item.detail?.status_usulan || "-",
          Keterangan: item.detail?.keterangan || "-",
          "Path Pertek": item.detail?.path_ttd_pertek || "-",
          "Path SK": item.detail?.path_ttd_sk || "-",
        })) || [];

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      const columnWidths = [
        { wch: 5 }, // No
        { wch: 20 }, // NIP
        { wch: 30 }, // Nama
        { wch: 20 }, // No. Peserta
        { wch: 15 }, // Unor SIMASTER
        { wch: 35 }, // Unor SIASN
        { wch: 15 }, // Gaji
        { wch: 15 }, // Tempat Lahir
        { wch: 15 }, // Tanggal Lahir
        { wch: 15 }, // TMT CPNS
        { wch: 20 }, // No. Pertek
        { wch: 15 }, // Tanggal Pertek
        { wch: 10 }, // Status
        { wch: 30 }, // Keterangan
        { wch: 50 }, // Path Pertek
        { wch: 50 }, // Path SK
      ];
      worksheet["!cols"] = columnWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, "Pegawai Paruh Waktu");

      const currentDate = dayjs().format("YYYY-MM-DD_HH-mm-ss");
      const filename = `Pegawai-Paruh-Waktu_${currentDate}.xlsx`;

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const excelBlob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(excelBlob, filename);
      message.success("Berhasil mengunduh data Excel");
    },
    onError: (error) => {
      console.error("Download error:", error);
      message.error("Gagal mengunduh data");
    },
  });

  const handleDownload = () => {
    downloadData(router.query);
  };

  const handleSearch = (field, value) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        [field]: value || undefined,
        page: 1,
      },
    });
  };

  const handleTreeSelectChange = (value) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        opd_id: value || undefined,
        page: 1,
      },
    });
  };

  const clearFilter = () => {
    router.push({
      pathname: router.pathname,
      query: { page: 1 },
    });
  };

  const columns = [
    {
      title: "Pegawai",
      key: "pegawai",
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Avatar size={36} style={{ border: "2px solid #f0f0f0" }}>
            <UserOutlined />
          </Avatar>
          <div style={{ lineHeight: "1.2" }}>
            <div>
              <Text fw={600} size="xs">
                {record?.nama}
              </Text>
            </div>
            {record?.nip && (
              <div style={{ marginTop: "3px" }}>
                <Text size="10px" c="dimmed" ff="monospace">
                  {record?.nip}
                </Text>
              </div>
            )}
            {record?.detail?.usulan_data?.data?.no_peserta && (
              <div style={{ marginTop: "3px" }}>
                <Badge
                  variant="light"
                  color="blue"
                  size="xs"
                  style={{ maxWidth: "180px" }}
                >
                  <Text size="10px" truncate span>
                    No: {record?.detail?.usulan_data?.data?.no_peserta}
                  </Text>
                </Badge>
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "Unit Organisasi",
      key: "unor",
      width: 180,
      render: (_, record) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <div>
            <Text
              size="10px"
              c="purple"
              fw={600}
              style={{ display: "block", marginBottom: "3px" }}
            >
              SIMASTER
            </Text>
            <Text size="10px" ff="monospace" c="dimmed">
              {record?.unor_simaster || "-"}
            </Text>
          </div>
          <div>
            <Text
              size="10px"
              c="cyan"
              fw={600}
              style={{ display: "block", marginBottom: "3px" }}
            >
              SIASN
            </Text>
            <Tooltip title={record?.unor_siasn || "-"}>
              <Text
                size="10px"
                ff="monospace"
                c="dimmed"
                style={{
                  display: "block",
                  wordBreak: "break-all",
                  lineHeight: "1.4",
                  cursor: "help",
                }}
              >
                {record?.unor_siasn || "-"}
              </Text>
            </Tooltip>
          </div>
        </div>
      ),
    },
    {
      title: "Gaji",
      key: "gaji",
      width: 110,
      render: (_, record) => {
        const gaji =
          record?.gaji || record?.detail?.usulan_data?.data?.gaji_pokok || "0";
        return (
          <Text size="10px" fw={600} c="green" ff="monospace">
            Rp {parseInt(gaji).toLocaleString("id-ID")}
          </Text>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      width: 90,
      render: (_, record) => {
        const status = record?.detail?.status_usulan;
        const statusMap = {
          22: { color: "green", label: "Selesai" },
          20: { color: "blue", label: "Proses" },
          21: { color: "yellow", label: "Pending" },
        };
        const statusConfig = statusMap[status] || {
          color: "gray",
          label: status || "-",
        };
        return (
          <Badge color={statusConfig.color} size="xs" variant="light">
            <Text size="10px" span>
              {statusConfig.label}
            </Text>
          </Badge>
        );
      },
    },
    {
      title: "Dokumen",
      key: "dokumen",
      width: 90,
      render: (_, record) => (
        <Space size={3} direction="vertical">
          {record?.detail?.path_ttd_pertek && (
            <Tooltip title="Unduh file Pertek">
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${record.detail.path_ttd_pertek}`}
                target="_blank"
                rel="noreferrer"
              >
                <Badge
                  color="orange"
                  size="xs"
                  style={{ cursor: "pointer" }}
                  leftSection={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <IconDownload size={10} />
                    </div>
                  }
                  styles={{
                    section: { display: "flex", alignItems: "center" },
                    label: { display: "flex", alignItems: "center" },
                  }}
                >
                  <Text size="10px" span>
                    Pertek
                  </Text>
                </Badge>
              </a>
            </Tooltip>
          )}
          {record?.detail?.path_ttd_sk && (
            <Tooltip title="Unduh file SK">
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${record.detail.path_ttd_sk}`}
                target="_blank"
                rel="noreferrer"
              >
                <Badge
                  color="blue"
                  size="xs"
                  style={{ cursor: "pointer" }}
                  leftSection={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <IconDownload size={10} />
                    </div>
                  }
                  styles={{
                    section: { display: "flex", alignItems: "center" },
                    label: { display: "flex", alignItems: "center" },
                  }}
                >
                  <Text size="10px" span>
                    SK
                  </Text>
                </Badge>
              </a>
            </Tooltip>
          )}
          {!record?.detail?.path_ttd_pertek && !record?.detail?.path_ttd_sk && (
            <Badge
              color="gray"
              size="xs"
              leftSection={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <IconX size={10} />
                </div>
              }
              styles={{
                section: { display: "flex", alignItems: "center" },
                label: { display: "flex", alignItems: "center" },
              }}
            >
              <Text size="10px" span>
                No File
              </Text>
            </Badge>
          )}
        </Space>
      ),
    },
    {
      title: "Aksi",
      key: "aksi",
      width: 80,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Tooltip title="Lihat Detail">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleShowDetail(record)}
            style={{
              color: "#FF4500",
              padding: "0 8px",
              height: "auto",
            }}
          >
            <Text size="10px" span style={{ color: "#FF4500" }}>
              Detail
            </Text>
          </Button>
        </Tooltip>
      ),
    },
  ];

  const hasFilter = nama || nip || no_peserta || opd_id;

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
            <UserOutlined style={{ fontSize: "24px", marginBottom: "8px" }} />
            <Title level={3} style={{ color: "white", margin: 0 }}>
              Pegawai Paruh Waktu
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px" }}>
              Data pegawai PPPK paruh waktu
            </Text>
          </div>

          {/* Filter Section */}
          <div
            style={{
              padding: "20px 0 16px 0",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <Row gutter={[12, 12]}>
              <Col xs={24} md={5}>
                <div style={{ marginBottom: 4 }}>
                  <Text fw={600} size="sm" c="dimmed">
                    Nama:
                  </Text>
                </div>
                <Search
                  placeholder="Cari nama"
                  allowClear
                  defaultValue={nama}
                  onSearch={(value) => handleSearch("nama", value)}
                  style={{ width: "100%" }}
                />
              </Col>
              <Col xs={24} md={5}>
                <div style={{ marginBottom: 4 }}>
                  <Text fw={600} size="sm" c="dimmed">
                    NIP:
                  </Text>
                </div>
                <Search
                  placeholder="Cari NIP"
                  allowClear
                  defaultValue={nip}
                  onSearch={(value) => handleSearch("nip", value)}
                  style={{ width: "100%" }}
                />
              </Col>
              <Col xs={24} md={5}>
                <div style={{ marginBottom: 4 }}>
                  <Text fw={600} size="sm" c="dimmed">
                    No. Peserta:
                  </Text>
                </div>
                <Search
                  placeholder="Cari no. peserta"
                  allowClear
                  defaultValue={no_peserta}
                  onSearch={(value) => handleSearch("no_peserta", value)}
                  style={{ width: "100%" }}
                />
              </Col>
              <Col xs={24} md={9}>
                <div style={{ marginBottom: 4 }}>
                  <Text fw={600} size="sm" c="dimmed">
                    Perangkat Daerah:
                  </Text>
                </div>
                <TreeSelect
                  style={{ width: "100%" }}
                  treeNodeFilterProp="label"
                  showSearch
                  treeData={unor}
                  placeholder="Pilih OPD"
                  allowClear
                  value={opd_id}
                  onChange={handleTreeSelectChange}
                />
              </Col>
            </Row>
            {hasFilter && (
              <Row style={{ marginTop: 12 }}>
                <Col>
                  <Button
                    type="text"
                    onClick={clearFilter}
                    style={{
                      color: "#FF4500",
                      fontWeight: 500,
                      padding: "4px 8px",
                    }}
                  >
                    Clear Filter
                  </Button>
                </Col>
              </Row>
            )}
          </div>

          {/* Actions Section */}
          <div
            style={{
              padding: "12px 0",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Space wrap>
              <Button
                icon={<ReloadOutlined />}
                loading={isLoading || isRefetching}
                onClick={() => refetch()}
                style={{ borderRadius: 6, fontWeight: 500 }}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                loading={isMutating}
                onClick={handleDownload}
                style={{
                  background: "#FF4500",
                  borderColor: "#FF4500",
                  borderRadius: 6,
                  fontWeight: 500,
                }}
              >
                Unduh Data
              </Button>
            </Space>
          </div>

          {/* Table Section */}
          <div style={{ marginTop: "16px" }}>
            <Table
              columns={columns}
              dataSource={data?.data}
              rowKey="id"
              loading={isLoading || isFetching}
              scroll={{ x: 730 }}
              size="middle"
              style={{
                borderRadius: "12px",
                overflow: "hidden",
              }}
              pagination={{
                position: ["bottomRight"],
                total: data?.total || 0,
                pageSize: parseInt(limit),
                current: parseInt(page),
                showSizeChanger: false,
                onChange: (newPage) => {
                  router.push({
                    pathname: router.pathname,
                    query: {
                      ...router.query,
                      page: newPage,
                    },
                  });
                },
                showTotal: (total, range) =>
                  `${range[0].toLocaleString(
                    "id-ID"
                  )}-${range[1].toLocaleString(
                    "id-ID"
                  )} dari ${total.toLocaleString("id-ID")} records`,
                style: { margin: "16px 0" },
              }}
              locale={{
                emptyText: (
                  <div style={{ padding: "60px", textAlign: "center" }}>
                    <IconUsers
                      size={48}
                      style={{ color: "#d1d5db", marginBottom: 16 }}
                    />
                    <div>
                      <Text size="lg" c="dimmed">
                        Tidak ada data
                      </Text>
                    </div>
                    <div style={{ marginTop: "8px" }}>
                      <Text size="sm" c="dimmed">
                        Belum ada data pegawai paruh waktu
                      </Text>
                    </div>
                  </div>
                ),
              }}
            />
          </div>
        </Card>
      </div>

      {/* Modal Detail */}
      <ModalDetailParuhWaktu
        visible={modalVisible}
        onClose={handleCloseModal}
        data={selectedData}
      />
    </div>
  );
};

export default DaftarPegawaiParuhWaktu;
