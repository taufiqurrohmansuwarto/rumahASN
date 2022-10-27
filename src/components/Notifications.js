import { NotificationOutlined } from "@ant-design/icons";
import { Badge } from "antd";
import { useRouter } from "next/router";

function Notifications() {
  const router = useRouter();

  const changePageNotification = () => {
    router.push("/notifications");
  };

  return (
    <div onClick={changePageNotification}>
      <Badge count={10} size="small">
        <NotificationOutlined />
      </Badge>
    </div>
  );
}

export default Notifications;
