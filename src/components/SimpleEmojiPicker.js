import { SmileOutlined } from "@ant-design/icons";
import { Space, Popover, Button } from "antd";
import { useState } from "react";

const emoticons = ["👍", "👎", "😁", "🎉", "🤔", "❤", "🚀", "🤬"];

const SimpleEmojiPicker = () => {
  const [visible, setVisible] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState(null);

  const onEmojiClick = (emoji) => {
    console.log(emoji);
    setSelectedEmoji(emoji);
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
            emoji === selectedEmoji
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
