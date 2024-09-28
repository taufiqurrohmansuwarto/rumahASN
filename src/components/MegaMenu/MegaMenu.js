import {
  IconBrain,
  IconMailbox,
  IconMapPin,
  IconZoomQuestion,
} from "@tabler/icons";
import {
  IconCalendarUser,
  IconGridDots,
  IconUserSquareRounded,
} from "@tabler/icons-react";
import { Col, Grid, Popover, Row, Typography } from "antd";
import { useRouter } from "next/router";
import React from "react";

const { useBreakpoint } = Grid;
const { Text } = Typography;

const applist = [
  {
    icon: <IconZoomQuestion />,
    title: "Tanya BKD",
    color: "#1A73E8",
    link: "/",
  },
  {
    icon: <IconCalendarUser />,
    title: "TemuBKD",
    color: "#4285F4",
    link: "/guests-books/main",
  },
  {
    icon: <IconMailbox />,
    title: "ASN Mail",
    color: "#1A73E8",
    link: "/guests-books",
  },
  {
    icon: <IconBrain />,
    title: "Inovasi",
    color: "#EA4335",
    link: "/guests-books",
  },
  {
    icon: <IconUserSquareRounded />,
    title: "Klinik ASN",
    color: "#34A853",
    link: "/guests-books",
  },
  {
    icon: <IconUserSquareRounded />,
    title: "Time Capsule",
    color: "#FBBC05",
    link: "/guests-books",
  },
  {
    icon: <IconMapPin />,
    title: "Peta Inspirasi",
    color: "#FBBC05",
    link: "/guests-books",
  },
];

const MegaMenu = () => {
  const screens = useBreakpoint();
  const router = useRouter();

  const handleLink = (link) => {
    router.push(link);
  };

  const content = (
    <Row gutter={[16, 16]}>
      {applist.map((app, index) => (
        <Col key={index} xs={6} sm={6} md={6} lg={6} xl={6}>
          <a
            style={{ textDecoration: "none" }}
            onClick={() => handleLink(app.link)}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {React.cloneElement(app.icon, {
                style: { fontSize: 24, color: app.color, marginBottom: 4 },
              })}
              <Text
                style={{ fontSize: 12, color: "#5f6368", textAlign: "center" }}
              >
                {app.title}
              </Text>
            </div>
          </a>
        </Col>
      ))}
    </Row>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      placement={screens.xs ? "bottom" : "bottomLeft"}
      overlayInnerStyle={{
        width: screens.xs ? "100vw" : 400,
        padding: 16,
      }}
    >
      <IconGridDots
        color="black"
        size={30}
        style={{ cursor: "pointer", marginLeft: 10 }}
      />
    </Popover>
  );
};

export default MegaMenu;
