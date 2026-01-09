import { getLaporanProgressMasterServices } from "@/services/master.services";
import { getUnorSimaster } from "@/services/rekon.services";
import { Group, Text, Stack } from "@mantine/core";
import { IconChartBar, IconChevronDown } from "@tabler/icons-react";
import { Card, Collapse, Progress, Table, Tag, TreeSelect } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";

const LaporanProgress = () => {
  const [selectedOpd, setSelectedOpd] = useState(null);

  const { data: unorData, isLoading: isLoadingUnor } = useQuery({
    queryKey: ["rekon-unor-simaster"],
    queryFn: () => getUnorSimaster(),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 30,
    cacheTime: 1000 * 60 * 60,
  });

  const { data: laporanData, isLoading: isLoadingLaporan } = useQuery({
    queryKey: ["laporan-progress-master", selectedOpd],
    queryFn: () => getLaporanProgressMasterServices({ opd_id: selectedOpd }),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 15,
    cacheTime: 1000 * 60 * 30,
    enabled: !!selectedOpd,
  });

  const average = useMemo(() => {
    if (!laporanData?.length) return 0;
    return laporanData.reduce((acc, d) => acc + (d.percentage || 0), 0) / laporanData.length;
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
          children: (
            <Table
              dataSource={laporanData}
              columns={columns}
              rowKey="item"
              size="small"
              pagination={false}
              loading={isLoadingLaporan}
              bordered
            />
          ),
        },
      ]
    : [];

  return (
    <Stack spacing="sm">
      <Card size="small">
        <Stack spacing="xs">
          <Text fw={600} size="sm">
            Laporan Progress Data Kepegawaian
          </Text>
          <TreeSelect
            style={{ width: "100%" }}
            showSearch
            allowClear
            placeholder="Pilih Unit Organisasi..."
            value={selectedOpd}
            treeNodeFilterProp="title"
            onChange={setSelectedOpd}
            treeData={unorData}
            loading={isLoadingUnor}
          />
        </Stack>
      </Card>

      {selectedOpd && laporanData && (
        <Collapse
          items={collapseItems}
          defaultActiveKey={["1"]}
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
