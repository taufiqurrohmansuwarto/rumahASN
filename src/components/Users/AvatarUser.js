import { Avatar, Popover } from "antd";
import ContentInformation from "./ContentInformation";

function AvatarUser({ userId, user, ...props }) {
  const colorAvatar = (user) => {
    const pns = user?.status_kepegawaian === "PNS";
    const pppk = user?.status_kepegawaian === "PPPK";
    const nonAsn = user?.status_kepegawaian === "NON ASN";

    if (pns) {
      return "#69b1ff";
    } else if (pppk) {
      return "#ffd6e7";
    } else if (nonAsn) {
      return "#faad14";
    } else {
      return "transparent";
    }
  };

  return (
    <Popover
      overlayStyle={{
        width: 250,
      }}
      content={
        <ContentInformation status={user?.status_kepegawaian} userId={userId} />
      }
    >
      <Avatar
        style={{
          border: `2px solid ${colorAvatar(user)}`,
        }}
        size="large"
        {...props}
      />
    </Popover>
  );
}

export default AvatarUser;
