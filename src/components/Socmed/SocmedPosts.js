import { getPosts, likePost } from "@/services/socmed.services";
import { CommentOutlined, LikeTwoTone } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, Comment, List, Space, Tooltip, message } from "antd";
import moment from "moment";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

const Post = ({ post, currentUser }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const gotoDetailPost = () => {
    router.push(`/asn-connect/asn-updates/${post?.id}`);
  };

  const { mutate: like, isLoading } = useMutation((data) => likePost(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["socmed-posts"]);
      message.success("berhasil");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["socmed-posts"]);
    },
  });

  const handleLike = () => {
    like(post?.id);
  };

  const actions = [
    <span key="likes" onClick={handleLike}>
      <LikeTwoTone /> {post?.likes_count}
    </span>,
    <span key="comment" onClick={gotoDetailPost}>
      <Space>
        <CommentOutlined />
        Komentar
      </Space>
    </span>,
  ];

  return (
    <>
      <Comment
        author={post?.user?.username}
        actions={actions}
        avatar={<Avatar src={post?.user?.image} />}
        datetime={
          <Tooltip
            title={moment(post?.created_at).format("DD-MM-YYYY HH:mm:ss")}
          >
            {moment(post?.created_at).fromNow()}
          </Tooltip>
        }
        content={post?.content}
      />
    </>
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
