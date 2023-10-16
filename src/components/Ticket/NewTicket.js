import { getSavedReplies, parseMarkdown, uploadFiles } from "@/services/index";
import { MarkdownEditor } from "@primer/react/drafts";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Col, Row } from "antd";
import { useSession } from "next-auth/react";
import ButtonStatus from "../TicketProps/ButtonStatus";

const NewTicket = ({
  value,
  setValue,
  submitMessage,
  loadingSubmit,
  withCancel = false,
  handleCancel,
  currentStatus,
}) => {
  const { data, status } = useSession();

  const { data: savedReplies, isLoading: loadingSavedReplies } = useQuery(
    ["saved-replies"],
    () => getSavedReplies(),
    {
      refetchOnWindowFocus: false,
    }
  );

  // todo add mentions

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
    if (!markdown) return;
    const result = await parseMarkdown(markdown);
    return result?.html;
  };

  return (
    <>
      <Row>
        <Col md={1} sm={0} xs={0}>
          <Avatar src={data?.user?.image} />
        </Col>
        <Col md={23} sm={24} xs={24}>
          <MarkdownEditor
            onRenderPreview={renderMarkdown}
            savedReplies={savedReplies}
            acceptedFileTypes={[
              "image/*",
              // word, excel, txt, pdf
              ".doc",
              ".docx",
              ".xls",
              ".xlsx",
              ".txt",
              ".pdf",
            ]}
            onUploadFile={uploadFile}
            value={value}
            onChange={setValue}
          >
            <MarkdownEditor.Actions>
              {withCancel && (
                <MarkdownEditor.ActionButton
                  variant="danger"
                  size="medium"
                  onClick={handleCancel}
                >
                  Cancel
                </MarkdownEditor.ActionButton>
              )}
              <ButtonStatus currentStatus={currentStatus} />
              <MarkdownEditor.ActionButton
                disabled={!value || loadingSubmit}
                variant="primary"
                size="medium"
                onClick={submitMessage}
              >
                {loadingSubmit ? "Loading..." : "Submit"}
              </MarkdownEditor.ActionButton>
            </MarkdownEditor.Actions>
          </MarkdownEditor>
        </Col>
      </Row>
    </>
  );
};

export default NewTicket;
