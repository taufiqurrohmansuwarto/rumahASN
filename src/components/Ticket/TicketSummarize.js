import { summarizeQuestion } from "@/services/admin.services";
import { ActionIcon } from "@mantine/core";
import { IconSparkles } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Flex, message } from "antd";
import { Tooltip } from "@mantine/core";
import { useSession } from "next-auth/react";

const TicketSummarize = ({ ticket }) => {
  const { data } = useSession();
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation((data) => summarizeQuestion(data), {
    onSuccess: () => {
      message.success("Summary has been updated");
      queryClient.invalidateQueries(["publish-ticket"]);
    },
    onError: (error) => {
      const msg = error.response.data.message || "Gagal membuat summary";
      message.error(msg);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["publish-ticket"]);
    },
  });

  const handleSummarize = () => {
    mutate(ticket?.id);
  };

  return (
    <Flex justify="flex-start">
      {data?.user?.current_role === "admin" && (
        <Tooltip label="Ringkas dengan AI">
          <ActionIcon
            loading={isLoading}
            variant="light"
            color="blue"
            size="sm"
            onClick={handleSummarize}
          >
            <IconSparkles />
          </ActionIcon>
        </Tooltip>
      )}
    </Flex>
  );
};

export default TicketSummarize;
