import { Text } from "@mantine/core";
import { Grid, Popover } from "antd";
import { useRouter } from "next/router";
import ContentInformation from "./ContentInformation";

const { useBreakpoint } = Grid;

function UserText({ userId, text }) {
  const router = useRouter();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
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
      <Text
        onClick={gotoDetailUser}
        style={{
          cursor: "pointer",
          fontSize: isMobile ? "10px" : "13px",
          maxWidth: isMobile ? "80px" : "200px",
        }}
        ellipsis={{ tooltip: text }}
      >
        {text}
      </Text>
    </Popover>
  );
}

export default UserText;
