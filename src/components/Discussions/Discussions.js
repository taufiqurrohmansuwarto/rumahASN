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
  PlusOutlined,
  MessageOutlined,
  UserOutlined,
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
  Empty,
  Skeleton,
  Divider,
} from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import "dayjs/locale/id";

import relativeTime from "dayjs/plugin/relativeTime";
import ReactMarkdownCustom from "../MarkdownEditor/ReactMarkdownCustom";

dayjs.extend(relativeTime);

const { Title, Text: AntText } = Typography;

const DiscussionCard = ({ item }) => {
  const router = useRouter();

  const gotoDetail = () =>
    router.push(`/asn-connect/asn-discussions/${item.id}/detail`);

  const queryClient = useQueryClient();

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

  const voteScore =
    parseInt(item?.upvote_count) - parseInt(item?.downvote_count);
  const userVoteType = item?.votes?.[0]?.vote_type;

  return (
    <Card
      style={{
        width: "100%",
        backgroundColor: "#FFFFFF",
        border: "1px solid #EDEFF1",
        borderRadius: "4px",
        marginBottom: "8px",
        padding: 0,
        overflow: "hidden",
        cursor: "pointer",
        transition: "border-color 0.2s ease",
      }}
      bodyStyle={{ padding: 0 }}
      hoverable
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#898989";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#EDEFF1";
      }}
      onClick={gotoDetail}
    >
      <Flex style={{ minHeight: "80px" }}>
        {/* Vote Section - Reddit Style */}
        <div
          style={{
            width: "40px",
            backgroundColor: "#F8F9FA",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: "8px 0",
            borderRight: "1px solid #EDEFF1",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <CaretUpFilled
            style={{
              fontSize: 16,
              color: userVoteType === "upvote" ? "#FF4500" : "#878A8C",
              cursor: upvoteLoading ? "not-allowed" : "pointer",
              padding: "2px",
              opacity: upvoteLoading ? 0.6 : 1,
            }}
            onClick={!upvoteLoading ? upvote : undefined}
          />
          <AntText
            style={{
              fontSize: 12,
              fontWeight: 700,
              color:
                voteScore > 0
                  ? "#FF4500"
                  : voteScore < 0
                  ? "#7193FF"
                  : "#878A8C",
              margin: "2px 0",
              lineHeight: 1,
            }}
          >
            {voteScore > 0 ? `+${voteScore}` : voteScore}
          </AntText>
          <CaretDownFilled
            onClick={!downvoteLoading ? downvote : undefined}
            style={{
              fontSize: 16,
              color: userVoteType === "downvote" ? "#7193FF" : "#878A8C",
              cursor: downvoteLoading ? "not-allowed" : "pointer",
              padding: "2px",
              opacity: downvoteLoading ? 0.6 : 1,
            }}
          />
        </div>

        {/* Content Section */}
        <Flex vertical style={{ flex: 1, padding: "8px 12px" }}>
          {/* Post Meta */}
          <Flex align="center" gap={6} style={{ marginBottom: "4px" }}>
            <Avatar size={16} src={item?.user?.image} />
            <AntText
              style={{
                fontSize: "12px",
                color: "#787C7E",
                fontWeight: 500,
              }}
            >
              {item?.user?.username}
            </AntText>
            <span style={{ color: "#787C7E", fontSize: "12px" }}>•</span>
            <Tooltip
              title={dayjs(item?.created_at).format("DD MMM YYYY HH:mm")}
            >
              <AntText
                style={{
                  fontSize: "12px",
                  color: "#787C7E",
                }}
              >
                {dayjs(item?.created_at).locale("id").fromNow()}
              </AntText>
            </Tooltip>
          </Flex>

          {/* Title */}
          <Title
            level={5}
            style={{
              margin: "0 0 4px 0",
              color: "#1A1A1B",
              fontSize: "16px",
              fontWeight: 500,
              lineHeight: "20px",
              cursor: "pointer",
            }}
            onClick={gotoDetail}
          >
            {item.title}
          </Title>

          {/* Content Preview */}
          {item?.content && item.content.trim() !== "" ? (
            <div
              style={{
                color: "#787C7E",
                fontSize: "14px",
                lineHeight: "18px",
                marginBottom: "8px",
                maxHeight: "60px",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
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
                marginBottom: "8px",
              }}
            >
              Tidak ada konten tambahan
            </div>
          )}

          {/* Actions */}
          <Flex align="center" gap={16}>
            <Flex
              align="center"
              gap={4}
              style={{
                color: "#787C7E",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                padding: "4px 6px",
                borderRadius: "2px",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F8F9FA";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
              onClick={(e) => {
                e.stopPropagation();
                gotoDetail();
              }}
            >
              <CommentOutlined style={{ fontSize: "14px" }} />
              <span>{item?.total_comment} Komentar</span>
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

  if (!data || data?.user?.current_role !== "admin") {
    return null;
  }

  return (
    <Card
      style={{
        marginBottom: "16px",
        border: "1px solid #EDEFF1",
        borderRadius: "4px",
        backgroundColor: "#FFFFFF",
      }}
      bodyStyle={{ padding: 0 }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #EDEFF1",
          backgroundColor: "#F8F9FA",
        }}
      >
        <Flex align="center" gap={8}>
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: "#FF4500",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MessageOutlined style={{ color: "white", fontSize: "12px" }} />
          </div>
          <AntText
            strong
            style={{
              color: "#1A1A1B",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Buat Diskusi Baru
          </AntText>
        </Flex>
      </div>

      {/* Content */}
      <div style={{ padding: "16px" }}>
        <Flex justify="space-between" align="center">
          <Flex align="center" gap={12}>
            <Avatar
              size={32}
              src={data?.user?.image}
              icon={<UserOutlined />}
              style={{ backgroundColor: "#FF4500" }}
            />
            <Flex vertical gap={2}>
              <AntText style={{ color: "#787C7E", fontSize: "14px" }}>
                Bagikan ide dan pengalaman Anda dengan komunitas ASN
              </AntText>
            </Flex>
          </Flex>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={gotoCreateDiscussion}
            style={{
              backgroundColor: "#FF4500",
              borderColor: "#FF4500",
              borderRadius: "20px",
              fontWeight: 600,
              fontSize: "12px",
              height: "32px",
              padding: "0 16px",
            }}
          >
            Buat Post
          </Button>
        </Flex>
      </div>
    </Card>
  );
};

const LoadingSkeleton = () => (
  <div>
    {[1, 2, 3].map((item) => (
      <Card
        key={item}
        style={{
          width: "100%",
          marginBottom: "8px",
          border: "1px solid #EDEFF1",
          borderRadius: "4px",
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Flex>
          <div
            style={{
              width: "40px",
              backgroundColor: "#F8F9FA",
              padding: "8px",
            }}
          >
            <Skeleton.Avatar size={24} />
          </div>
          <Flex vertical style={{ flex: 1, padding: "12px" }} gap={8}>
            <Skeleton.Input style={{ width: "40%" }} active size="small" />
            <Skeleton.Input style={{ width: "80%" }} active />
            <Skeleton paragraph={{ rows: 2, width: ["100%", "60%"] }} active />
            <Skeleton.Input style={{ width: "30%" }} active size="small" />
          </Flex>
        </Flex>
      </Card>
    ))}
  </div>
);

const Discussions = () => {
  const { data: posts, isLoading } = useQuery(["asn-discussions"], () =>
    getDiscussions()
  );

  return (
    <div
      style={{
        backgroundColor: "#DAE0E6",
        minHeight: "100vh",
        padding: "20px 0",
      }}
    >
      <Row justify="center">
        <Col xs={24} sm={22} md={20} lg={18} xl={16}>
          <CreateDiscussionButton />

          {isLoading ? (
            <LoadingSkeleton />
          ) : posts?.data && posts.data.length > 0 ? (
            <>
              <List
                dataSource={posts?.data}
                renderItem={(item) => (
                  <List.Item style={{ padding: 0, border: "none" }}>
                    <DiscussionCard item={item} />
                  </List.Item>
                )}
                pagination={{
                  align: "center",
                  pageSize: 10,
                  total: posts?.pagination?.total || 0,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} dari ${total} post`,
                  style: {
                    marginTop: "20px",
                    textAlign: "center",
                    backgroundColor: "#FFFFFF",
                    padding: "16px",
                    borderRadius: "4px",
                    border: "1px solid #EDEFF1",
                  },
                }}
              />
            </>
          ) : (
            <Card
              style={{
                border: "1px solid #EDEFF1",
                borderRadius: "4px",
                backgroundColor: "#FFFFFF",
                textAlign: "center",
              }}
              bodyStyle={{ padding: "64px 32px" }}
            >
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Space direction="vertical" size={8}>
                    <AntText style={{ color: "#787C7E", fontSize: "16px" }}>
                      Belum ada diskusi di komunitas ini
                    </AntText>
                    <AntText
                      type="secondary"
                      style={{ fontSize: "14px", color: "#9CA3AF" }}
                    >
                      Jadilah yang pertama untuk memulai diskusi
                    </AntText>
                  </Space>
                }
              />
            </Card>
          )}
        </Col>
      </Row>

      <style jsx global>{`
        .ant-card-hoverable:hover {
          border-color: #898989 !important;
        }

        .ant-pagination-item {
          border-color: #edeff1;
        }

        .ant-pagination-item-active {
          background-color: #ff4500;
          border-color: #ff4500;
        }

        .ant-pagination-item-active a {
          color: white;
        }

        .ant-pagination-item:hover {
          border-color: #ff4500;
        }

        .ant-pagination-item:hover a {
          color: #ff4500;
        }
      `}</style>
    </div>
  );
};

export default Discussions;
