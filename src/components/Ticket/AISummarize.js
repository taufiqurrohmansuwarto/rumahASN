import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";
import { deleteSummary, getSolution } from "@/services/admin.services";
import { IconCopy, IconTrash, IconBrain } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Modal, message, Collapse, Tooltip } from "antd";
import { Text, Badge, Divider, Stack, Group, Box, Paper } from "@mantine/core";
import { useSession } from "next-auth/react";
import { useCallback, useState } from "react";

const { Panel } = Collapse;

function AISummarize({ item }) {
  const queryClient = useQueryClient();
  const { data } = useSession();
  const [activeKey, setActiveKey] = useState([]);

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

  const handleRemoveSummary = useCallback(() => {
    Modal.confirm({
      title: "Hapus Rekomendasi/Summary",
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
      message.success("Rekomendasi jawaban berhasil disalin");
    }
  }, [item?.recomendation_answer]);

  if (!item?.summarize_ai) return null;

  return (
    <>
      {data?.user?.current_role === "admin" && (
        <Box mb="md">
          <Collapse
            activeKey={activeKey}
            onChange={setActiveKey}
            ghost
            expandIconPosition="end"
          >
            <Panel
              header={
                <Group spacing="xs">
                  <Badge color="teal" size="sm">
                    AI
                  </Badge>
                  <Text weight={600} color="teal" size="sm">
                    Ringkasan & Rekomendasi AI
                  </Text>
                </Group>
              }
              key="ai-summary"
            >
              <Paper
                p="md"
                mt="xs"
                withBorder
                style={{
                  backgroundColor: "#fffbe6",
                  borderColor: "#ffd666",
                }}
              >
                <Stack spacing="md">
                  {/* Summary Section */}
                  <Box>
                    <Group spacing="xs" mb="sm">
                      <IconBrain size={18} style={{ color: "#10a37f" }} />
                      <Text weight={600} color="teal" size="sm">
                        Ringkasan AI
                      </Text>
                    </Group>
                    <Paper
                      p="sm"
                      withBorder
                      style={{ backgroundColor: "#fafafa" }}
                    >
                      <ReactMarkdownCustom withCustom={true}>
                        {item?.summarize_ai}
                      </ReactMarkdownCustom>
                    </Paper>
                  </Box>

                  {/* Recommendation Section */}
                  {item?.recomendation_answer && (
                    <>
                      <Divider />
                      <Box>
                        <Group position="apart" mb="sm">
                          <Text weight={600} color="teal" size="sm">
                            Rekomendasi Jawaban
                          </Text>
                          <Button
                            type="text"
                            icon={<IconCopy size={16} />}
                            onClick={handleCopyRecommendation}
                            size="small"
                          >
                            Salin
                          </Button>
                        </Group>
                        <Paper
                          p="sm"
                          withBorder
                          style={{ backgroundColor: "#fafafa" }}
                        >
                          <ReactMarkdownCustom withCustom={true}>
                            {item?.recomendation_answer}
                          </ReactMarkdownCustom>
                        </Paper>
                      </Box>
                    </>
                  )}

                  {/* Action Buttons */}
                  <Group spacing="xs">
                    <Tooltip title="Buat Rekomendasi">
                      <Button
                        type="primary"
                        icon={<IconBrain size={16} />}
                        onClick={handleGetSolution}
                        loading={isLoading}
                        shape="circle"
                      />
                    </Tooltip>
                    <Tooltip title="Hapus">
                      <Button
                        danger
                        icon={<IconTrash size={16} />}
                        onClick={handleRemoveSummary}
                        loading={isDeleting}
                        shape="circle"
                      />
                    </Tooltip>
                  </Group>
                </Stack>
              </Paper>
            </Panel>
          </Collapse>
        </Box>
      )}
    </>
  );
}

export default AISummarize;
