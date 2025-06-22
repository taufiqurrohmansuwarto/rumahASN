import { dataSealById, logBsreSeal } from "@/services/log.services";
import { formatDateFull } from "@/utils/client-utils";
import { useQuery } from "@tanstack/react-query";
import {
  Collapse,
  Modal,
  Skeleton,
  Space,
  Tag,
  Table,
  Card,
  Typography,
  Flex,
  Avatar,
  Tooltip,
  Grid,
  DatePicker,
  Button,
  Input,
} from "antd";
import {
  SafetyOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  KeyOutlined,
  FileProtectOutlined,
  DownloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ReactJson from "react-json-view";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import { useMutation } from "@tanstack/react-query";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const ModalDetail = ({ itemid, open, onClose }) => {
  const {
    data: dataResponseSeal,
    isLoading: isLoadingSeal,
    isFetching,
    refetch,
  } = useQuery(["data-seal", itemid], () => dataSealById(itemid), {
    refetchOnWindowFocus: false,
    enabled: false,
  });

  useEffect(() => {
    if (itemid) {
      refetch();
    }
  }, [itemid, refetch]);

  return (
    <Modal
      title={
        <Flex align="center" gap={8}>
          <FileProtectOutlined style={{ color: "#FF4500", fontSize: "18px" }} />
          <Text strong style={{ fontSize: "16px" }}>
            Detail Seal dengan ID #{itemid}
          </Text>
        </Flex>
      }
      open={open}
      onCancel={onClose}
      width={900}
      footer={null}
      styles={{
        header: {
          borderBottom: "2px solid #FF4500",
          paddingBottom: "16px",
          marginBottom: "20px",
        },
      }}
    >
      <Skeleton loading={isFetching} active>
        {dataResponseSeal && (
          <Collapse
            ghost
            expandIconPosition="end"
            style={{
              backgroundColor: "#fafafa",
              borderRadius: "8px",
              border: "1px solid #e8e8e8",
            }}
          >
            <Collapse.Panel
              header={
                <Flex align="center" gap={8}>
                  <Tag color="blue" icon={<KeyOutlined />}>
                    Request Data
                  </Tag>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Data yang dikirim ke server
                  </Text>
                </Flex>
              }
              key="1"
              style={{
                backgroundColor: "#ffffff",
                marginBottom: "8px",
                borderRadius: "6px",
                border: "1px solid #e0e0e0",
              }}
            >
              <div
                style={{
                  maxHeight: 400,
                  overflow: "auto",
                  backgroundColor: "#f8f9fa",
                  padding: "12px",
                  borderRadius: "6px",
                  border: "1px solid #e0e0e0",
                }}
              >
                <ReactJson
                  src={JSON?.parse(dataResponseSeal?.request_data)}
                  theme="rjv-default"
                  displayDataTypes={false}
                  displayObjectSize={false}
                  enableClipboard={true}
                  collapsed={false}
                  iconStyle="triangle"
                />
              </div>
            </Collapse.Panel>
            <Collapse.Panel
              header={
                <Flex align="center" gap={8}>
                  <Tag color="green" icon={<CheckCircleOutlined />}>
                    Response Data
                  </Tag>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Data yang diterima dari server
                  </Text>
                </Flex>
              }
              key="2"
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "6px",
                border: "1px solid #e0e0e0",
              }}
            >
              <div
                style={{
                  maxHeight: 400,
                  overflow: "auto",
                  backgroundColor: "#f8f9fa",
                  padding: "12px",
                  borderRadius: "6px",
                  border: "1px solid #e0e0e0",
                }}
              >
                <ReactJson
                  src={JSON?.parse(dataResponseSeal?.response_data)}
                  theme="rjv-default"
                  displayDataTypes={false}
                  displayObjectSize={false}
                  enableClipboard={true}
                  collapsed={false}
                  iconStyle="triangle"
                />
              </div>
            </Collapse.Panel>
          </Collapse>
        )}
      </Skeleton>
    </Modal>
  );
};

const LogBSRE = () => {
  const router = useRouter();
  const { page = 1, limit = 10, month, search } = router.query;
  const screens = useBreakpoint();
  const isMobile = !screens.md;

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

  const { data, isLoading, isFetching } = useQuery(
    ["log-bsre-seal", router?.query],
    () => logBsreSeal(router?.query),
    {
      keepPreviousData: true,
      enabled: !!router?.query,
    }
  );

  const { mutate: downloadLog, isLoading: isMutating } = useMutation({
    mutationFn: (data) => logBsreSeal(data),
    onSuccess: (data) => {
      // Transform data untuk Excel
      const excelData =
        data?.map((item, index) => ({
          No: index + 1,
          "ID Log": item.id,
          "Nama Pengguna": item.user?.username || item.user_id,
          "Custom ID": item.user?.custom_id || "-",
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
        { wch: 20 }, // Custom ID
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
    },
    onError: (error) => {
      console.error("Download error:", error);
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
        return (
          <Tag
            color={config.color}
            icon={!isMobile ? config.icon : null}
            style={{
              borderRadius: "16px",
              padding: isMobile ? "2px 6px" : "4px 8px",
              fontSize: isMobile ? "9px" : "11px",
              fontWeight: 500,
              border: `1px solid ${config.borderColor}`,
              backgroundColor: config.bgColor,
              maxWidth: isMobile ? "80px" : "120px",
            }}
          >
            {isMobile ? config.text.split(" ")[0] : config.text}
          </Tag>
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
        <Flex align="center" gap={8}>
          <Avatar
            size={isMobile ? 32 : 40}
            src={user?.image}
            style={{ backgroundColor: "#FF4500" }}
            icon={<UserOutlined />}
          />
          <Flex vertical gap={2}>
            <Text
              style={{
                fontSize: isMobile ? "11px" : "13px",
                fontWeight: 600,
                color: "#1a1a1a",
                lineHeight: 1.2,
              }}
              ellipsis={{ tooltip: user?.username }}
            >
              {user?.username || record.user_id}
            </Text>
            {user?.custom_id && (
              <Text
                style={{
                  fontSize: isMobile ? "9px" : "11px",
                  color: "#666",
                  fontFamily: "monospace",
                }}
              >
                ID: {user.custom_id}
              </Text>
            )}
          </Flex>
        </Flex>
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
          <Tag
            color={isSuccess ? "success" : "error"}
            icon={
              !isMobile ? (
                isSuccess ? (
                  <CheckCircleOutlined style={{ fontSize: "12px" }} />
                ) : (
                  <CloseCircleOutlined style={{ fontSize: "12px" }} />
                )
              ) : null
            }
            style={{
              borderRadius: "16px",
              padding: isMobile ? "2px 6px" : "4px 8px",
              fontSize: isMobile ? "9px" : "11px",
              fontWeight: 500,
              backgroundColor: isSuccess ? "#f6ffed" : "#fff2f0",
              border: `1px solid ${isSuccess ? "#b7eb8f" : "#ffccc7"}`,
            }}
          >
            {isMobile ? (isSuccess ? "✓" : "✗") : status}
          </Tag>
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
        <Tooltip title={dayjs(date).format("DD MMMM YYYY, HH:mm:ss")}>
          <Flex align="center" gap={4} vertical={isMobile}>
            {!isMobile && (
              <ClockCircleOutlined
                style={{ color: "#FF4500", fontSize: "12px" }}
              />
            )}
            <Text
              style={{
                fontSize: isMobile ? "10px" : "12px",
                color: "#FF4500",
                fontWeight: 500,
                cursor: "pointer",
                textAlign: isMobile ? "center" : "left",
              }}
            >
              {dayjs(date).locale("id").fromNow()}
            </Text>
            {isMobile && (
              <Text
                style={{
                  fontSize: "9px",
                  color: "#999",
                  textAlign: "center",
                }}
              >
                {dayjs(date).format("DD/MM HH:mm")}
              </Text>
            )}
          </Flex>
        </Tooltip>
      ),
    },
    {
      title: <Text strong>Detail</Text>,
      key: "detail",
      width: isMobile ? 60 : 80,
      align: "center",
      render: (item) => (
        <Button
          type="link"
          size="small"
          onClick={() => handleOpenModal(item)}
          style={{
            color: "#FF4500",
            fontWeight: 500,
            padding: "0",
            fontSize: isMobile ? "11px" : "12px",
          }}
        >
          {isMobile ? "Detail" : "Lihat Detail"}
        </Button>
      ),
    },
    ...(isMobile
      ? []
      : [
          {
            title: <Text strong>ID</Text>,
            dataIndex: "id",
            key: "id",
            width: 80,
            align: "center",
            render: (id) => (
              <Text
                style={{
                  fontSize: "11px",
                  color: "#999",
                  fontFamily: "monospace",
                  backgroundColor: "#f5f5f5",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                #{id}
              </Text>
            ),
          },
        ]),
  ];

  return (
    <div
      style={{
        padding: isMobile ? "12px" : "20px",
        backgroundColor: "#fafafa",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <Card
        style={{
          marginBottom: isMobile ? "12px" : "20px",
          borderRadius: isMobile ? "8px" : "12px",
          border: "1px solid #e8e8e8",
        }}
      >
        <Flex align="center" gap={isMobile ? 12 : 16} wrap>
          <div
            style={{
              width: isMobile ? "40px" : "48px",
              height: isMobile ? "40px" : "48px",
              backgroundColor: "#FF4500",
              borderRadius: isMobile ? "8px" : "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SafetyOutlined
              style={{
                color: "white",
                fontSize: isMobile ? "16px" : "20px",
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Title
              level={isMobile ? 4 : 3}
              style={{ margin: 0, color: "#1a1a1a" }}
            >
              🔐 Log Unduh Sertifikat TTE
            </Title>
            <Text
              type="secondary"
              style={{ fontSize: isMobile ? "12px" : "14px" }}
            >
              Riwayat aktivitas unduh dan seal sertifikat digital
            </Text>
          </div>
        </Flex>
      </Card>

      {/* Filter Card */}
      <Card
        style={{
          marginBottom: isMobile ? "12px" : "20px",
          borderRadius: isMobile ? "8px" : "12px",
          border: "1px solid #e8e8e8",
        }}
      >
        <Flex vertical gap={12}>
          <Flex align="center" gap={12} wrap justify="space-between">
            <Flex align="center" gap={12} wrap style={{ flex: 1 }}>
              <Flex align="center" gap={8}>
                <FilterOutlined
                  style={{ color: "#FF4500", fontSize: "16px" }}
                />
                <Text strong style={{ color: "#1a1a1a" }}>
                  Filter:
                </Text>
              </Flex>

              <Flex align="center" gap={8}>
                <CalendarOutlined style={{ color: "#666", fontSize: "14px" }} />
                <DatePicker
                  picker="month"
                  placeholder="Pilih Bulan"
                  value={month ? dayjs(month, "YYYY-MM") : null}
                  onChange={handleMonthChange}
                  style={{ width: isMobile ? 120 : 140 }}
                  format="MMMM YYYY"
                  allowClear={false}
                />
              </Flex>

              <Flex align="center" gap={8}>
                <SearchOutlined style={{ color: "#666", fontSize: "14px" }} />
                <Input.Search
                  placeholder="Cari berdasarkan nama pengguna..."
                  defaultValue={search}
                  onSearch={handleSearch}
                  style={{
                    width: isMobile ? 150 : 250,
                  }}
                  allowClear
                  enterButton={
                    <Button
                      type="primary"
                      style={{
                        backgroundColor: "#FF4500",
                        borderColor: "#FF4500",
                      }}
                    >
                      Cari
                    </Button>
                  }
                />
              </Flex>

              {(month || search) && (
                <Button
                  size="small"
                  onClick={clearFilter}
                  style={{
                    borderColor: "#FF4500",
                    color: "#FF4500",
                  }}
                >
                  Clear All
                </Button>
              )}
            </Flex>

            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownloadLog}
              loading={isMutating}
              style={{
                backgroundColor: "#FF4500",
                borderColor: "#FF4500",
                borderRadius: "6px",
                fontWeight: 500,
              }}
              size={isMobile ? "small" : "middle"}
            >
              {isMobile ? "Download" : "Download Excel"}
            </Button>
          </Flex>

          {/* Active Filter Tags */}
          {(month || search) && (
            <Flex align="center" gap={8} wrap>
              {month && (
                <Tag
                  color="orange"
                  closable
                  onClose={() => {
                    const { month, ...restQuery } = router.query;
                    router.push({
                      pathname: router.pathname,
                      query: { ...restQuery, page: 1 },
                    });
                  }}
                  style={{
                    borderRadius: "12px",
                    fontSize: "11px",
                    padding: "2px 8px",
                  }}
                >
                  📅 {dayjs(month, "YYYY-MM").format("MMMM YYYY")}
                </Tag>
              )}

              {search && (
                <Tag
                  color="blue"
                  closable
                  onClose={() => {
                    const { search, ...restQuery } = router.query;
                    router.push({
                      pathname: router.pathname,
                      query: { ...restQuery, page: 1 },
                    });
                  }}
                  style={{
                    borderRadius: "12px",
                    fontSize: "11px",
                    padding: "2px 8px",
                  }}
                >
                  🔍 &quot;{search}&quot;
                </Tag>
              )}
            </Flex>
          )}
        </Flex>
      </Card>

      {/* Stats Card */}
      {data && (
        <Card
          style={{
            marginBottom: isMobile ? "12px" : "20px",
            borderRadius: isMobile ? "8px" : "12px",
            border: "1px solid #e8e8e8",
          }}
        >
          <Flex justify="space-around" align="center" wrap>
            <Flex vertical align="center" style={{ minWidth: "80px" }}>
              <Text
                style={{
                  fontSize: isMobile ? "18px" : "24px",
                  fontWeight: 600,
                  color: "#FF4500",
                }}
              >
                {data.total?.toLocaleString()}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "10px" : "12px" }}
              >
                Total Log
              </Text>
            </Flex>
            <Flex vertical align="center" style={{ minWidth: "80px" }}>
              <Text
                style={{
                  fontSize: isMobile ? "18px" : "24px",
                  fontWeight: 600,
                  color: "#52c41a",
                }}
              >
                {data.data?.filter((item) => item.status === "SUCCESS")
                  .length || 0}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "10px" : "12px" }}
              >
                Berhasil
              </Text>
            </Flex>
            <Flex vertical align="center" style={{ minWidth: "80px" }}>
              <Text
                style={{
                  fontSize: isMobile ? "18px" : "24px",
                  fontWeight: 600,
                  color: "#ff4d4f",
                }}
              >
                {data.data?.filter((item) => item.status === "ERROR").length ||
                  0}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "10px" : "12px" }}
              >
                Error
              </Text>
            </Flex>
            <Flex vertical align="center" style={{ minWidth: "80px" }}>
              <Text
                style={{
                  fontSize: isMobile ? "18px" : "24px",
                  fontWeight: 600,
                  color: "#1890ff",
                }}
              >
                {data.data?.filter((item) => item.action === "SEAL_CERTIFICATE")
                  .length || 0}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "10px" : "12px" }}
              >
                Seal Cert
              </Text>
            </Flex>
          </Flex>
        </Card>
      )}

      {/* Table */}
      <Card
        style={{
          borderRadius: isMobile ? "8px" : "12px",
          border: "1px solid #e8e8e8",
        }}
      >
        <Table
          dataSource={data?.data}
          columns={columns}
          loading={isLoading || isFetching}
          rowKey="id"
          size={isMobile ? "small" : "middle"}
          scroll={{ x: isMobile ? 700 : undefined }}
          rowClassName={(record, index) =>
            index % 2 === 0 ? "table-row-light" : "table-row-dark"
          }
          pagination={{
            current: parseInt(page),
            pageSize: parseInt(limit),
            total: data?.total,
            showTotal: (total, range) => (
              <Text
                style={{ color: "#666", fontSize: isMobile ? "11px" : "14px" }}
              >
                {isMobile ? (
                  `${range[0]}-${range[1]} / ${total.toLocaleString()}`
                ) : (
                  <>
                    Menampilkan{" "}
                    <Text strong style={{ color: "#FF4500" }}>
                      {range[0]}-{range[1]}
                    </Text>{" "}
                    dari{" "}
                    <Text strong style={{ color: "#FF4500" }}>
                      {total.toLocaleString()}
                    </Text>{" "}
                    aktivitas
                    {(month || search) && (
                      <Text style={{ color: "#999" }}>
                        {" "}
                        {month &&
                          `(bulan ${dayjs(month, "YYYY-MM").format(
                            "MMMM YYYY"
                          )})`}
                        {month && search && " • "}
                        {search && `(pencarian: "${search}")`}
                      </Text>
                    )}
                  </>
                )}
              </Text>
            ),
            showSizeChanger: !isMobile,
            pageSizeOptions: ["10", "20", "50"],
            simple: isMobile,
            onChange: (newPage, newPageSize) => {
              router.push({
                pathname: router.pathname,
                query: { ...router.query, page: newPage, limit: newPageSize },
              });
            },
            style: {
              marginTop: isMobile ? "12px" : "20px",
              padding: isMobile ? "8px 0" : "16px 0",
              borderTop: "1px solid #f0f0f0",
            },
          }}
        />
      </Card>

      {/* Modal Detail */}
      <ModalDetail
        itemid={itemId}
        open={openModal}
        onClose={handleCloseModal}
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

        .ant-pagination-item-active {
          background: linear-gradient(
            135deg,
            #ff4500 0%,
            #ff6b35 100%
          ) !important;
          border-color: #ff4500 !important;
          box-shadow: 0 2px 4px rgba(255, 69, 0, 0.3) !important;
        }

        .ant-pagination-item-active a {
          color: white !important;
          font-weight: 600 !important;
        }

        .ant-pagination-item:hover {
          border-color: #ff4500 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 2px 4px rgba(255, 69, 0, 0.2) !important;
          transition: all 0.2s ease !important;
        }

        .ant-pagination-item:hover a {
          color: #ff4500 !important;
        }

        .ant-select:not(.ant-select-disabled):hover .ant-select-selector {
          border-color: #ff4500 !important;
        }

        .ant-select-focused .ant-select-selector {
          border-color: #ff4500 !important;
          box-shadow: 0 0 0 2px rgba(255, 69, 0, 0.2) !important;
        }

        .ant-picker:hover,
        .ant-picker-focused {
          border-color: #ff4500 !important;
          box-shadow: 0 0 0 2px rgba(255, 69, 0, 0.2) !important;
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

        .ant-modal-header {
          border-radius: 8px 8px 0 0 !important;
        }

        .ant-collapse-header {
          font-weight: 500 !important;
        }

        .ant-collapse-content-box {
          padding: 16px !important;
        }

        @media (max-width: 768px) {
          .ant-table-pagination {
            text-align: center !important;
          }

          .ant-pagination-simple .ant-pagination-simple-pager {
            margin: 0 8px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LogBSRE;
