import { parseMarkdown, uploadFiles } from "@/services/index";
import { createPost } from "@/services/socmed.services";
import { MarkdownEditor } from "@primer/react/drafts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, Comment } from "antd";
import { useSession } from "next-auth/react";
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

function SocmedCreatePost() {
  const { data, status } = useSession();
  const queryClient = useQueryClient();

  const [value, setValue] = useState();
  const { mutate: create, isLoading } = useMutation(
    (data) => createPost(data),
    {
      onSuccess: () => {
        setValue("");
      },
      onError: (error) => {
        alert(error.message);
      },
      onSettled: () => {
        queryClient.invalidateQueries("socmed-posts");
      },
    }
  );

  const submitMessage = () => {
    if (!value) {
      return;
    } else {
      create({ content: value });
    }
  };

  return (
    <Comment
      avatar={<Avatar src={data?.user?.image} alt={data?.user?.name} />}
      content={
        <>
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
                disabled={!value || isLoading}
                variant="primary"
                size="medium"
                onClick={submitMessage}
              >
                {isLoading ? "Loading..." : "Submit"}
              </MarkdownEditor.ActionButton>
            </MarkdownEditor.Actions>
          </MarkdownEditor>
        </>
      }
    />
  );
}

export default SocmedCreatePost;
