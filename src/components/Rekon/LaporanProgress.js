import { getLaporanProgressMasterServices } from "@/services/master.services";
import { Group, Text, Stack } from "@mantine/core";
import {
  IconChartBar,
  IconChevronDown,
  IconDownload,
  IconRefresh,
} from "@tabler/icons-react";
import {
  Button,
  Collapse,
  Progress,
  Space,
  Table,
  Tag,
  Tooltip,
  message,
} from "antd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const LaporanProgress = () => {
  const router = useRouter();
  const { opd_id } = router.query;
  const queryClient = useQueryClient();
  const [downloadingKode, setDownloadingKode] = useState(null);

  const {
    data: laporanData,
    isLoading: isLoadingLaporan,
    isFetching: isFetchingLaporan,
  } = useQuery({
    queryKey: ["laporan-progress-master", opd_id],
    queryFn: () => getLaporanProgressMasterServices({ opd_id }),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 15,
    cacheTime: 1000 * 60 * 30,
    enabled: !!opd_id,
  });

  // Refresh data function
  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: ["laporan-progress-master", opd_id],
    });
  };

  // Download Excel function
  const handleDownloadExcel = () => {
    if (!laporanData?.length) return;

    const excelData = laporanData.map((item, index) => ({
      No: index + 1,
      Item: item.item,
      Realisasi: item.realisasi,
      Total: item.total,
      "Progress (%)": Number(item.percentage?.toFixed(2)),
    }));

    // Add summary row
    excelData.push({
      No: "",
      Item: "Rata-rata",
      Realisasi: "",
      Total: "",
      "Progress (%)": Number(average.toFixed(2)),
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Progress");

    // Set column widths
    worksheet["!cols"] = [
      { wch: 5 },
      { wch: 40 },
      { wch: 12 },
      { wch: 10 },
      { wch: 15 },
    ];

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const fileName = `Progress_${opd_id}_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    saveAs(blob, fileName);
  };

  // Download detail per row
  const handleDownloadDetail = async (record) => {
    try {
      setDownloadingKode(record.kode);
      const data = await getLaporanProgressMasterServices({
        opd_id,
        kode: record.kode,
      });

      if (!data?.length) {
        message.warning("Data tidak ditemukan");
        setDownloadingKode(null);
        return;
      }

      const excelData = data.map((item, index) => ({
        No: index + 1,
        NIP: item.nip_baru,
        Status: item.status,
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Detail");

      worksheet["!cols"] = [{ wch: 5 }, { wch: 25 }, { wch: 15 }];

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const fileName = `${record.item}_${opd_id}.xlsx`;
      saveAs(blob, fileName);
      message.success(`Berhasil mengunduh ${record.item}`);
    } catch (error) {
      message.error("Gagal mengunduh data");
    } finally {
      setDownloadingKode(null);
    }
  };

  const average = useMemo(() => {
    if (!laporanData?.length) return 0;
    return (
      laporanData.reduce((acc, d) => acc + (d.percentage || 0), 0) /
      laporanData.length
    );
  }, [laporanData]);

  const getColor = (pct) => {
    if (pct >= 100) return "green";
    if (pct >= 80) return "blue";
    if (pct >= 50) return "orange";
    return "red";
  };

  const columns = [
    {
      title: "No",
      key: "no",
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Item",
      dataIndex: "item",
      key: "item",
    },
    {
      title: "Realisasi",
      key: "realisasi",
      width: 100,
      align: "center",
      render: (_, record) => `${record.realisasi}/${record.total}`,
    },
    {
      title: "Progress",
      key: "progress",
      width: 150,
      render: (_, record) => (
        <Progress
          percent={Number(record.percentage?.toFixed(1))}
          size="small"
          strokeColor={getColor(record.percentage)}
          status={record.percentage >= 100 ? "success" : "active"}
          showInfo={false}
        />
      ),
    },
    {
      title: "%",
      dataIndex: "percentage",
      key: "percentage",
      width: 80,
      align: "center",
      render: (val) => <Tag color={getColor(val)}>{val?.toFixed(1)}%</Tag>,
    },
    {
      title: "Aksi",
      key: "aksi",
      width: 60,
      align: "center",
      render: (_, record) => (
        <Tooltip title="Unduh Detail">
          <Button
            type="text"
            size="small"
            icon={<IconDownload size={14} />}
            onClick={() => handleDownloadDetail(record)}
            loading={downloadingKode === record.kode}
          />
        </Tooltip>
      ),
    },
  ];

  const collapseItems = laporanData
    ? [
        {
          key: "1",
          label: (
            <Group position="apart" style={{ width: "100%" }}>
              <Group spacing="xs">
                <IconChartBar size={16} />
                <Text size="sm" fw={500}>
                  Progress Data Kepegawaian
                </Text>
              </Group>
              <Group spacing="xs">
                <Text size="xs" c="dimmed">
                  Rata-rata:
                </Text>
                <Tag color={getColor(average)}>{average.toFixed(1)}%</Tag>
              </Group>
            </Group>
          ),
          extra: (
            <Space
              size="small"
              onClick={(e) => e.stopPropagation()}
              style={{ marginRight: 8 }}
            >
              <Tooltip title="Refresh Data">
                <Button
                  type="text"
                  size="small"
                  icon={<IconRefresh size={16} />}
                  onClick={handleRefresh}
                  loading={isFetchingLaporan}
                />
              </Tooltip>
              <Tooltip title="Unduh Excel">
                <Button
                  type="text"
                  size="small"
                  icon={<IconDownload size={16} />}
                  onClick={handleDownloadExcel}
                  disabled={!laporanData?.length}
                />
              </Tooltip>
            </Space>
          ),
          children: (
            <Table
              dataSource={laporanData}
              columns={columns}
              rowKey="item"
              size="small"
              pagination={false}
              loading={isFetchingLaporan}
              bordered
            />
          ),
        },
      ]
    : [];

  return (
    <Stack spacing="sm">
      {isLoadingLaporan && (
        <Progress percent={100} status="active" showInfo={false} size="small" />
      )}

      {!isLoadingLaporan && laporanData && (
        <Collapse
          items={collapseItems}
          expandIcon={({ isActive }) => (
            <IconChevronDown
              size={16}
              style={{
                transform: isActive ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
          )}
        />
      )}
    </Stack>
  );
};

export default LaporanProgress;
