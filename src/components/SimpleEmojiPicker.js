import { SmileOutlined } from "@ant-design/icons";
import { Space, Popover, Button } from "antd";
import { useState } from "react";

const emoticons = ["👍", "👎", "😁", "🎉", "🤔", "❤", "🚀", "🤬"];

const SimpleEmojiPicker = ({ emojis, commentId, ticketId }) => {
  const [visible, setVisible] = useState(false);
  const [selectedEmojis, setSelectedEmojis] = useState([]);

  const onEmojiClick = (emoji) => {
    console.log(emoji);
    if (selectedEmojis.includes(emoji)) {
      setSelectedEmojis(selectedEmojis.filter((e) => e !== emoji));
    } else {
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
