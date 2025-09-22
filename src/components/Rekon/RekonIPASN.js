import React from "react";
import {
  getRekonIPASNDashboard,
  syncRekonIPASN,
} from "@/services/rekon.services";
import { Badge, Group, Skeleton, Stack, Text, Title } from "@mantine/core";
import { IconUsers, IconEye, IconRefresh } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Table, message } from "antd";
import { useRouter } from "next/router";

function RekonIPASN() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["rekon-ipasn"],
    queryFn: getRekonIPASNDashboard,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  const { mutate: syncRekonIpasn, isLoading: isSyncRekonIpasnLoading } =
    useMutation({
      mutationFn: () => syncRekonIPASN(),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["rekon-ipasn"] });
        message.success("Data berhasil disinkronisasi");
      },
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
    });

  const handleSyncRekonIpasn = () => {
    syncRekonIpasn();
  };

  const columns = [
    {
      title: "Perangkat Daerah",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      ellipsis: true,
      render: (text) => (
        <Text fw={500} size="sm">
          {text}
        </Text>
      ),
    },
    {
      title: "PNS",
      dataIndex: "rerata_total_pns",
      sorter: (a, b) => a.rerata_total_pns - b.rerata_total_pns,
      align: "center",
      render: (value) => (
        <Badge color="orange" variant="light" size="sm">
          {value}
        </Badge>
      ),
    },
    {
      title: "PPPK",
      dataIndex: "rerata_total_pppk",
      sorter: (a, b) => a.rerata_total_pppk - b.rerata_total_pppk,
      align: "center",
      render: (value) => (
        <Badge color="green" variant="outline" size="sm">
          {value}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      {/* Header Section - Actions */}
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
        <div>
          <Text size="lg" fw={600} style={{ color: "#374151" }}>
            Data IPASN Pemprov Jatim
          </Text>
          <Text size="sm" c="dimmed">
            Monitoring dan sinkronisasi informasi pegawai
          </Text>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Button
            type="default"
            icon={<IconRefresh size={14} />}
            size="small"
            loading={isSyncRekonIpasnLoading}
            disabled={isSyncRekonIpasnLoading}
            onClick={handleSyncRekonIpasn}
          >
            Sinkronkan
          </Button>
          <Button
            type="link"
            icon={<IconEye size={14} />}
            size="small"
            onClick={() => router.push("/rekon/dashboard/ipasn")}
          >
            Detail Layanan
          </Button>
        </div>
      </div>

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
              rowKey={(row) => row?.id}
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
                Tidak ada data IPASN yang tersedia saat ini
                <br />
                Coba sinkronkan data atau hubungi administrator
              </Text>
            </Stack>
          </Stack>
        )}
      </div>
    </div>
  );
}

export default RekonIPASN;
