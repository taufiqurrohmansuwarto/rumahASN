import { Text } from "@mantine/core";
import { Popover } from "antd";
import Link from "next/link";
import ContentInformation from "./ContentInformation";
import { useRouter } from "next/router";

function UserText({ userId, text }) {
  const router = useRouter();

  const gotoDetailUser = () => {
    router.push(`/users/${userId}`);
  };

  return (
    <Popover
      overlayStyle={{
        width: 250,
      }}
      content={<ContentInformation userId={userId} />}
    >
      <Text onClick={gotoDetailUser} style={{ cursor: "pointer" }}>
        {text}
      </Text>
    </Popover>
  );
}

export default UserText;
