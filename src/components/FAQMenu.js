import { useQuery } from "@tanstack/react-query";
import { Card, Col, Flex, Grid, Menu, Row, Typography } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import React from "react";
import { getFaq } from "../../services";
import FAQDetail from "./FAQDetail";

const { useBreakpoint } = Grid;
const { Title } = Typography;

function FAQMenu({ data }) {
  const [current, setCurrent] = React.useState(null);
  const handleClick = ({ key }) => setCurrent(key);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Responsive variables
  const iconSectionWidth = isMobile ? "0px" : "40px";

  const { data: dataFaq, isLoading } = useQuery(
    ["faqs", current],
    () => getFaq(current),
    {
      enabled: !!current,
    }
  );

  return (
    <>
      <style jsx global>{`
        .ant-menu-item-selected span {
          color: #ffffff !important;
        }
        .ant-menu-item-selected {
          background-color: #ff4500 !important;
          color: #ffffff !important;
        }
      `}</style>
      <div style={{ padding: isMobile ? "12px" : "16px" }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <Card
              size="small"
              title="📂 Kategori FAQ"
              style={{
                backgroundColor: "#FAFBFC",
                borderRadius: "8px",
              }}
              headStyle={{
                backgroundColor: "#F8F9FA",
                borderBottom: "1px solid #E5E7EB",
                fontSize: "14px",
                fontWeight: 500,
                color: "#1C1C1C",
              }}
              bodyStyle={{ padding: "8px" }}
            >
              <Menu
                mode="inline"
                selectedKeys={current ? [current] : []}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                }}
                inlineIndent={16}
              >
                {data?.map((item) => {
                  return (
                    <Menu.Item
                      onClick={handleClick}
                      key={item?.id}
                      style={{
                        borderRadius: "6px",
                        margin: "4px 0",
                        height: "auto",
                        lineHeight: "1.4",
                        padding: "8px 12px",
                        color: "#374151",
                      }}
                    >
                      <span style={{ fontSize: "13px", color: "inherit" }}>
                        {item?.name}
                      </span>
                    </Menu.Item>
                  );
                })}
              </Menu>
            </Card>
          </Col>

          <Col xs={24} md={18}>
            {current ? (
              <Card
                size="small"
                title="💬 Pertanyaan & Jawaban"
                loading={isLoading}
                style={{
                  borderRadius: "8px",
                  minHeight: "400px",
                }}
                headStyle={{
                  backgroundColor: "#F8F9FA",
                  borderBottom: "1px solid #E5E7EB",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#1C1C1C",
                }}
              >
                {dataFaq && <FAQDetail data={dataFaq?.sub_faq} />}
              </Card>
            ) : (
              <Card
                style={{
                  borderRadius: "8px",
                  minHeight: "400px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#FAFBFC",
                }}
                bodyStyle={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: "60px 20px",
                }}
              >
                <div>
                  <QuestionCircleOutlined
                    style={{
                      fontSize: "48px",
                      color: "#D1D5DB",
                      marginBottom: "16px",
                      display: "block",
                    }}
                  />
                  <Title level={5} style={{ color: "#9CA3AF", margin: 0 }}>
                    Pilih kategori FAQ untuk melihat pertanyaan
                  </Title>
                </div>
              </Card>
            )}
          </Col>
        </Row>
      </div>
    </>
  );
}

export default FAQMenu;
