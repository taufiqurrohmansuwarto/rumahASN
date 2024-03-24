import { parseMarkdown, uploadFiles } from "@/services/index";
import { createPost } from "@/services/socmed.services";
import { MarkdownEditor } from "@primer/react/drafts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, Comment } from "antd";
import { useSession } from "next-auth/react";
import { useState } from "react";

const emojis = [
  { name: "+1", character: "👍" },
  { name: "-1", character: "👎" },
  { name: "heart", character: "❤️" },
  { name: "wave", character: "👋" },
  { name: "raised_hands", character: "🙌" },
  { name: "pray", character: "🙏" },
  { name: "clap", character: "👏" },
  { name: "ok_hand", character: "👌" },
  { name: "point_up", character: "☝️" },
  { name: "point_down", character: "👇" },
  { name: "point_left", character: "👈" },
  { name: "point_right", character: "👉" },
  { name: "raised_hand", character: "✋" },
  { name: "thumbsup", character: "👍" },
  { name: "thumbsdown", character: "👎" },
];

const references = [
  {
    id: "1",
    titleText: "Add logging functionality",
    titleHtml: "Add logging functionality",
  },
  {
    id: "2",
    titleText: "Error: `Failed to install` when installing",
    titleHtml: "Error: <code>Failed to install</code> when installing",
  },
  {
    id: "3",
    titleText: "Add error-handling functionality",
    titleHtml: "Add error-handling functionality",
  },
];

const mentionables = [
  { identifier: "monalisa", description: "Monalisa Octocat" },
  { identifier: "github", description: "GitHub" },
  { identifier: "primer", description: "Primer" },
];

const savedReplies = [
  { name: "Duplicate", content: "Duplicate of #" },
  {
    name: "Welcome",
    content:
      "Welcome to the project!\n\nPlease be sure to read the contributor guidelines.",
  },
  { name: "Thanks", content: "Thanks for your contribution!" },
];

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
            emojiSuggestions={null}
            referenceSuggestions={null}
            mentionSuggestions={null}
            savedReplies={null}
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
