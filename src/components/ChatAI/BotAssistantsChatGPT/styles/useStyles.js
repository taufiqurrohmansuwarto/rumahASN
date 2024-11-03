import { createStyles } from "antd-style";

export const useStyles = createStyles(({ token, css }) => ({
  container: css`
    height: 100vh;
    background: ${token.colorBgContainer};
  `,
  layout: css`
    height: 100vh;
  `,
  sider: css`
    background: ${token.colorBgElevated} !important;
    border-right: 1px solid ${token.colorBorder};

    .ant-layout-sider-children {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .ant-layout-sider-trigger {
      border-right: 1px solid ${token.colorBorder};
    }

    @media (max-width: ${token.screenMD}px) {
      position: absolute !important;
      height: 100%;
      z-index: 200;
      &.ant-layout-sider-collapsed {
        display: none;
      }
    }
  `,
  mainLayout: css`
    display: flex;
    flex-direction: column;
    height: 100vh;
  `,
  contentWrapper: css`
    flex: 1;
    overflow: hidden;
    position: relative;
    background: ${token.colorBgLayout};
  `,
  assistantWrapper: css`
    padding: ${token.padding}px;
    background: ${token.colorBgContainer};
    border-bottom: 1px solid ${token.colorBorder};
    display: flex;
    gap: ${token.padding}px;
    align-items: center;

    .assistant-select {
      flex: 1;
    }
  `,
  historyWrapper: css`
    display: flex;
    flex-direction: column;
    height: 100%;

    .history-header {
      padding: ${token.padding}px;
      border-bottom: 1px solid ${token.colorBorder};
    }

    .history-list {
      flex: 1;
      overflow: auto;
      padding: ${token.paddingXS}px;

      .history-item {
        padding: ${token.padding}px;
        border-radius: ${token.borderRadius}px;
        cursor: pointer;
        margin-bottom: ${token.marginXS}px;

        &:hover {
          background: ${token.colorBgTextHover};
        }

        &.active {
          background: ${token.colorPrimaryBg};
        }
      }
    }
  `,
  chatWrapper: css`
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;

    .chat-messages {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 80px;
      overflow-y: auto;
      padding: ${token.paddingLG}px;
      background: ${token.colorBgLayout};

      .message-container {
        max-width: 800px;
        margin: 0 auto;
        padding-bottom: ${token.padding}px;
      }

      .message-item {
        margin-bottom: ${token.margin}px;

        .ant-card {
          max-width: 80%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

          &.assistant {
            margin-right: auto;
            background: ${token.colorBgContainer};
          }

          &.user {
            margin-left: auto;
            background: ${token.colorPrimary};

            .ant-card-body {
              color: #fff;
            }
          }
        }
      }
    }

    .chat-input {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: ${token.colorBgContainer};
      border-top: 1px solid ${token.colorBorder};
      padding: ${token.padding}px;
      height: 80px;
      display: flex;
      align-items: center;
      z-index: 10;

      .input-container {
        max-width: 800px;
        margin: 0 auto;
        display: flex;
        gap: ${token.padding}px;
        width: 100%;

        .ant-input-textarea {
          flex: 1;

          textarea {
            resize: none;
            padding-right: ${token.padding}px;
          }
        }
      }
    }
  `,
  newChatWrapper: css`
    max-width: 900px;
    margin: 0 auto;
    padding: ${token.paddingLG}px;

    .feature-grid {
      margin-top: ${token.marginLG}px;
    }

    .feature-card {
      height: 100%;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-4px);
      }
    }
  `,
}));
