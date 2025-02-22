import { getUserType } from "@/utils/appLists";
import { IconGridDots } from "@tabler/icons-react";
import { Col, Grid, Popover, Row, Typography } from "antd";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";

const { useBreakpoint } = Grid;
const { Text } = Typography;

const MegaMenuTop = ({ url, title }) => {
  const screens = useBreakpoint();
  const router = useRouter();
  const { data } = useSession();

  const breakPoint = Grid.useBreakpoint();

  const { userType, filteredApps } = getUserType(data?.user || {});

  const handleLink = (link) => {
    if (link) {
      router.push(link);
    } else {
      console.warn("Invalid link");
    }
  };

  const isMobile = breakPoint.xs || breakPoint.sm;

  return (
    <>
      {userType?.length > 0 && isMobile && (
        <Popover
          content={
            filteredApps?.length ? (
              <Row gutter={[16, 16]}>
                {filteredApps.map((app, index) => (
                  <Col key={index} xs={6} sm={6} md={6} lg={6} xl={6}>
                    <a
                      style={{ textDecoration: "none" }}
                      onClick={() => handleLink(app.url)}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          cursor: "pointer",
                          padding: "8px",
                          transition: "all 0.3s ease",
                          borderRadius: "8px",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f0f0f0";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <Image
                          width={24}
                          height={24}
                          src={app.icon}
                          alt={app.title}
                          style={{
                            width: 24,
                            height: 24,
                            marginBottom: 4,
                          }}
                        />
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
            ) : (
              <Text>No applications available</Text>
            )
          }
          trigger="click"
          placement={screens.xs ? "bottom" : "bottomLeft"}
          overlayInnerStyle={{
            width: screens.xs ? "100vw" : 400,
            padding: 16,
          }}
        >
          <IconGridDots
            color="black"
            size={32}
            style={{ cursor: "pointer", marginLeft: 16 }}
          />
        </Popover>
      )}
    </>
  );
};

export default MegaMenuTop;
