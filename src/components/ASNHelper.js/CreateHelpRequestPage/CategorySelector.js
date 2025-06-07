import { CheckCircleOutlined } from "@ant-design/icons";
import { Card, Col, Flex, Row, Typography } from "antd";

const { Text } = Typography;

const CategorySelector = ({
  categories,
  selectedCategory,
  onCategorySelect,
  error,
}) => {
  return (
    <div style={{ marginBottom: "20px" }}>
      <Text
        style={{
          fontSize: "14px",
          fontWeight: 600,
          color: "#1A1A1B",
          display: "block",
          marginBottom: "12px",
        }}
      >
        Pilih Kategori {error && <Text type="danger">*</Text>}
      </Text>

      <Row gutter={[12, 12]}>
        {categories?.map((category) => (
          <Col xs={24} sm={12} md={8} key={category.id}>
            <Card
              hoverable
              size="small"
              style={{
                border:
                  selectedCategory === category.id
                    ? "2px solid #FF4500"
                    : "1px solid #EDEFF1",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                backgroundColor:
                  selectedCategory === category.id ? "#FFF2E8" : "#FFFFFF",
              }}
              bodyStyle={{
                padding: "12px 16px",
                textAlign: "center",
              }}
              onClick={() => onCategorySelect(category.id)}
              className="category-card"
            >
              <div
                style={{
                  fontSize: "24px",
                  marginBottom: "8px",
                }}
              >
                {category.icon}
              </div>
              <Text
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color:
                    selectedCategory === category.id ? "#FF4500" : "#1A1A1B",
                  display: "block",
                }}
              >
                {category.name}
              </Text>
              {selectedCategory === category.id && (
                <div
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    backgroundColor: "#FF4500",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckCircleOutlined
                    style={{
                      fontSize: "10px",
                      color: "white",
                    }}
                  />
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      {error && (
        <Text type="danger" style={{ fontSize: "12px", marginTop: "4px" }}>
          {error}
        </Text>
      )}
    </div>
  );
};

export default CategorySelector;
