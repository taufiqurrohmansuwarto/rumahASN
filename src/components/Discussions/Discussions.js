import {
  downvoteDiscussion,
  getDiscussions,
  upvoteDiscussion,
} from "@/services/asn-connect-discussions.services";
import {
  BookOutlined,
  CaretDownFilled,
  CaretUpFilled,
  CommentOutlined,
} from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Col,
  Flex,
  List,
  Row,
  Space,
  Typography,
  message,
} from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import "dayjs/locale/id";

import relativeTime from "dayjs/plugin/relativeTime";
import ReactMarkdownCustom from "../MarkdownEditor/ReactMarkdownCustom";

dayjs.extend(relativeTime);

const DiscussionCard = ({ item }) => {
  const router = useRouter();

  const gotoDetail = () =>
    router.push(`/asn-connect/asn-discussions/${item.id}/detail`);

  const queryClient = useQueryClient();

  const { mutate: upvote } = useMutation(() => upvoteDiscussion(item?.id), {
    onSuccess: () => {
      queryClient.invalidateQueries("asn-discussions");
      message.success("Discussion upvoted successfully");
    },
  });

  const { mutate: downvote } = useMutation(() => downvoteDiscussion(item?.id), {
    onSuccess: () => {
      queryClient.invalidateQueries("asn-discussions");
      message.success("Discussion downvoted successfully");
    },
  });

  return (
    <Card bordered={true} style={{ width: "100%" }}>
      <Flex align="center" gap={50}>
        <Flex vertical align="center" gap={4}>
          <CaretUpFilled
            style={{
              fontSize: 32,
              color: `${
                item?.votes?.[0]?.vote_type === "upvote" ? "orange" : "gray"
              }`,
              cursor: "pointer",
            }}
            onClick={upvote}
          />
          <span
            style={{
              fontWeight: "bold",
              fontSize: 18,
            }}
          >
            {parseInt(item?.upvote_count) - parseInt(item?.downvote_count)}
          </span>
          <CaretDownFilled
            onClick={downvote}
            style={{
              fontSize: 32,
              color: `${
                item?.votes?.[0]?.vote_type === "downvote" ? "orange" : "gray"
              }`,
              cursor: "pointer",
            }}
          />
        </Flex>
        <Flex style={{ flexGrow: 1 }} gap={14} vertical>
          <Flex align="center" gap={4}>
            <Flex>
              <Avatar size={28} src={item?.user?.image} />
            </Flex>
            <Flex vertical>
              <span
                style={{
                  fontSize: 10,
                }}
              >
                {item?.user?.username}
              </span>
              <span
                style={{
                  fontSize: 10,
                }}
              >
                {dayjs(item?.created_at).locale("id").fromNow()}
              </span>
            </Flex>
          </Flex>
          <Flex vertical>
            <Typography.Link onClick={gotoDetail}>
              <span style={{ fontWeight: "bold", fontSize: 18 }}>
                {item.title}
              </span>
            </Typography.Link>
            <ReactMarkdownCustom>{item.content}</ReactMarkdownCustom>
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
                  {item?.comment_count} Komentar
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
  const { data: posts, isLoading } = useQuery(["asn-discussions"], () =>
    getDiscussions()
  );

  return (
    <>
      <Stack>
        <Row justify="center" gutter={[0, 16]}>
          <Col md={18}>
            <CreateDiscussionButton />
            <List
              loading={isLoading}
              dataSource={posts?.data}
              renderItem={(item) => (
                <List.Item>
                  <DiscussionCard item={item} />
                </List.Item>
              )}
              size="large"
              pagination={{
                pageSize: 10,

                position: "both",
                total: posts?.pagination?.total || 0,
                showTotal: (total, range) =>
                  `Menampilkan ${range[0]}-${range[1]} dari ${total} diskusi`,
              }}
            />
          </Col>
        </Row>
      </Stack>
    </>
  );
};

export default Discussions;
