import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";
import AvatarUser from "@/components/Users/AvatarUser";
import UserText from "@/components/Users/UserText";
import { Comment } from "@ant-design/compatible";
import {
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CommentOutlined,
  EditOutlined,
  EyeOutlined,
  FolderOutlined,
  InboxOutlined,
  LikeFilled,
  LikeOutlined,
  LoadingOutlined,
  TagsOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Card, Flex, Tag, Tooltip, Typography } from "antd";
import dayjs from "dayjs";

const { Text } = Typography;

const KnowledgeContentHeader = ({
  content,
  onLike,
  onBookmark,
  isLiked,
  isBookmarked,
  isLiking = false,
  isBookmarking = false,
}) => {
  const getStatusColor = (status) => {
    const statusColors = {
      draft: "#d9d9d9",
      published: "#52c41a", 
      rejected: "#ff4d4f",
      archived: "#fa8c16",
      pending: "#faad14",
    };
    return statusColors[status] || "#d9d9d9";
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      draft: "Draft",
      published: "Published", 
      rejected: "Rejected",
      archived: "Archived",
      pending: "Pending",
    };
    return statusLabels[status] || status;
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      draft: <EditOutlined />,
      published: <CheckCircleOutlined />,
      rejected: <CloseCircleOutlined />,
      archived: <InboxOutlined />,
      pending: <ClockCircleOutlined />,
    };
    return statusIcons[status] || <EditOutlined />;
  };
  return (
    <Card
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #EDEFF1",
        borderRadius: "4px",
        marginBottom: "16px",
        padding: 0,
        overflow: "hidden",
      }}
      bodyStyle={{ padding: 0 }}
    >
      <Flex style={{ minHeight: "80px" }}>
        {/* Like Section - Reddit Style */}
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
        >
          <Tooltip title={isLiking ? "Loading..." : (isLiked ? "Unlike" : "Like konten ini")}>
            {isLiking ? (
              <LoadingOutlined
                style={{
                  fontSize: 16,
                  color: "#FF4500",
                  marginBottom: "4px",
                  cursor: "default",
                }}
                spin
              />
            ) : isLiked ? (
              <LikeFilled
                style={{
                  fontSize: 16,
                  color: "#FF4500",
                  cursor: "pointer",
                  marginBottom: "4px",
                  transition: "transform 0.2s ease",
                }}
                onClick={onLike}
              />
            ) : (
              <LikeOutlined
                style={{
                  fontSize: 16,
                  color: "#878A8C",
                  cursor: "pointer",
                  marginBottom: "4px",
                  transition: "color 0.2s ease, transform 0.2s ease",
                }}
                onClick={onLike}
              />
            )}
          </Tooltip>
          <Text
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: isLiked ? "#FF4500" : "#878A8C",
              margin: "4px 0",
              lineHeight: 1,
            }}
          >
            {content?.likes_count || 0}
          </Text>
        </div>

        {/* Content Section */}
        <Flex vertical style={{ flex: 1, padding: "12px 16px" }}>
          {/* Content Header with Comment Component */}
          <Comment
            avatar={
              <AvatarUser
                size={32}
                src={content?.author?.image}
                userId={content?.author?.custom_id}
                user={content?.author}
              />
            }
            author={
              <Flex align="center" gap={6}>
                <UserText 
                  userId={content?.author?.custom_id}
                  text={content?.author?.username}
                />
                <span style={{ color: "#787C7E", fontSize: "12px" }}>•</span>
                <Tooltip
                  title={dayjs(content?.created_at).format(
                    "DD MMMM YYYY, HH:mm"
                  )}
                >
                  <Text
                    style={{
                      fontSize: "12px",
                      color: "#787C7E",
                    }}
                  >
                    {dayjs(content?.created_at).format("DD MMM YYYY")}
                  </Text>
                </Tooltip>

                {/* Status */}
                {content?.status && (
                  <>
                    <span style={{ color: "#787C7E", fontSize: "12px" }}>
                      •
                    </span>
                    <Tag
                      color={getStatusColor(content.status)}
                      style={{
                        fontSize: "10px",
                        fontWeight: 500,
                        border: "none",
                        borderRadius: "4px",
                        margin: 0,
                        padding: "0 6px",
                        lineHeight: "16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span style={{ fontSize: "8px" }}>
                        {getStatusIcon(content.status)}
                      </span>
                      {getStatusLabel(content.status)}
                    </Tag>
                  </>
                )}

                {/* Category */}
                {content?.category && (
                  <>
                    <span style={{ color: "#787C7E", fontSize: "12px" }}>
                      •
                    </span>
                    <Tag
                      style={{
                        fontSize: "10px",
                        fontWeight: 500,
                        backgroundColor: "#FF4500",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        margin: 0,
                        padding: "0 6px",
                        lineHeight: "16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <FolderOutlined style={{ fontSize: "8px" }} />
                      {content?.category?.name}
                    </Tag>
                  </>
                )}
              </Flex>
            }
            content={
              <div>
                {/* Last Updated Info */}
                {content?.updated_at &&
                  content?.updated_at !== content?.created_at && (
                    <div style={{ marginBottom: "8px" }}>
                      <Text
                        style={{
                          fontSize: "11px",
                          color: "#666",
                          fontStyle: "italic",
                        }}
                      >
                        Terakhir diedit:{" "}
                        {dayjs(content?.updated_at).format(
                          "DD MMMM YYYY, HH:mm"
                        )}
                      </Text>
                    </div>
                  )}

                {/* Content Title */}
                <Text
                  strong
                  style={{
                    color: "#1A1A1B",
                    fontSize: "18px",
                    lineHeight: "1.3",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  {content?.title}
                </Text>

                {/* Summary */}
                {content?.summary && (
                  <Text
                    style={{
                      color: "#666",
                      fontSize: "14px",
                      lineHeight: "1.4",
                      marginBottom: "12px",
                      display: "block",
                      fontStyle: "italic",
                    }}
                  >
                    {content.summary}
                  </Text>
                )}

                {/* Content Body */}
                <div
                  style={{
                    backgroundColor: "#F8F9FA",
                    padding: "16px",
                    borderRadius: "6px",
                    border: "1px solid #E9ECEF",
                    marginBottom: "12px",
                  }}
                >
                  <ReactMarkdownCustom withCustom={false}>
                    {content?.content}
                  </ReactMarkdownCustom>
                </div>

                {/* Verification Information */}
                {content?.verified_by && content?.verified_at && (
                  <div
                    style={{
                      backgroundColor: "#E6F7FF",
                      padding: "12px",
                      borderRadius: "6px",
                      border: "1px solid #91D5FF",
                      marginTop: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <CheckCircleOutlined style={{ color: "#1890FF", fontSize: "14px" }} />
                    <div>
                      <Text style={{ fontSize: "12px", fontWeight: 600, color: "#1890FF" }}>
                        Diverifikasi oleh:
                      </Text>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                        <AvatarUser
                          size={18}
                          src={content.user_verified?.image}
                          userId={content.user_verified?.custom_id}
                          user={content.user_verified}
                        />
                        <div style={{ fontSize: "11px", color: "#1890FF" }}>
                          <UserText 
                            userId={content.user_verified?.custom_id}
                            text={content.user_verified?.username || "Admin"}
                          />
                        </div>
                        <span style={{ color: "#1890FF", fontSize: "11px" }}>•</span>
                        <Text style={{ fontSize: "11px", color: "#1890FF" }}>
                          {dayjs(content.verified_at).format("DD MMM YYYY, HH:mm")}
                        </Text>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            }
          />

          {/* Tags */}
          {content?.tags && content?.tags.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <Flex align="center" gap="8px" wrap="wrap">
                <Flex align="center" gap="4px">
                  <TagsOutlined style={{ fontSize: "12px", color: "#787C7E" }} />
                  <Text style={{ fontSize: "12px", color: "#787C7E", fontWeight: 600 }}>
                    Tags:
                  </Text>
                </Flex>
                {content?.tags.map((tag, index) => (
                  <Tag
                    key={index}
                    style={{
                      fontSize: "10px",
                      padding: "0 6px",
                      backgroundColor: "#f5f5f5",
                      border: "1px solid #e8e8e8",
                      color: "#595959",
                      margin: 0,
                      borderRadius: "4px",
                      lineHeight: "16px",
                    }}
                  >
                    {tag}
                  </Tag>
                ))}
              </Flex>
            </div>
          )}

          {/* References */}
          {content?.references && content?.references.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <Text
                strong
                style={{
                  fontSize: "14px",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                🔗 Referensi:
              </Text>
              {content.references.map((reference, index) => (
                <div key={index} style={{ marginBottom: "4px" }}>
                  <a
                    href={reference.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "13px", color: "#FF4500" }}
                  >
                    {reference.title || reference.url}
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Attachments */}
          {content?.attachments && content?.attachments.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <Text
                strong
                style={{
                  fontSize: "14px",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                📎 Lampiran:
              </Text>
              {content.attachments.map((attachment, index) => (
                <div key={index} style={{ marginBottom: "4px" }}>
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "13px", color: "#FF4500" }}
                  >
                    {attachment.filename || attachment.name}
                    {attachment.size && (
                      <span style={{ color: "#787C7E", fontSize: "11px" }}>
                        {" "}
                        ({Math.round(attachment.size / 1024)} KB)
                      </span>
                    )}
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Content Stats */}
          <Flex align="center" gap={16}>
            {/* Views Count */}
            <Flex align="center" gap={4}>
              <EyeOutlined style={{ fontSize: "14px", color: "#787C7E" }} />
              <Text
                style={{
                  fontSize: "12px",
                  color: "#787C7E",
                  fontWeight: 700,
                }}
              >
                {content?.views_count || 0} Views
              </Text>
            </Flex>

            {/* Comments Count */}
            <Flex align="center" gap={4}>
              <CommentOutlined style={{ fontSize: "14px", color: "#787C7E" }} />
              <Text
                style={{
                  fontSize: "12px",
                  color: "#787C7E",
                  fontWeight: 700,
                }}
              >
                {content?.comments_count || 0} Komentar
              </Text>
            </Flex>

            {/* Bookmarks Count */}
            <Flex align="center" gap={4}>
              <BookOutlined style={{ fontSize: "14px", color: "#787C7E" }} />
              <Text
                style={{
                  fontSize: "12px",
                  color: "#787C7E",
                  fontWeight: 700,
                }}
              >
                {content?.bookmarks_count || 0} Disimpan
              </Text>
            </Flex>

            <Flex
              align="center"
              gap={4}
              style={{
                cursor: isBookmarking ? "default" : "pointer",
                padding: "4px 8px",
                borderRadius: "4px",
                transition: "background-color 0.2s ease",
                opacity: isBookmarking ? 0.7 : 1,
              }}
              onClick={isBookmarking ? undefined : onBookmark}
              onMouseEnter={(e) => {
                if (!isBookmarking) {
                  e.currentTarget.style.backgroundColor = "#f8f9fa";
                }
              }}
              onMouseLeave={(e) => {
                if (!isBookmarking) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              {isBookmarking ? (
                <LoadingOutlined
                  style={{
                    fontSize: "14px",
                    color: "#FF4500",
                  }}
                  spin
                />
              ) : (
                <BookOutlined
                  style={{
                    fontSize: "14px",
                    color: isBookmarked ? "#FF4500" : "#787C7E",
                  }}
                />
              )}
              <Text
                style={{
                  fontSize: "12px",
                  color: isBookmarking ? "#FF4500" : (isBookmarked ? "#FF4500" : "#787C7E"),
                  fontWeight: 700,
                }}
              >
                {isBookmarking ? "Loading..." : (isBookmarked ? "Tersimpan" : "Simpan")}
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
};

export default KnowledgeContentHeader;
