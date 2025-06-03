import { getAllEmployeesPagingAdmin } from "@/services/master.services";
import { capitalizeWords } from "@/utils/client-utils";
import {
  CheckCircleOutlined,
  CloseOutlined,
  SearchOutlined,
  UserOutlined,
  TeamOutlined,
  DatabaseOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Badge } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  Button,
  Card,
  Flex,
} from "antd";
import { useRouter } from "next/router";
import ReportEmployeeMaster from "../Admin/ReportEmployeeMaster";
import EmployeesTableFilterAdmin from "../Filter/EmployeesTableFilterAdmin";
import React from "react";

const { Title, Text } = Typography;

const TagKomparasi = ({ komparasi, nama }) => {
  return (
    <Tag
      icon={komparasi ? <CheckCircleOutlined /> : <CloseOutlined />}
      color={komparasi ? "success" : "error"}
      style={{
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: 500,
        padding: "2px 8px",
        margin: "2px",
        border: komparasi ? "1px solid #52C41A" : "1px solid #FF4D4F",
        backgroundColor: komparasi ? "#F6FFED" : "#FFF2F0",
      }}
    >
      {nama}
    </Tag>
  );
};

function EmployeesTableAdmin() {
  const router = useRouter();

  const { data, isLoading, isFetching } = useQuery(
    ["employees-paging-admin", router?.query],
    () => getAllEmployeesPagingAdmin(router?.query),
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
      title: "Foto",
      key: "foto",
      width: 120,
      render: (row) => (
        <div style={{ textAlign: "center" }}>
          <Avatar
            onClick={() => gotoDetail(row?.nip_master)}
            style={{
              cursor: "pointer",
              borderRadius: "12px",
              border: "2px solid #E5E7EB",
              transition: "all 0.2s ease",
            }}
            size={100}
            shape="square"
            src={row?.foto}
            alt="foto"
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.05)";
              e.target.style.borderColor = "#EF4444";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.borderColor = "#E5E7EB";
            }}
          />
        </div>
      ),
      fixed: true,
    },
    {
      title: "Informasi Pegawai",
      key: "informasi",
      fixed: true,
      width: 280,
      render: (_, row) => {
        return (
          <div
            style={{
              padding: "12px",
              backgroundColor: "#FEF2F2",
              borderRadius: "8px",
              border: "1px solid #FECACA",
            }}
          >
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Typography.Link
                strong
                onClick={() =>
                  router.push(`/rekon/pegawai/${row?.nip_master}/detail`)
                }
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#DC2626",
                }}
              >
                {row?.nama_master}
              </Typography.Link>
              <Typography.Text
                style={{
                  fontSize: "13px",
                  color: "#6B7280",
                  fontFamily: "monospace",
                }}
              >
                {row?.nip_master}
              </Typography.Text>
              <Space wrap size={[8, 8]}>
                <Tooltip title="Status Pegawai - Pembetulan dilakukan di SIASN">
                  <Tag
                    color="gold"
                    icon={<UserOutlined />}
                    style={{
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                  >
                    {row?.siasn?.status}
                  </Tag>
                </Tooltip>
                <Tooltip title="Jenjang Jabatan - Perbaikan dilakukan dengan menambahkan riwayat jabatan SIASN">
                  <Tag
                    color="cyan"
                    style={{
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                  >
                    {row?.siasn?.jenjang_jabatan}
                  </Tag>
                </Tooltip>
              </Space>
            </Space>
          </div>
        );
      },
    },

    {
      title: "Jabatan & Golongan",
      key: "jabatan",
      width: 280,
      render: (row) => {
        return (
          <div
            style={{
              padding: "12px",
              backgroundColor: "#F0F9FF",
              borderRadius: "8px",
              border: "1px solid #E0F2FE",
            }}
          >
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Flex gap={8} wrap="wrap">
                <Tag
                  color="blue"
                  style={{
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 500,
                  }}
                >
                  {row?.jenis_jabatan}
                </Tag>
                <Tag
                  color="geekblue"
                  style={{
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 500,
                  }}
                >
                  {row?.golongan_master}
                </Tag>
              </Flex>
              <Tag
                color="processing"
                style={{
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 500,
                  width: "100%",
                  textAlign: "center",
                }}
              >
                {row?.jabatan_master || "Tidak ada"}
              </Tag>
              <Tag
                color="purple"
                style={{
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 500,
                  width: "100%",
                  textAlign: "center",
                }}
              >
                {capitalizeWords(row?.siasn?.nama_jabatan) || "Tidak ada"}
              </Tag>
            </Space>
          </div>
        );
      },
    },
    {
      title: "Jenjang & Pendidikan",
      key: "jenjang_pendidikan_master",
      width: 280,
      render: (row) => (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#FFFBEB",
            borderRadius: "8px",
            border: "1px solid #FDE68A",
          }}
        >
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Text
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "#374151",
              }}
            >
              SIMASTER:
            </Text>
            <Tag color="orange">{row?.jenjang_master || "Kosong"}</Tag>
            <Text
              style={{
                fontSize: "12px",
                color: "#6B7280",
                display: "block",
              }}
            >
              {row?.jenjang_master} {row?.prodi_master}
            </Text>
            <Text
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "#374151",
                marginTop: "8px",
              }}
            >
              SIASN:
            </Text>
            <Tag color="gold">{row?.siasn?.jenjang || "Tidak ada"}</Tag>
          </Space>
        </div>
      ),
    },
    {
      title: "Perangkat Daerah",
      dataIndex: "opd_master",
      width: 250,
      render: (text) => (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#F3F4F6",
            borderRadius: "8px",
            border: "1px solid #D1D5DB",
          }}
        >
          <Text
            style={{
              fontSize: "13px",
              color: "#374151",
              fontWeight: 500,
              wordBreak: "break-word",
            }}
          >
            {text || "Tidak ada"}
          </Text>
        </div>
      ),
    },
    {
      title: "Unor SIASN",
      key: "unor_siasn",
      width: 250,
      render: (row) => (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#ECFDF5",
            borderRadius: "8px",
            border: "1px solid #A7F3D0",
          }}
        >
          <Text
            style={{
              fontSize: "13px",
              color: "#065F46",
              fontWeight: 500,
              wordBreak: "break-word",
            }}
          >
            {row?.siasn?.unor || "Tidak ada"}
          </Text>
        </div>
      ),
    },
    {
      title: "Hasil Validasi",
      key: "hasil",
      width: 400,
      render: (row) => {
        return (
          <div
            style={{
              padding: "12px",
              backgroundColor: "#FEFFFE",
              borderRadius: "8px",
              border: "1px solid #ECFDF5",
            }}
          >
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Text
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#374151",
                  marginBottom: "4px",
                }}
              >
                Validasi Data:
              </Text>
              <Flex gap={4} wrap="wrap">
                <Tooltip title="Perbaikan dapat dilakukan dengan usulan perubahan nama">
                  <TagKomparasi
                    komparasi={row?.komparasi?.nama}
                    nama={"Nama"}
                  />
                </Tooltip>
                <Tooltip title="Perbaikan dapat dilakukan dengan usulan perubahan nip">
                  <TagKomparasi komparasi={row?.komparasi?.nip} nama={"NIP"} />
                </Tooltip>
                <Tooltip title="Perbaikan dapat dilakukan dengan usulan perubahan tanggal lahir">
                  <TagKomparasi
                    komparasi={row?.komparasi?.tanggal_lahir}
                    nama={"Tanggal Lahir"}
                  />
                </Tooltip>
                <Tooltip title="Perbaikan dapat dilakukan dengan melakukan verifikas NIK di SIASN atau MyASN Personal">
                  <TagKomparasi komparasi={row?.siasn?.valid_nik} nama="NIK" />
                </Tooltip>
              </Flex>
              <Flex gap={4} wrap="wrap">
                <Tooltip title="Perbaikan dapat dilakukan dengan melakukan perubahan email di SIASN">
                  <TagKomparasi
                    komparasi={row?.komparasi?.email}
                    nama="Email"
                  />
                </Tooltip>
                <TagKomparasi
                  komparasi={row?.komparasi?.pangkat}
                  nama="Pangkat"
                />
                <Tooltip title="Apabila tidak sesuai dapat dilakukan usulan pencantuman gelar">
                  <TagKomparasi
                    komparasi={row?.komparasi?.pendidikan}
                    nama="Pendidikan"
                  />
                </Tooltip>
                {row?.status_master !== "PPPK" && (
                  <Tooltip title="Dapat dilakukan pembetulan di peremajaan data SIASN/Rumah ASN">
                    <TagKomparasi
                      komparasi={row?.komparasi?.jenjang_jabatan}
                      nama="Jenjang Jabatan"
                    />
                  </Tooltip>
                )}
              </Flex>
            </Space>
          </div>
        );
      },
    },
    {
      title: "Aksi",
      key: "action",
      width: 80,
      render: (row) => {
        return (
          <Tooltip title="Lihat Detail">
            <Button
              type="primary"
              shape="circle"
              icon={<SearchOutlined />}
              onClick={() => gotoDetail(row?.nip_master)}
              style={{
                backgroundColor: "#EF4444",
                borderColor: "#EF4444",
                boxShadow: "0 2px 4px rgba(239, 68, 68, 0.2)",
              }}
            />
          </Tooltip>
        );
      },
    },
  ];

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#FAFAFB",
        minHeight: "100vh",
      }}
      className="employees-table-admin-container"
    >
      {/* Header Section */}
      <div style={{ marginBottom: "32px" }}>
        <Title
          level={2}
          style={{
            margin: 0,
            color: "#1F2937",
            fontWeight: 700,
            fontSize: "clamp(20px, 4vw, 28px)",
          }}
        >
          Data Pegawai Admin
        </Title>
        <Text
          type="secondary"
          style={{
            fontSize: "clamp(14px, 3vw, 16px)",
            lineHeight: "24px",
          }}
        >
          Panel administrasi untuk mengelola data pegawai dan rekonsiliasi
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
          <Flex align="center" gap={12}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                backgroundColor: "#8B5CF6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SettingOutlined style={{ color: "white", fontSize: "18px" }} />
            </div>
            <Text strong style={{ color: "#374151", fontSize: "16px" }}>
              Filter & Laporan Admin
            </Text>
          </Flex>
          <EmployeesTableFilterAdmin />
          <ReportEmployeeMaster />
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
                  backgroundColor: "#EF4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TeamOutlined style={{ color: "white", fontSize: "18px" }} />
              </div>
              <Title level={4} style={{ margin: 0, color: "#1F2937" }}>
                Administrasi Pegawai
              </Title>
              {data?.total && (
                <Tag
                  color="red"
                  style={{
                    borderRadius: "8px",
                    padding: "4px 12px",
                    fontSize: "12px",
                    fontWeight: 500,
                  }}
                >
                  {data.total} pegawai
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
              size="large"
              columns={columns}
              dataSource={data?.results}
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
                    Menampilkan {range[0]}-{range[1]} dari {total} pegawai
                  </Text>
                ),
                showSizeChanger: false,
                position: ["topRight", "bottomRight"],
                current: parseInt(router?.query?.page) || 1,
                defaultCurrent: 1,
                onChange: handleChangePage,
                showQuickJumper: true,
                style: { marginBottom: 0 },
                responsive: true,
              }}
              loading={isLoading || isFetching}
              rowKey={(row) => row?.id}
              style={{
                backgroundColor: "white",
              }}
              scroll={{ x: 1400 }}
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

export default EmployeesTableAdmin;
