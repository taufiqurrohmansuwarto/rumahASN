import { parseMarkdown, uploadFiles } from "@/services/index";
import { createComment } from "@/services/socmed.services";
import { MarkdownEditor } from "@primer/react/drafts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, message } from "antd";
import { Comment } from "@ant-design/compatible";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

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

const SocmedCreateComment = ({ parentId, withBatal = false, onCancel }) => {
  const { data: currentUser } = useSession();
  const router = useRouter();
  const [value, setValue] = useState("");

  const queryClient = useQueryClient();

  const { mutate: create, isLoading } = useMutation(
    (data) => createComment(data),
    {
      onSuccess: () => {
        message.success("Comment posted");
        queryClient.invalidateQueries(["socmed-comments", router.query.id]);
        queryClient.invalidateQueries(["socmed-posts"]);
        setValue("");
        if (withBatal) onCancel();
      },
      onError: (error) => {
        message.error(error.message);
      },
      onSettled: () => {
        queryClient.invalidateQueries(["socmed-comments", router.query.id]);
        queryClient.invalidateQueries(["socmed-posts"]);
      },
    }
  );

  const submitMessage = () => {
    if (!value) return;
    const data = {
      postId: router.query.id,
      data: {
        comment: value,
        parent_id: parentId || null,
      },
    };

    create(data);
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Comment
      avatar={
        <Avatar src={currentUser?.user?.image} alt={currentUser?.user?.name} />
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
                Cancel
              </MarkdownEditor.ActionButton>
            )}
            <MarkdownEditor.ActionButton
              disabled={!value || isLoading}
              variant="primary"
              size="medium"
              onClick={submitMessage}
            >
              {isLoading ? "Loading..." : "Submit"}
            </MarkdownEditor.ActionButton>
          </MarkdownEditor.Actions>
        </MarkdownEditor>
      }
    />
  );
};

export default SocmedCreateComment;
