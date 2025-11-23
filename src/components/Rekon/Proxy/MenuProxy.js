import { Text } from "@mantine/core";
import {
  IconCash,
  IconCertificate,
  IconSchool,
  IconShieldCheck,
  IconUsers,
} from "@tabler/icons-react";
import { Card, Col, Grid, Row } from "antd";
import { useRouter } from "next/router";

const menuItems = [
  {
    title: "Integrasi KP",
    description: "Kenaikan Pangkat",
    icon: IconUsers,
    path: "/siasn/proxy-kp",
    color: "#1890FF",
  },
  {
    title: "Integrasi Pensiun",
    description: "Data Pensiun",
    icon: IconCash,
    path: "/siasn/proxy-pensiun",
    color: "#52C41A",
  },
  {
    title: "Integrasi PG Akademik",
    description: "Pencantuman Gelar Akademik",
    icon: IconSchool,
    path: "/siasn/proxy-pg-akademik",
    color: "#722ED1",
  },
  {
    title: "Integrasi PG Profesi",
    description: "Pencantuman Gelar Profesi",
    icon: IconCertificate,
    path: "/siasn/proxy-pg-profesi",
    color: "#FA8C16",
  },
  {
    title: "Integrasi SKK",
    description: "Status Kedudukan Kepegawaian",
    icon: IconShieldCheck,
    path: "/siasn/proxy-skk",
    color: "#13C2C2",
  },
];

const MenuButton = ({ item, onClick, isMobile }) => {
  const IconComponent = item.icon;

  return (
    <Card
      hoverable
      style={{
        height: isMobile ? "75px" : "85px",
        backgroundColor: "#FFFFFF",
        border: "1px solid #EDEFF1",
        borderRadius: "6px",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      bodyStyle={{
        padding: isMobile ? "6px" : "8px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
      onClick={() => onClick(item?.path)}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = item.color;
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 2px 8px ${item.color}33`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#EDEFF1";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <IconComponent
        size={isMobile ? 22 : 26}
        color={item.color}
        stroke={1.5}
        style={{ marginBottom: isMobile ? "4px" : "6px" }}
      />
      <Text
        fw={600}
        size={isMobile ? "10px" : "xs"}
        style={{
          color: "#1A1A1B",
          margin: 0,
          lineHeight: "1.2",
          textAlign: "center",
        }}
      >
        {item.title}
      </Text>
      <Text
        size={isMobile ? "9px" : "10px"}
        c="dimmed"
        style={{
          marginTop: "2px",
          lineHeight: "1.1",
          textAlign: "center",
        }}
      >
        {item.description}
      </Text>
    </Card>
  );
};

const MenuProxy = () => {
  const router = useRouter();
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  // Responsive variables
  const isMobile = !screens.md;

  const handleClick = (path) => {
    router.push(`/rekon/${path}`);
  };

  return (
    <div>
      {/* Menu Grid */}
      <Row gutter={[8, 8]} justify="center">
        {menuItems.map((item) => (
          <Col key={item.title} xs={12} sm={8} md={6} lg={4} xl={4}>
            <MenuButton item={item} onClick={handleClick} isMobile={isMobile} />
          </Col>
        ))}
      </Row>

      <style jsx global>{`
        .ant-card-hoverable:hover {
          border-color: inherit !important;
        }
      `}</style>
    </div>
  );
};

export default MenuProxy;
