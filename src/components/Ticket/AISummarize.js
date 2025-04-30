import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";
import { getSolution } from "@/services/admin.services";
import { CopyOutlined, OpenAIOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Col, Divider, message, Row, Space, Typography } from "antd";
import { useSession } from "next-auth/react";

function AISummarize({ item }) {
  const queryClient = useQueryClient();

  const { data } = useSession();

  const { mutate, isLoading } = useMutation((data) => getSolution(data), {
    onSuccess: () => {
      message.success("Rekomendasi jawaban berhasil dibuat");
      queryClient.invalidateQueries(["publish-ticket"]);
    },
    onError: () => {
      message.error("Gagal membuat rekomendasi jawaban");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["publish-ticket"]);
    },
  });

  if (!item?.summarize_ai) return null;

  const handleGetSolution = () => {
    const payload = {
      question: item?.summarize_ai,
      id: item?.id,
    };
    mutate(payload);
  };

  const handleCopyRecommendation = () => {
    if (item?.recomendation_answer) {
      navigator.clipboard.writeText(item.recomendation_answer);
      message.success("Rekomendasi jawaban berhasil disalin");
    }
  };

  return (
    <>
      {data?.user?.current_role === "admin" && (
        <div
          style={{
            border: "1px solid #ffe58f",
            backgroundColor: "#fffbe6",
            padding: "8px",
            borderRadius: "4px",
          }}
        >
          <Row gutter={[8, 8]}>
            <Col span={24}>
              <Space>
                <OpenAIOutlined style={{ color: "#10a37f" }} />
                <Typography.Text italic>{item?.summarize_ai}</Typography.Text>
              </Space>
            </Col>

            {item?.recomendation_answer && (
              <>
                <Col span={24}>
                  <Divider
                    style={{
                      margin: "8px 0",
                      borderColor: "#10a37f",
                    }}
                  />
                </Col>
                <Col span={24}>
                  <Space
                    align="start"
                    style={{ width: "100%", justifyContent: "space-between" }}
                  >
                    <Typography.Text strong style={{ color: "#10a37f" }}>
                      Rekomendasi Jawaban:
                    </Typography.Text>
                    <Button
                      type="text"
                      icon={<CopyOutlined />}
                      onClick={handleCopyRecommendation}
                      size="small"
                      title="Salin rekomendasi"
                    >
                      Salin
                    </Button>
                  </Space>
                  <ReactMarkdownCustom withCustom={true}>
                    {item?.recomendation_answer}
                  </ReactMarkdownCustom>
                </Col>
              </>
            )}

            <Col span={24}>
              <Button
                type="text"
                style={{
                  backgroundColor: "#10a37f",
                  color: "white",
                }}
                onClick={handleGetSolution}
                loading={isLoading}
                icon={<OpenAIOutlined />}
              >
                Buat Rekomendasi
              </Button>
            </Col>
          </Row>
        </div>
      )}
    </>
  );
}

export default AISummarize;
