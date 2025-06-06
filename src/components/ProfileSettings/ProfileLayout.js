import PageContainer from "@/components/PageContainer";
import {
  Breadcrumb,
  Card,
  Grid,
  Tabs,
  Typography,
  Flex,
  theme,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  HistoryOutlined,
  BookOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/router";

const { Title, Text } = Typography;
const { useToken } = theme;

function ProfileLayout({
  children,
  tabActiveKey = "profil",
  title = "Pengaturan Profil",
}) {
  const router = useRouter();
  const { token } = useToken();
  const screens = Grid.useBreakpoint();
  const breakPoint = Grid.useBreakpoint();

  const items = [
    {
      label: "Profil",
      key: "profil",
      icon: <UserOutlined />,
      color: "#6366F1",
    },
    {
      label: "Aktivitas",
      key: "activities",
      icon: <HistoryOutlined />,
      color: "#22C55E",
    },
    {
      label: "Pertanyaan Tersimpan",
      key: "saved",
      icon: <BookOutlined />,
      color: "#F59E0B",
    },
    {
      label: "Template Balasan",
      key: "saved-replies",
      icon: <MessageOutlined />,
      color: "#EF4444",
    },
  ];

  const handleTabChange = (key) => {
    if (key === "profil") {
      router.push(`/settings/profile`);
    } else {
      router.push(`/settings/profile/${key}`);
    }
  };

  const getCurrentTab = () => {
    return items.find((item) => item.key === tabActiveKey) || items[0];
  };

  const currentTab = getCurrentTab();

  return (
    <PageContainer
      title={currentTab.label}
      subTitle={`Kelola dan pantau data Anda`}
      childrenContentStyle={{
        paddingLeft: breakPoint.xs ? 16 : null,
        paddingRight: breakPoint.xs ? 16 : null,
      }}
      breadcrumbRender={() => (
        <Breadcrumb style={{ marginBottom: "24px" }}>
          <Breadcrumb.Item>
            <Link href="/feeds">Beranda</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Pengaturan Profil</Breadcrumb.Item>
        </Breadcrumb>
      )}
    >
      {/* Navigation & Content */}
      {screens.md ? (
        <Row gutter={24}>
          {/* Sidebar Navigation */}
          <Col span={5}>
            <Card
              style={{
                borderRadius: "16px",
                border: "1px solid #E5E7EB",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                height: "fit-content",
              }}
              bodyStyle={{ padding: "16px" }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                {items.map((item) => (
                  <div
                    key={item.key}
                    onClick={() => handleTabChange(item.key)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      backgroundColor:
                        tabActiveKey === item.key ? "#F3F4F6" : "transparent",
                      borderLeft:
                        tabActiveKey === item.key
                          ? `3px solid ${item.color}`
                          : "3px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (tabActiveKey !== item.key) {
                        e.currentTarget.style.backgroundColor = "#F9FAFB";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (tabActiveKey !== item.key) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "6px",
                        backgroundColor:
                          tabActiveKey === item.key ? item.color : "#E5E7EB",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {React.cloneElement(item.icon, {
                        style: {
                          color:
                            tabActiveKey === item.key ? "white" : "#6B7280",
                          fontSize: "12px",
                        },
                      })}
                    </div>
                    <span
                      style={{
                        fontWeight: tabActiveKey === item.key ? 600 : 500,
                        fontSize: "14px",
                        color:
                          tabActiveKey === item.key ? "#1F2937" : "#6B7280",
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </Col>

          {/* Content Area */}
          <Col span={19}>
            <Card
              title={title}
              style={{
                borderRadius: "16px",
                border: "1px solid #E5E7EB",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                minHeight: "600px",
              }}
              bodyStyle={{ padding: "32px" }}
            >
              {children}
            </Card>
          </Col>
        </Row>
      ) : (
        /* Mobile Navigation */
        <Card
          style={{
            borderRadius: "16px",
            border: "1px solid #E5E7EB",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Tabs
            activeKey={tabActiveKey}
            onTabClick={handleTabChange}
            style={{ minHeight: "500px" }}
            tabBarStyle={{
              backgroundColor: "#F9FAFB",
              margin: 0,
              padding: "12px 16px",
              borderBottom: "1px solid #E5E7EB",
            }}
            items={items.map((item) => ({
              key: item.key,
              label: (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 12px",
                    borderRadius: "6px",
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "4px",
                      backgroundColor:
                        tabActiveKey === item.key ? item.color : "#E5E7EB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {React.cloneElement(item.icon, {
                      style: {
                        color: tabActiveKey === item.key ? "white" : "#6B7280",
                        fontSize: "10px",
                      },
                    })}
                  </div>
                  <span
                    style={{
                      fontWeight: tabActiveKey === item.key ? 600 : 500,
                      fontSize: "12px",
                      color: tabActiveKey === item.key ? "#1F2937" : "#6B7280",
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              ),
              children: (
                <div
                  style={{
                    padding: "20px",
                    backgroundColor: "white",
                    minHeight: "400px",
                  }}
                >
                  {children}
                </div>
              ),
            }))}
          />
        </Card>
      )}
    </PageContainer>
  );
}

export default ProfileLayout;
