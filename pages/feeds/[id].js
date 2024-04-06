import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Button, Form, Input, message } from "antd";
import { Comment } from "@ant-design/compatible";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { createComment, detailComments } from "../../services";
import Layout from "../../src/components/Layout";
import PageContainer from "../../src/components/PageContainer";
import { fromNow } from "../../utils";

const CreateComment = ({ user, commentId }) => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const { mutate: create, isLoading } = useMutation(
    (data) => createComment(data),
    {
      onSettled: () => {
        queryClient.invalidateQueries(["comments"]);
      },
      onSuccess: () => {
        message.success("Berhasil membuat komentar");
        form.resetFields();
      },
      onError: () => {
        message.error("Gagal membuat komentar");
      },
    }
  );

  const handleCreate = async (values) => {
    try {
      // create(values);
      const data = { ...values, comment_id: commentId };
      create(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Comment
      avatar={user?.image}
      author={user?.name}
      content={
        <Form onFinish={handleCreate} form={form}>
          <Form.Item name="comment">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" loading={isLoading} htmlType="submit">
              Tambahkan Komentar
            </Button>
          </Form.Item>
        </Form>
      }
    />
  );
};

const MainComment = ({ message, user, comments, currentUser, commentId }) => {
  return (
    <Comment
      author={user?.username}
      avatar={user?.image}
      content={<p>{message}</p>}
    >
      <CreateComment user={currentUser} commentId={commentId} />
      {comments?.map((comment) => (
        <Comment
          datetime={fromNow(comment?.created_at)}
          key={comment.id}
          author={comment.user?.username}
          avatar={comment.user?.image}
          content={<p>{comment?.message}</p>}
        />
      ))}
    </Comment>
  );
};

function FeedDetail() {
  const { data, status } = useSession();

  const router = useRouter();

  const { data: dataComment, isLoading } = useQuery(
    ["comments", router.query.id],
    () => detailComments(router.query.id),
    {
      enabled: !!router.query.id,
    }
  );

  return (
    <PageContainer title="Beranda" subTitle="Feeds">
      <Button onClick={() => signOut()}>Logout</Button>
      <MainComment
        message={dataComment?.message}
        currentUser={data?.user}
        commentId={router?.query?.id}
        user={dataComment?.user}
        comments={dataComment?.comments}
      />
    </PageContainer>
  );
}

FeedDetail.Auth = {
  action: "manage",
  subject: "Feeds",
};

FeedDetail.getLayout = function getLayout(page) {
  return <Layout active={"/feeds"}>{page}</Layout>;
};

export default FeedDetail;
