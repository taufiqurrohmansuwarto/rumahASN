import { getSavedReplies, parseMarkdown, uploadFiles } from "@/services/index";
import { MarkdownEditor } from "@primer/react/drafts";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Col, Grid, Row, Typography } from "antd";
import { useSession } from "next-auth/react";
import { memo, useCallback, useMemo } from "react";

const { useBreakpoint } = Grid;
const { Text } = Typography;

// Static styles - defined outside component to prevent recreation
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

const USER_STATUS_STYLE = {
  fontSize: 12,
  lineHeight: 1.2,
};

const TIPS_TEXT_STYLE = {
  fontSize: 12,
  display: "flex",
  alignItems: "center",
  gap: 6,
};

// Static accepted file types
const ACCEPTED_FILE_TYPES = [
  "image/*",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".txt",
  ".pdf",
];

const NewTicket = memo(
  ({
    value,
    setValue,
    submitMessage,
    loadingSubmit,
    withCancel = false,
    handleCancel,
    currentStatus,
  }) => {
    const { data, status } = useSession();
    const screens = useBreakpoint();

    // Memoize responsive calculations
    const responsiveConfig = useMemo(() => {
      const isMobile = !screens.md;
      const isTablet = screens.md && !screens.lg;
      const isDesktop = screens.lg;

      return {
        isMobile,
        isTablet,
        isDesktop,
        avatarSize: isDesktop ? 40 : 36,
        mobileAvatarSize: 32,
        padding: isMobile ? "16px 0" : "20px 0",
        gutter: isMobile ? 12 : 16,
        borderRadius: isMobile ? 8 : 10,
        minHeight: isMobile ? "120px" : "150px",
        actionsPadding: isMobile ? "12px 16px" : "16px 20px",
        actionsGap: isMobile ? 8 : 12,
        buttonSize: isMobile ? "small" : "medium",
        buttonHeight: isMobile ? 32 : 36,
        fontSize: isMobile ? 13 : 14,
        cancelMinWidth: isMobile ? "80px" : "100px",
        submitMinWidth: isMobile ? "100px" : "120px",
      };
    }, [screens.md, screens.lg]);

    const { data: savedReplies, isLoading: loadingSavedReplies } = useQuery(
      ["saved-replies"],
      () => getSavedReplies(),
      {
        refetchOnWindowFocus: false,
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

    // Memoize accepted file types
    const acceptedFileTypes = useMemo(
      () => ["image/*", ".doc", ".docx", ".xls", ".xlsx", ".txt", ".pdf"],
      []
    );

    // Memoize container styles
    const containerStyle = useMemo(
      () => ({
        padding: responsiveConfig.padding,
        background: "#fff",
      }),
      [responsiveConfig.padding]
    );

    const rowStyle = useMemo(
      () => ({
        minHeight: responsiveConfig.isMobile ? "auto" : "120px",
      }),
      [responsiveConfig.isMobile]
    );

    // Memoize avatar styles
    const desktopAvatarStyle = useMemo(
      () => ({
        border: "2px solid #f0f0f0",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }),
      []
    );

    const mobileAvatarStyle = useMemo(
      () => ({
        border: "2px solid #fff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }),
      []
    );

    // Memoize mobile user card style
    const mobileUserCardStyle = useMemo(
      () => ({
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 16,
        padding: "12px 16px",
        background: "#fafafa",
        borderRadius: 8,
        border: "1px solid #f0f0f0",
      }),
      []
    );

    // Memoize editor container style
    const editorContainerStyle = useMemo(
      () => ({
        border: "1px solid #d9d9d9",
        borderRadius: responsiveConfig.borderRadius,
        overflow: "hidden",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        background: "#fff",
      }),
      [responsiveConfig.borderRadius]
    );

    // Memoize editor style
    const editorStyle = useMemo(
      () => ({
        minHeight: responsiveConfig.minHeight,
      }),
      [responsiveConfig.minHeight]
    );

    // Memoize actions style
    const actionsStyle = useMemo(
      () => ({
        padding: responsiveConfig.actionsPadding,
        background: "#fafafa",
        borderTop: "1px solid #f0f0f0",
        display: "flex",
        justifyContent: "flex-end",
        gap: responsiveConfig.actionsGap,
        flexWrap: responsiveConfig.isMobile ? "wrap" : "nowrap",
      }),
      [
        responsiveConfig.actionsPadding,
        responsiveConfig.actionsGap,
        responsiveConfig.isMobile,
      ]
    );

    // Memoize button styles
    const cancelButtonStyle = useMemo(
      () => ({
        minWidth: responsiveConfig.cancelMinWidth,
        height: responsiveConfig.buttonHeight,
        fontSize: responsiveConfig.fontSize,
        fontWeight: 500,
        borderRadius: 6,
        transition: "all 0.2s ease",
      }),
      [
        responsiveConfig.cancelMinWidth,
        responsiveConfig.buttonHeight,
        responsiveConfig.fontSize,
      ]
    );

    const submitButtonStyle = useMemo(
      () => ({
        minWidth: responsiveConfig.submitMinWidth,
        height: responsiveConfig.buttonHeight,
        fontSize: responsiveConfig.fontSize,
        fontWeight: 500,
        borderRadius: 6,
        background: loadingSubmit ? "#f5f5f5" : "#FF4500",
        borderColor: loadingSubmit ? "#d9d9d9" : "#FF4500",
        transition: "all 0.2s ease",
        opacity: !value || loadingSubmit ? 0.6 : 1,
      }),
      [
        responsiveConfig.submitMinWidth,
        responsiveConfig.buttonHeight,
        responsiveConfig.fontSize,
        loadingSubmit,
        value,
      ]
    );

    // Memoize tips style
    const tipsStyle = useMemo(
      () => ({
        marginTop: 12,
        padding: "8px 12px",
        background: "#f9f9f9",
        borderRadius: 6,
        border: "1px solid #f0f0f0",
      }),
      []
    );

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

    return (
      <div style={containerStyle}>
        <Row gutter={[responsiveConfig.gutter, 0]} align="top" style={rowStyle}>
          {!responsiveConfig.isMobile && (
            <Col md={2} sm={0} xs={0}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  paddingTop: 8,
                }}
              >
                <Avatar
                  src={data?.user?.image}
                  size={responsiveConfig.avatarSize}
                  style={desktopAvatarStyle}
                >
                  {userInitial}
                </Avatar>
              </div>
            </Col>
          )}

          <Col md={responsiveConfig.isMobile ? 24 : 22} sm={24} xs={24}>
            {responsiveConfig.isMobile && (
              <div style={mobileUserCardStyle}>
                <Avatar
                  src={data?.user?.image}
                  size={responsiveConfig.mobileAvatarSize}
                  style={mobileAvatarStyle}
                >
                  {userInitial}
                </Avatar>
                <div>
                  <Text
                    strong
                    style={{
                      fontSize: 14,
                      color: "#262626",
                      display: "block",
                      lineHeight: 1.2,
                    }}
                  >
                    {data?.user?.name}
                  </Text>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: 12,
                      lineHeight: 1.2,
                    }}
                  >
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
                acceptedFileTypes={acceptedFileTypes}
                onUploadFile={uploadFile}
                value={value}
                onChange={setValue}
                style={editorStyle}
              >
                <MarkdownEditor.Actions style={actionsStyle}>
                  {withCancel && (
                    <MarkdownEditor.ActionButton
                      variant="danger"
                      size={responsiveConfig.buttonSize}
                      onClick={handleCancel}
                      style={cancelButtonStyle}
                    >
                      ❌ Batal
                    </MarkdownEditor.ActionButton>
                  )}
                  <MarkdownEditor.ActionButton
                    disabled={!value || loadingSubmit}
                    variant="primary"
                    size={responsiveConfig.buttonSize}
                    onClick={submitMessage}
                    style={submitButtonStyle}
                  >
                    {loadingSubmit ? "⏳ Mengirim..." : "📤 Kirim"}
                  </MarkdownEditor.ActionButton>
                </MarkdownEditor.Actions>
              </MarkdownEditor>
            </div>

            {!responsiveConfig.isMobile && (
              <div style={tipsStyle}>
                <Text
                  type="secondary"
                  style={{
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  💡 <strong>Tips:</strong> Gunakan Markdown untuk formatting
                  text, atau drag & drop file untuk upload
                </Text>
              </div>
            )}
          </Col>
        </Row>
      </div>
    );
  }
);

NewTicket.displayName = "NewTicket";

export default NewTicket;
