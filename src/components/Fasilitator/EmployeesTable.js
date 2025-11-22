import useScrollRestoration from "@/hooks/useScrollRestoration";
import { getAllEmployeesPaging } from "@/services/master.services";
import { Badge as MantineBadge, Group, Stack, Text } from "@mantine/core";
import {
  IconBriefcase,
  IconBuilding,
  IconEye,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Button, Card, Space, Table, Tooltip } from "antd";
import { useRouter } from "next/router";
import DownloadDokumenFasilitator from "./DownloadDokumenFasilitator";
import EmployeesTableFilter from "../Filter/EmployeesTableFilter";
import React from "react";

function EmployeesTable() {
  const router = useRouter();
  useScrollRestoration();

  const { data, isLoading, isFetching } = useQuery(
    ["employees-paging", router?.query],
    () => getAllEmployeesPaging(router?.query),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const handleChangePage = (page) => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page },
    });
  };

  const gotoDetail = (nip) => {
    router.push(`/rekon/pegawai/${nip}/detail`);
  };

  const columns = [
    {
      title: "Pegawai",
      key: "pegawai",
      width: 340,
      render: (_, row) => (
        <Space size="middle">
          <Avatar
            src={row?.foto}
            size={64}
            shape="square"
            icon={<IconUser size={24} />}
            style={{
              border: "2px solid #f0f0f0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              borderRadius: "8px",
            }}
          />
          <Stack spacing={4}>
            <Text
              fw={600}
              size="sm"
              style={{
                cursor: "pointer",
                color: "#1890ff",
              }}
              onClick={() => gotoDetail(row?.nip_master)}
              lineClamp={1}
            >
              {row?.nama_master}
            </Text>
            <Text size="xs" c="dimmed" ff="monospace">
              {row?.nip_master}
            </Text>
            <Group spacing={6}>
              <MantineBadge
                color={row?.status_master === "PNS" ? "blue" : "cyan"}
                variant="light"
                size="sm"
                tt="none"
              >
                {row?.status_master}
              </MantineBadge>
              <MantineBadge color="gray" variant="outline" size="sm" tt="none">
                {row?.golongan_master}
              </MantineBadge>
            </Group>
          </Stack>
        </Space>
      ),
    },
    {
      title: "Jabatan & Unit Organisasi",
      key: "jabatan_unit",
      width: 450,
      render: (_, row) => (
        <Tooltip
          title={
            <Stack spacing={8}>
              <div>
                <Text size="xs" fw={600}>
                  Jabatan:
                </Text>
                <Text size="xs">{row?.jabatan_master || "-"}</Text>
              </div>
              <div>
                <Text size="xs" fw={600}>
                  Unit Organisasi:
                </Text>
                <Text size="xs">{row?.opd_master || "-"}</Text>
              </div>
            </Stack>
          }
          placement="topLeft"
        >
          <Stack spacing={4}>
            <Group spacing={6}>
              <IconBriefcase size={14} style={{ color: "#888" }} />
              <Text size="sm" fw={500} lineClamp={1}>
                {row?.jabatan_master || "-"}
              </Text>
            </Group>
            <Group spacing={6}>
              <IconBuilding size={14} style={{ color: "#888" }} />
              <Text size="xs" c="dimmed" lineClamp={1}>
                {row?.opd_master || "-"}
              </Text>
            </Group>
            <div>
              <MantineBadge color="orange" variant="light" size="sm" tt="none">
                {row?.jenjang_master || "Belum ada jenjang"}
              </MantineBadge>
            </div>
          </Stack>
        </Tooltip>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      width: 80,
      align: "center",
      render: (_, row) => (
        <Tooltip title="Lihat Detail">
          <Button
            type="primary"
            size="small"
            icon={<IconEye size={16} />}
            onClick={() => gotoDetail(row?.nip_master)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Card>
      <Stack spacing="md">
        {/* Header */}
        <Group position="apart" align="center">
          <Group spacing="xs">
            <IconUsers size={20} style={{ color: "#1890ff" }} />
            <Text size="lg" fw={600}>
              Data Pegawai
            </Text>
          </Group>
          <DownloadDokumenFasilitator />
        </Group>

        {/* Filter */}
        <EmployeesTableFilter />

        {/* Table */}
        <Table
          columns={columns}
          rowKey={(row) => row?.id}
          dataSource={data?.results}
          loading={isLoading || isFetching}
          size="small"
          scroll={{ x: "max-content" }}
          pagination={{
            current: parseInt(router?.query?.page) || 1,
            total: data?.total,
            showSizeChanger: false,
            onChange: handleChangePage,
            showTotal: (total, range) =>
              `${range[0].toLocaleString("id-ID")}-${range[1].toLocaleString(
                "id-ID"
              )} dari ${total.toLocaleString("id-ID")} data`,
          }}
          locale={{
            emptyText: (
              <Stack align="center" spacing="xs" style={{ padding: 40 }}>
                <IconUsers size={48} style={{ color: "#d1d5db" }} />
                <Text size="sm" c="dimmed">
                  Tidak ada data pegawai
                </Text>
              </Stack>
            ),
          }}
        />
      </Stack>
    </Card>
  );
}

export default EmployeesTable;
