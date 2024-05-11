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
import { Text, Title } from "@mantine/core";
import AvatarUser from "../Users/AvatarUser";
import { useState } from "react";
import CreateDiscussion from "./CreateDiscussion";
import { useSession } from "next-auth/react";

const Detail = ({ item }) => {
  const queryClient = useQueryClient();
  const { data: currentUser } = useSession();

  const [edit, setEdit] = useState(false);

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
      <Flex style={{ flexGrow: 1 }} vertical gap={20}>
        <Flex justify="space-between">
          <Flex align="center" gap={10}>
            <Flex>
              <AvatarUser
                src={item?.user?.image}
                size={40}
                userId={item?.user?.custom_id}
              />
            </Flex>
            <Flex vertical>
              <Text>{item?.user?.username}</Text>
              <Text size="sm">
                {dayjs(item?.created_at).locale("id").fromNow()}
              </Text>
            </Flex>
          </Flex>
          {currentUser?.user?.current_role === "admin" && (
            <Flex onClick={() => setEdit(true)}>
              <Text>Edit</Text>
            </Flex>
          )}
        </Flex>
        {edit ? (
          <CreateDiscussion
            action="edit"
            item={item}
            onCancel={() => setEdit(false)}
          />
        ) : (
          <>
            <Title order={3}>{item?.title}</Title>
            <span>
              <ReactMarkdownCustom>{item?.content}</ReactMarkdownCustom>
            </span>
            {item?.edited_at && (
              <Text italic>
                Terakhir di edit{" "}
                {dayjs(item?.edited_at).format("DD-MM-YYYY HH:mm:ss")}
              </Text>
            )}
          </>
        )}
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
            <Col md={12}>
              <Detail item={data} />
            </Col>
          </Row>
          <Row justify="center">
            <Col md={12}>
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
