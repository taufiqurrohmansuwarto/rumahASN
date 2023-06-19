import { createPodcastComment, podcastComment } from "@/services/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Comment,
  Skeleton,
  Space,
  Tooltip,
  Typography,
  message,
} from "antd";
import NewTicket from "./Ticket/NewTicket";
import { useState } from "react";
import Link from "next/link";
import { formatDate } from "@/utils/index";
import { formatDateFromNow } from "@/utils/client-utils";
import { Group } from "@mantine/core";

const CreateComment = ({ id }) => {
  return <div>Create Comment</div>;
};

const UpdateComment = () => {
  return <div>Update Comment</div>;
};

const CommentPodcast = ({ item }) => {
  return (
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
        content={item?.comment}
        avatar={
          <Link href={`/users/${item?.user?.custom_id}`}>
            <Avatar src={item?.user?.image} />
          </Link>
        }
      />
      <div>test</div>
    </Group>
  );
};
const Comments = ({ comments }) => {
  return comments.map((item) => <CommentPodcast key={item.id} item={item} />);
};

function PodcastsComments({ id }) {
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  const { data, isLoading } = useQuery(
    ["podcasts-comments", id],
    () => podcastComment(id),
    {}
  );

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
    <Skeleton loading={isLoading}>
      <Comments comments={data} />
      <NewTicket
        loadingSubmit={isLoadingCreateComment}
        submitMessage={handleSubmitMessage}
        value={comment}
        setValue={setComment}
      />
    </Skeleton>
  );
}

export default PodcastsComments;
