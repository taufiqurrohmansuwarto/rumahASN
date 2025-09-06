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
  InboxOutlined,
  LikeFilled,
  LikeOutlined,
  LoadingOutlined,
  TagsOutlined,
  UserOutlined,
  PaperClipOutlined,
  LinkOutlined,
  FileTextOutlined,
  FileImageOutlined,
  PlayCircleOutlined,
  SoundOutlined,
  SendOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  Card,
  Flex,
  Tag,
  Tooltip,
  Typography,
  Divider,
  Grid,
  Button,
  Space,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";

const { Text } = Typography;
const { useBreakpoint } = Grid;

const KnowledgeContentHeader = ({
  content,
  onLike,
  onBookmark,
  isLiked,
  isBookmarked,
  isLiking = false,
  isBookmarking = false,
  disableInteractions = false,
  showOwnerActions = false,
  onSubmitForReview = () => {},
  isSubmittingForReview = false,
  onDelete = () => {},
  isDeleting = false,
}) => {
  const router = useRouter();

  // Responsive breakpoints
  const screens = useBreakpoint();
  const isMobile = !screens.md;
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

  // Render metadata tags
  const renderMetadata = () => {
    const metadataItems = [];

    // Status
    if (content?.status) {
      metadataItems.push(
        <Tag
          key="status"
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
      );
    }

    // Category
    if (content?.category) {
      metadataItems.push(
        <Tag
          key="category"
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
          <span style={{ fontSize: "8px" }}>
            <FileTextOutlined />
          </span>
          {content?.category?.name}
        </Tag>
      );
    }

    // Content Type
    metadataItems.push(
      <Tag
        key="type"
        style={{
          fontSize: "10px",
          fontWeight: 500,
          backgroundColor: getTypeInfo(content?.type).color,
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
        <span style={{ fontSize: "8px" }}>
          {getTypeInfo(content?.type).icon}
        </span>
        {getTypeInfo(content?.type).label}
      </Tag>
    );

    return (
      <Flex align="center" gap="4px" wrap="wrap">
        {metadataItems.map((item, index) => (
          <div
            key={item.key}
            style={{ display: "flex", alignItems: "center", gap: "4px" }}
          >
            {item}
            {index < metadataItems.length - 1 && (
              <span style={{ color: "#787C7E", fontSize: "12px" }}>•</span>
            )}
          </div>
        ))}
      </Flex>
    );
  };

  // Get type icon and label
  const getTypeInfo = (type) => {
    const typeInfo = {
      teks: {
        label: "Teks",
        icon: <FileTextOutlined />,
        color: "#1890ff",
        description: "Konten berupa artikel atau tulisan",
      },
      gambar: {
        label: "Gambar",
        icon: <FileImageOutlined />,
        color: "#52c41a",
        description: "Konten berupa gambar atau infografik",
      },
      video: {
        label: "Video",
        icon: <PlayCircleOutlined />,
        color: "#722ed1",
        description: "Konten berupa video atau multimedia",
      },
      audio: {
        label: "Audio",
        icon: <SoundOutlined />,
        color: "#fa8c16",
        description: "Konten berupa audio atau podcast",
      },
    };
    return typeInfo[type] || typeInfo.teks;
  };

  // Extract YouTube video ID
  const getYouTubeVideoId = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url?.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Render media preview based on content type
  const renderMediaPreview = () => {
    const contentType = content?.type || "teks";
    const sourceUrl = content?.source_url;

    if (!sourceUrl || contentType === "teks") return null;

    const containerStyle = {
      width: "100%",
      maxWidth: "400px",
      borderRadius: "8px",
      overflow: "hidden",
      border: "1px solid #E9ECEF",
      backgroundColor: "#F8F9FA",
    };

    switch (contentType) {
      case "gambar":
        return (
          <div style={containerStyle}>
            <img
              src={sourceUrl}
              alt="Content preview"
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover",
                display: "block",
              }}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            <div
              style={{
                display: "none",
                alignItems: "center",
                justifyContent: "center",
                height: "200px",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <FileImageOutlined
                style={{ fontSize: "32px", color: "#52c41a" }}
              />
              <Text style={{ fontSize: "12px", color: "#6B7280" }}>
                Gambar tidak dapat dimuat
              </Text>
            </div>
          </div>
        );

      case "video":
        const videoId = getYouTubeVideoId(sourceUrl);
        const isYouTube = !!videoId;

        if (isYouTube) {
          return (
            <div style={containerStyle}>
              <div
                style={{
                  position: "relative",
                  height: "225px",
                  background: `url(https://img.youtube.com/vi/${videoId}/maxresdefault.jpg) center/cover`,
                  cursor: "pointer",
                }}
                onClick={() => window.open(sourceUrl, "_blank")}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(0,0,0,0.3)",
                  }}
                >
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      backgroundColor: "rgba(255,255,255,0.9)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "transform 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <PlayCircleOutlined
                      style={{ fontSize: "32px", color: "#722ed1" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        } else {
          return (
            <div style={containerStyle}>
              <video
                src={sourceUrl}
                controls
                style={{
                  width: "100%",
                  height: "225px",
                  objectFit: "cover",
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div
                style={{
                  display: "none",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "225px",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <PlayCircleOutlined
                  style={{ fontSize: "32px", color: "#722ed1" }}
                />
                <Text style={{ fontSize: "12px", color: "#6B7280" }}>
                  Video tidak dapat dimuat
                </Text>
              </div>
            </div>
          );
        }

      case "audio":
        return (
          <div style={{ ...containerStyle, padding: "16px" }}>
            <div style={{ marginBottom: "12px", textAlign: "center" }}>
              <SoundOutlined style={{ fontSize: "32px", color: "#fa8c16" }} />
            </div>
            <audio
              src={sourceUrl}
              controls
              style={{ width: "100%" }}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "block";
              }}
            />
            <div
              style={{ display: "none", textAlign: "center", padding: "8px 0" }}
            >
              <Text style={{ fontSize: "12px", color: "#6B7280" }}>
                Audio tidak dapat dimuat
              </Text>
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
      {!disableInteractions && (
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
      )}

      {/* Status indicator for disabled interactions */}
      {disableInteractions && (
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            zIndex: 10,
          }}
        >
          <div
            style={{
              padding: "6px 12px",
              borderRadius: "4px",
              backgroundColor: "#FFF7ED",
              border: "1px solid #FED7AA",
            }}
          >
            <Text
              style={{
                fontSize: "11px",
                color: "#C2410C",
                fontWeight: 600,
              }}
            >
              ⚠️ Preview Mode
            </Text>
          </div>
        </div>
      )}

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
              disableInteractions
                ? "Interaksi tidak tersedia"
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
                  fontSize: 16,
                  color: disableInteractions ? "#D1D5DB" : "#FF4500",
                  cursor: disableInteractions ? "default" : "pointer",
                  marginBottom: "4px",
                  transition: "transform 0.2s ease",
                  opacity: disableInteractions ? 0.6 : 1,
                }}
                onClick={disableInteractions ? undefined : onLike}
              />
            ) : (
              <LikeOutlined
                style={{
                  fontSize: 16,
                  color: disableInteractions ? "#D1D5DB" : "#878A8C",
                  cursor: disableInteractions ? "default" : "pointer",
                  marginBottom: "4px",
                  transition: "color 0.2s ease, transform 0.2s ease",
                  opacity: disableInteractions ? 0.6 : 1,
                }}
                onClick={disableInteractions ? undefined : onLike}
              />
            )}
          </Tooltip>
          <Text
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: disableInteractions
                ? "#D1D5DB"
                : isLiked
                ? "#FF4500"
                : "#878A8C",
              margin: "4px 0",
              lineHeight: 1,
              opacity: disableInteractions ? 0.6 : 1,
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

                  {/* Metadata for desktop/tablet screens */}
                  {!isMobile && (
                    <>
                      <span style={{ color: "#787C7E", fontSize: "12px" }}>
                        •
                      </span>
                      {renderMetadata()}
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
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <EditOutlined
                          style={{ fontSize: "11px", color: "#666" }}
                        />
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

            {/* Media Preview */}
            {renderMediaPreview() && (
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
                  Preview Media:
                </Text>
                <div>{renderMediaPreview()}</div>
              </div>
            )}

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
                }}
              >
                <ReactMarkdownCustom withCustom={false}>
                  {content?.content || "Tidak ada konten"}
                </ReactMarkdownCustom>
              </div>
            </div>
          </div>

          {/* Draft Actions - Only show for draft content and owner */}
          {content?.status === "draft" && showOwnerActions && (
            <div
              style={{
                marginBottom: "24px",
                padding: "16px",
                backgroundColor: "#FFF7ED",
                border: "2px solid #FED7AA",
                borderRadius: "8px",
                position: "relative",
              }}
            >
              {/* Alert indicator */}
              <div
                style={{
                  position: "absolute",
                  top: "-1px",
                  left: "-1px",
                  width: "4px",
                  height: "calc(100% + 2px)",
                  backgroundColor: "#EA580C",
                  borderRadius: "2px 0 0 2px",
                }}
              />

              <div style={{ marginBottom: "12px" }}>
                <Flex align="center" gap={8} style={{ marginBottom: "4px" }}>
                  <EditOutlined
                    style={{ color: "#EA580C", fontSize: "14px" }}
                  />
                  <Text
                    strong
                    style={{
                      color: "#EA580C",
                      fontSize: "14px",
                    }}
                  >
                    Konten Draft - Perlu Tindakan
                  </Text>
                </Flex>
                <Text
                  style={{
                    color: "#C2410C",
                    fontSize: "12px",
                    lineHeight: "1.4",
                  }}
                >
                  Konten ini masih dalam tahap draft. Anda dapat melakukan edit
                  atau submit untuk direview oleh admin.
                </Text>
              </div>

              <Space size="middle">
                <Button
                  type="default"
                  icon={<EditOutlined />}
                  onClick={() =>
                    router.push(
                      `/asn-connect/asn-knowledge/my-knowledge/${content.id}/edit`
                    )
                  }
                  style={{
                    borderColor: "#EA580C",
                    color: "#EA580C",
                    fontWeight: 600,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#EA580C";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#EA580C";
                  }}
                >
                  Edit Konten
                </Button>

                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={onDelete}
                  loading={isDeleting}
                  style={{
                    borderColor: "#ff4d4f",
                    color: "#ff4d4f",
                    fontWeight: 600,
                  }}
                  onMouseEnter={(e) => {
                    if (!isDeleting) {
                      e.currentTarget.style.backgroundColor = "#ff4d4f";
                      e.currentTarget.style.color = "white";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDeleting) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#ff4d4f";
                    }
                  }}
                >
                  {isDeleting ? "Menghapus..." : "Hapus Draft"}
                </Button>

                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={onSubmitForReview}
                  loading={isSubmittingForReview}
                  disabled={isSubmittingForReview}
                  style={{
                    backgroundColor: "#EA580C",
                    borderColor: "#EA580C",
                    fontWeight: 600,
                    boxShadow: "0 2px 4px rgba(234, 88, 12, 0.2)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmittingForReview) {
                      e.currentTarget.style.backgroundColor = "#C2410C";
                      e.currentTarget.style.borderColor = "#C2410C";
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 8px rgba(234, 88, 12, 0.3)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmittingForReview) {
                      e.currentTarget.style.backgroundColor = "#EA580C";
                      e.currentTarget.style.borderColor = "#EA580C";
                      e.currentTarget.style.transform = "translateY(0px)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 4px rgba(234, 88, 12, 0.2)";
                    }
                  }}
                >
                  {isSubmittingForReview ? "Mengirim..." : "Submit untuk Review"}
                </Button>
              </Space>
            </div>
          )}

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

          {/* Metadata for mobile screens only */}
          {isMobile && (
            <div style={{ marginBottom: "16px" }}>{renderMetadata()}</div>
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
