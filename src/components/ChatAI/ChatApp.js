import {
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  RobotOutlined,
  SettingOutlined,
  ShareAltOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  ConfigProvider,
  Drawer,
  Input,
  Layout,
  List,
  Space,
  Typography,
} from "antd";
import { createStyles } from "antd-style";
import { useState } from "react";

const { Header, Sider } = Layout;
const { Text, Title } = Typography;

// Breakpoints
const BREAKPOINT_MD = 768;

// Color palette
const colors = {
  border: "#f0f0f0",
  background: "#f5f5f5",
  shadow: "rgba(0, 0, 0, 0.06)",
};

// Scrollbar styles
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

const useStyles = createStyles(({ token, css }) => ({
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
    background: ${token.colorPrimary};
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
}));

const ChatApp = ({ height = "100vh" }) => {
  const { styles } = useStyles();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const chatHistory = Array(20)
    .fill(null)
    .map((_, i) => ({
      title: `Chat History ${i + 1}`,
      time: i === 0 ? "Just now" : i === 1 ? "Yesterday" : `${i} days ago`,
    }));

  const messages = Array(15)
    .fill(null)
    .map((_, i) => ({
      type: i % 2 === 0 ? "bot" : "user",
      content:
        i % 2 === 0
          ? `This is a bot message ${
              i + 1
            }. It contains some useful information about the topic.`
          : `This is user message ${
              i + 1
            }. It might be a question or response.`,
    }));

  const renderSideContent = () => (
    <>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        className={styles.newChatButton}
      >
        New Chat
      </Button>

      <div className={styles.historyContainer}>
        <div className={styles.sectionHeader}>
          <Text type="secondary">History</Text>
          <Button type="text" icon={<SettingOutlined />} size="small" />
        </div>
        <List
          size="small"
          dataSource={chatHistory}
          renderItem={(item) => (
            <List.Item className={styles.listItem}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Text>{item.title}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {item.time}
                </Text>
              </div>
            </List.Item>
          )}
        />
      </div>
    </>
  );

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#262626",
          borderRadius: 8,
          borderRadiusLG: 12,
        },
      }}
    >
      <Layout className={styles.layout} style={{ height }}>
        <Sider
          width={280}
          className={styles.sider}
          collapsed={collapsed}
          collapsedWidth={0}
          trigger={null}
        >
          {renderSideContent()}
        </Sider>

        <Drawer
          placement="left"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width={280}
          styles={{ body: { padding: 0 } }}
        >
          <div className={styles.drawerSider}>{renderSideContent()}</div>
        </Drawer>

        <Layout className={styles.mainLayout}>
          <Header className={styles.header}>
            <Space>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className={styles.toggleButton}
              />
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setDrawerVisible(true)}
                className={styles.mobileMenuButton}
              />
              <Title level={4} style={{ margin: 0 }}>
                Chat's Title
              </Title>
            </Space>
            <Space>
              <Button type="text" icon={<ShareAltOutlined />} />
              <Button type="text" icon={<SettingOutlined />} />
            </Space>
          </Header>

          <div className={styles.contentContainer}>
            <div className={styles.messagesContainer}>
              {messages.map((message, index) =>
                message.type === "user" ? (
                  <div key={index} className={styles.messageWrapperRight}>
                    <Avatar icon={<UserOutlined />} />
                    <div className={styles.messageContentRight}>
                      <Text>{message.content}</Text>
                    </div>
                  </div>
                ) : (
                  <div key={index} className={styles.messageWrapper}>
                    <Avatar
                      icon={<RobotOutlined />}
                      style={{ background: "#f5f5f5", color: "#666" }}
                    />
                    <div className={styles.messageContent}>
                      <Text>{message.content}</Text>
                    </div>
                  </div>
                )
              )}
            </div>

            <div className={styles.inputWrapper}>
              <div className={styles.inputBox}>
                <Input
                  placeholder="Type here..."
                  size="large"
                  bordered={false}
                  suffix={
                    <Space>
                      <Button type="text" icon={<SettingOutlined />} />
                    </Space>
                  }
                />
              </div>
            </div>
          </div>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default ChatApp;
