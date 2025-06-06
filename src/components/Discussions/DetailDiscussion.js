import {
  downvoteDiscussion,
  getDiscussion,
  upvoteDiscussion,
} from "@/services/asn-connect-discussions.services";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CommentOutlined,
  EditOutlined,
  CaretUpFilled,
  CaretDownFilled,
} from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Col,
  Divider,
  Flex,
  FloatButton,
  Row,
  Space,
  Tooltip,
  Typography,
  message,
  Card,
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

const { Text: AntText, Title: AntTitle } = Typography;

const Detail = ({ item }) => {
  const queryClient = useQueryClient();
  const { data: currentUser } = useSession();

  const [edit, setEdit] = useState(false);

  const { mutate: upvote, isLoading: upvoteLoading } = useMutation(
    () => upvoteDiscussion(item?.id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("asn-discussions");
        message.success("Diskusi berhasil di-upvote");
      },
      onError: () => {
        message.error("Gagal upvote diskusi");
      },
    }
  );

  const { mutate: downvote, isLoading: downvoteLoading } = useMutation(
    () => downvoteDiscussion(item?.id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("asn-discussions");
        message.success("Diskusi berhasil di-downvote");
      },
      onError: () => {
        message.error("Gagal downvote diskusi");
      },
    }
  );

  const toggleEdit = () => {
    setEdit(!edit);
  };

  const voteScore =
    parseInt(item?.upvote_count) - parseInt(item?.downvote_count);
  const userVoteType = item?.votes?.[0]?.vote_type;

  if (edit) {
    return (
      <Card
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #EDEFF1",
          borderRadius: "4px",
          marginBottom: "16px",
        }}
        bodyStyle={{ padding: "16px" }}
      >
        <CreateDiscussion
          action="edit"
          item={item}
          onCancel={() => setEdit(false)}
        />
      </Card>
    );
  }

  return (
    <Card
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #EDEFF1",
        borderRadius: "4px",
        marginBottom: "16px",
        overflow: "hidden",
      }}
      bodyStyle={{ padding: 0 }}
    >
      <Flex>
        {/* Vote Section - Reddit Style */}
        <div
          style={{
            width: "40px",
            backgroundColor: "#F8F9FA",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: "12px 0",
            borderRight: "1px solid #EDEFF1",
          }}
        >
          <CaretUpFilled
            style={{
              fontSize: 20,
              color: userVoteType === "upvote" ? "#FF4500" : "#878A8C",
              cursor: upvoteLoading ? "not-allowed" : "pointer",
              padding: "4px",
              opacity: upvoteLoading ? 0.6 : 1,
              transition: "color 0.2s ease",
            }}
            onClick={!upvoteLoading ? upvote : undefined}
          />
          <AntText
            style={{
              fontSize: 14,
              fontWeight: 700,
              color:
                voteScore > 0
                  ? "#FF4500"
                  : voteScore < 0
                  ? "#7193FF"
                  : "#878A8C",
              margin: "4px 0",
              lineHeight: 1,
              textAlign: "center",
            }}
          >
            {voteScore > 0 ? `+${voteScore}` : voteScore}
          </AntText>
          <CaretDownFilled
            onClick={!downvoteLoading ? downvote : undefined}
            style={{
              fontSize: 20,
              color: userVoteType === "downvote" ? "#7193FF" : "#878A8C",
              cursor: downvoteLoading ? "not-allowed" : "pointer",
              padding: "4px",
              opacity: downvoteLoading ? 0.6 : 1,
              transition: "color 0.2s ease",
            }}
          />
        </div>

        {/* Content Section */}
        <div style={{ flex: 1, padding: "16px" }}>
          {/* Header with user info and actions */}
          <Flex
            justify="space-between"
            align="flex-start"
            style={{ marginBottom: "12px" }}
          >
            <Flex align="center" gap={8}>
              <Avatar
                size={24}
                src={item?.user?.image}
                style={{ border: "1px solid #EDEFF1" }}
              />
              <Flex vertical gap={0}>
                <AntText
                  style={{
                    fontSize: "14px",
                    color: "#1A1A1B",
                    fontWeight: 600,
                    lineHeight: "18px",
                  }}
                >
                  {item?.user?.username}
                </AntText>
                <AntText
                  style={{
                    fontSize: "12px",
                    color: "#787C7E",
                    lineHeight: "16px",
                  }}
                >
                  {dayjs(item?.created_at).locale("id").fromNow()}
                </AntText>
              </Flex>
            </Flex>

            {currentUser?.user?.current_role === "admin" && (
              <Tooltip title="Edit Diskusi">
                <Button
                  onClick={toggleEdit}
                  icon={<EditOutlined />}
                  type="text"
                  size="small"
                  style={{
                    color: "#787C7E",
                    borderRadius: "4px",
                  }}
                />
              </Tooltip>
            )}
          </Flex>

          {/* Title */}
          <AntTitle
            level={3}
            style={{
              margin: "0 0 12px 0",
              color: "#1A1A1B",
              fontSize: "20px",
              fontWeight: 500,
              lineHeight: "24px",
            }}
          >
            {item?.title}
          </AntTitle>

          {/* Content */}
          {item?.content && item.content.trim() !== "" ? (
            <div
              style={{
                color: "#1A1A1B",
                fontSize: "14px",
                lineHeight: "21px",
                marginBottom: "12px",
              }}
            >
              <ReactMarkdownCustom>{item?.content}</ReactMarkdownCustom>
            </div>
          ) : (
            <div
              style={{
                color: "#9CA3AF",
                fontSize: "14px",
                fontStyle: "italic",
                marginBottom: "12px",
              }}
            >
              Tidak ada konten tambahan
            </div>
          )}

          {/* Edit timestamp */}
          {item?.edited_at && (
            <AntText
              style={{
                fontSize: "12px",
                color: "#787C7E",
                fontStyle: "italic",
                display: "block",
                marginBottom: "12px",
              }}
            >
              • Terakhir diubah{" "}
              {dayjs(item?.edited_at).format("DD MMM YYYY HH:mm")}
            </AntText>
          )}

          {/* Actions */}
          <Flex align="center" gap={16}>
            <Flex
              align="center"
              gap={6}
              style={{
                color: "#787C7E",
                fontSize: "12px",
                fontWeight: 700,
                padding: "6px 8px",
                borderRadius: "4px",
                backgroundColor: "#F8F9FA",
                border: "1px solid #EDEFF1",
              }}
            >
              <CommentOutlined style={{ fontSize: "14px" }} />
              <span>{item?.total_comment} Komentar</span>
            </Flex>
          </Flex>
        </div>
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
    <div
      style={{
        backgroundColor: "#DAE0E6",
        minHeight: "100vh",
        padding: "20px 0",
      }}
    >
      <FloatButton.BackTop />

      <Row justify="center">
        <Col xs={24} sm={22} md={20} lg={18} xl={16}>
          {data && (
            <>
              <Detail item={data} />

              {/* Comments Section */}
              <Card
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #EDEFF1",
                  borderRadius: "4px",
                  marginTop: "8px",
                }}
                bodyStyle={{ padding: "16px" }}
              >
                <AntText
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#1A1A1B",
                    marginBottom: "16px",
                    display: "block",
                  }}
                >
                  Komentar
                </AntText>
                <DiscussionsComments />
              </Card>
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default DetailDiscussion;
