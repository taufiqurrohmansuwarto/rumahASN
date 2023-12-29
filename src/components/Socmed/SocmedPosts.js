import { getPosts, likePost } from "@/services/socmed.services";
import { CommentOutlined, LikeOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Comment,
  List,
  Space,
  Tooltip,
  Typography,
  message,
} from "antd";
import moment from "moment";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

const Post = ({ post, currentUser }) => {
  const router = useRouter();

  const gotoDetailPost = () => {
    router.push(`/asn-connect/asn-updates/${post?.id}`);
  };

  const { mutate: like, isLoading } = useMutation((data) => likePost(data), {
    onSuccess: () => message.success("berhasil"),
  });

  const handleLike = () => {
    like(post?.id);
  };

  const actions = [
    <span key="likes" onClick={handleLike}>
      <LikeOutlined /> {post?.likes?.count || 0}
    </span>,
    <span key="comment" onClick={gotoDetailPost}>
      <Space>
        <CommentOutlined />
        Komentar
      </Space>
    </span>,
  ];

  return (
    <Comment
      author={post?.user?.username}
      actions={actions}
      avatar={<Avatar src={post?.user?.image} />}
      datetime={
        <Tooltip title={moment(post?.created_at).format("DD-MM-YYYY HH:mm:ss")}>
          {moment(post?.created_at).fromNow()}
        </Tooltip>
      }
      content={post?.content}
    />
  );
};

function SocmedPosts() {
  const { data: currentUser } = useSession();
  const { data: posts, isLoading } = useQuery(
    ["socmed-posts"],
    () => getPosts(),
    {}
  );
  return (
    <>
      <List
        dataSource={posts?.data}
        rowKey={(item) => item.id}
        loading={isLoading}
        renderItem={(item) => {
          return <Post currentUser={currentUser?.user} post={item} />;
        }}
      />
    </>
  );
}

export default SocmedPosts;
