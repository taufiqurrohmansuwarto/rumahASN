import { parseMarkdown, uploadFiles } from "@/services/index";
import { MarkdownEditor } from "@primer/react/drafts";
import { Avatar, Col, Divider, Row } from "antd";
import { useSession } from "next-auth/react";

const NewTicket = ({ value, setValue, submitMessage }) => {
  const { data, status } = useSession();

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
            value={value}
            onChange={setValue}
          >
            <MarkdownEditor.Actions>
              <MarkdownEditor.ActionButton variant="danger" size="medium">
                Cancel
              </MarkdownEditor.ActionButton>
              <MarkdownEditor.ActionButton
                disabled={!value}
                variant="primary"
                size="medium"
                onClick={submitMessage}
              >
                Submit
              </MarkdownEditor.ActionButton>
            </MarkdownEditor.Actions>
          </MarkdownEditor>
        </Col>
      </Row>
    </>
  );
};

export default NewTicket;