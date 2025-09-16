import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";
import AvatarUser from "@/components/Users/AvatarUser";
import UserText from "@/components/Users/UserText";
import {
  MessageOutlined,
  UserOutlined,
  LikeOutlined,
  LikeFilled,
  BookOutlined,
  LoadingOutlined,
  EyeOutlined,
  TagsOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  CloseCircleOutlined,
  InboxOutlined,
  FolderOutlined,
  SoundOutlined,
  PlayCircleOutlined,
  FileImageOutlined,
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

  const handleUserClick = (e) => {
    e.stopPropagation();
    onUserClick && onUserClick(content.author);
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    // Only allow like/unlike for published content
    if (!isLiking && content.status === "published") {
      onLike && onLike(content.id);
    }
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    // Only allow bookmark for published content
    if (!isBookmarking && content.status === "published") {
      onBookmark && onBookmark(content.id);
    }
  };

  const handleContentClick = () => {
    // Allow content click for all content (for viewing details)
    onClick && onClick();
  };

  // Render media based on content type
  const renderMediaPreview = () => {
    const contentType = content.type || "teks";
    const sourceUrl = content.source_url;

    if (!sourceUrl || contentType === "teks") {
      return null;
    }

    const mediaStyle = {
      width: "100%",
      marginBottom: "12px",
      borderRadius: "8px",
      overflow: "hidden",
      border: "1px solid #e9ecef",
    };

    switch (contentType) {
      case "gambar":
        return (
          <div style={mediaStyle}>
            <img
              src={sourceUrl}
              alt={content.title}
              style={{
                width: "100%",
                height: isMobile ? "120px" : "160px",
                objectFit: "cover",
                display: "block",
              }}
              onError={(e) => {
                // Fallback to icon if image fails to load
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            <div
              style={{
                display: "none",
                height: isMobile ? "120px" : "160px",
                backgroundColor: "#f8f9fa",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                color: "#8c8c8c",
              }}
            >
              <FileImageOutlined
                style={{ fontSize: "24px", marginBottom: "8px" }}
              />
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Gambar tidak dapat dimuat
              </Text>
            </div>
          </div>
        );

      case "video":
        // Check if it's a YouTube or Vimeo URL and create embed
        const isYouTube = /(?:youtube\.com|youtu\.be)/i.test(sourceUrl);
        const isVimeo = /vimeo\.com/i.test(sourceUrl);

        if (isYouTube) {
          const videoId = sourceUrl.match(
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/)([^&\n?#]+)/
          )?.[1];
          if (videoId) {
            // YouTube thumbnail URLs (ordered by quality preference)
            const thumbnailUrls = [
              `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, // 1280x720
              `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,     // 480x360
              `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,     // 320x180
              `https://img.youtube.com/vi/${videoId}/0.jpg`              // fallback
            ];
            
            return (
              <div style={mediaStyle}>
                <div style={{ position: "relative", cursor: "pointer" }}>
                  <img
                    src={thumbnailUrls[1]} // Use HQ default for better reliability
                    alt={content.title}
                    style={{
                      width: "100%",
                      height: isMobile ? "120px" : "160px",
                      objectFit: "cover",
                      display: "block",
                    }}
                    onError={(e) => {
                      // Try next quality if current fails
                      const currentSrc = e.target.src;
                      const currentIndex = thumbnailUrls.findIndex(url => url === currentSrc);
                      if (currentIndex < thumbnailUrls.length - 1) {
                        e.target.src = thumbnailUrls[currentIndex + 1];
                      } else {
                        // All thumbnails failed, show fallback
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Open YouTube video in new tab
                      window.open(sourceUrl, '_blank');
                    }}
                  />
                  {/* Play button overlay */}
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      borderRadius: "50%",
                      width: "48px",
                      height: "48px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(sourceUrl, '_blank');
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255, 69, 0, 0.9)";
                      e.currentTarget.style.transform = "translate(-50%, -50%) scale(1.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
                      e.currentTarget.style.transform = "translate(-50%, -50%) scale(1)";
                    }}
                  >
                    <PlayCircleOutlined
                      style={{
                        color: "white",
                        fontSize: "24px",
                      }}
                    />
                  </div>
                  
                  {/* YouTube badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      backgroundColor: "#FF0000",
                      color: "white",
                      padding: "2px 6px",
                      borderRadius: "3px",
                      fontSize: "10px",
                      fontWeight: "bold",
                      fontFamily: "Arial, sans-serif",
                    }}
                  >
                    YouTube
                  </div>
                  
                  {/* Fallback for thumbnail load error */}
                  <div
                    style={{
                      display: "none",
                      height: isMobile ? "120px" : "160px",
                      backgroundColor: "#f8f9fa",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      color: "#8c8c8c",
                    }}
                  >
                    <PlayCircleOutlined style={{ fontSize: "24px", marginBottom: "8px" }} />
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Video YouTube
                    </Text>
                  </div>
                </div>
              </div>
            );
          }
        }

        if (isVimeo) {
          const videoId = sourceUrl.match(/vimeo\.com\/(\d+)/)?.[1];
          if (videoId) {
            return (
              <div style={mediaStyle}>
                <iframe
                  width="100%"
                  height={isMobile ? "120px" : "160px"}
                  src={`https://player.vimeo.com/video/${videoId}`}
                  title={content.title}
                  frameBorder="0"
                  allowFullScreen
                  style={{ display: "block" }}
                />
              </div>
            );
          }
        }

        // For other video URLs or direct video files
        return (
          <div style={mediaStyle}>
            <video
              width="100%"
              height={isMobile ? "120px" : "160px"}
              controls
              style={{ display: "block" }}
              onError={(e) => {
                // Fallback to icon if video fails to load
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            >
              <source src={sourceUrl} />
              Your browser does not support the video tag.
            </video>
            <div
              style={{
                display: "none",
                height: isMobile ? "120px" : "160px",
                backgroundColor: "#f8f9fa",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                color: "#8c8c8c",
              }}
            >
              <PlayCircleOutlined
                style={{ fontSize: "24px", marginBottom: "8px" }}
              />
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Video tidak dapat dimuat
              </Text>
            </div>
          </div>
        );

      case "audio":
        return (
          <div style={mediaStyle}>
            <div
              style={{
                padding: "16px",
                backgroundColor: "#f8f9fa",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <SoundOutlined
                style={{
                  fontSize: "24px",
                  color: "#FF4500",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <audio
                  controls
                  style={{ width: "100%", height: "32px" }}
                  preload="metadata"
                >
                  <source src={sourceUrl} />
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
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
      <Flex style={{ minHeight: isMobile ? "60px" : "80px" }}>
        {/* Like Section - Reddit Style */}
        <div
          style={{
            width: isMobile ? "32px" : "40px",
            backgroundColor: "#F8F9FA",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: isMobile ? "6px 0" : "8px 0",
            borderRight: "1px solid #EDEFF1",
          }}
        >
          <Tooltip
            title={
              content.status !== "published"
                ? "Hanya konten yang dipublikasikan yang bisa dilike"
                : isLiking
                ? "Loading..."
                : isLiked
                ? "Unlike"
                : "Like konten ini"
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
                  fontSize: isMobile ? 14 : 16,
                  color: "#FF4500",
                  cursor: "pointer",
                  marginBottom: isMobile ? "2px" : "4px",
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
                  fontSize: isMobile ? 14 : 16,
                  color: "#878A8C",
                  cursor: "pointer",
                  marginBottom: isMobile ? "2px" : "4px",
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
              fontSize: isMobile ? 8 : 10,
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
            padding: isMobile ? "6px 8px" : "12px 16px",
          }}
        >
          {/* Post Meta */}
          <Flex align="center" gap={6} style={{ marginBottom: "8px" }}>
            <Tooltip title="Lihat profil">
              <AvatarUser
                size={isMobile ? 18 : 24}
                src={content.author?.image}
                userId={content.author?.custom_id}
                user={content.author}
                style={{ cursor: "pointer" }}
                onClick={handleUserClick}
              />
            </Tooltip>
            <div
              style={{
                fontSize: isMobile ? "11px" : "12px",
                fontWeight: 500,
              }}
            >
              <UserText
                userId={content.author?.custom_id}
                text={content.author?.username}
              />
            </div>
            <span
              style={{ color: "#787C7E", fontSize: isMobile ? "11px" : "12px" }}
            >
              •
            </span>
            <Tooltip
              title={dayjs(content.created_at).format("DD MMM YYYY HH:mm")}
            >
              <Text
                style={{
                  fontSize: isMobile ? "11px" : "12px",
                  color: "#787C7E",
                }}
              >
                {dayjs(content.created_at).fromNow()}
              </Text>
            </Tooltip>

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

          {/* Media Preview */}
          {renderMediaPreview()}

          {/* Summary */}
          {content?.summary && (
            <Text
              style={{
                color: "#666",
                fontSize: isMobile ? "12px" : "13px",
                lineHeight: "1.4",
                marginBottom: "16px",
                display: "-webkit-box",
                "-webkit-line-clamp": 2,
                "-webkit-box-orient": "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontStyle: "italic",
              }}
            >
              {content.summary}
            </Text>
          )}

          {/* Content Preview */}
          {content?.content && (
            <div
              style={{
                marginBottom: isMobile ? "12px" : "16px",
                padding: isMobile ? "8px" : "12px",
                backgroundColor: "#f8f9fa",
                borderRadius: "6px",
                border: "1px solid #e9ecef",
                position: "relative",
              }}
            >
              <div
                style={{
                  color: "#1A1A1B",
                  fontSize: isMobile ? "12px" : "14px",
                  lineHeight: isMobile ? "16px" : "18px",
                  display: "-webkit-box",
                  "-webkit-line-clamp": 3,
                  "-webkit-box-orient": "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                <ReactMarkdownCustom withCustom={false}>
                  {content?.summary || content?.content?.substring(0, 200)}
                </ReactMarkdownCustom>
              </div>
              {(content?.summary && content.summary.length > 0) ||
                (content?.content && content.content.length > 200 && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "8px",
                      right: "12px",
                      background:
                        "linear-gradient(90deg, transparent, #f8f9fa 30%)",
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
                ))}
            </div>
          )}

          {/* Metadata (Status, Type, Category) */}
          <div style={{ marginTop: "8px", marginBottom: "12px" }}>
            <Flex align="center" gap={isMobile ? "6px" : "8px"} wrap="wrap">
              {/* Status Badge */}
              {(showStatus || isAdmin) && content.status && (
                <>
                  <Tag
                    color={getStatusColor(content.status)}
                    style={{
                      fontSize: isMobile ? "8px" : "10px",
                      fontWeight: 500,
                      border: "none",
                      borderRadius: "4px",
                      margin: 0,
                      padding: isMobile ? "0 4px" : "0 6px",
                      lineHeight: isMobile ? "14px" : "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: isMobile ? "2px" : "4px",
                    }}
                  >
                    <span style={{ fontSize: isMobile ? "6px" : "8px" }}>
                      {getStatusIcon(content.status)}
                    </span>
                    {getStatusLabel(content.status)}
                  </Tag>
                </>
              )}

              {/* Content Type */}
              {content.type && content.type !== "teks" && (
                <>
                  <Tag
                    style={{
                      fontSize: isMobile ? "8px" : "10px",
                      fontWeight: 500,
                      backgroundColor: "#722ed1",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      margin: 0,
                      padding: isMobile ? "0 4px" : "0 6px",
                      lineHeight: isMobile ? "14px" : "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: isMobile ? "2px" : "4px",
                    }}
                  >
                    {content.type === "gambar" && (
                      <FileImageOutlined
                        style={{ fontSize: isMobile ? "6px" : "8px" }}
                      />
                    )}
                    {content.type === "video" && (
                      <PlayCircleOutlined
                        style={{ fontSize: isMobile ? "6px" : "8px" }}
                      />
                    )}
                    {content.type === "audio" && (
                      <SoundOutlined
                        style={{ fontSize: isMobile ? "6px" : "8px" }}
                      />
                    )}
                    {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                  </Tag>
                </>
              )}

              {/* Category */}
              {content.category && (
                <>
                  <Tag
                    style={{
                      fontSize: isMobile ? "8px" : "10px",
                      fontWeight: 500,
                      backgroundColor: "#FF4500",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      margin: 0,
                      padding: isMobile ? "0 4px" : "0 6px",
                      lineHeight: isMobile ? "14px" : "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: isMobile ? "2px" : "4px",
                    }}
                  >
                    <FolderOutlined
                      style={{ fontSize: isMobile ? "6px" : "8px" }}
                    />
                    {content.category.name}
                  </Tag>
                </>
              )}
            </Flex>
          </div>

          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <div style={{ marginBottom: "12px" }}>
              <Flex align="center" gap={isMobile ? "6px" : "8px"} wrap="wrap">
                <Flex align="center" gap="4px">
                  <TagsOutlined
                    style={{
                      fontSize: isMobile ? "8px" : "10px",
                      color: "#787C7E",
                    }}
                  />
                  <Text
                    style={{
                      fontSize: isMobile ? "8px" : "10px",
                      color: "#787C7E",
                      fontWeight: 600,
                    }}
                  >
                    Tags:
                  </Text>
                </Flex>
                {content.tags?.slice(0, 3).map((tag, index) => (
                  <Tag
                    key={index}
                    style={{
                      fontSize: isMobile ? "8px" : "10px",
                      padding: isMobile ? "0 4px" : "0 6px",
                      backgroundColor: "#f5f5f5",
                      border: "1px solid #e8e8e8",
                      color: "#595959",
                      margin: 0,
                      borderRadius: "4px",
                      lineHeight: isMobile ? "14px" : "16px",
                    }}
                  >
                    {tag}
                  </Tag>
                ))}
                {content.tags?.length > 3 && (
                  <Tag
                    style={{
                      fontSize: isMobile ? "8px" : "10px",
                      padding: isMobile ? "0 4px" : "0 6px",
                      backgroundColor: "#f0f0f0",
                      border: "1px solid #d9d9d9",
                      color: "#8c8c8c",
                      margin: 0,
                      borderRadius: "4px",
                      lineHeight: isMobile ? "14px" : "16px",
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
            <Flex align="center" gap={isMobile ? 8 : 12}>
              {/* Views Count */}
              <Flex align="center" gap={4}>
                <EyeOutlined
                  style={{
                    fontSize: isMobile ? "10px" : "12px",
                    color: "#787C7E",
                  }}
                />
                <span
                  style={{
                    fontSize: isMobile ? "10px" : "12px",
                    color: "#787C7E",
                    fontWeight: 700,
                  }}
                >
                  {isMobile
                    ? (content.views_count || 0)
                    : content.views_count
                    ? `${content.views_count}x dilihat`
                    : "0 dilihat"}
                </span>
              </Flex>

              {/* Comments Count */}
              <Flex
                align="center"
                gap={4}
                style={{
                  color: "#787C7E",
                  fontSize: isMobile ? "10px" : "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  padding: isMobile ? "2px 4px" : "4px 6px",
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
                <MessageOutlined
                  style={{ fontSize: isMobile ? "10px" : "12px" }}
                />
                <span>
                  {isMobile 
                    ? (content.comments_count || 0)
                    : `${content.comments_count || 0} komentar`}
                </span>
              </Flex>

              {/* Bookmarks Count */}
              <Flex align="center" gap={4}>
                <BookOutlined
                  style={{
                    fontSize: isMobile ? "10px" : "12px",
                    color: "#787C7E",
                  }}
                />
                <span
                  style={{
                    fontSize: isMobile ? "10px" : "12px",
                    color: "#787C7E",
                    fontWeight: 700,
                  }}
                >
                  {isMobile 
                    ? (content.bookmarks_count || 0)
                    : `${content.bookmarks_count || 0} disimpan`}
                </span>
              </Flex>
            </Flex>

            {/* Bookmark Button */}
            <Flex
              align="center"
              gap={4}
              style={{
                cursor: isBookmarking ? "default" : "pointer",
                padding: isMobile ? "2px 4px" : "4px 6px",
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
                    fontSize: isMobile ? "10px" : "12px",
                    color: "#FF4500",
                  }}
                  spin
                />
              ) : (
                <BookOutlined
                  style={{
                    fontSize: isMobile ? "10px" : "12px",
                    color: isBookmarked ? "#FF4500" : "#787C7E",
                  }}
                />
              )}
              <span
                style={{
                  fontSize: isMobile ? "10px" : "12px",
                  color: isBookmarking
                    ? "#FF4500"
                    : isBookmarked
                    ? "#FF4500"
                    : "#787C7E",
                  fontWeight: 700,
                }}
              >
                {isBookmarking
                  ? "Loading..."
                  : isBookmarked
                  ? "Tersimpan"
                  : "Simpan"}
              </span>
            </Flex>
          </Flex>
        </Flex>
      </Flex>

      <style jsx global>{`
        .ant-card-hoverable:hover {
          border-color: #ff4500 !important;
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
