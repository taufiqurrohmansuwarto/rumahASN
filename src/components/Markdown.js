import { Markdown as MarkdownEditor } from "@ant-design/pro-editor";
import { ConfigProvider } from "antd";
import { createStudioAntdTheme } from "@ant-design/pro-editor";

const Markdown = ({ children }) => {
  return (
    <ConfigProvider theme={createStudioAntdTheme}>
      <MarkdownEditor>{children}</MarkdownEditor>
    </ConfigProvider>
  );
};

export default Markdown;
