import { getUserType } from "@/utils/appLists";
import { AppstoreOutlined } from "@ant-design/icons";
import { IconGridDots } from "@tabler/icons-react";
import { Col, Grid, Popover, Row, Typography } from "antd";
import { useSession } from "next-auth/react";
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
                        }}
                      >
                        <span
                          style={{
                            fontSize: 24,
                            color: app.color,
                            marginBottom: 4,
                          }}
                        >
                          {app.rightIcon || <AppstoreOutlined />}
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
