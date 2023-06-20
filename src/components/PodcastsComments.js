import {
  createPodcastComment,
  deletePodcastComment,
  updatePodcastComment,
} from "@/services/index";
import { formatDateFromNow } from "@/utils/client-utils";
import { formatDate } from "@/utils/index";
import { Group } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Comment,
  Divider,
  Popconfirm,
  Space,
  Tooltip,
  Typography,
  message,
} from "antd";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import NewTicket from "./Ticket/NewTicket";

const CommentPodcast = ({ item, currentUserId }) => {
  const queryClient = useQueryClient();

  const [id, setId] = useState(null);
  const [currentComment, setCurrentComment] = useState();

  const handleChangeId = () => {
    setId(item?.id);
    setCurrentComment(item?.comment);
  };

  const handleCancel = () => {
    setId(null);
    setCurrentComment("");
  };

  const { mutate: hapus, isLoading } = useMutation(
    (data) => deletePodcastComment(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("podcasts-comments", item?.podcast_id);
        message.success("Komentar berhasil dihapus");
      },
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
    }
  );

  const { mutate: update, isLoading: isLoadingUpdate } = useMutation(
    (data) => updatePodcastComment(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("podcasts-comments", item?.podcast_id);
        message.success("Komentar berhasil diupdate");
        setId(null);
      },
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
    }
  );

  const handleUpdate = () => {
    const sendItem = {
      id: item?.podcast_id,
      commentId: id,
      data: {
        comment: currentComment,
      },
    };

    update(sendItem);
  };

  return (
    <>
      {id === item?.id ? (
        <NewTicket
          withCancel
          handleCancel={handleCancel}
          loadingSubmit={isLoadingUpdate}
          submitMessage={handleUpdate}
          value={currentComment}
          setValue={setCurrentComment}
        />
      ) : (
        <Group position="apart">
          <Comment
            author={
              <Link href={`/users/${item?.user?.custom_id}`}>
                <Typography.Link>{item?.user?.username}</Typography.Link>
              </Link>
            }
            datetime={
              <Tooltip title={formatDate(item?.created_at)}>
                <Space>
                  <span>
                    {item?.is_edited
                      ? formatDateFromNow(item?.updated_at)
                      : formatDateFromNow(item?.created_at)}
                  </span>
                  {item?.is_edited && <span>&#8226; diedit</span>}
                </Space>
              </Tooltip>
            }
            content={
              <div
                dangerouslySetInnerHTML={{
                  __html: item?.html,
                }}
              />
            }
            avatar={
              <Link href={`/users/${item?.user?.custom_id}`}>
                <Avatar src={item?.user?.image} />
              </Link>
            }
          />
          {currentUserId === item?.user?.custom_id && (
            <div>
              <Popconfirm
                title="Apakah anda yakin ingin menghapus komentar ini?"
                okText="Ya"
                cancelText="Tidak"
                onConfirm={() =>
                  hapus({
                    id: item?.podcast_id,
                    commentId: item?.id,
                  })
                }
              >
                <a>Hapus</a>
              </Popconfirm>
              <Divider type="vertical" />
              <a onClick={handleChangeId}>Edit</a>
            </div>
          )}
        </Group>
      )}
    </>
  );
};
const Comments = ({ comments, currentUserId, podcastId }) => {
  return comments.map((item) => (
    <CommentPodcast
      podcastId={podcastId}
      currentUserId={currentUserId}
      key={item.id}
      item={item}
    />
  ));
};

function PodcastsComments({ comments, id }) {
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  const { data: dataUser, status } = useSession();

  const { mutate: createComment, isLoading: isLoadingCreateComment } =
    useMutation((data) => createPodcastComment(data), {
      onSuccess: () => {
        queryClient.invalidateQueries("podcasts-comments", id);
        message.success("Komentar berhasil ditambahkan");
        setComment("");
      },
    });

  const handleSubmitMessage = () => {
    const data = {
      id,
      data: {
        comment,
        podcast_id: id,
      },
    };

    createComment(data);
  };

  return (
    <>
      <Comments
        currentUserId={status === "authenticated" ? dataUser?.user?.id : null}
        podcastId={id}
        comments={comments}
      />
      <Divider />
      <NewTicket
        loadingSubmit={isLoadingCreateComment}
        submitMessage={handleSubmitMessage}
        value={comment}
        setValue={setComment}
      />
    </>
  );
}

export default PodcastsComments;
