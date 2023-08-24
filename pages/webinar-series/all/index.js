import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { allWebinars } from "@/services/webinar.services";
import { LikeOutlined, MessageOutlined, StarOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Card, Image, List, Space } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const IconText = ({ icon, text, color }) => (
  <div style={{ cursor: "pointer" }}>
    <Space>
      {React.createElement(icon, { style: { color } })}
      <span
        style={{
          color: color,
        }}
      >
        {text}
      </span>
    </Space>
  </div>
);

function WebinarAll() {
  const router = useRouter();

  const { data, isLoading } = useQuery(
    ["webinar-series-all"],
    () => allWebinars(),
    {}
  );

  return (
    <>
      <Head>
        <title>Rumah ASN - Semua Webinar</title>
      </Head>
      <PageContainer title="Webinar Series" content="Daftar Semua webinar">
        <Card>
          <List
            pagination={{
              total: data?.total,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
            itemLayout="vertical"
            size="large"
            dataSource={data?.data}
            renderItem={(item) => (
              <List.Item
                extra={<Image width={272} src={item?.image_url} alt="test" />}
                actions={[
                  <IconText
                    icon={StarOutlined}
                    text="156"
                    color="green"
                    key="list-vertical-star-o"
                  />,
                  <IconText
                    icon={LikeOutlined}
                    text="156"
                    key="list-vertical-like-o"
                  />,
                  <IconText
                    icon={MessageOutlined}
                    text="2"
                    key="list-vertical-message"
                  />,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      src={
                        "https://xsgames.co/randomusers/assets/avatars/pixel/25.jpg"
                      }
                    />
                  }
                  title={item?.name}
                  description={item?.description}
                />
                {item?.description}
              </List.Item>
            )}
          />
        </Card>
      </PageContainer>
    </>
  );
}

WebinarAll.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

WebinarAll.Auth = {
  action: "manage",
  subject: "tickets",
};

export default WebinarAll;
