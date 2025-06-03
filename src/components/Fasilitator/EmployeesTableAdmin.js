import { getAllEmployeesPagingAdmin } from "@/services/master.services";
import { capitalizeWords } from "@/utils/client-utils";
import {
  CheckCircleOutlined,
  CloseOutlined,
  SearchOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
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
import ReportEmployeeMaster from "../Admin/ReportEmployeeMaster";
import EmployeesTableFilterAdmin from "../Filter/EmployeesTableFilterAdmin";

const { Title, Text } = Typography;

const TagKomparasi = ({ komparasi, nama }) => {
  return (
    <Tag
      icon={komparasi ? <CheckCircleOutlined /> : <CloseOutlined />}
      color={komparasi ? "success" : "error"}
      style={{
        borderRadius: "6px",
        fontSize: "10px",
        fontWeight: 500,
        padding: "1px 6px",
        margin: "1px",
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
      title: "Pegawai",
      key: "pegawai",
      width: 320,
      render: (_, row) => (
        <div style={{ padding: "16px 12px" }}>
          <Flex gap={16} align="center">
            <Avatar
              onClick={() => gotoDetail(row?.nip_master)}
              style={{
                cursor: "pointer",
                borderRadius: "8px",
                border: "2px solid #E5E7EB",
                flexShrink: 0,
              }}
              size={100}
              shape="square"
              src={row?.foto}
              alt="foto"
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Typography.Link
                strong
                onClick={() => gotoDetail(row?.nip_master)}
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#1F2937",
                  display: "block",
                  marginBottom: "6px",
                  lineHeight: "1.4",
                }}
              >
                {row?.nama_master}
              </Typography.Link>
              <Text
                style={{
                  fontSize: "13px",
                  color: "#6B7280",
                  fontFamily: "monospace",
                  display: "block",
                  marginBottom: "8px",
                  lineHeight: "1.3",
                }}
              >
                {row?.nip_master}
              </Text>
              <Space wrap size={[6, 4]}>
                <Tag color="blue" size="small" style={{ fontSize: "11px" }}>
                  {row?.siasn?.status}
                </Tag>
                <Tag color="cyan" size="small" style={{ fontSize: "11px" }}>
                  {row?.golongan_master}
                </Tag>
              </Space>
            </div>
          </Flex>
        </div>
      ),
    },
    {
      title: "Jabatan & Pendidikan",
      key: "jabatan_pendidikan",
      width: 280,
      render: (_, row) => (
        <div style={{ padding: "16px 12px" }}>
          <div style={{ marginBottom: "8px" }}>
            <Text
              style={{ fontSize: "11px", color: "#6B7280", display: "block" }}
            >
              Jabatan:
            </Text>
            <Text
              style={{
                fontSize: "12px",
                fontWeight: 500,
                display: "block",
                marginTop: "2px",
                wordBreak: "break-word",
              }}
            >
              {row?.jabatan_master || "Tidak ada"}
            </Text>
          </div>
          <div style={{ marginBottom: "8px" }}>
            <Text
              style={{ fontSize: "11px", color: "#6B7280", display: "block" }}
            >
              Pendidikan:
            </Text>
            <Tag color="orange" size="small" style={{ marginTop: "2px" }}>
              {row?.jenjang_master || "Kosong"}
            </Tag>
          </div>
          <div>
            <Text
              style={{ fontSize: "11px", color: "#6B7280", display: "block" }}
            >
              Jenjang Jabatan:
            </Text>
            <Tag color="geekblue" size="small" style={{ marginTop: "2px" }}>
              {row?.siasn?.jenjang_jabatan}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: "Unit Organisasi",
      key: "unit_organisasi",
      width: 280,
      render: (_, row) => (
        <div style={{ padding: "16px 12px" }}>
          <div style={{ marginBottom: "8px" }}>
            <Text
              style={{ fontSize: "11px", color: "#6B7280", display: "block" }}
            >
              Perangkat Daerah:
            </Text>
            <Text
              style={{
                fontSize: "12px",
                fontWeight: 500,
                wordBreak: "break-word",
                display: "block",
                marginTop: "2px",
              }}
            >
              {row?.opd_master || "Tidak ada"}
            </Text>
          </div>
          <div>
            <Text
              style={{ fontSize: "11px", color: "#6B7280", display: "block" }}
            >
              Unit Organisasi SIASN:
            </Text>
            <Text
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "#059669",
                wordBreak: "break-word",
                display: "block",
                marginTop: "2px",
              }}
            >
              {row?.siasn?.unor || "Tidak ada"}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Status Validasi",
      key: "validasi",
      width: 280,
      render: (_, row) => (
        <div style={{ padding: "16px 12px" }}>
          <Text
            style={{
              fontSize: "11px",
              fontWeight: 500,
              color: "#374151",
              display: "block",
              marginBottom: "6px",
            }}
          >
            Data Validasi:
          </Text>
          <div style={{ marginBottom: "4px" }}>
            <TagKomparasi komparasi={row?.komparasi?.nama} nama="Nama" />
            <TagKomparasi komparasi={row?.komparasi?.nip} nama="NIP" />
            <TagKomparasi komparasi={row?.siasn?.valid_nik} nama="NIK" />
            <TagKomparasi komparasi={row?.komparasi?.email} nama="Email" />
          </div>
          <div>
            <TagKomparasi komparasi={row?.komparasi?.pangkat} nama="Pangkat" />
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
        <div style={{ padding: "16px 12px", textAlign: "center" }}>
          <Tooltip title="Lihat Detail">
            <Button
              type="primary"
              shape="circle"
              icon={<SearchOutlined />}
              onClick={() => gotoDetail(row?.nip_master)}
              style={{
                backgroundColor: "#6366F1",
                borderColor: "#6366F1",
              }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#FAFAFB",
        minHeight: "100vh",
      }}
    >
      {/* Header Section */}
      <div style={{ marginBottom: "32px" }}>
        <Title
          level={2}
          style={{
            margin: 0,
            color: "#1F2937",
            fontWeight: 700,
          }}
        >
          Data Pegawai Admin
        </Title>
        <Text
          type="secondary"
          style={{
            fontSize: "16px",
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
                backgroundColor: "#6366F1",
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
                  backgroundColor: "#6366F1",
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
              size="middle"
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
              }}
              loading={isLoading || isFetching}
              rowKey={(row) => row?.id}
              style={{
                backgroundColor: "white",
              }}
              scroll={{ x: 1300 }}
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
