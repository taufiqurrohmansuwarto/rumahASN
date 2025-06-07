import React from "react";
import { Carousel } from "@mantine/carousel";
import { Text } from "@mantine/core";
import {
  IconDatabase,
  IconDeviceComputerCamera,
  IconHistory,
  IconMapPin,
  IconMessage,
  IconRobot,
  IconUsers,
} from "@tabler/icons";
import { Card, Flex, Typography } from "antd";
import { useRouter } from "next/router";

const { Title } = Typography;

const QuickAccessItem = ({ icon, label, color, onClick }) => {
  return (
    <div
      style={{
        height: "100%",
        padding: "10px 12px",
        borderRadius: "4px",
        border: "1px solid #EDEFF1",
        backgroundColor: "#FFFFFF",
        cursor: "pointer",
        transition: "all 0.3s ease",
        minWidth: "130px",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#FF4500";
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 69, 0, 0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#EDEFF1";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.04)";
      }}
    >
      <Flex align="center" gap={8} justify="flex-start">
        {/* Icon Container */}
        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "5px",
            backgroundColor: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {React.cloneElement(icon, {
            size: 12,
            color: "white",
            style: { strokeWidth: 2.5 },
          })}
        </div>

        {/* Text Content */}
        <Text
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "#1A1A1B",
            lineHeight: "16px",
            margin: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </Text>
      </Flex>
    </div>
  );
};

const QuickAccessCarousel = () => {
  const router = useRouter();

  const quickAccessItems = [
    {
      icon: <IconRobot />,
      label: "Bestie AI",
      color: "#FF4500",
      onClick: () => router.push("/chat-ai"),
    },
    {
      icon: <IconDatabase />,
      label: "Integrasi MyASN",
      color: "#1890FF",
      onClick: () => router.push("/pemutakhiran-data/komparasi"),
    },
    {
      icon: <IconHistory />,
      label: "Usulan SIASN",
      color: "#F5222D",
      onClick: () =>
        router.push("/pemutakhiran-data/usulan-siasn/inbox-usulan"),
    },
    {
      icon: <IconDeviceComputerCamera />,
      label: "Webinar ASN",
      color: "#1890FF",
      onClick: () => router.push("/webinar-series/all"),
    },
    {
      icon: <IconMessage />,
      label: "Forum Kepegawaian",
      color: "#FF4500",
      onClick: () => router.push("/feeds"),
    },
    {
      icon: <IconUsers />,
      label: "Coaching Clinic",
      color: "#52C41A",
      onClick: () => router.push("/coaching-clinic/all"),
    },
    {
      icon: <IconMapPin />,
      label: "Kegiatan ASN",
      color: "#722ED1",
      onClick: () => {},
    },
  ];

  return (
    <Card
      style={{
        marginBottom: "16px",
        border: "1px solid #EDEFF1",
        borderRadius: "4px",
        backgroundColor: "#FFFFFF",
      }}
      bodyStyle={{ padding: 0 }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #EDEFF1",
          backgroundColor: "#F8F9FA",
        }}
      >
        <Flex align="center" gap={8}>
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "4px",
              backgroundColor: "#FF4500",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                fill="white"
                strokeWidth="2"
              />
            </svg>
          </div>
          <Title
            level={5}
            style={{
              margin: 0,
              color: "#1A1A1B",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Akses Cepat
          </Title>
        </Flex>
      </div>

      {/* Carousel Content */}
      <div style={{ padding: "14px 12px" }}>
        <Carousel
          slideSize="auto"
          height={44}
          slideGap="sm"
          align="start"
          controlsOffset="md"
          controlSize={20}
          dragFree
          withControls={true}
          styles={{
            control: {
              backgroundColor: "#FFFFFF",
              border: "1px solid #EDEFF1",
              color: "#787C7E",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              boxShadow: "0 1px 4px rgba(0, 0, 0, 0.06)",
              "&:hover": {
                backgroundColor: "#FF4500",
                borderColor: "#FF4500",
                color: "white",
                boxShadow: "0 2px 8px rgba(255, 69, 0, 0.2)",
              },
            },
            controls: {
              padding: "0 8px",
            },
          }}
        >
          {quickAccessItems.map((item, index) => (
            <Carousel.Slide key={index} style={{ flex: "0 0 auto" }}>
              <QuickAccessItem
                icon={item.icon}
                label={item.label}
                color={item.color}
                onClick={item.onClick}
              />
            </Carousel.Slide>
          ))}
        </Carousel>
      </div>
    </Card>
  );
};

export default QuickAccessCarousel;
