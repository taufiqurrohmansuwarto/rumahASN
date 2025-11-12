import {
  BookOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { Card, Empty, Flex, Space, Spin, Tag, Typography, Button } from "antd";

import { Text } from "@mantine/core";

const TableRiwayatUsulanPencantumanGelarProfesi = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 200 }}>
        <Space direction="vertical" align="center">
          <Spin size="large" />
          <Text type="secondary">Memuat data gelar...</Text>
        </Space>
      </Flex>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <Space direction="vertical" align="center">
            <Text style={{ fontSize: 16 }}>
              Belum ada data gelar yang tercatat
            </Text>
            <Card
              size="small"
              style={{
                backgroundColor: "#FFF7E6",
                border: "1px solid #FFD591",
                maxWidth: 400,
              }}
            >
              <Flex align="center" gap={8}>
                <InfoCircleOutlined style={{ color: "#AD6800" }} />
                <Text style={{ fontSize: 13, color: "#AD6800" }}>
                  Data tidak ada? Hubungi bagian kepegawaian di unit kerja Anda.
                </Text>
              </Flex>
            </Card>
          </Space>
        }
      />
    );
  }

  return (
    <Space direction="vertical" style={{ width: "100%" }} size={16}>
      {data.map((record, index) => (
        <Card
          key={record.id || index}
          size="small"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #EDEFF1",
            borderRadius: "4px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          }}
          styles={{
            header: {
              borderBottom: "1px solid #EDEFF1",
              backgroundColor: "#F8F9FA",
              padding: "8px 12px",
            },
            body: {
              padding: "12px",
            },
          }}
          title={
            <Flex align="center" gap={8}>
              <div
                style={{
                  width: 4,
                  height: 24,
                  backgroundColor:
                    record.status_usulan === "11" ? "#52C41A" : "#FA8C16",
                  borderRadius: 2,
                }}
              />
              <Text
                strong
                style={{
                  fontSize: 14,
                  color: record.status_usulan === "11" ? "#52C41A" : "#1C1C1C",
                  textShadow:
                    record.status_usulan === "11"
                      ? "0 0 8px rgba(82, 196, 26, 0.3)"
                      : "none",
                }}
              >
                {record.nama_status_usulan}
              </Text>
              {record.status_usulan === "11" && (
                <div
                  style={{
                    backgroundColor: "#52C41A",
                    color: "white",
                    fontSize: 10,
                    padding: "2px 8px",
                    borderRadius: 12,
                    fontWeight: 600,
                    boxShadow: "0 2px 4px rgba(82, 196, 26, 0.3)",
                  }}
                >
                  ✓ DITERIMA
                </div>
              )}
            </Flex>
          }
        >
          <Space direction="vertical" style={{ width: "100%" }} size={8}>
            {/* Compact Info Section */}
            <Flex gap={12} wrap="wrap">
              {/* Pendidikan */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <Flex align="center" gap={6} style={{ marginBottom: 6 }}>
                  <BookOutlined style={{ color: "#FF4500", fontSize: 12 }} />
                  <Text strong style={{ color: "#1C1C1C", fontSize: 12 }}>
                    PENDIDIKAN
                  </Text>
                </Flex>
                <div style={{ fontSize: 11, lineHeight: "16px" }}>
                  <div style={{ marginBottom: 2 }}>
                    <Tag
                      color="blue"
                      style={{
                        fontSize: 9,
                        padding: "1px 4px",
                        lineHeight: "14px",
                      }}
                    >
                      {record.tingkat_pendidikan_nama}
                    </Tag>
                  </div>
                  <Text style={{ color: "#1C1C1C", fontWeight: 500 }}>
                    {record.pendidikan_nama}
                  </Text>
                  <br />
                  <Text style={{ color: "#878A8C" }}>{record.nama_sek}</Text>
                </div>
              </div>

              {/* Gelar */}
              <div style={{ flex: 1, minWidth: 150 }}>
                <Flex align="center" gap={6} style={{ marginBottom: 6 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      backgroundColor:
                        record.status_usulan === "11" ? "#52C41A" : "#FA8C16",
                      borderRadius: "50%",
                    }}
                  />
                  <Text strong style={{ color: "#1C1C1C", fontSize: 12 }}>
                    {record.status_usulan === "11" ||
                    record.nama_status_usulan ===
                      "Profil PNS telah diperbaharui"
                      ? "GELAR TEREGISTRASI"
                      : "GELAR USULAN"}
                  </Text>
                </Flex>
                <Flex gap={4} style={{ marginBottom: 4 }}>
                  {record.gelar_depan && (
                    <Tag
                      style={{
                        backgroundColor: "#52C41A",
                        color: "white",
                        border: "none",
                        fontSize: 9,
                        padding: "1px 6px",
                        lineHeight: "14px",
                      }}
                    >
                      {record.gelar_depan}
                    </Tag>
                  )}
                  {record.gelar_belakang && (
                    <Tag
                      style={{
                        backgroundColor: "#FF7A00",
                        color: "white",
                        border: "none",
                        fontSize: 9,
                        padding: "1px 6px",
                        lineHeight: "14px",
                      }}
                    >
                      {record.gelar_belakang}
                    </Tag>
                  )}
                </Flex>
                {record.tgl_approval && (
                  <Text style={{ fontSize: 10, color: "#52C41A" }}>
                    <CalendarOutlined style={{ marginRight: 2 }} />
                    {record.tgl_approval}
                  </Text>
                )}
              </div>
            </Flex>

            {/* Catatan/Alasan Tolak jika ada */}
            {record.alasan_tolak && (
              <div
                style={{
                  backgroundColor:
                    record.status_usulan === "11" ? "#F6FFED" : "#FFF2F0",
                  border:
                    record.status_usulan === "11"
                      ? "1px solid #B7EB8F"
                      : "1px solid #FFB3BA",
                  borderRadius: "4px",
                  padding: "8px",
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    color:
                      record.status_usulan === "11" ? "#389E0D" : "#CF1322",
                    fontStyle: "italic",
                    lineHeight: "1.4",
                  }}
                >
                  <strong>
                    {record.status_usulan === "11"
                      ? "Catatan Perbaikan (Sudah Diterima):"
                      : "Catatan:"}
                  </strong>{" "}
                  {record.alasan_tolak}
                </Text>
              </div>
            )}

            {/* Download SK jika ada */}
            {record.path_sk && (
              <div>
                <Button
                  type="link"
                  size="small"
                  icon={<DownloadOutlined />}
                  href={`/helpdesk/api/siasn/ws/download?filePath=${record.path_sk}`}
                  target="_blank"
                  style={{
                    height: "auto",
                    padding: "4px 8px",
                    fontSize: 11,
                    color: "#FF4500",
                    backgroundColor: "#FFF4E6",
                    border: "1px solid #FFD591",
                    borderRadius: 3,
                  }}
                >
                  Download SK
                </Button>
              </div>
            )}
          </Space>
        </Card>
      ))}
    </Space>
  );
};

export default TableRiwayatUsulanPencantumanGelarProfesi;
