import { rwAngkakreditMaster } from "@/services/master.services";
import { dataUtamaSIASN, getRwAngkakredit } from "@/services/siasn-services";
import {
  FileAddOutlined,
  AlertOutlined,
  CloudDownloadOutlined,
  DiffOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  Empty,
  Flex,
  Grid,
  Skeleton,
  Space,
  Table,
  Tooltip,
  Typography,
  message,
} from "antd";

const { Title, Text: AntText } = Typography;
const { useBreakpoint } = Grid;

function CompareAngkaKredit() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const isDesktop = screens.lg;

  const {
    data,
    isLoading,
    refetch: refetchSiasn,
    isFetching: isFetchingSiasn,
  } = useQuery(["angka-kredit"], () => getRwAngkakredit());

  const { data: dataUtama, isLoading: isLoadingDataUtama } = useQuery(
    ["data-utama-siasn"],
    () => dataUtamaSIASN(),
    {}
  );

  const {
    data: dataRwAngkakredit,
    isLoading: isLoadingAngkaKredit,
    refetch: refetchMaster,
    isFetching: isFetchingMaster,
  } = useQuery(["angkat-kredit-master"], () => rwAngkakreditMaster());

  const queryClient = useQueryClient();

  // Enhanced file download component
  const FileDownloadButton = ({
    filePath,
    fileName = "File",
    type = "siasn",
  }) => {
    const handleDownload = () => {
      message.loading(`Sedang mengunduh ${fileName}...`, 1);
    };

    if (!filePath)
      return (
        <AntText style={{ color: "#787C7E", fontSize: "12px" }}>
          Tidak ada file
        </AntText>
      );

    return (
      <Tooltip title={`Unduh ${fileName} Angka Kredit`} placement="top">
        <Button
          type="link"
          icon={<CloudDownloadOutlined />}
          href={`/helpdesk/api/siasn/ws/download?filePath=${filePath}`}
          target="_blank"
          rel="noreferrer"
          onClick={handleDownload}
          size={isMobile ? "small" : "middle"}
          style={{
            padding: isMobile ? "2px 6px" : "4px 8px",
            height: isMobile ? "24px" : "28px",
            borderRadius: "6px",
            backgroundColor: type === "siasn" ? "#E6F7FF" : "#FFF2E8",
            border: `1px solid ${type === "siasn" ? "#91D5FF" : "#FFD591"}`,
            color: type === "siasn" ? "#1890FF" : "#FF4500",
            fontWeight: 500,
            fontSize: isMobile ? "11px" : "12px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              type === "siasn" ? "#BAE7FF" : "#FFE7BA";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor =
              type === "siasn" ? "#E6F7FF" : "#FFF2E8";
            e.currentTarget.style.transform = "translateY(0px)";
          }}
        >
          {isMobile ? "📄" : fileName}
        </Button>
      </Tooltip>
    );
  };

  const columns = [
    {
      title: "Angka Kredit",
      responsive: ["xs"],
      key: "data",
      render: (_, record) => {
        return (
          <Card
            size="small"
            style={{
              backgroundColor: "#F8F9FA",
              border: "1px solid #EDEFF1",
              borderRadius: "8px",
              margin: "4px 0",
            }}
            bodyStyle={{ padding: "12px" }}
          >
            <Space direction="vertical" size={4}>
              <div>
                <AntText
                  style={{
                    color: "#787C7E",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  📄 File Angka Kredit
                </AntText>
                <br />
                <FileDownloadButton
                  filePath={record?.path?.[879]?.dok_uri}
                  fileName="Dokumen"
                  type="siasn"
                />
              </div>
              <div>
                <AntText
                  style={{
                    color: "#787C7E",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  📋 Nomor SK
                </AntText>
                <br />
                <AntText
                  style={{
                    color: "#1A1A1B",
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                >
                  {record?.nomorSk}
                </AntText>
              </div>
              <div>
                <AntText
                  style={{
                    color: "#787C7E",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  ⏰ Periode Penilaian
                </AntText>
                <br />
                <AntText style={{ color: "#52C41A", fontSize: "12px" }}>
                  {record?.bulanMulaiPenailan}/{record?.tahunMulaiPenailan} -{" "}
                  {record?.bulanSelesaiPenailan}/{record?.tahunSelesaiPenailan}
                </AntText>
              </div>
              <div>
                <AntText
                  style={{
                    color: "#787C7E",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  💼 Kredit
                </AntText>
                <br />
                <AntText style={{ color: "#787C7E", fontSize: "12px" }}>
                  Utama: {record?.kreditUtamaBaru} | Penunjang:{" "}
                  {record?.kreditPenunjangBaru} | Total:{" "}
                  {record?.kreditBaruTotal}
                </AntText>
              </div>
              <div>
                <AntText
                  style={{
                    color: "#787C7E",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  🏢 Nama Jabatan
                </AntText>
                <br />
                <AntText style={{ color: "#787C7E", fontSize: "12px" }}>
                  {record?.namaJabatan}
                </AntText>
              </div>
            </Space>
          </Card>
        );
      },
    },
    {
      title: "File",
      responsive: ["sm"],
      key: "path",
      render: (_, record) => {
        return (
          <FileDownloadButton
            filePath={record?.path?.[879]?.dok_uri}
            fileName="File"
            type="siasn"
          />
        );
      },
    },
    {
      title: "Nomor SK",
      dataIndex: "nomorSk",
      responsive: ["sm"],
      render: (text) => <AntText style={{ color: "#787C7E" }}>{text}</AntText>,
    },
    {
      title: "Bulan Mulai",
      dataIndex: "bulanMulaiPenailan",
      responsive: ["sm"],
      render: (text) => <AntText style={{ color: "#787C7E" }}>{text}</AntText>,
    },
    {
      title: "Tahun Mulai",
      dataIndex: "tahunMulaiPenailan",
      responsive: ["sm"],
      render: (text) => <AntText style={{ color: "#787C7E" }}>{text}</AntText>,
    },
    {
      title: "Bulan Selesai",
      dataIndex: "bulanSelesaiPenailan",
      responsive: ["sm"],
      render: (text) => <AntText style={{ color: "#787C7E" }}>{text}</AntText>,
    },
    {
      title: "Tahun Selesai",
      dataIndex: "tahunSelesaiPenailan",
      responsive: ["sm"],
      render: (text) => <AntText style={{ color: "#787C7E" }}>{text}</AntText>,
    },
    {
      title: "Kredit Utama",
      dataIndex: "kreditUtamaBaru",
      responsive: ["sm"],
      render: (text) => <AntText style={{ color: "#787C7E" }}>{text}</AntText>,
    },
    {
      title: "Kredit Penunjang",
      dataIndex: "kreditPenunjangBaru",
      responsive: ["sm"],
      render: (text) => <AntText style={{ color: "#787C7E" }}>{text}</AntText>,
    },
    {
      title: "Total Kredit",
      dataIndex: "kreditBaruTotal",
      responsive: ["sm"],
      render: (text) => <AntText style={{ color: "#787C7E" }}>{text}</AntText>,
    },
    {
      title: "Nama Jabatan",
      dataIndex: "namaJabatan",
      responsive: ["sm"],
      render: (text) => <AntText style={{ color: "#787C7E" }}>{text}</AntText>,
    },
  ];

  const columnsMaster = [
    {
      title: "Angka Kredit",
      key: "data",
      responsive: ["xs"],
      render: (_, record) => {
        return (
          <Card
            size="small"
            style={{
              backgroundColor: "#F8F9FA",
              border: "1px solid #EDEFF1",
              borderRadius: "8px",
              margin: "4px 0",
            }}
            bodyStyle={{ padding: "12px" }}
          >
            <Space direction="vertical" size={4}>
              <div>
                <AntText
                  style={{
                    color: "#787C7E",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  📄 File Angka Kredit
                </AntText>
                <br />
                <FileDownloadButton
                  filePath={record?.file_pak}
                  fileName="Dokumen"
                  type="simaster"
                />
              </div>
              <div>
                <AntText
                  style={{
                    color: "#787C7E",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  📋 Nomor SK
                </AntText>
                <br />
                <AntText
                  style={{
                    color: "#1A1A1B",
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                >
                  {record?.no_sk}
                </AntText>
              </div>
              <div>
                <AntText
                  style={{
                    color: "#787C7E",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  💼 Kredit Utama Baru
                </AntText>
                <br />
                <AntText style={{ color: "#787C7E", fontSize: "12px" }}>
                  {record?.nilai_unsur_utama_baru}
                </AntText>
              </div>
              <div>
                <AntText
                  style={{
                    color: "#787C7E",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  📊 Nilai PAK
                </AntText>
                <br />
                <AntText style={{ color: "#787C7E", fontSize: "12px" }}>
                  {record?.nilai_pak}
                </AntText>
              </div>
            </Space>
          </Card>
        );
      },
    },
    {
      title: "File",
      key: "file",
      render: (_, record) => {
        return (
          <FileDownloadButton
            filePath={record?.file_pak}
            fileName="File"
            type="simaster"
          />
        );
      },
      responsive: ["sm"],
    },
    {
      title: "Nomor SK",
      dataIndex: "no_sk",
      responsive: ["sm"],
      render: (text) => <AntText style={{ color: "#787C7E" }}>{text}</AntText>,
    },
    {
      title: "Kredit Utama Baru",
      dataIndex: "nilai_unsur_utama_baru",
      responsive: ["sm"],
      render: (text) => <AntText style={{ color: "#787C7E" }}>{text}</AntText>,
    },
    {
      title: "Nilai PAK",
      dataIndex: "nilai_pak",
      responsive: ["sm"],
      render: (text) => <AntText style={{ color: "#787C7E" }}>{text}</AntText>,
    },
  ];

  return (
    <div
      style={{
        backgroundColor: "#DAE0E6",
        padding: isMobile ? "8px" : isTablet ? "12px" : "16px",
      }}
    >
      <Skeleton
        loading={isLoading || isLoadingAngkaKredit || isLoadingDataUtama}
      >
        {dataUtama?.jenisJabatanId !== "2" ||
        dataUtama?.kedudukanPnsNama === "PPPK Aktif" ? (
          <Card
            style={{
              width: "100%",
              backgroundColor: "#FFFFFF",
              border: "1px solid #EDEFF1",
              borderRadius: "4px",
              marginBottom: isMobile ? "6px" : "8px",
              boxShadow: isMobile
                ? "0 1px 2px rgba(0,0,0,0.1)"
                : "0 2px 4px rgba(0,0,0,0.1)",
            }}
            bodyStyle={{
              padding: isMobile ? "12px" : isTablet ? "16px" : "24px",
            }}
          >
            <Empty
              description={
                <span
                  style={{
                    fontSize: isMobile ? "12px" : "14px",
                    color: "#787C7E",
                    textAlign: "center",
                    display: "block",
                    lineHeight: isMobile ? "1.4" : "1.5",
                  }}
                >
                  Tidak ada isian Angka Kredit karena Jabatan Anda Bukan JFT
                </span>
              }
              style={{
                padding: isMobile ? "20px 10px" : "40px 20px",
              }}
            />
          </Card>
        ) : (
          <>
            {/* Alert Card */}
            <Card
              style={{
                width: "100%",
                backgroundColor: "#FFFFFF",
                border: "1px solid #EDEFF1",
                borderRadius: "4px",
                marginBottom: isMobile ? "6px" : "8px",
                boxShadow: isMobile
                  ? "0 1px 2px rgba(0,0,0,0.1)"
                  : "0 2px 4px rgba(0,0,0,0.1)",
              }}
              bodyStyle={{ padding: 0 }}
            >
              <Flex>
                {/* Icon Section - Hide on mobile */}
                {!isMobile && (
                  <div
                    style={{
                      width: "40px",
                      backgroundColor: "#F8F9FA",
                      borderRight: "1px solid #EDEFF1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "100px",
                    }}
                  >
                    <AlertOutlined
                      style={{ color: "#FF4500", fontSize: "18px" }}
                    />
                  </div>
                )}

                {/* Content Section */}
                <div
                  style={{
                    flex: 1,
                    padding: isMobile ? "10px" : isTablet ? "14px" : "16px",
                  }}
                >
                  <Alert
                    message={
                      <span
                        style={{
                          fontSize: isMobile ? "12px" : "14px",
                          fontWeight: 600,
                        }}
                      >
                        Harap diperhatikan
                      </span>
                    }
                    description={
                      <span
                        style={{
                          fontSize: isMobile ? "11px" : "13px",
                          lineHeight: isMobile ? "1.4" : "1.5",
                        }}
                      >
                        Layanan Penambahan Angka Kredit SIASN secara personal
                        dihentikan sementara, silahkan hubungi fasilitator
                        kepegawaian anda untuk melakukan penambahan Angka
                        Kredit.
                      </span>
                    }
                    type="warning"
                    showIcon
                    style={{
                      backgroundColor: "#FFF7E6",
                      border: "1px solid #FFD591",
                      borderRadius: "4px",
                    }}
                  />
                </div>
              </Flex>
            </Card>

            {/* SIASN Table Card */}
            <Card
              style={{
                width: "100%",
                backgroundColor: "#FFFFFF",
                border: "1px solid #EDEFF1",
                borderRadius: "4px",
                marginBottom: isMobile ? "6px" : "8px",
                boxShadow: isMobile
                  ? "0 1px 2px rgba(0,0,0,0.1)"
                  : "0 2px 4px rgba(0,0,0,0.1)",
              }}
              bodyStyle={{ padding: 0 }}
            >
              <Flex>
                {/* Icon Section - Hide on mobile */}
                {!isMobile && (
                  <div
                    style={{
                      width: "40px",
                      backgroundColor: "#F8F9FA",
                      borderRight: "1px solid #EDEFF1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "200px",
                    }}
                  >
                    <DiffOutlined
                      style={{ color: "#1890FF", fontSize: "18px" }}
                    />
                  </div>
                )}

                {/* Content Section */}
                <div
                  style={{
                    flex: 1,
                    padding: isMobile ? "8px" : isTablet ? "12px" : "16px",
                  }}
                >
                  <Flex
                    justify="space-between"
                    align="center"
                    style={{
                      marginBottom: isMobile
                        ? "10px"
                        : isTablet
                        ? "12px"
                        : "16px",
                    }}
                    vertical={isMobile}
                    gap={isMobile ? 6 : 0}
                  >
                    <div>
                      <Title
                        level={5}
                        style={{
                          margin: 0,
                          color: "#1A1A1B",
                          fontSize: isMobile
                            ? "13px"
                            : isTablet
                            ? "15px"
                            : "16px",
                          fontWeight: 600,
                        }}
                      >
                        📋 Data Angka Kredit SIASN
                      </Title>
                      <AntText
                        style={{
                          color: "#787C7E",
                          fontSize: isMobile
                            ? "11px"
                            : isTablet
                            ? "12px"
                            : "14px",
                          lineHeight: isMobile ? "1.3" : "1.4",
                        }}
                      >
                        Riwayat angka kredit dari sistem SIASN
                      </AntText>
                    </div>
                    <Button
                      type="text"
                      icon={<ReloadOutlined />}
                      loading={isLoading || isFetchingSiasn}
                      onClick={refetchSiasn}
                      size={isMobile ? "small" : isTablet ? "small" : "middle"}
                      style={{
                        color: "#787C7E",
                        border: "1px solid #EDEFF1",
                        borderRadius: "4px",
                        fontSize: isMobile
                          ? "10px"
                          : isTablet
                          ? "12px"
                          : "14px",
                        padding: isMobile
                          ? "2px 6px"
                          : isTablet
                          ? "4px 8px"
                          : "6px 10px",
                        height: isMobile ? "28px" : isTablet ? "30px" : "32px",
                      }}
                    >
                      {isLoading || isFetchingSiasn ? "Memuat..." : "Refresh"}
                    </Button>
                  </Flex>

                  <Table
                    columns={columns}
                    rowKey={(record) => record.id}
                    pagination={false}
                    loading={isLoading || isFetchingSiasn}
                    dataSource={data}
                    size="small"
                    style={{
                      backgroundColor: "#FFFFFF",
                    }}
                    rowClassName={(record, index) =>
                      index % 2 === 0 ? "" : "table-row-light"
                    }
                  />
                </div>
              </Flex>
            </Card>

            {/* SIMASTER Table Card */}
            <Card
              style={{
                width: "100%",
                backgroundColor: "#FFFFFF",
                border: "1px solid #EDEFF1",
                borderRadius: "4px",
                marginBottom: isMobile ? "6px" : "8px",
                boxShadow: isMobile
                  ? "0 1px 2px rgba(0,0,0,0.1)"
                  : "0 2px 4px rgba(0,0,0,0.1)",
              }}
              bodyStyle={{ padding: 0 }}
            >
              <Flex>
                {/* Icon Section - Hide on mobile */}
                {!isMobile && (
                  <div
                    style={{
                      width: "40px",
                      backgroundColor: "#F8F9FA",
                      borderRight: "1px solid #EDEFF1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "200px",
                    }}
                  >
                    <DiffOutlined
                      style={{ color: "#FF4500", fontSize: "18px" }}
                    />
                  </div>
                )}

                {/* Content Section */}
                <div
                  style={{
                    flex: 1,
                    padding: isMobile ? "8px" : isTablet ? "12px" : "16px",
                  }}
                >
                  <Flex
                    justify="space-between"
                    align="center"
                    style={{
                      marginBottom: isMobile
                        ? "10px"
                        : isTablet
                        ? "12px"
                        : "16px",
                    }}
                    vertical={isMobile}
                    gap={isMobile ? 6 : 0}
                  >
                    <div>
                      <Title
                        level={5}
                        style={{
                          margin: 0,
                          color: "#1A1A1B",
                          fontSize: isMobile
                            ? "13px"
                            : isTablet
                            ? "15px"
                            : "16px",
                          fontWeight: 600,
                        }}
                      >
                        📋 Data Angka Kredit SIMASTER
                      </Title>
                      <AntText
                        style={{
                          color: "#787C7E",
                          fontSize: isMobile
                            ? "11px"
                            : isTablet
                            ? "12px"
                            : "14px",
                          lineHeight: isMobile ? "1.3" : "1.4",
                        }}
                      >
                        Riwayat angka kredit dari sistem SIMASTER
                      </AntText>
                    </div>
                    <Button
                      type="text"
                      icon={<ReloadOutlined />}
                      loading={isLoadingAngkaKredit || isFetchingMaster}
                      onClick={refetchMaster}
                      size={isMobile ? "small" : isTablet ? "small" : "middle"}
                      style={{
                        color: "#787C7E",
                        border: "1px solid #EDEFF1",
                        borderRadius: "4px",
                        fontSize: isMobile
                          ? "10px"
                          : isTablet
                          ? "12px"
                          : "14px",
                        padding: isMobile
                          ? "2px 6px"
                          : isTablet
                          ? "4px 8px"
                          : "6px 10px",
                        height: isMobile ? "28px" : isTablet ? "30px" : "32px",
                      }}
                    >
                      {isLoadingAngkaKredit || isFetchingMaster
                        ? "Memuat..."
                        : "Refresh"}
                    </Button>
                  </Flex>

                  <Table
                    columns={columnsMaster}
                    rowKey={(record) => record.pak_id}
                    pagination={false}
                    loading={isLoadingAngkaKredit || isFetchingMaster}
                    dataSource={dataRwAngkakredit}
                    size="small"
                    style={{
                      backgroundColor: "#FFFFFF",
                    }}
                    rowClassName={(record, index) =>
                      index % 2 === 0 ? "" : "table-row-light"
                    }
                  />
                </div>
              </Flex>
            </Card>
          </>
        )}
      </Skeleton>

      <style jsx global>{`
        .table-row-light {
          background-color: #fafafa !important;
        }
        .ant-table-thead > tr > th {
          background-color: #f8f9fa !important;
          border-bottom: 2px solid #edeff1 !important;
          color: #1a1a1b !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          padding: 12px 16px !important;
        }
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f0f0f0 !important;
          padding: 12px 16px !important;
          font-size: 13px !important;
        }
        .ant-table-tbody > tr:hover > td {
          background-color: #f8f9fa !important;
          transition: background-color 0.2s ease !important;
        }

        /* Mobile responsive adjustments */
        @media (max-width: 768px) {
          .ant-table-thead > tr > th {
            padding: 8px 6px !important;
            font-size: 11px !important;
            font-weight: 700 !important;
          }
          .ant-table-tbody > tr > td {
            padding: 8px 6px !important;
            font-size: 11px !important;
          }
          .ant-empty {
            margin: 10px 0 !important;
          }
          .ant-empty-description {
            color: #8c8c8c !important;
            font-size: 12px !important;
          }
        }

        /* Tablet responsive adjustments */
        @media (min-width: 768px) and (max-width: 1024px) {
          .ant-table-thead > tr > th {
            padding: 10px 12px !important;
            font-size: 12px !important;
          }
          .ant-table-tbody > tr > td {
            padding: 10px 12px !important;
            font-size: 12px !important;
          }
        }

        /* Mobile card adjustments */
        @media (max-width: 768px) {
          .ant-card-body {
            padding: 8px !important;
          }
          .ant-space-item {
            margin-bottom: 4px !important;
          }
        }

        /* Alert responsive adjustments */
        @media (max-width: 768px) {
          .ant-alert {
            padding: 8px 12px !important;
          }
          .ant-alert-message {
            margin-bottom: 4px !important;
          }
          .ant-alert-description {
            font-size: 11px !important;
            line-height: 1.4 !important;
          }
          .ant-alert-icon {
            font-size: 12px !important;
            margin-right: 4px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default CompareAngkaKredit;
