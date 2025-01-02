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
  IconTransfer,
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
    userType: ["asn", "non_asn", "umum", "fasilitator"],
  },
  {
    icon: <IconCalendarUser />,
    title: "TemuBKD",
    color: "#4285F4",
    link: "/guests-books/my-visit/visits",
    userType: ["asn", "umum", "non_asn"],
  },
  {
    icon: <IconRobot />,
    title: "Bestie AI",
    color: "#1A73E8",
    link: "/chat-ai",
    userType: ["asn"],
  },
  {
    icon: <IconMailbox />,
    title: "ASN Mail",
    color: "#1A73E8",
    link: "#",
    userType: ["asn", "umum", "non_asn", "fasilitator"],
  },
  {
    icon: <IconBrain />,
    title: "Inovasi",
    color: "#EA4335",
    link: "#",
    userType: ["asn"],
  },
  {
    icon: <IconUserSquareRounded />,
    title: "Klinik ASN",
    color: "#34A853",
    link: "#",
    userType: ["asn"],
  },
  {
    icon: <IconUserCircle />,
    title: "Pengadaan",
    color: "#34A853",
    link: "/pengadaan-asn/main",
    userType: ["asn"],
  },
  {
    icon: <IconUserSquareRounded />,
    title: "Time Capsule",
    color: "#FBBC05",
    link: "#",
    userType: ["asn"],
  },
  {
    icon: <IconMapPin />,
    title: "Peta Inspirasi",
    color: "#FBBC05",
    link: "#",
    userType: ["asn"],
  },
  {
    icon: <IconMailbox />,
    title: "Persuratan",
    color: "#FBBC05",
    link: "/letter-managements/letter-header",
    userType: ["fasilitator", "admin"],
  },
  {
    icon: <IconTransfer />,
    title: "Rekon SIASN",
    color: "#FBBC05",
    link: "/rekon/rekon-unor",
    userType: ["fasilitator", "admin"],
  },
];

function MegaMenuTop() {
  const screens = useBreakpoint();
  const router = useRouter();
  const { data } = useSession();

  const handleLink = (link) => {
    router.push(link);
  };

  const getUserType = (user) => {
    const statusKepegawaian = user?.status_kepegawaian;
    const currentRole = data?.user?.current_role;

    const userTypes = [];

    if (statusKepegawaian === "PNS" || statusKepegawaian === "PPPK") {
      userTypes.push("asn");
    }
    if (statusKepegawaian === "NONASN") {
      userTypes.push("nonasn");
    }
    if (statusKepegawaian === "FASILITATOR") {
      userTypes.push("fasilitator");
    }
    if (statusKepegawaian === "UMUM") {
      userTypes.push("umum");
    }
    if (currentRole === "admin") {
      userTypes.push("admin");
    }
    if (currentRole === "agent") {
      userTypes.push("agent");
    }

    return userTypes;
  };

  const userType = getUserType(data?.user);
  return (
    <>
      <Popover
        content={
          <>
            <Row gutter={[16, 16]}>
              {applist
                .filter((app) =>
                  app.userType.some((type) => userType.includes(type))
                )
                .map((app, index) => (
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
                        <span
                          style={{
                            fontSize: 24,
                            color: app.color,
                            marginBottom: 4,
                          }}
                        >
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
          </>
        }
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
    </>
  );
}

export default MegaMenuTop;
