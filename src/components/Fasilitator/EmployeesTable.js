import useScrollRestoration from "@/hooks/useScrollRestoration";
import { getAllEmployeesPaging } from "@/services/master.services";
import { Badge, Text, Title } from "@mantine/core";
import {
  IconCheck,
  IconUser,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Space,
  Table,
  Tooltip,
} from "antd";
import { useRouter } from "next/router";
import EmployeesTableFilter from "../Filter/EmployeesTableFilter";
import DownloadDokumenFasilitator from "./DownloadDokumenFasilitator";
import React from "react";

const TagKomparasi = ({ komparasi, nama }) => {
  return (
    <Badge
      color={komparasi ? "green" : "red"}
      variant={komparasi ? "filled" : "light"}
      size="xs"
      leftSection={
        <div style={{ display: "flex", alignItems: "center" }}>
          {komparasi ? <IconCheck size={8} /> : <IconX size={8} />}
        </div>
      }
      styles={{
        section: { display: "flex", alignItems: "center" },
        label: { display: "flex", alignItems: "center", fontSize: "10px" },
      }}
      style={{
        margin: "1px",
      }}
    >
      {nama}
    </Badge>
  );
};



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
      width: 280,
      render: (_, row) => (
        <Space size="small">
          <Avatar
            src={row?.foto}
            size={40}
            style={{
              border: "2px solid #f0f0f0",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
            icon={<IconUser size={16} />}
          />
          <div style={{ lineHeight: "1.1" }}>
            <div>
              <Text
                fw={600}
                size="sm"
                style={{
                  cursor: "pointer",
                  textDecoration: "underline",
                  textDecorationStyle: "dotted"
                }}
                onClick={() => gotoDetail(row?.nip_master)}
              >
                {row?.nama_master}
              </Text>
            </div>
            {row?.nip_master && (
              <div style={{ marginTop: "1px" }}>
                <Text size="xs" c="dimmed" ff="monospace">
                  {row?.nip_master}
                </Text>
              </div>
            )}
            <div style={{ marginTop: "2px" }}>
              <Space wrap size={[4, 2]}>
                <Badge color="blue" variant="light" size="sm">
                  {row?.siasn?.status}
                </Badge>
                <Badge color="cyan" variant="outline" size="sm">
                  {row?.golongan_master}
                </Badge>
              </Space>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Jabatan & Unit",
      key: "jabatan_unit",
      width: 400,
      render: (_, row) => (
        <div>
          <Tooltip
            title={
              <div>
                <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                  Jabatan Lengkap:
                </div>
                <div style={{ marginBottom: "8px" }}>
                  {row?.jabatan_master || "Tidak ada"}
                </div>
                <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                  Unit Organisasi Lengkap:
                </div>
                <div>{row?.opd_master || "Tidak ada"}</div>
              </div>
            }
            placement="topLeft"
          >
            <div style={{ cursor: "help" }}>
              <Text
                size="sm"
                fw={500}
                truncate
                style={{ maxWidth: "370px", marginBottom: "4px" }}
              >
                {row?.jabatan_master?.length > 55
                  ? `${row?.jabatan_master?.substring(0, 55)}...`
                  : row?.jabatan_master || "Tidak ada"}
              </Text>
              <Text
                size="xs"
                c="dimmed"
                truncate
                style={{ maxWidth: "370px", marginBottom: "6px" }}
              >
                {row?.opd_master?.length > 60
                  ? `${row?.opd_master?.substring(0, 60)}...`
                  : row?.opd_master || "Tidak ada"}
              </Text>
            </div>
          </Tooltip>
          <Space wrap size={[2, 2]}>
            <Badge color="orange" variant="light" size="xs">
              {row?.jenjang_master || "Kosong"}
            </Badge>
            <Badge color="blue" variant="outline" size="xs">
              {row?.siasn?.jenjang_jabatan}
            </Badge>
          </Space>
        </div>
      ),
    },
    {
      title: "Validasi",
      key: "validasi",
      width: 220,
      render: (_, row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <div style={{ display: "flex", gap: "2px", flexWrap: "wrap" }}>
            <TagKomparasi
              komparasi={row?.komparasi?.nama}
              nama="Nama"
            />
            <TagKomparasi
              komparasi={row?.komparasi?.nip}
              nama="NIP"
            />
            <TagKomparasi
              komparasi={row?.siasn?.valid_nik}
              nama="NIK"
            />
          </div>
          <div style={{ display: "flex", gap: "2px", flexWrap: "wrap" }}>
            <TagKomparasi
              komparasi={row?.komparasi?.pangkat}
              nama="Pangkat"
            />
            <TagKomparasi
              komparasi={row?.komparasi?.pendidikan}
              nama="Pendidikan"
            />
            {row?.status_master !== "PPPK" && (
              <TagKomparasi
                komparasi={row?.komparasi?.jenjang_jabatan}
                nama="Jenjang"
              />
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      width: 80,
      align: "center",
      render: (_, row) => (
        <Button
          type="link"
          size="small"
          onClick={() => gotoDetail(row?.nip_master)}
          style={{
            color: "#FF4500",
            padding: "0 8px",
            height: "auto",
            fontWeight: 500,
          }}
        >
          Detail
        </Button>
      ),
    },
  ];

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
            <IconUsers size={24} style={{ marginBottom: "8px" }} />
            <Title level={3} style={{ color: "white", margin: 0 }}>
              Data Pegawai
            </Title>
            <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 14 }}>
              Sistem informasi dan rekonsiliasi data pegawai
            </Text>
          </div>

          {/* Filter Section */}
          <div
            style={{
              padding: "20px 0 16px 0",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <Text size="sm" fw={600} c="dimmed">
                  🔧 Filter & Pencarian Data
                </Text>
                <DownloadDokumenFasilitator />
              </div>
              <EmployeesTableFilter />
            </div>
          </div>

          {/* Table Section */}
          <div style={{ marginTop: "16px" }}>
            <Table
              columns={columns}
              rowKey={(row) => row?.id}
              dataSource={data?.results}
              loading={isLoading || isFetching}
              size="middle"
              scroll={{ x: 1200 }}
              style={{
                borderRadius: "12px",
                overflow: "hidden",
              }}
              pagination={{
                position: ["bottomRight"],
                current: parseInt(router?.query?.page) || 1,
                total: data?.total,
                showSizeChanger: false,
                onChange: handleChangePage,
                showTotal: (total, range) =>
                  `${range[0].toLocaleString(
                    "id-ID"
                  )}-${range[1].toLocaleString(
                    "id-ID"
                  )} dari ${total.toLocaleString("id-ID")} records`,
                style: { margin: "16px 0" },
              }}
              locale={{
                emptyText: (
                  <div style={{ padding: "40px", textAlign: "center" }}>
                    <IconUsers
                      size={48}
                      style={{ color: "#d1d5db", marginBottom: 16 }}
                    />
                    <div>
                      <Text size="md" c="dimmed">
                        Tidak ada data pegawai
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed">
                        Belum ada data untuk filter yang dipilih
                      </Text>
                    </div>
                  </div>
                ),
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default EmployeesTable;
