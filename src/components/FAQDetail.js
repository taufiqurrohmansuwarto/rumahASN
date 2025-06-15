import { Collapse, Grid, Typography } from "antd";
import { MessageOutlined } from "@ant-design/icons";

const { useBreakpoint } = Grid;
const { Text } = Typography;

const FAQDetail = ({ data, loading }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  if (!data || data.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px 20px",
          color: "#9CA3AF",
        }}
      >
        <MessageOutlined style={{ fontSize: "32px", marginBottom: "16px" }} />
        <Text style={{ color: "#9CA3AF" }}>
          Tidak ada pertanyaan dalam kategori ini
        </Text>
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? "8px" : "12px" }}>
      <Collapse
        accordion
        ghost
        style={{
          backgroundColor: "transparent",
        }}
        expandIconPosition="end"
      >
        {data?.map((item, index) => {
          return (
            <Collapse.Panel
              key={item?.id}
              header={
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    padding: "4px 0",
                  }}
                >
                  <MessageOutlined
                    style={{
                      color: "#FF4500",
                      fontSize: "14px",
                      marginTop: "2px",
                      flexShrink: 0,
                    }}
                  />
                  <Text
                    strong
                    style={{
                      fontSize: isMobile ? "14px" : "15px",
                      color: "#1C1C1C",
                      lineHeight: "1.5",
                      flex: 1,
                    }}
                  >
                    {item?.question}
                  </Text>
                </div>
              }
              style={{
                marginBottom: "8px",
                backgroundColor: "#FAFBFC",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  backgroundColor: "#FFFFFF",
                  borderTop: "1px solid #E5E7EB",
                  fontSize: isMobile ? "13px" : "14px",
                  lineHeight: "1.6",
                  color: "#374151",
                }}
                dangerouslySetInnerHTML={{
                  __html: item?.html,
                }}
              />
            </Collapse.Panel>
          );
        })}
      </Collapse>

      <style jsx global>{`
        .ant-collapse-ghost > .ant-collapse-item {
          border: none !important;
        }

        .ant-collapse-ghost > .ant-collapse-item > .ant-collapse-header {
          padding: 12px 16px !important;
          background-color: #f8f9fa !important;
          border-radius: 8px 8px 0 0 !important;
          transition: all 0.2s ease !important;
        }

        .ant-collapse-ghost > .ant-collapse-item > .ant-collapse-header:hover {
          background-color: #fff7e6 !important;
        }

        /* Default state - pastikan text gelap */
        .ant-collapse-ghost > .ant-collapse-item > .ant-collapse-header {
          color: #374151 !important;
        }

        .ant-collapse-ghost
          > .ant-collapse-item
          > .ant-collapse-header
          .anticon {
          color: #ff4500 !important;
        }

        .ant-collapse-ghost
          > .ant-collapse-item
          > .ant-collapse-header
          .ant-typography {
          color: #374151 !important;
        }

        .ant-collapse-item-active > .ant-collapse-header {
          background-color: #ff4500 !important;
        }

        .ant-collapse-item-active > .ant-collapse-header .anticon {
          color: #ffffff !important;
        }

        .ant-collapse-item-active > .ant-collapse-header .ant-typography {
          color: #ffffff !important;
        }

        .ant-collapse-item-active > .ant-collapse-header span {
          color: #ffffff !important;
        }

        /* Pastikan text di content area tetap gelap */
        .ant-collapse-content {
          color: #374151 !important;
        }

        .ant-collapse-content * {
          color: #374151 !important;
        }

        .ant-collapse-expand-icon {
          color: #9ca3af !important;
          transition: all 0.2s ease !important;
        }

        .ant-collapse-item-active .ant-collapse-expand-icon {
          color: #ffffff !important;
        }

        .ant-collapse-content {
          border: none !important;
          background-color: transparent !important;
        }

        .ant-collapse-content-box {
          padding: 0 !important;
        }

        /* Mobile specific styles */
        @media (max-width: 768px) {
          .ant-collapse-ghost > .ant-collapse-item > .ant-collapse-header {
            padding: 10px 12px !important;
            font-size: 13px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default FAQDetail;
