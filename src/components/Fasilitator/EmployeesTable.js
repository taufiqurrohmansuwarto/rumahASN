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
import { Button, Card, Space, Table, Tooltip } from "antd";
import Image from "next/image";
import { useRouter } from "next/router";
import DownloadDokumenFasilitator from "./DownloadDokumenFasilitator";
import EmployeesTableFilter from "../Filter/EmployeesTableFilter";
import React, { useState } from "react";

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

  const EmployeeAvatar = ({ foto, nama }) => {
    const [imageError, setImageError] = useState(false);

    return (
      <div
        style={{
          position: "relative",
          width: 48,
          height: 48,
          borderRadius: "6px",
          border: "1px solid #f0f0f0",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          overflow: "hidden",
          backgroundColor: "#f5f5f5",
          flexShrink: 0,
        }}
      >
        {foto && !imageError ? (
          <Image
            src={foto}
            alt={nama || "Foto Pegawai"}
            fill
            sizes="48px"
            style={{ objectFit: "cover" }}
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#e8e8e8",
            }}
          >
            <IconUser size={20} style={{ color: "#999" }} />
          </div>
        )}
      </div>
    );
  };

  const columns = [
    {
      title: "Pegawai",
      key: "pegawai",
      width: 280,
      render: (_, row) => (
        <Space size="small">
          <EmployeeAvatar foto={row?.foto} nama={row?.nama_master} />
          <Stack spacing={2}>
            <Text
              fw={600}
              size="xs"
              style={{
                cursor: "pointer",
                color: "#1890ff",
              }}
              onClick={() => gotoDetail(row?.nip_master)}
              lineClamp={1}
            >
              {row?.nama_master}
            </Text>
            <Text size="10px" c="dimmed" ff="monospace">
              {row?.nip_master}
            </Text>
            <Group spacing={4}>
              <MantineBadge
                color={row?.status_master === "PNS" ? "blue" : "cyan"}
                variant="light"
                size="xs"
                tt="none"
              >
                {row?.status_master}
              </MantineBadge>
              <MantineBadge color="gray" variant="outline" size="xs" tt="none">
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
      width: 380,
      render: (_, row) => (
        <Tooltip
          title={
            <Stack spacing={6}>
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
          <Stack spacing={2}>
            <Group spacing={4}>
              <IconBriefcase size={12} style={{ color: "#888" }} />
              <Text size="xs" fw={500} lineClamp={1}>
                {row?.jabatan_master || "-"}
              </Text>
            </Group>
            <Group spacing={4}>
              <IconBuilding size={12} style={{ color: "#888" }} />
              <Text size="10px" c="dimmed" lineClamp={1}>
                {row?.opd_master || "-"}
              </Text>
            </Group>
            <div>
              <MantineBadge color="orange" variant="light" size="xs" tt="none">
                {row?.jenjang_master
                  ? row?.prodi_master
                    ? `${row.jenjang_master} (${row.prodi_master})`
                    : row.jenjang_master
                  : "Belum ada jenjang"}
              </MantineBadge>
            </div>
          </Stack>
        </Tooltip>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      width: 70,
      align: "center",
      render: (_, row) => (
        <Tooltip title="Lihat Detail">
          <Button
            type="primary"
            size="small"
            icon={<IconEye size={14} />}
            onClick={() => gotoDetail(row?.nip_master)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Card>
      <Stack spacing="sm">
        {/* Header */}
        <Group position="apart" align="center">
          <Group spacing={6}>
            <IconUsers size={18} style={{ color: "#1890ff" }} />
            <Text size="md" fw={600}>
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
            size: "small",
            showTotal: (total, range) =>
              `${range[0].toLocaleString("id-ID")}-${range[1].toLocaleString(
                "id-ID"
              )} dari ${total.toLocaleString("id-ID")} data`,
          }}
          locale={{
            emptyText: (
              <Stack align="center" spacing={6} style={{ padding: 30 }}>
                <IconUsers size={40} style={{ color: "#d1d5db" }} />
                <Text size="xs" c="dimmed">
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
