import { createStyles } from "antd-style";

export const BREAKPOINT_MD = 768;
export const BREAKPOINT_LG = 992;

export const colors = {
  border: "#f0f0f0",
  background: "#f5f5f5",
  shadow: "rgba(0, 0, 0, 0.06)",
};

const scrollbarStyles = {
  "&::-webkit-scrollbar": {
    width: "6px",
    height: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#d9d9d9",
    borderRadius: "3px",
    "&:hover": {
      background: "#bfbfbf",
    },
  },
  "&:hover::-webkit-scrollbar-thumb": {
    background: "#bfbfbf",
  },
  scrollbarWidth: "thin",
  scrollbarColor: "#d9d9d9 transparent",
};

export const useStyles = createStyles(({ token, css }) => ({
  layout: css`
    height: 100%;
    @media (max-width: ${BREAKPOINT_MD}px) {
      flex-direction: column;
    }
  `,
  sider: css`
    padding: 16px;
    border-right: 1px solid ${token.colorBorderSecondary};
    background: #fff;
    position: relative;
    transition: all 0.2s;

    .ant-layout-sider-children {
      background: #fff;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    &.ant-layout-sider-collapsed {
      padding: 16px 0;
      .ant-layout-sider-children > * {
        display: none;
      }
    }

    @media (max-width: ${BREAKPOINT_MD}px) {
      display: none;
    }
  `,
  newChatButton: {
    width: "100%",
    marginBottom: 24,
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    padding: "0 4px",
  },
  historyContainer: {
    flex: 1,
    overflowY: "auto",
    minHeight: 0,
    padding: "0 4px",
    ...scrollbarStyles,
  },
  listItem: {
    padding: "10px 12px",
    cursor: "pointer",
    borderRadius: token.borderRadius,
    transition: "all 0.2s",
    "&:hover": {
      background: colors.background,
    },
  },
  drawerSider: {
    padding: 16,
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  toggleButton: css`
    margin-right: 16px;
    @media (max-width: ${BREAKPOINT_MD}px) {
      display: none;
    }
  `,
  mobileMenuButton: css`
    display: none;
    @media (max-width: ${BREAKPOINT_MD}px) {
      display: block;
      margin-right: 16px;
    }
  `,
  header: css`
    background: #fff;
    padding: 0 24px;
    border-bottom: 1px solid ${token.colorBorderSecondary};
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 64px;

    @media (max-width: ${BREAKPOINT_MD}px) {
      padding: 0 16px;
    }
  `,
  mainLayout: css`
    transition: all 0.2s;
  `,
  contentContainer: {
    height: "calc(100% - 64px)",
    display: "flex",
    flexDirection: "column",
    background: colors.background,
  },
  messagesContainer: css`
    flex: 1;
    padding: 24px 24px 0 24px;
    overflow-y: auto;
    min-height: 0;
    ${scrollbarStyles}
    @media (max-width: ${BREAKPOINT_MD}px) {
      padding: 16px 16px 0 16px;
    }
  `,
  messageWrapper: css`
    display: flex;
    margin-bottom: 24px;
    align-items: flex-start;
    gap: 12px;
    @media (max-width: ${BREAKPOINT_MD}px) {
      margin-bottom: 16px;
      gap: 8px;
    }
  `,
  messageWrapperRight: css`
    display: flex;
    margin-bottom: 24px;
    align-items: flex-start;
    gap: 12px;
    flex-direction: row-reverse;
    @media (max-width: ${BREAKPOINT_MD}px) {
      margin-bottom: 16px;
      gap: 8px;
    }
  `,
  messageContent: css`
    background: #fff;
    padding: 16px;
    border-radius: ${token.borderRadiusLG}px;
    max-width: 70%;
    box-shadow: 0 2px 8px ${colors.shadow};
    @media (max-width: ${BREAKPOINT_MD}px) {
      max-width: 85%;
      padding: 12px;
    }
  `,
  messageContentRight: css`
    background: #fff;
    padding: 16px;
    border-radius: ${token.borderRadiusLG}px;
    max-width: 70%;
    box-shadow: 0 2px 8px ${colors.shadow};
    span {
      color: #fff;
    }
    @media (max-width: ${BREAKPOINT_MD}px) {
      max-width: 85%;
      padding: 12px;
    }
  `,
  inputWrapper: css`
    padding: x 24px 24px;
    background: ${colors.background};
    @media (max-width: ${BREAKPOINT_MD}px) {
      padding: 12px 16px 16px;
    }
  `,
  inputBox: {
    background: "#fff",
    padding: 16,
    borderRadius: token.borderRadiusLG,
    boxShadow: `0 2px 8px ${colors.shadow}`,
  },
  newChatLayout: css`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 24px;
    background: ${token.colorBgLayout};
  `,

  newChatContainer: css`
    width: 100%;
    max-width: 600px;
    background: white;
    padding: 24px;
    border-radius: ${token.borderRadiusLG}px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
    gap: 16px;
  `,

  newChatInput: css`
    border-radius: ${token.borderRadius}px;
    resize: none;
    font-size: 16px;

    &:focus {
      box-shadow: none;
      border-color: ${token.colorPrimary};
    }
  `,

  newChatButton: css`
    align-self: flex-end;
  `,
  newChatLayout: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 24px;
    background: ${token.colorBgContainer};
  `,

  newChatContent: css`
    width: 100%;
    max-width: 800px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
  `,

  newChatTitle: css`
    margin: 0;
    font-weight: 600;
    color: ${token.colorTextHeading};
  `,

  newChatInput: css`
    width: 100%;
    max-width: 650px;
    padding: 12px 16px;
    border-radius: 24px;
    background: ${token.colorBgContainer};
    border: 1px solid ${token.colorBorder};
    resize: none;
    font-size: 16px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);

    &:focus {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-color: ${token.colorPrimary};
    }

    &::placeholder {
      color: ${token.colorTextSecondary};
    }
  `,

  suggestionsContainer: css`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  `,

  suggestionButton: css`
    color: ${token.colorTextSecondary};
    padding: 6px 16px;
    border-radius: 16px;
    background: ${token.colorBgContainerSecondary};
    transition: all 0.3s;

    &:hover {
      background: ${token.colorBgContainer};
      color: ${token.colorText};
    }

    .anticon {
      margin-right: 8px;
    }
  `,
  // Thread Chat Layout Styles
  threadChatLayout: css`
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #fff;
    margin-left: 0; // Align with sider
  `,
  loadingContainer: css`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
  `,
  messagesContainer: css`
    flex: 1;
    overflow-y: auto;
    padding: 24px 0;

    /* Minimalist Scrollbar */
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 3px;
      &:hover {
        background-color: rgba(0, 0, 0, 0.3);
      }
    }
  `,
  messagesList: css`
    padding: 0 24px;
  `,
  messageWrapper: css`
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 24px;
  `,
  messageWrapperRight: css`
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 24px;
    flex-direction: row-reverse;
  `,
  messageContent: css`
    background: #f5f5f5;
    padding: 12px 16px;
    border-radius: ${token.borderRadiusLG}px;
    max-width: 70%;
  `,
  messageContentRight: css`
    background: #f5f5f5;
    padding: 12px 16px;
    border-radius: ${token.borderRadiusLG}px;
    max-width: 70%;

    span {
      color: #fff;
    }
  `,
  userAvatar: css`
    background: ${token.colorPrimary};
  `,
  botAvatar: css`
    background: #f5f5f5;
    color: #666;
  `,
  inputContainer: css`
    padding: 24px;
    border-top: 1px solid ${token.colorBorderSecondary};
  `,

  //   end of threadChatLayout
}));
