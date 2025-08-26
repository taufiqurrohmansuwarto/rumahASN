import AvatarUser from "@/components/Users/AvatarUser";
import UserText from "@/components/Users/UserText";
import { Comment } from "@ant-design/compatible";
import { UserOutlined } from "@ant-design/icons";
import { Avatar, Divider, Space, Tag, Tooltip, Typography } from "antd";
import dayjs from "dayjs";

const { Text } = Typography;

const ContentComments = ({ content }) => {
  return (
    <>
      <Divider style={{ margin: "32px 0 24px 0" }}>
        <Text style={{ color: "#666", fontSize: "14px" }}>
          💬 Komentar ({content.comments?.length || 0})
        </Text>
      </Divider>

      {/* Comments Section */}
      <div style={{ marginBottom: "24px" }}>
        {content.comments && content.comments.length > 0 ? (
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            {content.comments.map((comment) => (
              <Comment
                key={comment.id}
                avatar={
                  <AvatarUser
                    src={comment.user?.image}
                    userId={comment.user?.custom_id}
                    user={comment.user}
                    size="default"
                  />
                }
                author={
                  <Space>
                    <div style={{ fontSize: "13px", fontWeight: 600 }}>
                      <UserText 
                        userId={comment.user?.custom_id}
                        text={comment.user?.username}
                      />
                    </div>
                    {comment.user?.nama_jabatan && (
                      <Tooltip title={comment.user?.perangkat_daerah_detail}>
                        <Tag size="small" style={{ fontSize: "10px", cursor: "help" }}>
                          {comment.user?.nama_jabatan}
                        </Tag>
                      </Tooltip>
                    )}
                  </Space>
                }
                datetime={
                  <Text style={{ fontSize: "12px", color: "#999" }}>
                    {dayjs(comment.created_at).format("DD MMM YYYY, HH:mm")}
                  </Text>
                }
                content={
                  <div style={{
                    padding: "12px 16px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "6px",
                    border: "1px solid #e9ecef",
                    marginTop: "8px"
                  }}>
                    <Text style={{ 
                      fontSize: "14px", 
                      color: "#1A1A1B",
                      lineHeight: "1.5"
                    }}>
                      {comment.comment_text}
                    </Text>
                  </div>
                }
              />
            ))}
          </Space>
        ) : (
          <div style={{ 
            textAlign: "center", 
            padding: "40px 20px",
            color: "#999",
            fontStyle: "italic"
          }}>
            <Text style={{ fontSize: "14px", color: "#999" }}>
              Belum ada komentar pada konten ini
            </Text>
          </div>
        )}
      </div>
    </>
  );
};

export default ContentComments;