import { InboxOutlined, MailOutlined, SendOutlined } from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { useRouter } from "next/router";

const { Content, Sider } = Layout;

function MailLayout({ children, active = "all" }) {
  const router = useRouter();

  const changePage = (key) => {
    router.push(`/mails/${key}`);
  };

  return (
    <Layout>
      <Sider theme="light" collapsible>
        <Menu
          style={{
            height: "85vh",
          }}
          onClick={({ key }) => changePage(key)}
          mode="inline"
          defaultSelectedKeys={["all"]}
          activeKey={active}
          items={[
            {
              key: "all",
              icon: <MailOutlined />,
              label: "Semua Pesan",
            },
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
