import { dataSealById, logBsreSeal } from "@/services/log.services";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FileProtectOutlined,
  KeyOutlined,
  SafetyOutlined,
  SyncOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Badge } from "@mantine/core";
import {
  Avatar,
  Button,
  Card,
  DatePicker,
  Flex,
  Grid,
  Row,
  Col,
  Input,
  message,
  Modal,
  Skeleton,
  Space,
  Table,
  Tooltip,
  Typography,
  Tabs,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

// Dynamic imports untuk mencegah SSR issues
const ReactJson = dynamic(() => import("react-json-view"), { ssr: false });

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const ModalDetail = ({ itemid, open, onClose }) => {
  const {
    data: dataResponseSeal,
    isLoading: isLoadingSeal,
    isFetching,
    refetch,
    error,
  } = useQuery(["data-seal", itemid], () => dataSealById(itemid), {
    refetchOnWindowFocus: false,
    enabled: false,
  });

  useEffect(() => {
    if (itemid) {
      refetch();
    }
  }, [itemid, refetch]);

  const isLoading = isLoadingSeal || isFetching;

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <SafetyOutlined style={{ color: "#FF4500" }} />
          <Text strong>Detail Log BSRE</Text>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={900}
      footer={null}
      styles={{
        header: {
          borderBottom: "1px solid #f0f0f0",
          marginBottom: 12,
        },
      }}
    >
      {/* Loading State */}
      {isLoading && (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <Skeleton active paragraph={{ rows: 8 }} />
          <Text
            type="secondary"
            style={{ fontSize: "14px", marginTop: "16px" }}
          >
            Sedang memuat detail data seal...
          </Text>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <CloseCircleOutlined
            style={{
              fontSize: "48px",
              color: "#ff4d4f",
              marginBottom: "16px",
            }}
          />
          <Text type="danger" style={{ fontSize: "16px", display: "block" }}>
            Gagal memuat data
          </Text>
          <Text type="secondary" style={{ fontSize: "14px", marginTop: "8px" }}>
            {error?.message || "Terjadi kesalahan saat memuat detail data seal"}
          </Text>
          <Button
            type="primary"
            style={{
              backgroundColor: "#FF4500",
              borderColor: "#FF4500",
              marginTop: "16px",
            }}
            onClick={() => refetch()}
          >
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Content */}
      {dataResponseSeal && !isLoading && !error && (
        <Tabs
          size="small"
          items={[
            {
              key: "req",
              label: "Request",
              children: (
                <div style={{ maxHeight: 360, overflow: "auto" }}>
                  <ReactJson
                    src={
                      dataResponseSeal?.request_data
                        ? JSON.parse(dataResponseSeal.request_data)
                        : {}
                    }
                    theme="rjv-default"
                    displayDataTypes={false}
                    displayObjectSize={false}
                    enableClipboard
                    collapsed={false}
                    iconStyle="triangle"
                  />
                </div>
              ),
            },
            {
              key: "res",
              label: "Response",
              children: (
                <div style={{ maxHeight: 360, overflow: "auto" }}>
                  <ReactJson
                    src={
                      dataResponseSeal?.response_data
                        ? JSON.parse(dataResponseSeal.response_data)
                        : {}
                    }
                    theme="rjv-default"
                    displayDataTypes={false}
                    displayObjectSize={false}
                    enableClipboard
                    collapsed={false}
                    iconStyle="triangle"
                  />
                </div>
              ),
            },
          ]}
        />
      )}

      {/* Empty State */}
      {!dataResponseSeal && !isLoading && !error && itemid && (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <Text type="secondary">Data tidak ditemukan</Text>
        </div>
      )}
    </Modal>
  );
};

const LogBSRE = () => {
  const router = useRouter();
  const { page = 1, limit = 10, month, search } = router.query;
  const screens = useBreakpoint();
  const isMobile = !screens?.md;

  const [itemId, setItemId] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = (item) => {
    setItemId(item?.id);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setItemId(null);
    setOpenModal(false);
  };

  const { data, isLoading, isFetching, refetch, isRefetching } = useQuery(
    ["log-bsre-seal", router?.query],
    () => logBsreSeal(router?.query),
    {
      keepPreviousData: true,
      enabled: !!router?.query,
    }
  );

  const { mutate: downloadLog, isLoading: isMutating } = useMutation({
    mutationFn: (data) => logBsreSeal(data),
    onSuccess: async (data) => {
      try {
        // Transform data untuk Excel
        const excelData =
          data?.data?.map((item, index) => ({
            No: index + 1,
            "ID Log": item.id,
            "Nama Pengguna": item.user?.username || item.user_id,
            Aksi: getActionText(item.action),
            Status: item.status,
            Tanggal: dayjs(item.created_at).format("DD/MM/YYYY"),
            Waktu: dayjs(item.created_at).format("HH:mm:ss"),
            "Tanggal Lengkap": dayjs(item.created_at).format(
              "DD MMMM YYYY, HH:mm:ss"
            ),
            "Created At": item.created_at,
          })) || [];

        // Buat workbook baru
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Set column widths
        const columnWidths = [
          { wch: 5 }, // No
          { wch: 10 }, // ID Log
          { wch: 35 }, // Nama Pengguna
          { wch: 20 }, // Aksi
          { wch: 12 }, // Status
          { wch: 12 }, // Tanggal
          { wch: 10 }, // Waktu
          { wch: 25 }, // Tanggal Lengkap
          { wch: 20 }, // Created At
        ];
        worksheet["!cols"] = columnWidths;

        // Header styling
        const headerRange = XLSX.utils.decode_range(worksheet["!ref"]);
        for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
          if (!worksheet[cellAddress]) continue;
          worksheet[cellAddress].s = {
            font: {
              bold: true,
              color: { rgb: "FFFFFF" },
              size: 12,
              name: "Calibri",
            },
            fill: {
              fgColor: { rgb: "FF4500" },
              patternType: "solid",
            },
            alignment: {
              horizontal: "center",
              vertical: "center",
              wrapText: true,
            },
          };
        }

        XLSX.utils.book_append_sheet(workbook, worksheet, "Log BSRE Seal");

        const currentDate = dayjs().format("YYYY-MM-DD_HH-mm-ss");
        const monthFilter = month
          ? `_${dayjs(month, "YYYY-MM").format("MMMM-YYYY")}`
          : "";
        const filename = `Log-BSRE-Seal_${currentDate}${monthFilter}.xlsx`;

        const excelBuffer = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });

        const excelBlob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(excelBlob, filename);
        message.success("Berhasil mengunduh data Excel");
      } catch (error) {
        console.error("Error creating Excel file:", error);
        message.error("Gagal mengunduh data");
      }
    },
    onError: (error) => {
      console.error("Download error:", error);
      message.error("Gagal mengunduh data");
    },
  });

  const handleDownloadLog = () => {
    downloadLog({ ...router.query, limit: -1 });
  };

  const getActionText = (action) => {
    switch (action) {
      case "SEAL_CERTIFICATE":
        return "Seal Sertifikat";
      case "REQUEST_SEAL_OTP":
        return "Request OTP Seal";
      case "REFRESH_SEAL_OTP":
        return "Refresh OTP Seal";
      default:
        return action;
    }
  };

  const getActionConfig = (action) => {
    switch (action) {
      case "SEAL_CERTIFICATE":
        return {
          color: "blue",
          icon: <FileProtectOutlined style={{ fontSize: "12px" }} />,
          text: "Seal Sertifikat",
          bgColor: "#f0f5ff",
          borderColor: "#adc6ff",
        };
      case "REQUEST_SEAL_OTP":
        return {
          color: "orange",
          icon: <KeyOutlined style={{ fontSize: "12px" }} />,
          text: "Request OTP",
          bgColor: "#fff7e6",
          borderColor: "#ffcc99",
        };
      case "REFRESH_SEAL_OTP":
        return {
          color: "purple",
          icon: <SyncOutlined style={{ fontSize: "12px" }} />,
          text: "Refresh OTP",
          bgColor: "#f9f0ff",
          borderColor: "#d3adf7",
        };
      default:
        return {
          color: "default",
          icon: <SafetyOutlined style={{ fontSize: "12px" }} />,
          text: action,
          bgColor: "#fafafa",
          borderColor: "#d9d9d9",
        };
    }
  };

  const handleMonthChange = (date) => {
    const monthValue = date ? dayjs(date).format("YYYY-MM") : undefined;
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        month: monthValue,
        page: 1,
      },
    });
  };

  const handleSearch = (value) => {
    const searchValue = value?.trim() || undefined;
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        search: searchValue,
        page: 1,
      },
    });
  };

  const clearFilter = () => {
    const { month, search, ...restQuery } = router.query;
    router.push({
      pathname: router.pathname,
      query: { ...restQuery, page: 1 },
    });
  };

  const columns = [
    {
      title: (
        <Space>
          <SafetyOutlined />
          <Text strong>Aksi</Text>
        </Space>
      ),
      dataIndex: "action",
      key: "action",
      width: isMobile ? 100 : 140,
      align: "center",
      render: (action) => {
        const config = getActionConfig(action);
        const label = isMobile
          ? config.text?.split(" ")[0] || config.text
          : config.text;
        return (
          <Badge
            color={config.color}
            size="sm"
            variant="light"
            leftSection={
              !isMobile ? (
                <div style={{ display: "flex", alignItems: "center" }}>
                  {config.icon}
                </div>
              ) : null
            }
            styles={{
              section: { display: "flex", alignItems: "center" },
              label: { display: "flex", alignItems: "center" },
            }}
          >
            {label}
          </Badge>
        );
      },
    },
    {
      title: (
        <Space>
          <Avatar
            size={16}
            style={{ backgroundColor: "#FF4500" }}
            icon={<UserOutlined />}
          />
          <Text strong>Pengguna</Text>
        </Space>
      ),
      dataIndex: "user",
      key: "user",
      width: isMobile ? 200 : 280,
      render: (user, record) => (
        <Space size="small">
          <Avatar
            src={user?.image}
            size={isMobile ? 32 : 36}
            style={{
              border: "2px solid #f0f0f0",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            {!user?.image && <UserOutlined />}
          </Avatar>
          <div style={{ lineHeight: 1.1 }}>
            <div>
              <Text style={{ fontWeight: 600, fontSize: isMobile ? 11 : 12 }}>
                {user?.username || record.user_id}
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <CheckCircleOutlined />
          <Text strong>Status</Text>
        </Space>
      ),
      dataIndex: "status",
      key: "status",
      width: isMobile ? 80 : 100,
      align: "center",
      render: (status) => {
        const isSuccess = status === "SUCCESS";
        return (
          <Badge
            color={isSuccess ? "green" : "red"}
            size="sm"
            variant="light"
            leftSection={
              !isMobile ? (
                <div style={{ display: "flex", alignItems: "center" }}>
                  {isSuccess ? (
                    <CheckCircleOutlined style={{ fontSize: 12 }} />
                  ) : (
                    <CloseCircleOutlined style={{ fontSize: 12 }} />
                  )}
                </div>
              ) : null
            }
            styles={{
              section: { display: "flex", alignItems: "center" },
              label: { display: "flex", alignItems: "center" },
            }}
          >
            {isMobile ? (isSuccess ? "SUKSES" : "GAGAL") : status}
          </Badge>
        );
      },
    },
    {
      title: (
        <Space>
          <ClockCircleOutlined />
          <Text strong>Waktu</Text>
        </Space>
      ),
      dataIndex: "created_at",
      key: "created_at",
      width: isMobile ? 100 : 140,
      render: (date) => (
        <Tooltip title={dayjs(date).format("DD-MM-YYYY HH:mm:ss")}>
          <div style={{ lineHeight: "1.1", cursor: "pointer" }}>
            <Text style={{ fontSize: 12 }}>
              {dayjs(date).format("DD/MM/YY")}
            </Text>
            <div style={{ marginTop: 0 }}>
              <Text style={{ fontSize: 10, color: "#999" }}>
                {dayjs(date).format("HH:mm")}
              </Text>
            </div>
          </div>
        </Tooltip>
      ),
    },
    {
      title: <Text strong>Data</Text>,
      key: "detail",
      width: isMobile ? 60 : 80,
      align: "center",
      render: (item) => (
        <Button
          type="text"
          size="small"
          onClick={() => handleOpenModal(item)}
          style={{
            color: "#FF4500",
            fontWeight: 500,
            padding: "0 8px",
          }}
        >
          Data
        </Button>
      ),
    },
    // removed ID column for cleaner view
  ];

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
            <SafetyOutlined style={{ fontSize: "24px", marginBottom: "8px" }} />
            <Title level={3} style={{ color: "white", margin: 0 }}>
              Log Unduh Sertifikat TTE
            </Title>
            <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 14 }}>
              Riwayat aktivitas unduh dan seal sertifikat digital
            </Text>
          </div>

          {/* Filter and Actions Section */}
          <div
            style={{
              padding: "20px 0 16px 0",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <Row gutter={16} align="middle" justify="space-between">
              <Col>
                <Space>
                  <Text strong style={{ color: "#6b7280" }}>
                    Filter Bulan:
                  </Text>
                  <DatePicker
                    placeholder="Pilih Bulan"
                    picker="month"
                    value={month ? dayjs(month, "YYYY-MM") : null}
                    onChange={handleMonthChange}
                    allowClear
                    style={{ width: 160 }}
                  />
                  <Text strong style={{ color: "#6b7280" }}>
                    Cari User:
                  </Text>
                  <Input.Search
                    placeholder="Cari berdasarkan nama pengguna..."
                    defaultValue={search}
                    onSearch={handleSearch}
                    style={{ width: 200 }}
                    allowClear
                  />
                  {(month || search) && (
                    <Button
                      type="text"
                      onClick={clearFilter}
                      style={{
                        color: "#FF4500",
                        fontWeight: "500",
                        padding: "4px 8px",
                      }}
                    >
                      Clear Filter
                    </Button>
                  )}
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button
                    loading={isLoading || isRefetching}
                    onClick={() => refetch()}
                    style={{
                      borderRadius: "6px",
                      fontWeight: "500",
                      padding: "0 16px",
                    }}
                  >
                    Refresh
                  </Button>
                  <Button
                    type="primary"
                    loading={isMutating}
                    onClick={handleDownloadLog}
                    style={{
                      background: "#FF4500",
                      borderColor: "#FF4500",
                      borderRadius: "6px",
                      fontWeight: "500",
                      padding: "0 16px",
                    }}
                  >
                    Unduh Data
                  </Button>
                </Space>
              </Col>
            </Row>
          </div>

          {/* Table Section */}
          <div style={{ marginTop: "16px" }}>
            <Table
              dataSource={data?.data}
              columns={columns}
              loading={isLoading || isFetching}
              rowKey="id"
              size="middle"
              scroll={{ x: 890 }}
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
                onChange: (newPage, newPageSize) => {
                  router.push({
                    pathname: router.pathname,
                    query: {
                      ...router.query,
                      page: newPage,
                      limit: newPageSize,
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
                    <SafetyOutlined
                      style={{
                        fontSize: 64,
                        color: "#d1d5db",
                        marginBottom: 24,
                      }}
                    />
                    <div>
                      <Text style={{ color: "#6b7280", fontSize: 16 }}>
                        Tidak ada data log
                      </Text>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <Text style={{ color: "#9ca3af", fontSize: 14 }}>
                        Belum ada aktivitas yang tercatat
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
      <ModalDetail itemid={itemId} open={openModal} onClose={handleCloseModal} />
    </div>
  );
};

export default LogBSRE;
