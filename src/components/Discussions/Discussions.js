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
import { Stack, Text } from "@mantine/core";
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
  Tooltip,
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
      <Flex align="center" gap={24}>
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
        <Flex style={{ flexGrow: 1 }} gap={12} vertical>
          <Flex align="center" gap={8}>
            <Flex>
              <Avatar size={36} src={item?.user?.image} />
            </Flex>
            <Flex vertical>
              <Text fz="xs">{item?.user?.username}</Text>
              <Text fz="xs">
                <Tooltip
                  title={dayjs(item?.created_at).format("DD MMM YYYY HH:mm")}
                >
                  {dayjs(item?.created_at).locale("id").fromNow()}
                </Tooltip>
              </Text>
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
                  {item?.total_comment} Komentar
                </span>
              </Space>
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
            <Button
              style={{
                marginLeft: 18,
              }}
              type="primary"
              onClick={gotoCreateDiscussion}
            >
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
        <Row justify="start">
          <Col md={18} xs={24}>
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
                align: "start",
                pageSize: 10,
                position: "bottom",
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
