import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";
import { Comment } from "@ant-design/compatible";
import { BookOutlined, CommentOutlined, LikeOutlined } from "@ant-design/icons";
import { Avatar, Tooltip } from "antd";
import dayjs from "dayjs";

const KnowledgeContentBody = ({ data, actions }) => {
  return (
    <Comment
      avatar={<Avatar src={data?.author?.image} />}
      author={data?.author?.username}
      actions={actions}
      datetime={dayjs(data?.created_at).format("DD MMMM YYYY")}
      content={
        <div
          style={{
            padding: "24px 16px",
            backgroundColor: "#fafafa",
            borderRadius: "8px",
            border: "1px solid #f0f0f0",
            marginTop: "12px",
            lineHeight: "1.8",
            fontSize: "15px",
            color: "#262626",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
        >
          <ReactMarkdownCustom withCustom={false}>
            {data?.content}
          </ReactMarkdownCustom>
        </div>
      }
    />
  );
};

export default KnowledgeContentBody;
