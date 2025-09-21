import { logSIASN } from "@/services/log.services";
import {
  DatabaseOutlined,
  EyeOutlined,
  FileTextOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Text, Badge } from "@mantine/core";
import {
  IconDatabase,
  IconUpload,
  IconDownload,
  IconEdit,
  IconTrash,
  IconEye,
  IconRefresh,
  IconUser
} from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Input,
  Modal,
  Row,
  Space,
  Table,
  Tooltip,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { upperCase } from "lodash";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState } from "react";

dayjs.extend(relativeTime);

// Dynamic imports untuk mencegah SSR issues
const ReactJson = dynamic(() => import("react-json-view"), { ssr: false });

const { Title } = Typography;

const LogSiasn = () => {
  const router = useRouter();
  const { page = 1, limit = 15, bulan, search, mandiri } = router.query;
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const { data, isLoading, isFetching, refetch, isRefetching } = useQuery({
    queryKey: ["logs-siasn", router?.query],
    queryFn: () => logSIASN(router?.query),
    enabled: !!router?.query,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    keepPreviousData: true,
  });

  const gotoDetail = (nip) => {
    router.push(`/rekon/pegawai/${nip}/detail`);
  };

  const handleChangePage = (page, limit) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        page,
        limit,
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

  const handleBulanChange = (date) => {
    const bulanValue = date ? dayjs(date).format("YYYY-MM") : undefined;
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        bulan: bulanValue,
        page: 1,
      },
    });
  };

  const handleMandiriChange = (checked) => {
    const mandiriValue = checked ? true : undefined;
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        mandiri: mandiriValue,
        page: 1,
      },
    });
  };

  const clearFilter = () => {
    const { bulan, search, mandiri, ...restQuery } = router.query;
    router.push({
      pathname: router.pathname,
      query: { ...restQuery, page: 1 },
    });
  };

  const { mutate: downloadLog, isLoading: isMutating } = useMutation({
    mutationFn: (data) => logSIASN(data),
    onSuccess: async (data) => {
      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Log SIASN");

        worksheet.columns = [
          { header: "No", key: "no", width: 5 },
          { header: "ID Log", key: "id", width: 10 },
          { header: "Nama Pengguna", key: "username", width: 35 },
          { header: "NIP", key: "nip", width: 20 },
          { header: "Role", key: "role", width: 15 },
          { header: "Tipe", key: "type", width: 20 },
          { header: "Service SIASN", key: "siasn_service", width: 25 },
          { header: "Tanggal", key: "tanggal", width: 12 },
          { header: "Waktu", key: "waktu", width: 10 },
          { header: "Created At", key: "created_at", width: 20 },
        ];

        // Transform data untuk Excel
        const excelData =
          data?.data?.map((item, index) => ({
            no: index + 1,
            id: item?.id,
            username: item?.user?.username || item?.user_id,
            nip: item?.employee_number || "-",
            role: item?.user?.role || "-",
            type: item?.type,
            siasn_service: upperCase(item?.siasn_service),
            tanggal: dayjs(item?.created_at).format("DD/MM/YYYY"),
            waktu: dayjs(item?.created_at).format("HH:mm:ss"),
            created_at: item?.created_at,
          })) || [];

        excelData.forEach((item) => {
          worksheet.addRow(item);
        });

        // Styling header
        worksheet.getRow(1).eachCell((cell) => {
          cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFF4500" },
          };
          cell.alignment = { horizontal: "center", vertical: "center" };
        });

        const excelBuffer = await workbook.xlsx.writeBuffer();
        const excelBlob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const currentDate = dayjs().format("YYYY-MM-DD_HH-mm-ss");
        const bulanFilter = bulan
          ? `_${dayjs(bulan, "YYYY-MM").locale("id").format("MMMM-YYYY")}`
          : "";
        const mandiriFilter = mandiri ? "_Mandiri" : "";
        const filename = `Log-SIASN_${currentDate}${bulanFilter}${mandiriFilter}.xlsx`;

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
    const payload = {
      ...router?.query,
      limit: -1,
    };
    downloadLog(payload);
  };

  const showModalInformation = (record) => {
    setSelectedRecord(record);
    setModalOpened(true);
  };

  const columns = [
    {
      title: "Pengguna",
      key: "user",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Avatar
            src={record.user?.image}
            size={36}
            style={{
              border: "2px solid #f0f0f0",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
          >
            {!record.user?.image && <UserOutlined />}
          </Avatar>
          <div style={{ lineHeight: "1.1" }}>
            <div>
              <Text fw={600} size="xs">{record.user?.username || record.user_id}</Text>
            </div>
            {record.user?.employee_number && (
              <div style={{ marginTop: "0px" }}>
                <Text size="10px" c="dimmed">
                  {record.user.employee_number}
                </Text>
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "Target NIP",
      dataIndex: "employee_number",
      key: "employee_number",
      width: 140,
      render: (text, record) => {
        const isSelfUpdate = record?.user?.employee_number === text;
        return (
          <div>
            {isSelfUpdate ? (
              <Badge
                color="orange"
                size="sm"
                leftSection={<div style={{ display: "flex", alignItems: "center" }}><IconUser size={12} /></div>}
                styles={{
                  section: { display: "flex", alignItems: "center" },
                  label: { display: "flex", alignItems: "center" }
                }}
              >
                MANDIRI
              </Badge>
            ) : (
              <Text fw={500} size="xs">{text}</Text>
            )}
          </div>
        );
      },
    },
    {
      title: "Service",
      dataIndex: "siasn_service",
      key: "siasn_service",
      width: 150,
      render: (text) => (
        <Badge
          color="blue"
          variant="light"
          size="sm"
          leftSection={<div style={{ display: "flex", alignItems: "center" }}><IconDatabase size={12} /></div>}
          styles={{
            section: { display: "flex", alignItems: "center" },
            label: { display: "flex", alignItems: "center" }
          }}
        >
          {text?.toUpperCase()}
        </Badge>
      ),
    },
    {
      title: "Tipe",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (text) => {
        const getTypeIcon = (type) => {
          const typeMap = {
            SAVE: <IconUpload size={12} />,
            UPDATE: <IconEdit size={12} />,
            DELETE: <IconTrash size={12} />,
            SYNC: <IconRefresh size={12} />,
            UPLOAD: <IconUpload size={12} />,
            DOWNLOAD: <IconDownload size={12} />,
            VIEW: <IconEye size={12} />,
          };
          return typeMap[type?.toUpperCase()] || <IconUser size={12} />;
        };

        return (
          <Badge
            variant="outline"
            size="sm"
            leftSection={<div style={{ display: "flex", alignItems: "center" }}>{getTypeIcon(text)}</div>}
            styles={{
              section: { display: "flex", alignItems: "center" },
              label: { display: "flex", alignItems: "center" }
            }}
          >
            {text?.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      title: "Waktu",
      dataIndex: "created_at",
      key: "created_at",
      width: 120,
      render: (text) => (
        <Tooltip title={dayjs(text).format("DD-MM-YYYY HH:mm:ss")}>
          <div style={{ lineHeight: "1.1", cursor: "pointer" }}>
            <Text size="xs">{dayjs(text).format("DD/MM/YY")}</Text>
            <div style={{ marginTop: "0px" }}>
              <Text size="10px" c="dimmed">
                {dayjs(text).format("HH:mm")}
              </Text>
            </div>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            onClick={() => gotoDetail(record?.employee_number)}
            disabled={!record?.employee_number}
            style={{
              color: "#595959",
              fontWeight: "500",
              padding: "0 8px",
            }}
          >
            Detail
          </Button>
          <Button
            type="text"
            size="small"
            onClick={() => showModalInformation(record)}
            style={{
              color: "#FF4500",
              fontWeight: "500",
              padding: "0 8px",
            }}
          >
            Data
          </Button>
        </Space>
      ),
    },
  ];

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
            <DatabaseOutlined style={{ fontSize: "24px", marginBottom: "8px" }} />
            <Title level={3} style={{ color: "white", margin: 0 }}>
              Log SIASN
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px" }}>
              Monitoring aktivitas integrasi SIASN
            </Text>
          </div>

          {/* Filter and Actions Section */}
          <div style={{ padding: "20px 0 16px 0", borderBottom: "1px solid #f0f0f0" }}>
            <Row gutter={16} align="middle" justify="space-between">
              <Col>
                <Space>
                  <Text fw={600} size="sm" c="dimmed">Filter Bulan:</Text>
                  <DatePicker
                    placeholder="Pilih Bulan"
                    picker="month"
                    value={bulan ? dayjs(bulan, "YYYY-MM") : null}
                    onChange={handleBulanChange}
                    allowClear
                    style={{ width: "160px" }}
                  />
                  <Text fw={600} size="sm" c="dimmed">Cari User:</Text>
                  <Input.Search
                    placeholder="Cari berdasarkan nama pengguna..."
                    defaultValue={search}
                    onSearch={handleSearch}
                    style={{ width: "200px" }}
                  />
                  <Checkbox
                    checked={mandiri === "true"}
                    onChange={(e) => handleMandiriChange(e.target.checked)}
                  >
                    Hanya Mandiri
                  </Checkbox>
                  {(bulan || search || mandiri) && (
                    <Button
                      type="text"
                      onClick={clearFilter}
                      style={{
                        color: "#FF4500",
                        fontWeight: "500",
                        padding: "4px 8px"
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
              columns={columns}
              dataSource={tableData}
              rowKey="id"
              loading={isLoading || isFetching}
              scroll={{ x: 890 }}
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
                onChange: handleChangePage,
                showTotal: (total, range) =>
                  `${range[0].toLocaleString('id-ID')}-${range[1].toLocaleString('id-ID')} dari ${total.toLocaleString('id-ID')} records`,
                style: { margin: "16px 0" },
              }}
              locale={{
                emptyText: (
                  <div style={{ padding: "60px", textAlign: "center" }}>
                    <DatabaseOutlined
                      style={{ fontSize: 64, color: "#d1d5db", marginBottom: 24 }}
                    />
                    <div>
                      <Text size="lg" c="dimmed">
                        Tidak ada data log
                      </Text>
                    </div>
                    <div style={{ marginTop: "8px" }}>
                      <Text size="sm" c="dimmed">
                        Belum ada aktivitas yang tercatat
                      </Text>
                    </div>
                  </div>
                ),
              }}
            />
          </div>

          {/* Modal for Data Details */}
          <Modal
            open={modalOpened}
            onCancel={() => setModalOpened(false)}
            title={
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <DatabaseOutlined style={{ color: "#FF4500" }} />
                <Text fw={600}>Detail Log SIASN</Text>
              </div>
            }
            width={900}
            centered
            footer={null}
            styles={{
              header: {
                borderBottom: "1px solid #f0f0f0",
                marginBottom: "16px",
              },
            }}
          >
          {selectedRecord && (
            <div style={{ maxHeight: 400, overflow: "auto" }}>
              <ReactJson
                src={
                  selectedRecord?.request_data
                    ? JSON.parse(selectedRecord.request_data)
                    : {}
                }
                theme="rjv-default"
                displayDataTypes={false}
                displayObjectSize={false}
                enableClipboard={true}
                collapsed={false}
                iconStyle="triangle"
              />
            </div>
          )}
        </Modal>
        </Card>
      </div>
    </div>
  );
};

export default LogSiasn;
