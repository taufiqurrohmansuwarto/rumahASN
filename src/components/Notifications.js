import { NotificationOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "antd";
import { useRouter } from "next/router";
import { listNotifications } from "../../services";

function Notifications() {
  const { data, isLoading } = useQuery(
    ["notifications-total"],
    () => listNotifications("yes"),
    {}
  );
  const router = useRouter();

  const changePageNotification = () => {
    router.push("/notifications");
  };

  return (
    <div onClick={changePageNotification}>
      <Badge count={isLoading ? null : data?.count} size="small">
        <NotificationOutlined />
      </Badge>
    </div>
  );
}

export default Notifications;
