import { Comment } from "@ant-design/compatible";
import { useSession } from "next-auth/react";
import { Avatar } from "antd";

function InputChatBot() {
  const { data } = useSession();
  return (
    <Comment avatar={<Avatar src={data?.user?.image} />} content={<Editor />} />
  );
}

export default InputChatBot;
