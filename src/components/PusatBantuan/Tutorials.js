import {
  Col,
  List,
  Row,
  Card,
  Input,
  Alert,
  Typography,
  Flex,
  Grid,
} from "antd";
import { PlayCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import ReactPlayer from "../ReactPlayer";

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

const data = [
  {
    id: 1,
    url: "https://www.youtube.com/watch?v=5CwM6WZVs44&t=3s",
    title: "Daftar Hingga Mendapat Sertifikat Webinar Rumah ASN",
    description:
      "lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    id: 2,
    url: "https://www.youtube.com/watch?v=b93lpc0Go_4",
    title: "Input Menambahkan Nilai IP ASN",
    description:
      "Yuk Guys mimin kasih tau bagaimana caranya menggenerate kartu virtual mohon disimak ya",
  },
  {
    id: 4,
    url: "https://www.youtube.com/watch?v=_MvI-PHyA8I&t=55s",
    title: "Generate Kartu Virtual ASN",
    description:
      "Yuk Guys mimin kasih tau bagaimana caranya menggenerate kartu virtual mohon disimak ya",
  },
  {
    id: 3,
    url: "https://www.youtube.com/watch?v=tXCtuXqoWOQ",
    title: "Tutorial Merubah Rumpun Jabatan dan Import Jabatan Kesehatan",
    description:
      "Yuk Guys mimin kasih tau bagaimana caranya menggenerate kartu virtual mohon disimak ya",
  },
  {
    id: 4,
    url: "https://www.youtube.com/watch?v=DfCnKu7USwA",
    title:
      "Menambah Rumpun Jabatan, Jenis Unor, Lokasi Unor, dan Info Jabatan Pada Aplikasi SIASN",
    description:
      "Yuk Guys mimin kasih tau bagaimana caranya menggenerate kartu virtual mohon disimak ya",
  },
  {
    id: 5,
    url: "https://www.youtube.com/watch?v=lKZB35QKk_4",
    title: "Pemetaan Jabatan di SIMASTER",
    description:
      "Yuk Guys mimin kasih tau bagaimana caranya menggenerate kartu virtual mohon disimak ya",
  },
  {
    id: 6,
    url: "https://www.youtube.com/watch?v=JiWXgxJeQdU&t=275s",
    title: "Pindah Jabatan di SIMASTER",
    description:
      "Yuk Guys mimin kasih tau bagaimana caranya menggenerate kartu virtual mohon disimak ya",
  },
  {
    id: 7,
    url: "https://youtu.be/cbV1PJz10Ck?si=SXs2ogU5-egLM1pm",
    title: "E-Presensi 2021",
    description:
      "Yuk Guys mimin kasih tau bagaimana caranya menggenerate kartu virtual mohon disimak ya",
  },
];

const CustomVideo = ({ url, title, description }) => {
  return (
    <Card
      hoverable
      style={{
        borderRadius: "12px",
        height: "380px", // Fixed height untuk konsistensi
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        border: "1px solid #E5E7EB",
        transition: "all 0.3s ease",
      }}
      bodyStyle={{ padding: "0", height: "100%" }}
    >
      <div
        className="video-container"
        style={{
          position: "relative",
          height: "200px",
          overflow: "hidden",
          borderRadius: "12px 12px 0 0",
        }}
      >
        <ReactPlayer
          width="100%"
          height="200px"
          url={url}
          style={{
            borderRadius: "12px 12px 0 0",
          }}
        />

        {/* Play overlay */}
        <div
          className="play-overlay"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(0,0,0,0.6)",
            borderRadius: "50%",
            width: "50px",
            height: "50px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.8,
            transition: "opacity 0.3s ease",
          }}
        >
          <PlayCircleOutlined
            style={{
              color: "#FFFFFF",
              fontSize: "24px",
            }}
          />
        </div>
      </div>

      <div
        className="content-area"
        style={{
          padding: "16px 20px",
          height: "180px", // Fixed height untuk content area
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <Title
            level={5}
            className="title-area"
            style={{
              margin: "0 0 12px 0",
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: "1.4",
              color: "#1C1C1C",
              display: "-webkit-box",
              WebkitLineClamp: 2, // Max 2 lines untuk title
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              height: "40px", // Fixed height untuk title area
            }}
          >
            {title}
          </Title>

          <Text
            className="description-area"
            style={{
              fontSize: "13px",
              color: "#6B7280",
              lineHeight: "1.5",
              display: "-webkit-box",
              WebkitLineClamp: 3, // Max 3 lines untuk description
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              height: "60px", // Fixed height untuk description area
            }}
          >
            {description}
          </Text>
        </div>

        {/* Duration badge */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "12px",
            paddingTop: "12px",
            borderTop: "1px solid #F3F4F6",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFF7ED",
              color: "#FF4500",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <PlayCircleOutlined style={{ fontSize: "12px" }} />
            Tutorial Video
          </div>

          <Text
            style={{
              fontSize: "11px",
              color: "#9CA3AF",
              fontWeight: 500,
            }}
          >
            YouTube
          </Text>
        </div>
      </div>
    </Card>
  );
};

const Tutorials = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <>
      <style jsx global>{`
        .tutorial-card .ant-card-body {
          padding: 0 !important;
        }
        .tutorial-list .ant-list-item {
          padding: 8px !important;
        }
        .tutorial-card .ant-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
        }
        .tutorial-card .ant-card:hover .play-overlay {
          opacity: 1 !important;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .tutorial-card .ant-card {
            height: 320px !important;
          }
          .tutorial-card .video-container {
            height: 160px !important;
          }
          .tutorial-card .content-area {
            height: 160px !important;
            padding: 12px 16px !important;
          }
          .tutorial-card .title-area {
            height: 36px !important;
            font-size: 13px !important;
          }
          .tutorial-card .description-area {
            height: 54px !important;
            font-size: 12px !important;
          }
        }
      `}</style>

      <Card
        style={{
          borderRadius: "8px",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Flex
          gap={isMobile ? 12 : 16}
          style={{
            marginBottom: isMobile ? 16 : 20,
            padding: isMobile ? "0 4px" : "0 8px",
          }}
        >
          <div
            style={{
              width: isMobile ? "0px" : "40px",
              height: "40px",
              backgroundColor: "#FF4500",
              borderRadius: "8px",
              display: isMobile ? "none" : "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <PlayCircleOutlined
              style={{ color: "#FFFFFF", fontSize: "18px" }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <Title
              level={4}
              style={{
                margin: "0 0 8px 0",
                color: "#1C1C1C",
                fontSize: isMobile ? "16px" : "18px",
              }}
            >
              📚 Tutorial
            </Title>

            <Alert
              message="Halaman ini berisi tutorial-tutorial yang dapat membantu Anda dalam menggunakan aplikasi Rumah ASN. Pilih tutorial yang ingin Anda lihat dan ikuti langkah-langkahnya."
              type="info"
              icon={<InfoCircleOutlined />}
              style={{
                marginBottom: 16,
                borderRadius: "6px",
              }}
            />

            <Input.Search
              placeholder="Cari Tutorial"
              style={{ marginBottom: 16 }}
              size={isMobile ? "middle" : "large"}
            />

            <List
              className="tutorial-list"
              grid={{
                gutter: [16, 16],
                xs: 1,
                sm: 2,
                md: 2,
                lg: 3,
                xl: 3,
                xxl: 4,
              }}
              pagination={{
                position: "bottom",
                align: "center",
                total: data.length,
                pageSize: isMobile ? 6 : 12,
                showTotal: (total) => `Total ${total} tutorial`,
                showSizeChanger: false,
              }}
              dataSource={data}
              rowKey={(row) => row?.id}
              renderItem={(item) => (
                <List.Item>
                  <div className="tutorial-card">
                    <CustomVideo
                      url={item?.url}
                      title={item?.title}
                      description={item?.description}
                    />
                  </div>
                </List.Item>
              )}
            />
          </div>
        </Flex>
      </Card>
    </>
  );
};

export default Tutorials;
