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
        height: isMobile ? "100px" : "120px",
        backgroundColor: "#FFFFFF",
        border: "1px solid #EDEFF1",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      bodyStyle={{
        padding: isMobile ? "12px" : "16px",
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
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = `0 4px 12px ${item.color}33`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#EDEFF1";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <IconComponent
        size={isMobile ? 28 : 36}
        color={item.color}
        stroke={1.5}
        style={{ marginBottom: isMobile ? "8px" : "12px" }}
      />
      <Text
        fw={600}
        size={isMobile ? "xs" : "sm"}
        style={{
          color: "#1A1A1B",
          margin: 0,
          lineHeight: "1.3",
          textAlign: "center",
        }}
      >
        {item.title}
      </Text>
      <Text
        size={isMobile ? "10px" : "xs"}
        c="dimmed"
        style={{
          marginTop: "4px",
          lineHeight: "1.2",
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
      <Row gutter={[12, 12]}>
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
