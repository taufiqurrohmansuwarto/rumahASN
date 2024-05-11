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
import {
  Avatar,
  Col,
  Divider,
  Flex,
  FloatButton,
  Row,
  Space,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { useRouter } from "next/router";

import { useQuery } from "@tanstack/react-query";
import ReactMarkdownCustom from "../MarkdownEditor/ReactMarkdownCustom";
import DiscussionsComments from "./DiscussionsComments";

const Detail = ({ item }) => {
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
          <ReactMarkdownCustom>{item?.content}</ReactMarkdownCustom>
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
                <span>
                  {parseInt(item?.upvote_count) -
                    parseInt(item?.downvote_count)}
                </span>
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
                <span>{item?.total_comment}</span>
              </Space>
            </div>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
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
      <FloatButton.BackTop />
      {data && (
        <>
          <Row justify="center">
            <Col md={16}>
              <Detail item={data} />
            </Col>
          </Row>
          <Row justify="center">
            <Col md={16}>
              <Divider />
              <DiscussionsComments />
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default DetailDiscussion;
