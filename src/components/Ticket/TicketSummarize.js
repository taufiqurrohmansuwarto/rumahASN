import { summarizeQuestion } from "@/services/admin.services";
import { ActionIcon } from "@mantine/core";
import { IconSparkles } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message, Tooltip } from "antd";
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
      message.error(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["publish-ticket"]);
    },
  });

  const handleSummarize = () => {
    mutate(ticket?.id);
  };

  return (
    <>
      {data?.user?.current_role === "admin" && (
        <Tooltip title="Ringkas dengan AI">
          <ActionIcon
            loading={isLoading}
            variant="light"
            color="gray"
            size="sm"
            onClick={handleSummarize}
          >
            <IconSparkles />
          </ActionIcon>
        </Tooltip>
      )}
    </>
  );
};

export default TicketSummarize;
