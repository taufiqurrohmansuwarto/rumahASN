import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";
import { deleteSummary, getSolution } from "@/services/admin.services";
import {
  CopyOutlined,
  DeleteOutlined,
  OpenAIOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Col,
  Divider,
  message,
  Modal,
  Row,
  Typography,
  Grid,
  Collapse,
} from "antd";
import { useSession } from "next-auth/react";
import { useMemo, useCallback, useState } from "react";

const { useBreakpoint } = Grid;
const { Panel } = Collapse;

function AISummarize({ item }) {
  const queryClient = useQueryClient();
  const { data } = useSession();
  const screens = useBreakpoint();
  const [collapseOpen, setCollapseOpen] = useState(true);

  // Memoize responsive config
  const responsiveConfig = useMemo(() => {
    const isMobile = !screens.md;

    return {
      isMobile,
      padding: isMobile ? 16 : 20,
      borderRadius: isMobile ? 8 : 12,
      fontSize: isMobile ? 13 : 14,
      buttonSize: isMobile ? "small" : "middle",
      iconSize: isMobile ? 16 : 18,
    };
  }, [screens.md]);

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

  const { mutateAsync: removeSummary, isLoading: isDeleting } = useMutation(
    (data) => deleteSummary(data),
    {
      onSuccess: () => {
        message.success("Rekomendasi jawaban berhasil dihapus");
        queryClient.invalidateQueries(["publish-ticket"]);
      },
      onError: () => {
        message.error("Gagal menghapus rekomendasi jawaban");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["publish-ticket"]);
      },
    }
  );

  // Memoize handlers
  const handleRemoveSummary = useCallback(() => {
    Modal.confirm({
      title: "🗑️ Hapus Rekomendasi/Summary",
      content: "Apakah anda yakin ingin menghapus rekomendasi/summary?",
      okText: "Ya, Hapus",
      cancelText: "Batal",
      okType: "danger",
      onOk: async () => {
        await removeSummary({
          id: item?.id,
        });
      },
    });
  }, [removeSummary, item?.id]);

  const handleGetSolution = useCallback(() => {
    const payload = {
      question: item?.summarize_ai,
      id: item?.id,
    };
    mutate(payload);
  }, [mutate, item?.summarize_ai, item?.id]);

  const handleCopyRecommendation = useCallback(() => {
    if (item?.recomendation_answer) {
      navigator.clipboard.writeText(item.recomendation_answer);
      message.success("📋 Rekomendasi jawaban berhasil disalin");
    }
  }, [item?.recomendation_answer]);

  const handleCollapseChange = useCallback((key) => {
    setCollapseOpen(key.length > 0);
  }, []);

  if (!item?.summarize_ai) return null;

  return (
    <>
      {data?.user?.current_role === "admin" && (
        <div style={{ marginBottom: 16 }}>
          <Collapse
            activeKey={collapseOpen ? ["ai-summary"] : []}
            onChange={handleCollapseChange}
            ghost
            expandIcon={({ isActive }) => (
              <DownOutlined rotate={isActive ? 180 : 0} />
            )}
          >
            <Panel
              header={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      background: "#10a37f",
                      color: "white",
                      padding: "2px 6px",
                      borderRadius: 8,
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  >
                    🤖 AI
                  </div>
                  <Typography.Text strong style={{ color: "#10a37f" }}>
                    Ringkasan & Rekomendasi AI
                  </Typography.Text>
                </div>
              }
              key="ai-summary"
            >
              <div
                style={{
                  border: "2px solid #ffd666",
                  background:
                    "linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%)",
                  padding: responsiveConfig.padding,
                  borderRadius: responsiveConfig.borderRadius,
                  boxShadow: "0 4px 12px rgba(255, 193, 7, 0.15)",
                  marginTop: 8,
                }}
              >
                <Row gutter={[0, responsiveConfig.isMobile ? 12 : 16]}>
                  {/* Summary Section */}
                  <Col span={24}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: responsiveConfig.isMobile ? 8 : 12,
                        marginBottom: responsiveConfig.isMobile ? 12 : 16,
                        padding: responsiveConfig.isMobile
                          ? "8px 12px"
                          : "12px 16px",
                        background: "rgba(16, 163, 127, 0.08)",
                        borderRadius: responsiveConfig.isMobile ? 6 : 8,
                        border: "1px solid rgba(16, 163, 127, 0.2)",
                      }}
                    >
                      <OpenAIOutlined
                        style={{
                          color: "#10a37f",
                          fontSize: responsiveConfig.iconSize,
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <Typography.Text
                          strong
                          style={{
                            color: "#10a37f",
                            fontSize: responsiveConfig.fontSize,
                          }}
                        >
                          📝 Ringkasan AI:
                        </Typography.Text>
                      </div>
                    </div>
                    <Typography.Paragraph
                      style={{
                        fontSize: responsiveConfig.fontSize,
                        lineHeight: 1.6,
                        color: "#595959",
                        fontStyle: "italic",
                        margin: 0,
                      }}
                    >
                      {item?.summarize_ai}
                    </Typography.Paragraph>
                  </Col>

                  {/* Recommendation Section */}
                  {item?.recomendation_answer && (
                    <>
                      <Col span={24}>
                        <Divider
                          style={{
                            margin: responsiveConfig.isMobile
                              ? "12px 0"
                              : "16px 0",
                            borderColor: "#10a37f",
                            borderWidth: 2,
                          }}
                        />
                      </Col>
                      <Col span={24}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: responsiveConfig.isMobile ? 8 : 12,
                            flexWrap: responsiveConfig.isMobile
                              ? "wrap"
                              : "nowrap",
                            gap: responsiveConfig.isMobile ? 8 : 0,
                          }}
                        >
                          <Typography.Text
                            strong
                            style={{
                              color: "#10a37f",
                              fontSize: responsiveConfig.fontSize,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            💡 Rekomendasi Jawaban:
                          </Typography.Text>
                          <Button
                            type="text"
                            icon={<CopyOutlined />}
                            onClick={handleCopyRecommendation}
                            size={responsiveConfig.buttonSize}
                            style={{
                              background: "#f6ffed",
                              border: "1px solid #b7eb8f",
                              color: "#389e0d",
                              borderRadius: 6,
                              fontWeight: 500,
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#389e0d";
                              e.currentTarget.style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#f6ffed";
                              e.currentTarget.style.color = "#389e0d";
                            }}
                          >
                            📋 Salin
                          </Button>
                        </div>

                        <div
                          style={{
                            background: "#fafafa",
                            border: "1px solid #f0f0f0",
                            borderRadius: responsiveConfig.isMobile ? 6 : 8,
                            padding: responsiveConfig.isMobile ? 12 : 16,
                            marginTop: 8,
                          }}
                        >
                          <ReactMarkdownCustom withCustom={true}>
                            {item?.recomendation_answer}
                          </ReactMarkdownCustom>
                        </div>
                      </Col>
                    </>
                  )}

                  {/* Action Buttons */}
                  <Col span={24}>
                    <div
                      style={{
                        display: "flex",
                        gap: responsiveConfig.isMobile ? 8 : 12,
                        flexWrap: responsiveConfig.isMobile ? "wrap" : "nowrap",
                        marginTop: responsiveConfig.isMobile ? 12 : 16,
                      }}
                    >
                      <Button
                        type="primary"
                        onClick={handleGetSolution}
                        loading={isLoading}
                        icon={<OpenAIOutlined />}
                        size={responsiveConfig.buttonSize}
                        style={{
                          background:
                            "linear-gradient(135deg, #10a37f 0%, #0d8f72 100%)",
                          border: "none",
                          borderRadius: 8,
                          fontWeight: 600,
                          boxShadow: "0 2px 8px rgba(16, 163, 127, 0.3)",
                          minWidth: responsiveConfig.isMobile
                            ? "140px"
                            : "160px",
                          height: responsiveConfig.isMobile ? 36 : 40,
                        }}
                      >
                        {isLoading ? "⏳ Membuat..." : "✨ Buat Rekomendasi"}
                      </Button>

                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleRemoveSummary}
                        loading={isDeleting}
                        size={responsiveConfig.buttonSize}
                        style={{
                          borderRadius: 8,
                          fontWeight: 600,
                          minWidth: responsiveConfig.isMobile
                            ? "100px"
                            : "120px",
                          height: responsiveConfig.isMobile ? 36 : 40,
                          background: "#fff2f0",
                          borderColor: "#ffccc7",
                          color: "#cf1322",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#cf1322";
                          e.currentTarget.style.color = "white";
                          e.currentTarget.style.borderColor = "#cf1322";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#fff2f0";
                          e.currentTarget.style.color = "#cf1322";
                          e.currentTarget.style.borderColor = "#ffccc7";
                        }}
                      >
                        {isDeleting ? "⏳ Menghapus..." : "🗑️ Hapus"}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </div>
            </Panel>
          </Collapse>
        </div>
      )}
    </>
  );
}

export default AISummarize;
