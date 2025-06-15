import { summarizeQuestion } from "@/services/admin.services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Flex, message, Grid, Button, Tooltip } from "antd";
import { useSession } from "next-auth/react";
import { useMemo, useCallback } from "react";
import { OpenAIOutlined } from "@ant-design/icons";

const { useBreakpoint } = Grid;

const TicketSummarize = ({ ticket }) => {
  const { data } = useSession();
  const queryClient = useQueryClient();
  const screens = useBreakpoint();

  // Memoize responsive config
  const responsiveConfig = useMemo(() => {
    const isMobile = !screens.md;

    return {
      isMobile,
      buttonSize: isMobile ? "small" : "middle",
    };
  }, [screens.md]);

  const { mutate, isLoading } = useMutation((data) => summarizeQuestion(data), {
    onSuccess: () => {
      message.success("✨ Summary berhasil dibuat");
      queryClient.invalidateQueries(["publish-ticket"]);
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "❌ Gagal membuat summary";
      message.error(msg);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["publish-ticket"]);
    },
  });

  // Memoize handler
  const handleSummarize = useCallback(() => {
    mutate(ticket?.id);
  }, [mutate, ticket?.id]);

  if (data?.user?.current_role !== "admin") return null;

  return (
    <Flex justify="flex-start" align="center">
      <Tooltip title="Ringkas dengan AI">
        <Button
          shape="circle"
          type="default"
          loading={isLoading}
          onClick={handleSummarize}
          size={responsiveConfig.buttonSize}
          icon={<OpenAIOutlined />}
        />
      </Tooltip>
    </Flex>
  );
};

export default TicketSummarize;
