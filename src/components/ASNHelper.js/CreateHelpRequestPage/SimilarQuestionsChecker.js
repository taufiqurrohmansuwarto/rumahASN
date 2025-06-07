import { InfoCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { Card, Flex, Typography, Button } from "antd";

const { Text } = Typography;

const SimilarQuestionsChecker = ({
  similarQuestions,
  loading = false,
  onViewMore,
  showViewMore = false,
}) => {
  if (!similarQuestions || similarQuestions.length === 0) {
    return null;
  }

  return (
    <Card
      style={{
        marginBottom: "8px",
        border: "1px solid #EDEFF1",
        borderRadius: "4px",
        backgroundColor: "#FFFFFF",
      }}
      bodyStyle={{ padding: 0 }}
    >
      <Flex>
        <div
          style={{
            width: "40px",
            backgroundColor: "#F8F9FA",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px 0",
            borderRight: "1px solid #EDEFF1",
          }}
        >
          <InfoCircleOutlined style={{ fontSize: 16, color: "#1890FF" }} />
        </div>

        <Flex vertical style={{ flex: 1, padding: "12px 16px" }}>
          <Text
            style={{
              fontSize: "14px",
              color: "#1A1A1B",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Permintaan Serupa yang Sudah Diselesaikan
          </Text>

          {similarQuestions.map((question) => (
            <Flex
              key={question.id}
              justify="space-between"
              align="center"
              style={{
                padding: "8px 12px",
                backgroundColor: "#F8F9FA",
                borderRadius: "4px",
                marginBottom: "6px",
                border: "1px solid #EDEFF1",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onClick={() => question.onClick && question.onClick()}
              className="similar-question-item"
            >
              <Text style={{ fontSize: "13px", color: "#1A1A1B" }}>
                {question.title}
              </Text>
              <Flex align="center" gap={6}>
                <CheckCircleOutlined
                  style={{ fontSize: "12px", color: "#52C41A" }}
                />
                <Text style={{ fontSize: "12px", color: "#787C7E" }}>
                  {question.resolvedTime}
                </Text>
              </Flex>
            </Flex>
          ))}

          {showViewMore && (
            <Button
              type="link"
              onClick={onViewMore}
              style={{
                fontSize: "12px",
                padding: 0,
                height: "auto",
                color: "#FF4500",
              }}
            >
              Lihat lebih banyak pertanyaan serupa
            </Button>
          )}
        </Flex>
      </Flex>
    </Card>
  );
};

export default SimilarQuestionsChecker;
