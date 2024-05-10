import { createComment } from "@/services/asn-connect-discussions.services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, message } from "antd";
import React from "react";

function CreateComment({ discussionId, parentId = null }) {
  const queryClient = useQueryClient();

  const { mutateAsync: create, isLoading: isLoadingCreate } = useMutation(
    (data) => createComment(data),
    {
      onSuccess: () => {
        message.success("Comment created successfully");
      },
      onSettled: () => {
        queryClient.invalidateQueries([
          "asn-discussions-comment",
          discussionId,
        ]);
      },
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
    }
  );

  const handleCreate = async () => {
    try {
      const payload = {
        discussionId,
        data: {
          content: "Comment content",
        },
      };
      await create(payload);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Button loading={isLoadingCreate} onClick={handleCreate}>
      Buat Komentar
    </Button>
  );
}

export default CreateComment;
