import { BellOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Badge, Tooltip } from "antd";
import { useRouter } from "next/router";
import { listNotifications } from "../../services";

function Notifications() {
  const { data, isLoading } = useQuery(
    ["notifications-total"],
    () => listNotifications("yes"),
    {
      refetchInterval: 1000,
    }
  );
  const router = useRouter();

  const changePageNotification = () => {
    router.push("/notifications");
  };

  return (
    <Badge
      onClick={changePageNotification}
      count={isLoading ? null : data?.count}
      size="default"
    >
      <BellOutlined />
    </Badge>
  );
}

export default Notifications;
