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
  PaperClipOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { Card, Flex, Tag, Tooltip, Typography, Divider } from "antd";
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
        position: "relative",
      }}
      bodyStyle={{ padding: 0 }}
    >
      {/* Bookmark Button - Top Right Corner */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          zIndex: 10,
        }}
      >
        <Flex
          align="center"
          gap={4}
          style={{
            cursor: isBookmarking ? "default" : "pointer",
            padding: "6px 8px",
            borderRadius: "4px",
            transition: "all 0.2s ease",
            opacity: isBookmarking ? 0.7 : 1,
            backgroundColor: "transparent",
          }}
          onClick={isBookmarking ? undefined : onBookmark}
          onMouseEnter={(e) => {
            if (!isBookmarking) {
              e.currentTarget.style.backgroundColor = "#F3F4F6";
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
                color: isBookmarked ? "#FF4500" : "#6B7280",
              }}
            />
          )}
          <Text
            style={{
              fontSize: "12px",
              color: isBookmarking
                ? "#FF4500"
                : isBookmarked
                ? "#FF4500"
                : "#6B7280",
              fontWeight: 600,
            }}
          >
            {isBookmarking
              ? "Loading..."
              : isBookmarked
              ? "Tersimpan"
              : "Simpan"}
          </Text>
        </Flex>
      </div>

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
          <Tooltip
            title={
              isLiking ? "Loading..." : isLiked ? "Unlike" : "Like konten ini"
            }
          >
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
        <Flex vertical style={{ flex: 1, padding: "12px 16px 20px 16px" }}>
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
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

                {/* Spacer untuk alignment dengan tombol simpan */}
                <div style={{ width: "80px" }}></div>
              </div>
            }
            content={
              <div style={{ marginTop: "12px" }}>
                {/* Last Updated Info */}
                {content?.updated_at &&
                  content?.updated_at !== content?.created_at && (
                    <div style={{ marginBottom: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <EditOutlined style={{ fontSize: "11px", color: "#666" }} />
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
                    </div>
                  )}
              </div>
            }
          />

          {/* Summary Section with Labels */}
          <div style={{ marginBottom: "16px" }}>
            {/* Judul */}
            <div style={{ marginBottom: "12px" }}>
              <Text
                strong
                style={{
                  color: "#1A1A1B",
                  fontSize: "14px",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                Judul:
              </Text>
              <Text
                style={{
                  color: "#374151",
                  fontSize: "16px",
                  lineHeight: "1.4",
                  fontWeight: 600,
                }}
              >
                {content?.title}
              </Text>
            </div>

            {/* Ringkasan */}
            <div style={{ marginBottom: "12px" }}>
              <Text
                strong
                style={{
                  color: "#1A1A1B",
                  fontSize: "14px",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                Ringkasan:
              </Text>
              <Text
                style={{
                  color: "#6B7280",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  fontStyle: content?.summary ? "italic" : "normal",
                }}
              >
                {content?.summary ||
                  (content?.content && content.content.length > 200
                    ? `${content.content.substring(0, 200)}...`
                    : content?.content || "Tidak ada ringkasan")}
              </Text>
            </div>

            {/* Isi */}
            <div style={{ marginBottom: "12px" }}>
              <Text
                strong
                style={{
                  color: "#1A1A1B",
                  fontSize: "14px",
                  marginBottom: "8px",
                  display: "block",
                }}
              >
                Isi:
              </Text>
              <div
                style={{
                  backgroundColor: "#F8F9FA",
                  padding: "12px",
                  borderRadius: "6px",
                  border: "1px solid #E9ECEF",
                  fontSize: "13px",
                  lineHeight: "1.6",
                  color: "#374151",
                  maxHeight: "200px",
                  overflowY: "auto",
                }}
              >
                <ReactMarkdownCustom withCustom={false}>
                  {content?.content || "Tidak ada konten"}
                </ReactMarkdownCustom>
              </div>
            </div>
          </div>

          <Divider style={{ margin: "16px 0" }} />

          {/* Tags */}
          {content?.tags && content?.tags.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <Flex align="center" gap="8px" wrap="wrap">
                <Flex align="center" gap="4px">
                  <TagsOutlined
                    style={{ fontSize: "12px", color: "#787C7E" }}
                  />
                  <Text
                    style={{
                      fontSize: "12px",
                      color: "#787C7E",
                      fontWeight: 600,
                    }}
                  >
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "8px",
                }}
              >
                <LinkOutlined style={{ fontSize: "14px", color: "#FF4500" }} />
                <Text
                  strong
                  style={{
                    fontSize: "14px",
                  }}
                >
                  Referensi:
                </Text>
              </div>
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "8px",
                }}
              >
                <PaperClipOutlined
                  style={{ fontSize: "14px", color: "#FF4500" }}
                />
                <Text
                  strong
                  style={{
                    fontSize: "14px",
                  }}
                >
                  Lampiran:
                </Text>
              </div>
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

          {/* Verification Information - Bottom Right */}
          {content?.verified_by && content?.verified_at && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 10px",
                  backgroundColor: "#F0F9FF",
                  borderRadius: "4px",
                  border: "1px solid #E0F2FE",
                }}
              >
                <CheckCircleOutlined
                  style={{ color: "#008000", fontSize: "16px" }}
                />
                <AvatarUser
                  size={28}
                  src={content.user_verified?.image}
                  userId={content.user_verified?.custom_id}
                  user={content.user_verified}
                />
                <Text
                  style={{
                    fontSize: "11px",
                    color: "#0F172A",
                    fontWeight: 500,
                  }}
                >
                  {dayjs(content.verified_at).format("DD MMM YYYY, HH:mm")}
                </Text>
              </div>
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
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
};

export default KnowledgeContentHeader;
