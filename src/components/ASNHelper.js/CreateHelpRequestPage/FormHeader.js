import {
  PlusOutlined,
  BulbOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Card, Flex, Progress, Typography, Steps } from "antd";

const { Text, Title } = Typography;

const FormHeader = ({
  currentStep = 0,
  validationStatus,
  tips,
  title,
  subtitle,
}) => {
  const steps = [
    { title: "Kategori", description: "Pilih kategori bantuan" },
    { title: "Detail", description: "Isi detail permintaan" },
    { title: "Review", description: "Tinjau dan kirim" },
  ];

  return (
    <>
      {/* Header Card */}
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
            <PlusOutlined style={{ fontSize: 16, color: "#FF4500" }} />
          </div>

          <Flex vertical style={{ flex: 1, padding: "12px 16px" }}>
            <Title
              level={5}
              style={{
                margin: "0 0 4px 0",
                color: "#1A1A1B",
                fontSize: "16px",
                fontWeight: 500,
                lineHeight: "20px",
              }}
            >
              {title || "Buat Permintaan Bantuan Baru"}
            </Title>
            <Text
              style={{
                color: "#787C7E",
                fontSize: "14px",
                lineHeight: "18px",
                marginBottom: "12px",
              }}
            >
              {subtitle ||
                "Jelaskan masalah Anda dengan detail untuk mendapat bantuan yang tepat"}
            </Text>

            {/* Progress Steps */}
            <Steps
              current={currentStep}
              size="small"
              items={steps}
              style={{ marginTop: "8px" }}
            />
          </Flex>
        </Flex>
      </Card>

      {/* Help Tips Card */}
      {tips && (
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
              <BulbOutlined style={{ fontSize: 16, color: "#FAAD14" }} />
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
                Tips untuk Mendapat Bantuan Cepat
              </Text>
              {tips?.map((tip, index) => (
                <Text
                  key={index}
                  style={{
                    fontSize: "13px",
                    color: "#787C7E",
                    lineHeight: "18px",
                    marginBottom: index < tips.length - 1 ? "4px" : 0,
                  }}
                >
                  • {tip}
                </Text>
              ))}
            </Flex>
          </Flex>
        </Card>
      )}
    </>
  );
};

export default FormHeader;
