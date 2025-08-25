import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";
import AvatarUser from "@/components/Users/AvatarUser";
import {
  MessageOutlined,
  UserOutlined,
  LikeOutlined,
  LikeFilled,
  BookOutlined,
  LoadingOutlined,
  EyeOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { Card, Flex, Tag, Typography, Tooltip } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text } = Typography;

const ContentCard = ({ 
  content, 
  isMobile, 
  onClick, 
  showStatus = false, 
  isAdmin = false,
  onLike,
  onBookmark,
  onUserClick,
  isLiked = false,
  isBookmarked = false,
  isLiking = false,
  isBookmarking = false
}) => {
  const getStatusColor = (status) => {
    const statusColors = {
      draft: "#d9d9d9",
      published: "#52c41a", 
      rejected: "#ff4d4f",
      archived: "#fa8c16",
      pending: "#faad14"
    };
    return statusColors[status] || "#d9d9d9";
  };
  
  const getStatusLabel = (status) => {
    const statusLabels = {
      draft: "Draft",
      published: "Published", 
      rejected: "Rejected",
      archived: "Archived",
      pending: "Pending"
    };
    return statusLabels[status] || status;
  };

  const handleUserClick = (e) => {
    e.stopPropagation();
    onUserClick && onUserClick(content.author);
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    if (!isLiking) {
      onLike && onLike(content.id);
    }
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    if (!isBookmarking) {
      onBookmark && onBookmark(content.id);
    }
  };

  const handleContentClick = () => {
    onClick && onClick();
  };

  return (
    <Card
      style={{
        width: "100%",
        marginBottom: "16px",
        padding: 0,
        overflow: "hidden",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      }}
      bodyStyle={{ padding: 0 }}
      hoverable
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#FF4500";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(255, 69, 0, 0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#EDEFF1";
        e.currentTarget.style.boxShadow = "none";
      }}
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
                onClick={handleLikeClick}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
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
                onClick={handleLikeClick}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#FF4500";
                  e.currentTarget.style.transform = "scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#878A8C";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              />
            )}
          </Tooltip>
          <Text
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: isLiked ? "#FF4500" : "#878A8C",
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            {content.likes_count || 0}
          </Text>
        </div>

        {/* Content Section */}
        <Flex
          vertical
          style={{ 
            flex: 1, 
            padding: isMobile ? "8px 12px" : "12px 16px"
          }}
        >
          {/* Post Meta */}
          <Flex align="center" gap={6} style={{ marginBottom: "8px" }}>
            <Tooltip title="Lihat profil">
              <AvatarUser
                size={20}
                src={content.author?.image}
                userId={content.author?.custom_id}
                user={content.author}
                style={{ cursor: "pointer" }}
                onClick={handleUserClick}
              />
            </Tooltip>
            <Text
              style={{
                fontSize: "12px",
                color: "#787C7E",
                fontWeight: 500,
                cursor: "pointer",
                transition: "color 0.2s ease",
              }}
              onClick={handleUserClick}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#FF4500";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#787C7E";
              }}
            >
              {content.author?.username}
            </Text>
            <span style={{ color: "#787C7E", fontSize: "12px" }}>•</span>
            <Tooltip
              title={dayjs(content.created_at).format("DD MMM YYYY HH:mm")}
            >
              <Text
                style={{
                  fontSize: "12px",
                  color: "#787C7E",
                }}
              >
                {dayjs(content.created_at).fromNow()}
              </Text>
            </Tooltip>
            
            {/* Status Badge */}
            {(showStatus || isAdmin) && content.status && (
              <>
                <span style={{ color: "#787C7E", fontSize: "12px" }}>•</span>
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
                  }}
                >
                  {getStatusLabel(content.status)}
                </Tag>
              </>
            )}
            
            {/* Category */}
            {content.category && (
              <>
                <span style={{ color: "#787C7E", fontSize: "12px" }}>•</span>
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
                  }}
                >
                  {content.category.name}
                </Tag>
              </>
            )}
          </Flex>

          {/* Title */}
          <Text
            strong
            style={{
              color: "#1A1A1B",
              fontSize: isMobile ? "14px" : "16px",
              lineHeight: "1.3",
              marginBottom: "8px",
              display: "-webkit-box",
              "-webkit-line-clamp": 2,
              "-webkit-box-orient": "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              cursor: "pointer",
              transition: "color 0.2s ease",
            }}
            title={content.title}
            onClick={handleContentClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#FF4500";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#1A1A1B";
            }}
          >
            {content.title}
          </Text>

          {/* Content Preview */}
          {content?.content && (
            <div
              style={{
                marginBottom: "12px",
                padding: "12px",
                backgroundColor: "#f8f9fa",
                borderRadius: "6px",
                border: "1px solid #e9ecef",
                position: "relative",
              }}
            >
              <div
                style={{
                  color: "#1A1A1B",
                  fontSize: "14px",
                  lineHeight: "18px",
                  display: "-webkit-box",
                  "-webkit-line-clamp": 3,
                  "-webkit-box-orient": "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                <ReactMarkdownCustom withCustom={false}>
                  {content?.content?.substring(0, 200)}
                </ReactMarkdownCustom>
              </div>
              {content?.content?.length > 200 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "8px",
                    right: "12px",
                    background: "linear-gradient(90deg, transparent, #f8f9fa 30%)",
                    paddingLeft: "20px",
                    fontSize: "12px",
                    color: "#FF4500",
                    fontWeight: 500,
                    fontStyle: "italic",
                    cursor: "pointer",
                  }}
                  onClick={handleContentClick}
                >
                  ... Baca selengkapnya
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <div style={{ marginBottom: "12px" }}>
              <Flex align="center" gap="8px" wrap="wrap">
                <Flex align="center" gap="4px">
                  <TagsOutlined style={{ fontSize: "10px", color: "#787C7E" }} />
                  <Text style={{ fontSize: "10px", color: "#787C7E", fontWeight: 600 }}>
                    Tags:
                  </Text>
                </Flex>
                {content.tags?.slice(0, 3).map((tag, index) => (
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
                {content.tags?.length > 3 && (
                  <Tag
                    style={{
                      fontSize: "10px",
                      padding: "0 6px",
                      backgroundColor: "#f0f0f0",
                      border: "1px solid #d9d9d9",
                      color: "#8c8c8c",
                      margin: 0,
                      borderRadius: "4px",
                      lineHeight: "16px",
                    }}
                  >
                    +{content.tags.length - 3}
                  </Tag>
                )}
              </Flex>
            </div>
          )}

          {/* Actions */}
          <Flex align="center" justify="space-between">
            {/* Stats */}
            <Flex align="center" gap={12}>
              {/* Views Count */}
              <Flex align="center" gap={4}>
                <EyeOutlined style={{ fontSize: "12px", color: "#787C7E" }} />
                <span style={{ fontSize: "12px", color: "#787C7E", fontWeight: 700 }}>
                  {content.views_count || 0} Views
                </span>
              </Flex>

              {/* Comments Count */}
              <Flex
                align="center"
                gap={4}
                style={{
                  color: "#787C7E",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  padding: "4px 6px",
                  borderRadius: "4px",
                  transition: "background-color 0.2s ease",
                }}
                onClick={handleContentClick}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F8F9FA";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <MessageOutlined style={{ fontSize: "12px" }} />
                <span>{content.comments_count || 0} Komentar</span>
              </Flex>

              {/* Bookmarks Count */}
              <Flex align="center" gap={4}>
                <BookOutlined style={{ fontSize: "12px", color: "#787C7E" }} />
                <span style={{ fontSize: "12px", color: "#787C7E", fontWeight: 700 }}>
                  {content.bookmarks_count || 0} Disimpan
                </span>
              </Flex>
            </Flex>

            {/* Bookmark Button */}
            <Flex
              align="center"
              gap={4}
              style={{
                cursor: isBookmarking ? "default" : "pointer",
                padding: "4px 6px",
                borderRadius: "4px",
                transition: "background-color 0.2s ease",
                opacity: isBookmarking ? 0.7 : 1,
              }}
              onClick={handleBookmarkClick}
              onMouseEnter={(e) => {
                if (!isBookmarking) {
                  e.currentTarget.style.backgroundColor = "#F8F9FA";
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
                    fontSize: "12px",
                    color: "#FF4500",
                  }}
                  spin
                />
              ) : (
                <BookOutlined
                  style={{
                    fontSize: "12px",
                    color: isBookmarked ? "#FF4500" : "#787C7E",
                  }}
                />
              )}
              <span
                style={{
                  fontSize: "12px",
                  color: isBookmarking ? "#FF4500" : (isBookmarked ? "#FF4500" : "#787C7E"),
                  fontWeight: 700,
                }}
              >
                {isBookmarking ? "Loading..." : (isBookmarked ? "Tersimpan" : "Simpan")}
              </span>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      
      <style jsx global>{`
        .ant-card-hoverable:hover {
          border-color: #FF4500 !important;
          box-shadow: 0 2px 8px rgba(255, 69, 0, 0.15) !important;
        }

        .ant-card {
          transition: all 0.2s ease !important;
        }
      `}</style>
    </Card>
  );
};

export default ContentCard;
