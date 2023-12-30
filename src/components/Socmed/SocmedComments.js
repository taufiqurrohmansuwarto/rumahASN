import { getPost } from "@/services/socmed.services";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Comment } from "antd";
import { useRouter } from "next/router";

function SocmedComments() {
  const router = useRouter();
  const { id } = router.query;

  const { data: post, isLoading } = useQuery(
    ["socmed-posts", id],
    () => getPost(id),
    {}
  );
  return (
    <Comment
      content={post?.content}
      author={post?.user?.username}
      avatar={<Avatar src={post?.user?.image} />}
      datetime={post?.created_at}
    >
      <Comment
        content={post?.content}
        author={post?.user?.username}
        avatar={<Avatar src={post?.comments?.user?.image} />}
        datetime={post?.comments?.created_at}
      />
    </Comment>
  );
}

export default SocmedComments;
