import { BellOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Badge, Tooltip } from "antd";
import { useRouter } from "next/router";
import { listNotifications } from "../../services";

function Notifications() {
  const { data, isLoading } = useQuery(
    ["notifications-total"],
    () => listNotifications({ symbol: "yes" }),
    {
      refetchInterval: 5000,
    }
  );
  const router = useRouter();

  const changePageNotification = () => {
    router.push("/notifications");
  };

  return (
    <div onClick={changePageNotification}>
      <Badge count={isLoading ? null : data?.count}>
        <BellOutlined
          style={{
            fontSize: 13,
          }}
        />
      </Badge>
    </div>
  );
}

export default Notifications;
