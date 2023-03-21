import {
  removeCommentsReactions,
  updateCommentsReactions,
} from "@/services/index";
import { SmileOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Space, Popover, Button } from "antd";
import { useState } from "react";

const emoticons = ["👍", "👎", "😁", "🎉", "🤔", "❤", "🚀", "🤬"];

const reaction = (comment) => {
  if (!comment?.my_reaction?.length === 0) {
    return [];
  }
  return comment?.my_reaction?.map((c) => c?.reaction);
};

const SimpleEmojiPicker = ({ comment, ticketId }) => {
  const [visible, setVisible] = useState(false);
  const [selectedEmojis, setSelectedEmojis] = useState(reaction(comment));
  const queryClient = useQueryClient();

  const { mutateAsync: insert } = useMutation(
    (data) => updateCommentsReactions(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["publish-ticket", ticketId]);
      },
    }
  );

  const { mutateAsync: remove } = useMutation(
    (data) => removeCommentsReactions(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["publish-ticket", ticketId]);
      },
    }
  );

  const onEmojiClick = async (emoji) => {
    const sending = {
      ticketId,
      commentId: comment?.id,
      data: {
        reaction: emoji,
      },
    };
    if (selectedEmojis.includes(emoji)) {
      await remove(sending);
      setSelectedEmojis(selectedEmojis.filter((e) => e !== emoji));
    } else {
      await insert(sending);
      setSelectedEmojis([...selectedEmojis, emoji]);
    }
  };

  const handleClick = () => {
    setVisible(!visible);
  };

  const handleVisibleChange = (visible) => {
    setVisible(visible);
  };

  const content = (
    <Space>
      {emoticons.map((emoji, index) => (
        <Button
          style={
            selectedEmojis.includes(emoji)
              ? { backgroundColor: "#1890ff", color: "white" }
              : {}
          }
          size="small"
          key={index}
          onClick={() => onEmojiClick(emoji)}
        >
          {emoji}
        </Button>
      ))}
    </Space>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={visible}
      onOpenChange={handleVisibleChange}
    >
      <SmileOutlined onClick={handleClick} />
    </Popover>
  );
};

export default SimpleEmojiPicker;
