import { SmileOutlined } from "@ant-design/icons";
import { Popover } from "antd";
import { useState } from "react";
import Picker from "emoji-picker-react";

const CustomEmojiPicker = ({ ticketId, commentId }) => {
  const [visible, setVisible] = useState(false);

  const onEmojiClick = (event, emojiObject) => {
    console.log(emojiObject);
  };

  const handleClick = () => {
    setVisible(!visible);
  };

  const handleVisibleChange = (visible) => {
    setVisible(visible);
  };

  return (
    <Popover
      content={<Picker onEmojiClick={onEmojiClick} />}
      trigger="click"
      open={visible}
      onOpenChange={handleVisibleChange}
    >
      <SmileOutlined onClick={handleClick} />
    </Popover>
  );
};

export default CustomEmojiPicker;
