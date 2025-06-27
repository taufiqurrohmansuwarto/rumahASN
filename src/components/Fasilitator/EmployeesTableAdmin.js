import { getAllEmployeesPagingAdmin } from "@/services/master.services";
import { capitalizeWords } from "@/utils/client-utils";
import {
  IconCheck,
  IconX,
  IconSearch,
  IconSettings,
  IconUsers,
  IconUser,
  IconEye,
} from "@tabler/icons-react";
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
  Grid,
} from "antd";
import { useRouter } from "next/router";
import ReportEmployeeMaster from "../Admin/ReportEmployeeMaster";
import EmployeesTableFilterAdmin from "../Filter/EmployeesTableFilterAdmin";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const TagKomparasi = ({ komparasi, nama, isMobile }) => {
  return (
    <Tag
      icon={komparasi ? <IconCheck size={10} /> : <IconX size={10} />}
      color={komparasi ? "success" : "error"}
      style={{
        borderRadius: "4px",
        fontWeight: 500,
        padding: "1px 6px",
        margin: "1px",
      }}
    >
      {isMobile ? nama.substring(0, 3) : nama}
    </Tag>
  );
};

function EmployeesTableAdmin() {
  const router = useRouter();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;

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
      title: (
        <Space>
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconUser style={{ color: "white", fontSize: "10px" }} />
          </div>
          <Text strong style={{ color: "#1a1a1a" }}>
            👤 Pegawai
          </Text>
        </Space>
      ),
      key: "pegawai",
      width: isMobile ? 250 : 320,
      render: (_, row) => (
        <div style={{ padding: isMobile ? "8px 4px" : "12px 8px" }}>
          <Flex gap={isMobile ? 8 : 12} align="center">
            <div
              onClick={() => gotoDetail(row?.nip_master)}
              style={{
                cursor: "pointer",
                flexShrink: 0,
                position: "relative",
              }}
            >
              <Avatar
                size={isMobile ? 64 : 80}
                src={row?.foto}
                style={{
                  background: row?.foto
                    ? "transparent"
                    : "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)",
                  border: "2px solid #fff",
                  boxShadow: "0 2px 8px rgba(255, 69, 0, 0.3)",
                  transition: "all 0.3s ease",
                }}
                icon={<IconUser />}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "-2px",
                  right: "-2px",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: "#52c41a",
                  border: "2px solid #fff",
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Typography.Link
                strong
                onClick={() => gotoDetail(row?.nip_master)}
                style={{
                  fontWeight: 600,
                  color: "#1a1a1a",
                  display: "block",
                  marginBottom: "4px",
                }}
                ellipsis={{ tooltip: row?.nama_master }}
              >
                {row?.nama_master}
              </Typography.Link>
              <Text
                style={{
                  color: "#666",
                  fontFamily: "monospace",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                {row?.nip_master}
              </Text>
              <Space wrap size={[4, 2]}>
                <Tag color="blue" size="small">
                  {row?.siasn?.status}
                </Tag>
                <Tag color="cyan" size="small">
                  {row?.golongan_master}
                </Tag>
              </Space>
            </div>
          </Flex>
        </div>
      ),
    },
    ...(isMobile
      ? []
      : [
          {
            title: (
              <Space>
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "8px",
                    background:
                      "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconSettings style={{ color: "white", fontSize: "10px" }} />
                </div>
                <Text strong style={{ color: "#1a1a1a" }}>
                  🏢 Jabatan & Unit
                </Text>
              </Space>
            ),
            key: "jabatan_unit",
            width: 380,
            maxWidth: 380,
            render: (_, row) => (
              <div style={{ padding: "12px 8px" }}>
                <div style={{ marginBottom: "8px" }}>
                  <Text
                    style={{
                      fontSize: "10px",
                      color: "#666",
                      display: "block",
                      marginBottom: "2px",
                    }}
                  >
                    Jabatan:
                  </Text>
                  <Tooltip
                    title={row?.jabatan_master || "Tidak ada"}
                    placement="top"
                    overlayStyle={{ maxWidth: "300px" }}
                  >
                    <Text
                      style={{
                        fontSize: "12px",
                        fontWeight: 500,
                        display: "block",
                        wordBreak: "break-word",
                        lineHeight: "1.4",
                        maxWidth: "340px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                      }}
                    >
                      {row?.jabatan_master || "Tidak ada"}
                    </Text>
                  </Tooltip>
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <Text
                    style={{
                      fontSize: "10px",
                      color: "#666",
                      display: "block",
                      marginBottom: "2px",
                    }}
                  >
                    Unit Organisasi:
                  </Text>
                  <Text
                    style={{
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "#FF4500",
                      wordBreak: "break-word",
                      display: "block",
                      lineHeight: "1.4",
                      maxWidth: "340px",
                      whiteSpace: "normal",
                    }}
                  >
                    {row?.opd_master || "Tidak ada"}
                  </Text>
                </div>
                <Space wrap size={[4, 2]}>
                  <Tag color="orange" size="small" style={{ fontSize: "9px" }}>
                    {row?.jenjang_master || "Kosong"}
                  </Tag>
                  <Tag
                    color="geekblue"
                    size="small"
                    style={{ fontSize: "9px" }}
                  >
                    {row?.siasn?.jenjang_jabatan}
                  </Tag>
                </Space>
              </div>
            ),
          },
        ]),
    {
      title: (
        <Space>
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconCheck style={{ color: "white", fontSize: "10px" }} />
          </div>
          <Text strong style={{ color: "#1a1a1a" }}>
            ✅ Validasi
          </Text>
        </Space>
      ),
      key: "validasi",
      width: isMobile ? 180 : 240,
      render: (_, row) => (
        <div style={{ padding: isMobile ? "8px 4px" : "12px 8px" }}>
          <div style={{ marginBottom: isMobile ? "2px" : "4px" }}>
            <TagKomparasi
              komparasi={row?.komparasi?.nama}
              nama="Nama"
              isMobile={isMobile}
            />
            <TagKomparasi
              komparasi={row?.komparasi?.nip}
              nama="NIP"
              isMobile={isMobile}
            />
            <TagKomparasi
              komparasi={row?.siasn?.valid_nik}
              nama="NIK"
              isMobile={isMobile}
            />
          </div>
          <div>
            <TagKomparasi
              komparasi={row?.komparasi?.pangkat}
              nama="Pangkat"
              isMobile={isMobile}
            />
            <TagKomparasi
              komparasi={row?.komparasi?.pendidikan}
              nama="Pendidikan"
              isMobile={isMobile}
            />
            {!isMobile && row?.status_master !== "PPPK" && (
              <TagKomparasi
                komparasi={row?.komparasi?.jenjang_jabatan}
                nama="Jenjang"
                isMobile={isMobile}
              />
            )}
          </div>
        </div>
      ),
    },
    {
      title: (
        <Space>
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #722ed1 0%, #9254de 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconEye style={{ color: "white", fontSize: "10px" }} />
          </div>
          <Text strong style={{ color: "#1a1a1a" }}>
            ⚡ Aksi
          </Text>
        </Space>
      ),
      key: "action",
      width: isMobile ? 60 : 80,
      align: "center",
      render: (_, row) => (
        <div
          style={{
            padding: isMobile ? "8px 4px" : "12px 8px",
            textAlign: "center",
          }}
        >
          <Tooltip title="Lihat Detail">
            <Button
              type="primary"
              shape="circle"
              size={isMobile ? "small" : "middle"}
              icon={<IconEye size={isMobile ? 14 : 16} />}
              onClick={() => gotoDetail(row?.nip_master)}
              style={{
                backgroundColor: "#FF4500",
                borderColor: "#FF4500",
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
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <Card
        style={{
          marginBottom: isMobile ? "12px" : "20px",
          borderRadius: isMobile ? "8px" : "12px",
          border: "1px solid #e8e8e8",
        }}
      >
        <Flex align="center" gap={isMobile ? 12 : 16} wrap>
          <div
            style={{
              width: isMobile ? "40px" : "48px",
              height: isMobile ? "40px" : "48px",
              backgroundColor: "#FF4500",
              borderRadius: isMobile ? "8px" : "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconUsers size={isMobile ? 16 : 20} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <Title
              level={isMobile ? 4 : 3}
              style={{ margin: 0, color: "#1a1a1a" }}
            >
              👥 Data Pegawai Admin
            </Title>
            <Text
              type="secondary"
              style={{
                fontSize: isMobile ? "12px" : "14px",
              }}
            >
              Panel administrasi untuk mengelola data pegawai dan rekonsiliasi
            </Text>
          </div>
        </Flex>
      </Card>

      {/* Table with Filter */}
      <Card
        style={{
          borderRadius: isMobile ? "8px" : "12px",
          border: "1px solid #e8e8e8",
        }}
      >
        <Space
          direction="vertical"
          size={isMobile ? 12 : 16}
          style={{ width: "100%" }}
        >
          {/* Filter Section */}
          <div>
            <Flex
              align="center"
              gap={8}
              style={{ marginBottom: isMobile ? 8 : 12 }}
            >
              <div
                style={{
                  width: isMobile ? "16px" : "20px",
                  height: isMobile ? "16px" : "20px",
                  borderRadius: "4px",
                  background:
                    "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconSettings size={isMobile ? 10 : 12} color="white" />
              </div>
              <Text
                strong
                style={{
                  color: "#1a1a1a",
                  fontSize: isMobile ? "12px" : "14px",
                }}
              >
                🔧 Filter & Laporan
              </Text>
            </Flex>
            <EmployeesTableFilterAdmin />
            <div style={{ marginTop: isMobile ? 8 : 12 }}>
              <ReportEmployeeMaster />
            </div>
          </div>

          {/* Table */}
          <div>
            <Table
              size={isMobile ? "small" : "middle"}
              columns={columns}
              dataSource={data?.results}
              pagination={{
                current: parseInt(router?.query?.page) || 1,
                total: data?.total,
                showTotal: (total, range) => (
                  <Text
                    style={{
                      color: "#666",
                      fontSize: isMobile ? "11px" : "14px",
                    }}
                  >
                    {isMobile ? (
                      `${range[0]}-${range[1]} / ${total.toLocaleString()}`
                    ) : (
                      <>
                        Menampilkan{" "}
                        <Text strong style={{ color: "#FF4500" }}>
                          {range[0]}-{range[1]}
                        </Text>{" "}
                        dari{" "}
                        <Text strong style={{ color: "#FF4500" }}>
                          {total.toLocaleString()}
                        </Text>{" "}
                        pegawai
                      </>
                    )}
                  </Text>
                ),
                showSizeChanger: !isMobile,
                showQuickJumper: !isMobile,
                simple: isMobile,
                onChange: handleChangePage,
                style: {
                  marginTop: isMobile ? "12px" : "20px",
                  padding: isMobile ? "8px 0" : "16px 0",
                  borderTop: "1px solid #f0f0f0",
                },
              }}
              loading={isLoading || isFetching}
              rowKey={(row) => row?.id}
              scroll={{ x: isMobile ? 600 : 1200 }}
              rowClassName={(record, index) =>
                index % 2 === 0 ? "table-row-light" : "table-row-dark"
              }
            />
          </div>
        </Space>
      </Card>

      <style jsx global>{`
        .ant-table-thead > tr > th {
          background: #ffffff !important;
          color: #1a1a1a !important;
          font-weight: 600 !important;
          border-bottom: 2px solid #ff4500 !important;
          padding: ${isMobile ? "12px 8px" : "16px 12px"} !important;
          font-size: ${isMobile ? "11px" : "14px"} !important;
        }

        .ant-table-thead > tr > th:first-child {
          border-top-left-radius: 8px !important;
        }

        .ant-table-thead > tr > th:last-child {
          border-top-right-radius: 8px !important;
        }

        .table-row-light {
          background-color: #ffffff !important;
        }

        .table-row-dark {
          background-color: #fafafa !important;
        }

        .ant-table-tbody > tr:hover > td {
          background-color: #fff7e6 !important;
          transition: all 0.2s ease !important;
        }

        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f0f0f0 !important;
          padding: ${isMobile ? "8px 6px" : "12px"} !important;
          transition: all 0.2s ease !important;
        }

        .ant-pagination-item-active {
          background: linear-gradient(
            135deg,
            #ff4500 0%,
            #ff6b35 100%
          ) !important;
          border-color: #ff4500 !important;
          box-shadow: 0 2px 4px rgba(255, 69, 0, 0.3) !important;
        }

        .ant-pagination-item-active a {
          color: white !important;
          font-weight: 600 !important;
        }

        .ant-pagination-item:hover {
          border-color: #ff4500 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 2px 4px rgba(255, 69, 0, 0.2) !important;
          transition: all 0.2s ease !important;
        }

        .ant-pagination-item:hover a {
          color: #ff4500 !important;
        }

        .ant-select:not(.ant-select-disabled):hover .ant-select-selector {
          border-color: #ff4500 !important;
        }

        .ant-select-focused .ant-select-selector {
          border-color: #ff4500 !important;
          box-shadow: 0 0 0 2px rgba(255, 69, 0, 0.2) !important;
        }

        .ant-picker:hover,
        .ant-picker-focused {
          border-color: #ff4500 !important;
          box-shadow: 0 0 0 2px rgba(255, 69, 0, 0.2) !important;
        }

        .ant-table-container {
          border-radius: 8px !important;
          overflow: hidden !important;
        }

        .ant-card {
          transition: all 0.3s ease !important;
        }

        .ant-card:hover {
          border-color: #ff4500 !important;
        }

        .ant-modal-header {
          border-radius: 8px 8px 0 0 !important;
        }

        .ant-collapse-header {
          font-weight: 500 !important;
        }

        .ant-collapse-content-box {
          padding: 16px !important;
        }

        @media (max-width: 768px) {
          .ant-table-pagination {
            text-align: center !important;
          }

          .ant-pagination-simple .ant-pagination-simple-pager {
            margin: 0 8px !important;
          }
        }

        .ant-avatar:hover {
          transform: scale(1.05) !important;
          box-shadow: 0 4px 12px rgba(255, 69, 0, 0.4) !important;
        }
      `}</style>
    </div>
  );
}

export default EmployeesTableAdmin;
