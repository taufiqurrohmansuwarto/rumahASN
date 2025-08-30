import {
  BookOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import {
  Card,
  Empty,
  Flex,
  Space,
  Spin,
  Tag,
  Typography,
  Button,
} from "antd";

const { Text } = Typography;

const TabelRiwayatUsulanPencantumanGelar = ({ data, isLoading }) => {
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
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #EDEFF1",
            borderRadius: "4px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            transition: "all 0.2s ease",
          }}
          styles={{
            header: {
              borderBottom: "1px solid #EDEFF1",
              backgroundColor: "#F8F9FA",
              padding: "12px 16px",
            },
            body: {
              padding: "16px",
            },
          }}
          title={
            <Flex align="center" gap={12}>
              <div 
                style={{
                  width: 8,
                  height: 32,
                  backgroundColor: "#FF4500",
                  borderRadius: 2,
                }}
              />
              <div>
                <Text strong style={{ fontSize: 16, color: "#1C1C1C" }}>
                  {record.nama}
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12, color: "#878A8C" }}>
                  NIP: {record.nip}
                </Text>
              </div>
            </Flex>
          }
        >
          <Space direction="vertical" style={{ width: "100%" }} size={12}>
            {/* Pendidikan Section */}
            <div
              style={{
                backgroundColor: "#FAFBFC",
                border: "1px solid #EDEFF1",
                borderRadius: "4px",
                padding: "12px",
              }}
            >
              <Flex align="center" gap={8} style={{ marginBottom: 8 }}>
                <BookOutlined style={{ color: "#FF4500", fontSize: 14 }} />
                <Text strong style={{ color: "#1C1C1C", fontSize: 13 }}>
                  PENDIDIKAN
                </Text>
              </Flex>
              <Space direction="vertical" style={{ width: "100%" }} size={6}>
                <Flex justify="space-between" align="center">
                  <Text style={{ color: "#878A8C", fontSize: 12 }}>Tingkat</Text>
                  <Tag 
                    color="blue" 
                    style={{ 
                      fontSize: 11, 
                      padding: "2px 6px",
                      borderRadius: 2 
                    }}
                  >
                    {record.tingkat_pendidikan_nama}
                  </Tag>
                </Flex>
                <Flex justify="space-between" align="start">
                  <Text style={{ color: "#878A8C", fontSize: 12 }}>Program</Text>
                  <Text 
                    style={{ 
                      textAlign: "right", 
                      maxWidth: 250,
                      fontSize: 12,
                      color: "#1C1C1C"
                    }}
                  >
                    {record.pendidikan_nama}
                  </Text>
                </Flex>
                <Flex justify="space-between" align="start">
                  <Text style={{ color: "#878A8C", fontSize: 12 }}>Institusi</Text>
                  <Text 
                    style={{ 
                      textAlign: "right", 
                      maxWidth: 250,
                      fontSize: 12,
                      color: "#1C1C1C"
                    }}
                  >
                    {record.nama_sek}
                  </Text>
                </Flex>
                <Flex justify="space-between" align="center">
                  <Text style={{ color: "#878A8C", fontSize: 12 }}>No. Ijazah</Text>
                  <Text 
                    code 
                    style={{ 
                      fontSize: 11,
                      backgroundColor: "#F6F7F8",
                      color: "#1C1C1C"
                    }}
                  >
                    {record.nomor_ijazah || "-"}
                  </Text>
                </Flex>
              </Space>
            </div>

            {/* Gelar Section */}
            <div
              style={{
                backgroundColor: "#F6FFED",
                border: "1px solid #B7EB8F",
                borderRadius: "4px",
                padding: "12px",
              }}
            >
              <Flex align="center" gap={8} style={{ marginBottom: 8 }}>
                <div 
                  style={{
                    width: 12,
                    height: 12,
                    backgroundColor: "#52C41A",
                    borderRadius: "50%",
                  }}
                />
                <Text strong style={{ color: "#1C1C1C", fontSize: 13 }}>
                  GELAR TEREGISTRASI
                </Text>
              </Flex>
              <Space direction="vertical" style={{ width: "100%" }} size={6}>
                <Flex justify="space-between" align="center">
                  <Text style={{ color: "#878A8C", fontSize: 12 }}>Depan</Text>
                  {record.gelar_depan ? (
                    <Tag 
                      style={{ 
                        backgroundColor: "#52C41A",
                        color: "white",
                        border: "none",
                        fontSize: 11,
                        padding: "2px 8px",
                        borderRadius: 2
                      }}
                    >
                      {record.gelar_depan}
                    </Tag>
                  ) : (
                    <Text style={{ color: "#878A8C", fontSize: 12 }}>-</Text>
                  )}
                </Flex>
                <Flex justify="space-between" align="center">
                  <Text style={{ color: "#878A8C", fontSize: 12 }}>Belakang</Text>
                  {record.gelar_belakang ? (
                    <Tag 
                      style={{ 
                        backgroundColor: "#FF7A00",
                        color: "white",
                        border: "none",
                        fontSize: 11,
                        padding: "2px 8px",
                        borderRadius: 2
                      }}
                    >
                      {record.gelar_belakang}
                    </Tag>
                  ) : (
                    <Text style={{ color: "#878A8C", fontSize: 12 }}>-</Text>
                  )}
                </Flex>
                {record.tgl_approval && (
                  <Flex justify="space-between" align="center">
                    <Text style={{ color: "#878A8C", fontSize: 12 }}>
                      <CalendarOutlined style={{ marginRight: 4 }} />
                      Penetapan
                    </Text>
                    <Text 
                      strong 
                      style={{ 
                        color: "#52C41A", 
                        fontSize: 12,
                        backgroundColor: "#F6FFED",
                        padding: "2px 6px",
                        borderRadius: 2,
                        border: "1px solid #B7EB8F"
                      }}
                    >
                      {record.tgl_approval}
                    </Text>
                  </Flex>
                )}
                {record.path_sk && (
                  <Flex justify="space-between" align="center">
                    <Text style={{ color: "#878A8C", fontSize: 12 }}>
                      Dokumen SK
                    </Text>
                    <Button
                      type="link"
                      size="small"
                      icon={<DownloadOutlined />}
                      href={`/helpdesk/api/siasn/ws/download?filePath=${record.path_sk}`}
                      target="_blank"
                      style={{
                        height: 'auto',
                        padding: '2px 8px',
                        fontSize: 11,
                        color: '#FF4500',
                        backgroundColor: '#FFF4E6',
                        border: '1px solid #FFD591',
                        borderRadius: 2,
                      }}
                    >
                      Download
                    </Button>
                  </Flex>
                )}
              </Space>
            </div>
          </Space>
        </Card>
      ))}
    </Space>
  );
};

export default TabelRiwayatUsulanPencantumanGelar;
