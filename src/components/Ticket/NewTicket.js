import { parseMarkdown, uploadFiles } from "@/services/index";
import { MarkdownEditor } from "@primer/react/drafts";
import { Avatar, Col, Divider, Row } from "antd";
import { useSession } from "next-auth/react";

const NewTicket = ({ value, setValue, submitMessage }) => {
  const { data, status } = useSession();

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
      formData.append("file", file);
      const result = await uploadFiles(formData);
      return {
        url: result?.data,
        file,
      };
    } catch (error) {
      console.log(error);
    }
  };
  const renderMarkdown = async (markdown) => {
    const result = await parseMarkdown(markdown);
    return result?.html;
  };

  return (
    <>
      <Divider />
      <Row>
        <Col span={1}>
          <Avatar src={data?.user?.image} />
        </Col>
        <Col span={23}>
          <MarkdownEditor
            onRenderPreview={renderMarkdown}
            onUploadFile={uploadFile}
            emojiSuggestions={emojis}
            referenceSuggestions={references}
            mentionSuggestions={mentionables}
            savedReplies={savedReplies}
            value={value}
            onChange={setValue}
          ></MarkdownEditor>
        </Col>
      </Row>
    </>
  );
};

export default NewTicket;
