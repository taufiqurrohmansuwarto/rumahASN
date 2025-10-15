import { dashboardKPJatim } from "@/services/rekon.services";
import { Badge, Group, Skeleton, Stack, Text, Title } from "@mantine/core";
import {
  IconUsers,
  IconCalendar,
  IconFileText,
  IconEye,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Table, DatePicker, Button } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useRouter } from "next/router";
import GenerateRingkasanAnalisis from "./GenerateRingkasanAnalisis";
import ShowRingkasanAnalisis from "./ShowRingkasanAnalisis";
const queryFormat = "DD-MM-YYYY";
const DEFAULT_PERIODE = "01-06-2025";

const getFirstDayOfMonth = (date) => {
  return dayjs(date).startOf("month").format(queryFormat);
};

function RekonLayananPangkat() {
  const [period, setPeriod] = useState(null);
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboardKPJatim", period],
    queryFn: () =>
      dashboardKPJatim({
        periode: period ? getFirstDayOfMonth(period) : DEFAULT_PERIODE,
      }),
    refetchOnWindowFocus: false,
  });

  const handleChange = (value) => {
    setPeriod(value);
  };

  const columns = [
    {
      title: "Perangkat Daerah",
      dataIndex: "nama_unor",
      sorter: (a, b) => a.nama_unor.localeCompare(b.nama_unor),
      ellipsis: true,
      render: (text) => (
        <Text fw={500} size="sm">
          {text}
        </Text>
      ),
    },
    {
      title: "Jumlah Usulan",
      dataIndex: "jumlah_usulan",
      sorter: (a, b) => a.jumlah_usulan - b.jumlah_usulan,
      align: "center",
      render: (value) => (
        <Badge color="orange" variant="light" size="sm">
          {value}
        </Badge>
      ),
    },
    {
      title: "TTD Pertek",
      dataIndex: "jumlah_ttd_pertek",
      sorter: (a, b) => a.jumlah_ttd_pertek - b.jumlah_ttd_pertek,
      align: "center",
      render: (value) => (
        <Badge color="green" variant="outline" size="sm">
          {value}
        </Badge>
      ),
    },
    {
      title: "SK Berhasil",
      dataIndex: "jumlah_sk_berhasil",
      sorter: (a, b) => a.jumlah_sk_berhasil - b.jumlah_sk_berhasil,
      align: "center",
      render: (value) => (
        <Badge color="yellow" variant="dot" size="sm">
          {value}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      {/* Header Section - Filter & Actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 0",
          borderBottom: "1px solid #f1f3f4",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <IconCalendar size={18} style={{ color: "#6b7280" }} />
            <Text size="sm" fw={500} style={{ color: "#374151" }}>
              Periode:
            </Text>
          </div>
          <DatePicker
            picker="month"
            format="MMMM YYYY"
            onChange={handleChange}
            defaultValue={dayjs("2025-06-01")}
            placeholder="Pilih periode"
            style={{
              width: "160px",
              borderRadius: "8px",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Button
            type="link"
            icon={<IconEye size={14} />}
            size="small"
            onClick={() => router.push("/rekon/dashboard/kenaikan-pangkat")}
          >
            Detail Layanan
          </Button>
          <GenerateRingkasanAnalisis
            periode={period ? getFirstDayOfMonth(period) : DEFAULT_PERIODE}
          />
          <ShowRingkasanAnalisis
            periode={period ? getFirstDayOfMonth(period) : DEFAULT_PERIODE}
          />
        </div>
      </div>

      {/* Summary Statistics */}
      {data?.data && data.data.length > 0 && (
        <Group
          justify="space-between"
          align="center"
          style={{
            padding: "12px 16px",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            marginBottom: "16px",
            border: "1px solid #e5e7eb",
          }}
        >
          <Text size="sm" fw={500} c="dimmed">
            Total: {data?.data?.length || 0} Perangkat Daerah
          </Text>
          <Group gap="lg">
            <Text size="sm">
              <Text component="span" fw={600} c="green">
                {data?.data
                  ?.reduce(
                    (acc, item) => acc + (parseInt(item.jumlah_usulan) || 0),
                    0
                  )
                  ?.toLocaleString("id-ID") || 0}
              </Text>
              <Text component="span" c="dimmed" ml={4}>
                usulan
              </Text>
            </Text>
            <Text size="sm">
              <Text component="span" fw={600} c="blue">
                {data?.data
                  ?.reduce(
                    (acc, item) =>
                      acc + (parseInt(item.jumlah_sk_berhasil) || 0),
                    0
                  )
                  ?.toLocaleString("id-ID") || 0}
              </Text>
              <Text component="span" c="dimmed" ml={4}>
                SK berhasil
              </Text>
            </Text>
          </Group>
        </Group>
      )}

      {/* Data Table Section */}
      <div>
        {isLoading ? (
          <Stack gap="xs">
            <Skeleton height={20} width="30%" />
            <Skeleton height={200} />
          </Stack>
        ) : data?.data && data.data.length > 0 ? (
          <div>
            <Group
              justify="space-between"
              align="center"
              style={{ marginBottom: "16px" }}
            >
              <Group gap="xs" align="center">
                <IconUsers size={16} style={{ color: "#6b7280" }} />
                <Text size="sm" fw={500} style={{ color: "#374151" }}>
                  Data Perangkat Daerah
                </Text>
              </Group>
            </Group>
            <Table
              rowKey={(row) => row?.id_unor}
              dataSource={data?.data}
              loading={isLoading}
              columns={columns}
              pagination={false}
              sortDirections={["ascend", "descend"]}
              scroll={{ x: "max-content" }}
              size="small"
              style={{
                borderRadius: "8px",
                overflow: "hidden",
              }}
            />
          </div>
        ) : (
          <Stack align="center" gap="md" style={{ padding: "40px 20px" }}>
            <IconUsers size={48} color="#d9d9d9" />
            <Stack align="center" gap="xs">
              <Title order={4} c="dimmed">
                Tidak ada data tersedia
              </Title>
              <Text c="dimmed" size="sm" ta="center">
                Tidak ada data yang tersedia untuk periode ini
                <br />
                Silakan pilih periode lain atau hubungi administrator
              </Text>
            </Stack>
          </Stack>
        )}
      </div>
    </div>
  );
}

export default RekonLayananPangkat;
