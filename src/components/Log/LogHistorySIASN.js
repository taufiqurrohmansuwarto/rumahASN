import {
  Button,
  Card,
  Collapse,
  Flex,
  message,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import ExcelJS from "exceljs";

import { saveAs } from "file-saver";

import { logSIASN } from "@/services/log.services";

import {
  CalendarOutlined,
  FileExcelFilled,
  HistoryOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { upperCase } from "lodash";
import { useRouter } from "next/router";
import LogSIASNFilter from "../Filter/LogSIASNFilter";

const { Title, Text } = Typography;

const showModalInformation = (item, title = "SIASN") => {
  Modal.info({
    title: `Detail Log ${title}`,
    centered: true,
    width: 800,
    content: (
      <Collapse>
        <Collapse.Panel header="Request Data" key="1">
          <div
            style={{
              maxHeight: 400,
              overflow: "auto",
            }}
          ></div>
        </Collapse.Panel>
      </Collapse>
    ),
  });
};

function LogHistorySIASN() {
  const router = useRouter();

  const query = router?.query;

  const { data, isLoading, isFetching } = useQuery(
    ["logs-siasn", query],
    () => logSIASN(query),
    {
      enabled: !!query,
      keepPreviousData: true,
    }
  );

  const gotoDetail = (nip) => {
    router.push(`/rekon/pegawai/${nip}/detail`);
  };

  const handleChangePage = (page, limit) => {
    router.push({
      pathname: "/rekon/logs",
      query: {
        ...query,
        page,
      },
    });
  };

  const columns = [
    {
      title: "User & Aksi",
      key: "user_aksi",
      width: 280,
      render: (_, text) => (
        <div style={{ padding: "16px 12px" }}>
          <div style={{ marginBottom: "8px" }}>
            <Text
              style={{ fontSize: "11px", color: "#6B7280", display: "block" }}
            >
              User:
            </Text>
            <Text
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#1F2937",
                display: "block",
                marginTop: "2px",
              }}
            >
              {text?.user?.username}
            </Text>
          </div>
          <div style={{ marginBottom: "8px" }}>
            <Text
              style={{ fontSize: "11px", color: "#6B7280", display: "block" }}
            >
              NIP:
            </Text>
            <Text
              style={{
                fontSize: "13px",
                color: "#6B7280",
                fontFamily: "monospace",
                display: "block",
                marginTop: "2px",
              }}
            >
              {text?.employee_number}
            </Text>
          </div>
          <div>
            <Text
              style={{ fontSize: "11px", color: "#6B7280", display: "block" }}
            >
              Role:
            </Text>
            <Tag color="blue" size="small" style={{ marginTop: "2px" }}>
              {text?.user?.role}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: "Aktivitas SIASN",
      key: "aktivitas",
      width: 280,
      render: (_, text) => (
        <div style={{ padding: "16px 12px" }}>
          <div style={{ marginBottom: "8px" }}>
            <Text
              style={{ fontSize: "11px", color: "#6B7280", display: "block" }}
            >
              Tipe Aksi:
            </Text>
            <Tag color="green" style={{ marginTop: "2px" }}>
              {text?.type}
            </Tag>
          </div>
          <div style={{ marginBottom: "8px" }}>
            <Text
              style={{ fontSize: "11px", color: "#6B7280", display: "block" }}
            >
              Service SIASN:
            </Text>
            <Tag color="orange" style={{ marginTop: "2px" }}>
              {upperCase(text?.siasn_service)}
            </Tag>
          </div>
          <div>
            <Text
              style={{ fontSize: "11px", color: "#6B7280", display: "block" }}
            >
              Waktu:
            </Text>
            <Text
              style={{
                fontSize: "12px",
                color: "#374151",
                display: "block",
                marginTop: "2px",
              }}
            >
              {dayjs(text?.created_at).format("DD MMM YYYY HH:mm:ss")}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      width: 120,
      align: "center",
      render: (_, text) => (
        <div style={{ padding: "16px 12px", textAlign: "center" }}>
          <Space direction="vertical" size={8}>
            <Button
              type="primary"
              size="small"
              icon={<SearchOutlined />}
              onClick={() => gotoDetail(text?.employee_number)}
              style={{
                backgroundColor: "#6366F1",
                borderColor: "#6366F1",
                width: "100%",
              }}
            >
              Detail
            </Button>
            <Button
              size="small"
              onClick={() => showModalInformation(text)}
              style={{
                width: "100%",
              }}
            >
              Show Data
            </Button>
          </Space>
        </div>
      ),
    },
  ];

  const { mutateAsync: unduh, isLoading: isLoadingUnduh } = useMutation({
    mutationFn: (data) => logSIASN(data),
    onSuccess: async (data) => {
      message.success("Berhasil mengunduh data");
    },
    onError: (error) => {
      message.error("Gagal mengunduh data");
    },
  });

  const saveAsExcel = async (data) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Log SIASN");

    worksheet.columns = [
      { header: "NIP", key: "nip" },
      { header: "Tipe", key: "type" },
      { header: "SIASN", key: "siasn_service" },
      { header: "Tgl. Dibuat", key: "created_at" },
    ];

    data.forEach((item) => {
      worksheet.addRow({
        nip: item?.employee_number,
        type: item?.type,
        siasn_service: item?.siasn_service,
        created_at: item?.created_at,
      });
    });

    const excelBuffer = await workbook.xlsx.writeBuffer();
    const excelBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(excelBlob, "Log SIASN.xlsx");
  };

  const handleUnduh = async () => {
    try {
      const payload = {
        ...router?.query,
        bulan:
          dayjs(query?.bulan).format("YYYY-MM") || dayjs().format("YYYY-MM"),
        limit: 0,
        mandiri: true,
      };
      const result = await unduh(payload);
      await saveAsExcel(result?.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#FAFAFB",
        minHeight: "100vh",
      }}
    >
      {/* Header Section */}
      <div style={{ marginBottom: "32px" }}>
        <Title
          level={2}
          style={{
            margin: 0,
            color: "#1F2937",
            fontWeight: 700,
          }}
        >
          Riwayat Log SIASN
        </Title>
        <Text
          type="secondary"
          style={{
            fontSize: "16px",
            lineHeight: "24px",
          }}
        >
          Monitoring dan tracking aktivitas integrasi SIASN
        </Text>
      </div>

      {/* Filter Section */}
      <Card
        style={{
          marginBottom: "24px",
          borderRadius: "16px",
          border: "1px solid #E5E7EB",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
        bodyStyle={{ padding: "24px" }}
      >
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Flex align="center" gap={12} justify="space-between" wrap="wrap">
            <Flex align="center" gap={12}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  backgroundColor: "#6366F1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CalendarOutlined
                  style={{ color: "white", fontSize: "18px" }}
                />
              </div>
              <Text strong style={{ color: "#374151", fontSize: "16px" }}>
                Filter & Export Data
              </Text>
            </Flex>
            <Button
              icon={<FileExcelFilled />}
              disabled={isLoadingUnduh}
              loading={isLoadingUnduh}
              onClick={handleUnduh}
              type="primary"
              style={{
                backgroundColor: "#22C55E",
                borderColor: "#22C55E",
                borderRadius: "8px",
                fontWeight: 500,
              }}
            >
              Export Excel
            </Button>
          </Flex>
          <LogSIASNFilter />
        </Space>
      </Card>

      {/* Table Section */}
      <Card
        style={{
          borderRadius: "16px",
          border: "1px solid #E5E7EB",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
        bodyStyle={{ padding: "24px" }}
      >
        <Space direction="vertical" size={24} style={{ width: "100%" }}>
          <Flex align="center" gap={12} justify="space-between" wrap="wrap">
            <Flex align="center" gap={12}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  backgroundColor: "#6366F1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <HistoryOutlined style={{ color: "white", fontSize: "18px" }} />
              </div>
              <Title level={4} style={{ margin: 0, color: "#1F2937" }}>
                Log Aktivitas
              </Title>
              {data?.total && (
                <Tag
                  color="blue"
                  style={{
                    borderRadius: "8px",
                    padding: "4px 12px",
                    fontSize: "12px",
                    fontWeight: 500,
                  }}
                >
                  {data.total} aktivitas
                </Tag>
              )}
            </Flex>
          </Flex>

          <div
            style={{
              borderRadius: "12px",
              border: "1px solid #F3F4F6",
              overflow: "hidden",
            }}
          >
            <Table
              size="middle"
              pagination={{
                total: data?.total,
                showTotal: (total, range) => (
                  <Text
                    style={{
                      color: "#6B7280",
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    Menampilkan {range[0]}-{range[1]} dari {total} log
                  </Text>
                ),
                showSizeChanger: false,
                position: ["topRight", "bottomRight"],
                current: parseInt(query?.page) || 1,
                pageSize: 15,
                onChange: handleChangePage,
                showQuickJumper: true,
                style: { marginBottom: 0 },
              }}
              columns={columns}
              loading={isLoading || isFetching}
              dataSource={data?.data}
              rowKey={(row) => row?.id}
              style={{
                backgroundColor: "white",
              }}
              scroll={{ x: 800 }}
              sticky={{
                offsetHeader: 64,
              }}
            />
          </div>
        </Space>
      </Card>
    </div>
  );
}

export default LogHistorySIASN;
