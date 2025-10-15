import React from "react";
import { getPengadaanProxyStats } from "@/services/siasn-services";
import { useQuery, useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { Card, Table, Typography, Space, Button, message } from "antd";
import {
  BarChartOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { Text, Badge } from "@mantine/core";
import { IconUsers, IconFileCheck, IconChartBar } from "@tabler/icons-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const { Title } = Typography;

function LayananPengadaanStats({ tahun }) {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["pengadaan-proxy-stats", tahun],
    queryFn: () => getPengadaanProxyStats({ tahun: tahun }),
    refetchOnWindowFocus: false,
    enabled: !!tahun,
  });

  const { mutate: downloadStats, isLoading: isMutating } = useMutation({
    mutationFn: (params) => getPengadaanProxyStats(params),
    onSuccess: (data) => {
      try {
        const excelDataDetail =
          data?.data?.map((item, index) => ({
            No: index + 1,
            "Jenis Formasi": item.jenis_formasi_nama,
            "Status Usulan": item.status_usulan_nama,
            Total: parseInt(item.total),
            Periode: data.periode,
          })) || [];

        const excelDataFormasi =
          data?.data_formasi?.map((item, index) => ({
            No: index + 1,
            "Jenis Formasi": item.jenis_formasi_nama,
            Total: parseInt(item.total),
            Periode: data.periode,
          })) || [];

        const workbook = XLSX.utils.book_new();

        // Sheet 1: Detail per Status
        const worksheetDetail = XLSX.utils.json_to_sheet(excelDataDetail);
        const columnWidthsDetail = [
          { wch: 5 },
          { wch: 25 },
          { wch: 40 },
          { wch: 10 },
          { wch: 10 },
        ];
        worksheetDetail["!cols"] = columnWidthsDetail;

        const headerRangeDetail = XLSX.utils.decode_range(
          worksheetDetail["!ref"]
        );
        for (
          let col = headerRangeDetail.s.c;
          col <= headerRangeDetail.e.c;
          col++
        ) {
          const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
          if (!worksheetDetail[cellAddress]) continue;
          worksheetDetail[cellAddress].s = {
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

        // Sheet 2: Summary per Jenis Formasi
        const worksheetFormasi = XLSX.utils.json_to_sheet(excelDataFormasi);
        const columnWidthsFormasi = [
          { wch: 5 },
          { wch: 30 },
          { wch: 15 },
          { wch: 10 },
        ];
        worksheetFormasi["!cols"] = columnWidthsFormasi;

        const headerRangeFormasi = XLSX.utils.decode_range(
          worksheetFormasi["!ref"]
        );
        for (
          let col = headerRangeFormasi.s.c;
          col <= headerRangeFormasi.e.c;
          col++
        ) {
          const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
          if (!worksheetFormasi[cellAddress]) continue;
          worksheetFormasi[cellAddress].s = {
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

        XLSX.utils.book_append_sheet(
          workbook,
          worksheetDetail,
          "Detail Status"
        );
        XLSX.utils.book_append_sheet(
          workbook,
          worksheetFormasi,
          "Summary Formasi"
        );

        const currentDate = dayjs().format("YYYY-MM-DD_HH-mm-ss");
        const filename = `Statistik-Pengadaan-${data.periode}_${currentDate}.xlsx`;

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

  const handleDownloadStats = () => {
    downloadStats({ tahun });
  };

  const columns = [
    {
      title: "Jenis Formasi",
      dataIndex: "jenis_formasi_nama",
      key: "jenis_formasi_nama",
      width: 200,
      render: (text) => (
        <Badge
          color="blue"
          size="sm"
          variant="light"
          leftSection={
            <div style={{ display: "flex", alignItems: "center" }}>
              <IconUsers size={12} />
            </div>
          }
          styles={{
            section: { display: "flex", alignItems: "center" },
            label: { display: "flex", alignItems: "center" },
          }}
        >
          {text}
        </Badge>
      ),
    },
    {
      title: "Status Usulan",
      dataIndex: "status_usulan_nama",
      key: "status_usulan_nama",
      width: 300,
      render: (text) => (
        <Badge
          color="orange"
          size="sm"
          variant="outline"
          leftSection={
            <div style={{ display: "flex", alignItems: "center" }}>
              <IconFileCheck size={12} />
            </div>
          }
          styles={{
            section: { display: "flex", alignItems: "center" },
            label: { display: "flex", alignItems: "center" },
          }}
        >
          {text}
        </Badge>
      ),
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      width: 120,
      align: "center",
      render: (text) => (
        <Text fw={600} size="sm" style={{ color: "#FF4500" }}>
          {parseInt(text).toLocaleString("id-ID")}
        </Text>
      ),
    },
  ];

  const columnsFormasi = [
    {
      title: "Jenis Formasi",
      dataIndex: "jenis_formasi_nama",
      key: "jenis_formasi_nama",
      width: 300,
      render: (text) => (
        <Badge
          color="blue"
          size="md"
          variant="light"
          leftSection={
            <div style={{ display: "flex", alignItems: "center" }}>
              <IconUsers size={14} />
            </div>
          }
          styles={{
            section: { display: "flex", alignItems: "center" },
            label: { display: "flex", alignItems: "center" },
          }}
        >
          {text}
        </Badge>
      ),
    },
    {
      title: "Total Keseluruhan",
      dataIndex: "total",
      key: "total",
      width: 200,
      align: "center",
      render: (text) => (
        <Text fw={700} size="md" style={{ color: "#FF4500" }}>
          {parseInt(text).toLocaleString("id-ID")}
        </Text>
      ),
    },
  ];

  const tableData = data?.data || [];
  const tableDataFormasi = data?.data_formasi || [];

  return (
    <Card
      style={{
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        border: "none",
        marginTop: "16px",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          background: "#FF4500",
          color: "white",
          padding: "20px",
          textAlign: "center",
          borderRadius: "12px 12px 0 0",
          margin: "-24px -24px 0 -24px",
        }}
      >
        <BarChartOutlined style={{ fontSize: "24px", marginBottom: "8px" }} />
        <Title level={4} style={{ color: "white", margin: 0 }}>
          Statistik Pengadaan ASN
        </Title>
        <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px" }}>
          Periode {data?.periode || tahun}
        </Text>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          padding: "16px 0",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Space>
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
            onClick={handleDownloadStats}
            style={{
              background: "#FF4500",
              borderColor: "#FF4500",
              borderRadius: 6,
              fontWeight: 500,
            }}
          >
            Unduh Statistik
          </Button>
        </Space>
      </div>

      {/* Summary Cards */}
      {tableDataFormasi.length > 0 && (
        <div style={{ padding: "20px 0 10px 0" }}>
          <Title level={5} style={{ marginBottom: 16, color: "#595959" }}>
            <IconChartBar size={18} style={{ marginRight: 8 }} />
            Ringkasan per Jenis Formasi
          </Title>
          <Table
            columns={columnsFormasi}
            dataSource={tableDataFormasi}
            rowKey={(record) => record.jenis_formasi_nama}
            loading={isLoading}
            pagination={false}
            size="small"
            style={{
              borderRadius: "8px",
              overflow: "hidden",
              marginBottom: 24,
            }}
          />
        </div>
      )}

      {/* Table Section */}
      <div style={{ marginTop: "16px" }}>
        <Title level={5} style={{ marginBottom: 16, color: "#595959" }}>
          <IconFileCheck size={18} style={{ marginRight: 8 }} />
          Detail per Status Usulan
        </Title>
        <Table
          columns={columns}
          dataSource={tableData}
          rowKey={(record, index) =>
            `${record.jenis_formasi_nama}-${record.status_usulan_nama}-${index}`
          }
          loading={isLoading}
          scroll={{ x: 680 }}
          size="small"
          style={{
            borderRadius: "12px",
            overflow: "hidden",
          }}
          pagination={{
            position: ["bottomRight"],
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total, range) =>
              `${range[0].toLocaleString("id-ID")}-${range[1].toLocaleString(
                "id-ID"
              )} dari ${total.toLocaleString("id-ID")} records`,
            style: { margin: "16px 0" },
          }}
          locale={{
            emptyText: (
              <div style={{ padding: "40px", textAlign: "center" }}>
                <BarChartOutlined
                  style={{
                    fontSize: 48,
                    color: "#d1d5db",
                    marginBottom: 16,
                  }}
                />
                <div>
                  <Text size="md" c="dimmed">
                    Tidak ada data statistik
                  </Text>
                </div>
                <div style={{ marginTop: "8px" }}>
                  <Text size="sm" c="dimmed">
                    Belum ada data pengadaan yang tercatat
                  </Text>
                </div>
              </div>
            ),
          }}
        />
      </div>
    </Card>
  );
}

export default LayananPengadaanStats;
