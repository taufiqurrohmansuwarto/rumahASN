import { createStyles } from "antd-style";

const useStyle = createStyles(({ token, css }) => {
  return {
    menuButton: css`
      position: fixed;
      left: 20px;
      top: 10px;
      z-index: 999;
    `,
    layout: css`
      width: 100%;
      height: 85vh;
      border-radius: 12px;
      display: flex;
      background: ${token.colorBgContainer};
      font-family: "Inter", system-ui, -apple-system, ${token.fontFamily},
        sans-serif;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
      backdrop-filter: blur(8px);
      transition: all 0.3s ease;

      .ant-prompts {
        color: ${token.colorText};
        font-weight: 500;
      }

      @media (max-width: 768px) {
        height: 85vh;
        padding-bottom: 10;
        border-radius: 0;
      }
    `,
    toggleButton: css`
      position: absolute;
      right: -15px;
      top: 72px;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${token.colorBgContainer};
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      z-index: 1;
    `,
    menu: css`
      background: ${token.colorBgLayout}90;
      width: 300px;
      min-height: 100%;
      display: flex;
      flex-direction: column;
    `,
    conversations: css`
      font-size: 12px;
      padding: 0 12px;
      overflow-y: auto;
      margin-top: 12px;
      scrollbar-width: thin;
      scrollbar-color: ${token.colorBorder} transparent;

      &::-webkit-scrollbar {
        width: 8px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background: ${token.colorBorder}80;
        border-radius: 4px;
        border: 2px solid transparent;
        background-clip: padding-box;
        transition: background-color 0.2s ease;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: ${token.colorBorder};
        border: 2px solid transparent;
        background-clip: padding-box;
      }
    `,
    assistants: css`
      padding: 0 12px;
      overflow-y: auto;
      margin-top: 12px;
      min-height: 120px;
      height: 5%;
      scrollbar-width: thin;
      scrollbar-color: ${token.colorBorder} transparent;

      &::-webkit-scrollbar {
        width: 8px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background: ${token.colorBorder}80;
        border-radius: 4px;
        border: 2px solid transparent;
        background-clip: padding-box;
        transition: background-color 0.2s ease;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: ${token.colorBorder};
        border: 2px solid transparent;
        background-clip: padding-box;
      }
    `,
    addBtn: css`
      width: calc(100% - 24px);
      margin: 20px 12px 24px 12px;
    `,

    chat: css`
      height: 100%;
      width: 100%;
      max-width: 60%;
      margin: 0 auto;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      padding-top: 20px;
      gap: 40px;
      transition: all 0.3s ease;

      &.chatExpanded {
        max-width: calc(100% - 80px);
      }

      @media (max-width: 768px) {
        max-width: 100%;
        padding: 0px 20px;
      }
    `,
    messages: css`
      flex: 1;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: ${token.colorBorder} transparent;

      &::-webkit-scrollbar {
        width: 8px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background: ${token.colorBorder}80;
        border-radius: 4px;
        border: 2px solid transparent;
        background-clip: padding-box;
        transition: background-color 0.2s ease;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: ${token.colorBorder};
        border: 2px solid transparent;
        background-clip: padding-box;
      }
    `,
    placeholder: css`
      flex: 1;
      padding-top: 32px;
    `,
    sender: css`
      box-shadow: ${token.boxShadow};
      @media (max-width: 768px) {
      }
    `,
    logo: css`
      display: flex;
      height: 72px;
      align-items: center;
      justify-content: start;
      padding: 0 24px;
      box-sizing: border-box;

      img {
        width: 24px;
        height: 24px;
        display: inline-block;
      }

      span {
        display: inline-block;
        margin: 0 8px;
        font-weight: bold;
        color: ${token.colorText};
        font-size: 16px;
      }
    `,
  };
});

export default useStyle;
