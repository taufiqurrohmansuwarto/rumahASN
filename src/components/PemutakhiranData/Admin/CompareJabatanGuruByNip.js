import { rwJabGuruByNip } from "@/services/master.services";
import {
  Badge as MantineBadge,
  Text as MantineText,
} from "@mantine/core";
import { IconSchool } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Card, Space, Table, Typography } from "antd";
import React from "react";

function CompareJabatanGuruByNip({ nip }) {
  const { data, isLoading } = useQuery(
    ["rw-jabatan-guru", nip],
    () => rwJabGuruByNip(nip),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 500000,
    }
  );

  const columns = [
    {
      title: "Jenis PTK",
      key: "jenis_ptk",
      width: 150,
      render: (_, row) => (
        <MantineBadge size="sm" color="grape" tt="none">
          {row?.ptk?.jenis_ptk}
        </MantineBadge>
      ),
    },
    {
      title: "Sekolah",
      key: "sekolah",
      width: 250,
      render: (_, row) => (
        <div>
          <MantineText size="sm" fw={500}>
            {row?.sekolah_induk}
          </MantineText>
          {row?.sekolah_mengajar && row?.sekolah_mengajar !== row?.sekolah_induk && (
            <MantineText size="xs" c="dimmed">
              Mengajar: {row?.sekolah_mengajar}
            </MantineText>
          )}
        </div>
      ),
    },
    {
      title: "Mapel",
      key: "mapel",
      width: 150,
      render: (_, row) => (
        <MantineText size="sm" fw={500}>
          {row?.mapel?.mapel}
        </MantineText>
      ),
    },
    {
      title: "No. SK",
      dataIndex: "no_sk",
      width: 180,
      render: (no_sk, record) => (
        <div>
          <MantineText size="sm" fw={500}>
            {no_sk}
          </MantineText>
          <MantineText size="xs" c="dimmed">
            {record?.tgl_sk}
          </MantineText>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "aktif",
      width: 80,
      align: "center",
      render: (aktif) => (
        <MantineBadge
          size="sm"
          color={aktif === "Y" ? "green" : "gray"}
          tt="none"
        >
          {aktif === "Y" ? "Aktif" : "Tidak"}
        </MantineBadge>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={
          <Space>
            <IconSchool size={20} color="#eb2f96" />
            <Typography.Title level={4} style={{ margin: 0 }}>
              Jabatan Guru
            </Typography.Title>
          </Space>
        }
      >
        <Space style={{ marginBottom: 16 }}>
          <MantineText fw={600} size="sm">
            Data Jabatan Guru
          </MantineText>
          <MantineBadge size="sm" variant="light" color="grape">
            {data?.length || 0}
          </MantineBadge>
        </Space>
        <Table
          columns={columns}
          dataSource={data}
          loading={isLoading}
          rowKey={(row) => row?.guru_id}
          pagination={false}
          size="middle"
          scroll={{ x: 800 }}
          rowClassName={(record, index) =>
            index % 2 === 0 ? "table-row-light" : "table-row-dark"
          }
        />
      </Card>
    </div>
  );
}

export default CompareJabatanGuruByNip;
