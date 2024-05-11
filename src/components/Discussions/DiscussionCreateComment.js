import {
  createComment,
  updateComment,
} from "@/services/asn-connect-discussions.services";
import { parseMarkdown, uploadFiles } from "@/services/index";
import { Comment } from "@ant-design/compatible";
import { MarkdownEditor } from "@primer/react/drafts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Col, Row, message } from "antd";
import { useSession } from "next-auth/react";
import { useState } from "react";
import AvatarUser from "../Users/AvatarUser";

const uploadFile = async (file) => {
  try {
    const formData = new FormData();

    // if file not image png, jpg, jpeg, gif
    const allowedTypes = ["image/png", "image/jpg", "image/jpeg", "image/gif"];

    if (!allowedTypes.includes(file.type)) {
      return;
    } else {
      formData.append("file", file);
      const result = await uploadFiles(formData);
      return {
        url: result?.data,
        file,
      };
    }
  } catch (error) {
    console.log(error);
  }
};

const renderMarkdown = async (markdown) => {
  if (!markdown) return;
  const result = await parseMarkdown(markdown);
  return result?.html;
};

function DiscussionCreateComment({
  discussionId,
  commentId = null,
  parentId = null,
  withBatal = false,
  onCancel,
  action = "create",
  content = "",
}) {
  const queryClient = useQueryClient();
  const { data } = useSession();
  const [value, setValue] = useState(content);

  const { mutateAsync: create, isLoading: isLoadingCreate } = useMutation(
    (data) => createComment(data),
    {
      onSuccess: () => {
        message.success("Comment created successfully");
        setValue("");
        if (withBatal) onCancel();
      },
      onSettled: () => {
        queryClient.invalidateQueries([
          "asn-discussions-comment",
          discussionId,
        ]);
        queryClient.invalidateQueries(["asn-discussions", discussionId]);
      },
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
    }
  );

  const { mutateAsync: update, isLoading: isLoadingUpdate } = useMutation(
    (data) => updateComment(data),
    {
      onSuccess: () => {
        message.success("Comment updated successfully");
        setValue("");
        if (withBatal) onCancel();
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

  const handleCancel = () => {
    onCancel();
  };

  const submitMessage = async () => {
    console.log(action);
    try {
      if (action === "create") {
        const payload = {
          discussionId,
          data: {
            content: value,
            parentId,
          },
        };
        await create(payload);
      } else if (action === "edit") {
        // do something
        const payload = {
          discussionId,
          commentId,
          data: {
            content: value,
          },
        };
        await update(payload);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Comment
      avatar={
        <>
          {action === "create" && (
            <AvatarUser
              userId={data?.user?.id}
              src={data?.user?.image}
              alt={data?.user?.name}
            />
          )}
        </>
      }
      content={
        <MarkdownEditor
          acceptedFileTypes={[
            "image/png",
            "image/jpg",
            "image/jpeg",
            "image/gif",
          ]}
          value={value}
          onChange={setValue}
          onRenderPreview={renderMarkdown}
          onUploadFile={uploadFile}
          savedReplies={false}
          mentionSuggestions={false}
        >
          <MarkdownEditor.Actions>
            {withBatal && (
              <MarkdownEditor.ActionButton
                variant="danger"
                size="medium"
                onClick={handleCancel}
              >
                Batal
              </MarkdownEditor.ActionButton>
            )}
            <MarkdownEditor.ActionButton
              disabled={!value || isLoadingCreate || isLoadingUpdate}
              variant="primary"
              size="medium"
              onClick={submitMessage}
            >
              {isLoadingCreate || isLoadingUpdate ? "Loading..." : "OK"}
            </MarkdownEditor.ActionButton>
          </MarkdownEditor.Actions>
        </MarkdownEditor>
      }
    />
  );
}

export default DiscussionCreateComment;
