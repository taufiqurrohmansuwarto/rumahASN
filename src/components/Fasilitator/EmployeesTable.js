import useScrollRestoration from "@/hooks/useScrollRestoration";
import { getAllEmployeesPaging } from "@/services/master.services";
import { capitalizeWords } from "@/utils/client-utils";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  UserOutlined,
  TeamOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Flex,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useRouter } from "next/router";
import EmployeesTableFilter from "../Filter/EmployeesTableFilter";
import DownloadASN from "./DownloadASN";
import DownloadDokumenFasilitator from "./DownloadDokumenFasilitator";
import { useSession } from "next-auth/react";
import React from "react";

const { Title, Text } = Typography;
const TagKomparasi = ({ komparasi, nama }) => {
  return (
    <Tag
      icon={komparasi ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
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

const mappingPerangkatDaerah = (daftarPerangkatDaerah, organizationId) => {
  const result = daftarPerangkatDaerah?.map((item) => {
    const id = item?.id;
    const currentUserOrganizationId = organizationId;

    const regexOrgIdMatch = new RegExp(`^${currentUserOrganizationId}`);

    const isMatch = regexOrgIdMatch.test(id);

    return { ...item, isMatch };
  });

  return result;
};

const ExampleComponent = ({ data }) => {
  const router = useRouter();

  const handleClick = (item) => {
    if (item.isMatch) {
      router.push({
        pathname: router.pathname,
        query: { ...router.query, opd_id: item?.id },
      });
    } else {
      return;
    }
  };

  return (
    <Space direction="vertical" size={4} style={{ width: "100%" }}>
      {data?.map((item, index) => {
        return (
          <Typography.Text
            key={item.id}
            onClick={() => handleClick(item)}
            style={{
              cursor: item.isMatch ? "pointer" : "default",
              fontSize: "13px",
              color: item.isMatch ? "#1E40AF" : "#6B7280",
              fontWeight: item.isMatch ? 500 : 400,
              display: "block",
              padding: "4px 8px",
              borderRadius: "4px",
              backgroundColor: item.isMatch ? "#EFF6FF" : "transparent",
              border: item.isMatch ? "1px solid #DBEAFE" : "none",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (item.isMatch) {
                e.target.style.backgroundColor = "#DBEAFE";
                e.target.style.borderColor = "#93C5FD";
              }
            }}
            onMouseLeave={(e) => {
              if (item.isMatch) {
                e.target.style.backgroundColor = "#EFF6FF";
                e.target.style.borderColor = "#DBEAFE";
              }
            }}
          >
            {item.name}
          </Typography.Text>
        );
      })}
    </Space>
  );
};

function EmployeesTable() {
  const router = useRouter();
  useScrollRestoration();
  const { data: session } = useSession();

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
      title: "Informasi Pegawai",
      dataIndex: "nama_master",
      responsive: ["xs"],
      render: (_, row) => {
        return (
          <div
            style={{
              padding: "12px",
              backgroundColor: "#FAFAFB",
              borderRadius: "12px",
              border: "1px solid #F3F4F6",
            }}
          >
            <Flex gap={12} vertical align="start">
              <Flex gap={12} align="center">
                <Avatar
                  size={60}
                  shape="square"
                  src={row?.foto}
                  alt="foto"
                  style={{
                    borderRadius: "8px",
                    border: "2px solid #E5E7EB",
                  }}
                />
                <Space direction="vertical" size={4}>
                  <Typography.Text
                    strong
                    style={{
                      fontSize: "16px",
                      color: "#1F2937",
                      cursor: "pointer",
                    }}
                    onClick={() => gotoDetail(row?.nip_master)}
                  >
                    {row?.nama_master}
                  </Typography.Text>
                  <Typography.Text
                    style={{
                      color: "#6B7280",
                      fontSize: "14px",
                    }}
                  >
                    {row?.nip_master}
                  </Typography.Text>
                </Space>
              </Flex>

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
            </Flex>

            <div style={{ marginTop: "12px" }}>
              <Text
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#374151",
                  marginBottom: "8px",
                  display: "block",
                }}
              >
                Status Validasi:
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
            </div>
          </div>
        );
      },
    },
    {
      title: "Foto",
      key: "foto",
      responsive: ["sm"],
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
              e.target.style.borderColor = "#6366F1";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.borderColor = "#E5E7EB";
            }}
          />
        </div>
      ),
    },
    {
      title: "Nama dan Jabatan",
      key: "nama_dan_jabatan",
      responsive: ["sm"],
      width: 280,
      render: (_, row) => {
        return (
          <div
            style={{
              padding: "12px",
              backgroundColor: "#F8FAFC",
              borderRadius: "8px",
              border: "1px solid #E2E8F0",
            }}
          >
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Typography.Link
                onClick={() => gotoDetail(row?.nip_master)}
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#1E40AF",
                }}
              >
                {row?.nama_lengkap_master}
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
              <Tag
                color="processing"
                style={{
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 500,
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {row?.jabatan_master || "Tidak ada jabatan"}
              </Tag>
              <Tooltip title="Status Pegawai">
                <Tag
                  color="warning"
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
            </Space>
          </div>
        );
      },
    },
    {
      title: "Unit Kerja",
      key: "unit_kerja",
      responsive: ["sm"],
      width: 250,
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
            <ExampleComponent
              data={mappingPerangkatDaerah(
                row?.opd_master_full,
                session?.user?.organization_id
              )}
            />
          </div>
        );
      },
    },
    {
      title: "Hasil Integrasi SIASN",
      key: "hasil",
      responsive: ["sm"],
      width: 320,
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
      key: "aksi",
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
                backgroundColor: "#6366F1",
                borderColor: "#6366F1",
                boxShadow: "0 2px 4px rgba(99, 102, 241, 0.2)",
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
      className="employees-table-container"
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
          Data Pegawai
        </Title>
        <Text
          type="secondary"
          style={{
            fontSize: "clamp(14px, 3vw, 16px)",
            lineHeight: "24px",
          }}
        >
          Sistem informasi dan rekonsiliasi data pegawai
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
          <Flex align="center" gap={12} justify="space-between" wrap="wrap">
            <Flex align="center" gap={12}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  backgroundColor: "#6366F1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <DatabaseOutlined
                  style={{ color: "white", fontSize: "18px" }}
                />
              </div>
              <Text strong style={{ color: "#374151", fontSize: "16px" }}>
                Filter & Pencarian Data
              </Text>
            </Flex>
            <DownloadDokumenFasilitator />
          </Flex>
          <EmployeesTableFilter />
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
                  backgroundColor: "#22C55E",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TeamOutlined style={{ color: "white", fontSize: "18px" }} />
              </div>
              <Title level={4} style={{ margin: 0, color: "#1F2937" }}>
                Daftar Pegawai
              </Title>
              {data?.total && (
                <Tag
                  color="blue"
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
                current: parseInt(router?.query?.page) || 1,
                defaultCurrent: 1,
                onChange: handleChangePage,
                pageSize: 10,
                position: ["topRight", "bottomRight"],
                showQuickJumper: true,
                style: { marginBottom: 0 },
                responsive: true,
              }}
              loading={isLoading || isFetching}
              rowKey={(row) => row?.id}
              style={{
                backgroundColor: "white",
              }}
              size="large"
              scroll={{ x: 1200 }}
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

export default EmployeesTable;
