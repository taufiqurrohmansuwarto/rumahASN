import { AppstoreOutlined } from "@ant-design/icons";
import {
  IconBrain,
  IconMailbox,
  IconMapPin,
  IconRobot,
  IconZoomQuestion,
} from "@tabler/icons";
import {
  IconCalendarUser,
  IconUserCircle,
  IconUserSquareRounded,
} from "@tabler/icons-react";
import { Col, Grid, Popover, Row, Typography } from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
const { useBreakpoint } = Grid;
const { Text } = Typography;

const applist = [
  {
    icon: <IconZoomQuestion />,
    title: "Tanya BKD",
    color: "#1A73E8",
    link: "/",
    userType: ["PNS", "PPPK", "UMUM", "NONASN"],
  },
  {
    icon: <IconCalendarUser />,
    title: "TemuBKD",
    color: "#4285F4",
    link: "/guests-books/my-visit/visits",
    userType: ["PNS", "PPPK", "UMUM", "NONASN"],
  },
  {
    icon: <IconRobot />,
    title: "Bot AI",
    color: "#1A73E8",
    link: "/chat-ai",
    userType: ["PNS", "PPPK"],
  },
  {
    icon: <IconMailbox />,
    title: "ASN Mail",
    color: "#1A73E8",
    link: "#",
    userType: ["PNS", "PPPK", "UMUM", "NONASN"],
  },
  {
    icon: <IconBrain />,
    title: "Inovasi",
    color: "#EA4335",
    link: "#",
    userType: ["PNS", "PPPK", "UMUM", "NONASN"],
  },
  {
    icon: <IconUserSquareRounded />,
    title: "Klinik ASN",
    color: "#34A853",
    link: "#",
    userType: ["PNS", "PPPK"],
  },
  {
    icon: <IconUserCircle />,
    title: "Pengadaan",
    color: "#34A853",
    link: "/pengadaan-asn/main",
    userType: ["PNS", "PPPK"],
  },
  {
    icon: <IconUserSquareRounded />,
    title: "Time Capsule",
    color: "#FBBC05",
    link: "#",
    userType: ["PNS", "PPPK", "UMUM", "NONASN"],
  },
  {
    icon: <IconMapPin />,
    title: "Peta Inspirasi",
    color: "#FBBC05",
    link: "#",
    userType: ["PNS", "PPPK", "UMUM", "NONASN"],
  },
];

const MegaMenu = () => {
  const screens = useBreakpoint();
  const router = useRouter();
  const { data: session } = useSession();

  const userType = session?.user?.status_kepegawaian;

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
              <span style={{ fontSize: 24, color: app.color, marginBottom: 4 }}>
                {app.icon}
              </span>
              <Text
                style={{
                  fontSize: 12,
                  color: "#5f6368",
                  textAlign: "center",
                }}
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
      <AppstoreOutlined
        color="black"
        size={36}
        style={{ cursor: "pointer", marginLeft: 16 }}
      />
    </Popover>
  );
};

export default MegaMenu;
