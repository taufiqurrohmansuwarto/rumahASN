import { InboxOutlined, SendOutlined } from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { useRouter } from "next/router";

const { Content, Sider } = Layout;

function MailLayout({ children, active = "inbox" }) {
  const router = useRouter();

  const changePage = (key) => {
    router.push(`/mails/${key}`);
  };

  return (
    <Layout>
      <Sider defaultCollapsed={true} theme="light" collapsible>
        <Menu
          style={{
            height: "85vh",
          }}
          onClick={({ key }) => changePage(key)}
          mode="inline"
          activeKey={active}
          items={[
            {
              key: "inbox",
              icon: <InboxOutlined />,
              label: "Kotak Masuk",
            },
            {
              key: "sent",
              icon: <SendOutlined />,
              label: "Pesan Terkirim",
            },
          ]}
        />
      </Sider>
      <Content>{children}</Content>
    </Layout>
  );
}

export default MailLayout;
