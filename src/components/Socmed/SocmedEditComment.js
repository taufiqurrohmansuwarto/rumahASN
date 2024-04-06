import { parseMarkdown, uploadFiles } from "@/services/index";
import { updateComment } from "@/services/socmed.services";
import { MarkdownEditor } from "@primer/react/drafts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, message } from "antd";
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

const SocmedEditComment = ({
  parentId,
  withBatal = false,
  onCancel,
  comment,
}) => {
  const { data: currentUser } = useSession();
  const router = useRouter();
  const [form] = Form.useForm();

  const [value, setValue] = useState(comment?.comment);

  const handleCancel = () => {
    onCancel();
  };

  const queryClient = useQueryClient();

  const { mutate: update, isLoading } = useMutation(
    (data) => updateComment(data),
    {
      onSuccess: () => {
        form.resetFields();
        message.success("Comment Edited");
        queryClient.invalidateQueries(["socmed-comments", router.query.id]);
        if (withBatal) onCancel();
      },
      onError: (error) => {
        message.error(error.message);
      },
      onSettled: () => {},
    }
  );

  const submitMessage = () => {
    if (!value) return;
    const data = {
      postId: router.query.id,
      commentId: comment?.id,
      data: {
        comment: value,
      },
    };

    update(data);
  };

  return (
    <Comment
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
            <MarkdownEditor.ActionButton
              variant="danger"
              size="medium"
              onClick={handleCancel}
            >
              Cancel
            </MarkdownEditor.ActionButton>
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

export default SocmedEditComment;
