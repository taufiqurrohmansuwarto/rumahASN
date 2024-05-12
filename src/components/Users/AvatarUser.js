import { Avatar, Popover } from "antd";
import ContentInformation from "./ContentInformation";

function AvatarUser({ userId, ...props }) {
  return (
    <Popover
      overlayStyle={{
        width: 250,
      }}
      content={<ContentInformation userId={userId} />}
    >
      <Avatar {...props} />
    </Popover>
  );
}

export default AvatarUser;
