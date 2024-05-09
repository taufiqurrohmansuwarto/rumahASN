import { Card, Avatar, Typography, Space, message, Flex } from "antd";
import {
  CaretUpFilled,
  CaretDownFilled,
  CommentOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import {
  upvoteDiscussion,
  downvoteDiscussion,
  getDiscussion,
} from "@/services/asn-connect-discussions.services";
import dayjs from "dayjs";
import "dayjs/locale/id";

import relativeTime from "dayjs/plugin/relativeTime";
import { useQuery } from "@tanstack/react-query";
import CommentList from "./CommentList";

const Detail = ({ item }) => {
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
    <Card style={{ width: "100%" }}>
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
            <span>{item.content}</span>
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

const DetailDiscussion = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data, isLoading } = useQuery(
    ["asn-discussions", id],
    () => getDiscussion(id),
    {
      enabled: !!id,
    }
  );

  return (
    <>
      {data && (
        <>
          <Detail item={data} />
          <CommentList />
        </>
      )}
    </>
  );
};

export default DetailDiscussion;
