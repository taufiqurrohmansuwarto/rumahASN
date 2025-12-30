import { getSavedReplies, parseMarkdown, uploadFiles } from "@/services/index";
import { MarkdownEditor } from "@primer/react/drafts";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Col, Row, Grid, Typography } from "antd";
import { useSession } from "next-auth/react";
import { useMemo, useCallback, memo } from "react";

const { useBreakpoint } = Grid;
const { Text } = Typography;

// Static styles - defined outside component to prevent recreation on every render
const DESKTOP_AVATAR_STYLE = {
  border: "2px solid #f0f0f0",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
};

const MOBILE_AVATAR_STYLE = {
  border: "2px solid #fff",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
};

const MOBILE_USER_CARD_STYLE = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 16,
  padding: "12px 16px",
  background: "#fafafa",
  borderRadius: 8,
  border: "1px solid #f0f0f0",
};

const TIPS_STYLE = {
  marginTop: 12,
  padding: "8px 12px",
  background: "#f9f9f9",
  borderRadius: 6,
  border: "1px solid #f0f0f0",
};

const AVATAR_CONTAINER_STYLE = {
  display: "flex",
  justifyContent: "center",
  paddingTop: 8,
};

const USER_NAME_STYLE = {
  fontSize: 14,
  color: "#262626",
  display: "block",
  lineHeight: 1.2,
};

const USER_SUBTITLE_STYLE = {
  fontSize: 12,
  lineHeight: 1.2,
};

const TIPS_TEXT_STYLE = {
  fontSize: 12,
  display: "flex",
  alignItems: "center",
  gap: 6,
};

// Static file types
const ACCEPTED_FILE_TYPES = ["image/*", ".doc", ".docx", ".xls", ".xlsx", ".txt", ".pdf"];

const NewTicket = memo(({
  value,
  setValue,
  submitMessage,
  loadingSubmit,
  withCancel = false,
  handleCancel,
  currentStatus,
}) => {
  const { data } = useSession();
  const screens = useBreakpoint();

  // Simple responsive calculations - avoid excessive memoization
  const isMobile = !screens.md;
  const isDesktop = screens.lg;

  // Only memoize complex computed styles
  const containerStyle = useMemo(() => ({
    padding: isMobile ? "16px 0" : "20px 0",
    background: "#fff",
  }), [isMobile]);

  const rowStyle = useMemo(() => ({
    minHeight: isMobile ? "auto" : "120px",
  }), [isMobile]);

  const editorContainerStyle = useMemo(() => ({
    border: "1px solid #d9d9d9",
    borderRadius: isMobile ? 8 : 10,
    overflow: "hidden",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    background: "#fff",
  }), [isMobile]);

  const editorStyle = useMemo(() => ({
    minHeight: isMobile ? "120px" : "150px",
  }), [isMobile]);

  const actionsStyle = useMemo(() => ({
    padding: isMobile ? "12px 16px" : "16px 20px",
    background: "#fafafa",
    borderTop: "1px solid #f0f0f0",
    display: "flex",
    justifyContent: "flex-end",
    gap: isMobile ? 8 : 12,
    flexWrap: isMobile ? "wrap" : "nowrap",
  }), [isMobile]);

  // Button styles - remove value dependency to avoid re-render on typing
  const cancelButtonStyle = useMemo(() => ({
    minWidth: isMobile ? "80px" : "100px",
    height: isMobile ? 32 : 36,
    fontSize: isMobile ? 13 : 14,
    fontWeight: 500,
    borderRadius: 6,
    transition: "all 0.2s ease",
  }), [isMobile]);

  const submitButtonStyle = useMemo(() => ({
    minWidth: isMobile ? "100px" : "120px",
    height: isMobile ? 32 : 36,
    fontSize: isMobile ? 13 : 14,
    fontWeight: 500,
    borderRadius: 6,
    background: "#FF4500",
    borderColor: "#FF4500",
    transition: "all 0.2s ease",
  }), [isMobile]);

  const { data: savedReplies } = useQuery(
    ["saved-replies"],
    () => getSavedReplies(),
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    }
  );

  // Memoize upload file function
  const uploadFile = useCallback(async (file) => {
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
  }, []);

  // Memoize render markdown function
  const renderMarkdown = useCallback(async (markdown) => {
    if (!markdown) return;
    const result = await parseMarkdown(markdown);
    return result?.html;
  }, []);

  // Memoize focus/blur handlers
  const handleFocus = useCallback((e) => {
    e.currentTarget.style.borderColor = "#FF4500";
    e.currentTarget.style.boxShadow = "0 0 0 2px rgba(255, 69, 0, 0.1)";
  }, []);

  const handleBlur = useCallback((e) => {
    e.currentTarget.style.borderColor = "#d9d9d9";
    e.currentTarget.style.boxShadow = "none";
  }, []);

  // Memoize user initial
  const userInitial = useMemo(
    () => data?.user?.name?.charAt(0)?.toUpperCase() || "U",
    [data?.user?.name]
  );

  const avatarSize = isDesktop ? 40 : 36;
  const buttonSize = isMobile ? "small" : "medium";
  const gutter = isMobile ? 12 : 16;

  return (
    <div style={containerStyle}>
      <Row gutter={[gutter, 0]} align="top" style={rowStyle}>
        {!isMobile && (
          <Col md={2} sm={0} xs={0}>
            <div style={AVATAR_CONTAINER_STYLE}>
              <Avatar
                src={data?.user?.image}
                size={avatarSize}
                style={DESKTOP_AVATAR_STYLE}
              >
                {userInitial}
              </Avatar>
            </div>
          </Col>
        )}

        <Col md={isMobile ? 24 : 22} sm={24} xs={24}>
          {isMobile && (
            <div style={MOBILE_USER_CARD_STYLE}>
              <Avatar
                src={data?.user?.image}
                size={32}
                style={MOBILE_AVATAR_STYLE}
              >
                {userInitial}
              </Avatar>
              <div>
                <Text strong style={USER_NAME_STYLE}>
                  {data?.user?.name}
                </Text>
                <Text type="secondary" style={USER_SUBTITLE_STYLE}>
                  💬 Menulis balasan...
                </Text>
              </div>
            </div>
          )}

          <div
            style={editorContainerStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            <MarkdownEditor
              onRenderPreview={renderMarkdown}
              savedReplies={savedReplies}
              acceptedFileTypes={ACCEPTED_FILE_TYPES}
              onUploadFile={uploadFile}
              value={value}
              onChange={setValue}
              style={editorStyle}
            >
              <MarkdownEditor.Actions style={actionsStyle}>
                {withCancel && (
                  <MarkdownEditor.ActionButton
                    variant="danger"
                    size={buttonSize}
                    onClick={handleCancel}
                    style={cancelButtonStyle}
                  >
                    Batal
                  </MarkdownEditor.ActionButton>
                )}
                <MarkdownEditor.ActionButton
                  disabled={!value || loadingSubmit}
                  variant="primary"
                  size={buttonSize}
                  onClick={submitMessage}
                  style={submitButtonStyle}
                >
                  {loadingSubmit ? "Mengirim..." : "Kirim"}
                </MarkdownEditor.ActionButton>
              </MarkdownEditor.Actions>
            </MarkdownEditor>
          </div>

          {!isMobile && (
            <div style={TIPS_STYLE}>
              <Text type="secondary" style={TIPS_TEXT_STYLE}>
                💡 <strong>Tips:</strong> Gunakan Markdown untuk formatting
                text, atau drag & drop file untuk upload
              </Text>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
});

NewTicket.displayName = "NewTicket";

export default NewTicket;
