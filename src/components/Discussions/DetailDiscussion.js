import {
  downvoteDiscussion,
  getDiscussion,
  upvoteDiscussion,
} from "@/services/asn-connect-discussions.services";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, Card, Flex, Space, Typography, message } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { useRouter } from "next/router";

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
      <Flex align="center" gap={0}>
        <Flex style={{ flexGrow: 1 }} vertical gap={10}>
          <Flex align="center" gap={10}>
            <Flex>
              <Avatar size={40} src={item?.user?.image} />
            </Flex>
            <Flex vertical>
              <Typography.Text style={{ fontSize: 12 }}>
                {item?.user?.username}
              </Typography.Text>
              <Typography.Text style={{ fontSize: 12 }}>
                {dayjs(item?.created_at).locale("id").fromNow()}
              </Typography.Text>
            </Flex>
          </Flex>
          <Flex vertical>
            <span style={{ fontSize: 24, fontWeight: "bold" }}>
              {item?.title}
            </span>
            <Typography.Text>{item.content}</Typography.Text>
          </Flex>
          <Flex gap={10}>
            <Flex>
              <div
                style={{
                  backgroundColor: "#f5f5f5",
                  padding: "5px 10px",
                  borderRadius: 10,
                }}
              >
                <Space>
                  <ArrowUpOutlined
                    onClick={upvote}
                    style={{
                      cursor: "pointer",
                      color:
                        item?.votes?.[0]?.vote_type === "upvote"
                          ? "#ffc53d"
                          : "gray",
                    }}
                  />
                  <span>{item?.upvote_count}</span>
                  <ArrowDownOutlined
                    onClick={downvote}
                    style={{
                      cursor: "pointer",
                      color:
                        item?.votes?.[0]?.vote_type === "downvote"
                          ? "#ffc53d"
                          : "gray",
                    }}
                  />
                </Space>
              </div>
            </Flex>
            <Flex>
              <div
                style={{
                  backgroundColor: "#f5f5f5",
                  padding: "5px 10px",
                  borderRadius: 10,
                }}
              >
                <Space>
                  <CommentOutlined style={{ cursor: "pointer" }} />
                  <span>{item?.comment_count}</span>
                </Space>
              </div>
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
