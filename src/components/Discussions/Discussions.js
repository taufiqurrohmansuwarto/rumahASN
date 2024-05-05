import {
  BookOutlined,
  CaretDownFilled,
  CaretUpFilled,
  CommentOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Card, Flex, List, Space } from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

const DiscussionCard = ({ title, description }) => {
  return (
    <Card style={{ width: "100%" }}>
      <Flex align="center" gap={50}>
        <Flex vertical align="center" gap={4}>
          <CaretUpFilled
            style={{ fontSize: 32, color: "gray", cursor: "pointer" }}
          />
          <span
            style={{
              fontWeight: "bold",
              fontSize: 18,
            }}
          >
            2.5k
          </span>
          <CaretDownFilled
            style={{ fontSize: 32, color: "orange", cursor: "pointer" }}
          />
        </Flex>
        <Flex style={{ flexGrow: 1 }} gap={14} vertical>
          <Flex align="center" gap={4}>
            <Flex>
              <Avatar
                size={28}
                src="https://avatars.githubusercontent.com/u/62581081?v=4"
              />
            </Flex>
            <Flex vertical>
              <span
                style={{
                  fontSize: 10,
                }}
              >
                Iput Taufiqurrohman Suwarto
              </span>
              <span
                style={{
                  fontSize: 10,
                }}
              >
                2 hours ago
              </span>
            </Flex>
          </Flex>
          <Flex vertical>
            <span style={{ fontWeight: "bold", fontSize: 18 }}>{title}</span>
            <span>{description}</span>
          </Flex>
          <Flex justify="space-between">
            <Flex>
              <Space>
                <span
                  style={{
                    fontSize: 12,
                    color: "gray",
                  }}
                >
                  <CommentOutlined style={{ marginRight: 8 }} />
                  530 Komentar
                </span>
                <span>
                  {/* dot html */}
                  &#x2022;
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: "gray",
                  }}
                >
                  <BookOutlined style={{ marginRight: 8 }} />
                  Simpan
                </span>
              </Space>
            </Flex>
            <Flex>
              <Space></Space>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
};

const CreateDiscussionButton = () => {
  const { data } = useSession();
  const router = useRouter();

  const gotoCreateDiscussion = () => {
    router.push("/asn-connect/asn-discussions/create");
  };

  return (
    <>
      {data && (
        <>
          {data?.user?.current_role === "admin" && (
            <Button type="primary" onClick={gotoCreateDiscussion}>
              Buat Diskusi
            </Button>
          )}
        </>
      )}
    </>
  );
};

const Discussions = () => {
  const posts = [
    {
      title: "First Post",
      description:
        "lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    },
    {
      title: "Second Post",
      description: "test",
    },
  ];

  return (
    <Space direction="vertical">
      <CreateDiscussionButton />
      <List
        dataSource={posts}
        renderItem={(item) => (
          <List.Item>
            <DiscussionCard title={item.title} description={item.description} />
          </List.Item>
        )}
      />
    </Space>
  );
};

export default Discussions;
