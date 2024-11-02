import { Layout, theme, Typography } from "antd";

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;
const { useToken } = theme;

const ChatInterface = () => {
  const token = useToken();
  return <div>hello world</div>;
};

export default ChatInterface;
