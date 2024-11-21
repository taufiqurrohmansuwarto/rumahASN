import { Comment } from "@ant-design/compatible";
import { useSession } from "next-auth/react";
import { Avatar, Input } from "antd";

const Editor = ({ onChange, onSubmit, submitting, value }) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const calculateRows = (text) => {
    const lineCount = (text.match(/\n/g) || []).length + 1;
    return Math.min(Math.max(1, lineCount), 6); // Min 1 row, max 6 rows
  };

  return (
    <Input.TextArea
      rows={calculateRows(value)}
      onChange={onChange}
      value={value}
      onKeyDown={handleKeyDown}
      submitting={submitting}
      autoSize={{ minRows: 1, maxRows: 5 }}
    />
  );
};

function InputChatBot({ onChange, onSubmit, submitting, value }) {
  const { data } = useSession();
  return (
    <Comment
      avatar={<Avatar src={data?.user?.image} />}
      content={
        <Editor
          onChange={onChange}
          onSubmit={onSubmit}
          submitting={submitting}
          value={value}
        />
      }
    />
  );
}

export default InputChatBot;
