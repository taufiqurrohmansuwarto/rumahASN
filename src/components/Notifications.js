import { IconMailbox } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "antd";
import { useRouter } from "next/router";
import { listNotifications } from "@/services/index";

function Notifications() {
  const { data, isLoading } = useQuery(
    ["notifications-total"],
    () => listNotifications({ symbol: "yes" }),
    {}
  );

  const router = useRouter();

  const changePageNotification = () => {
    router.push("/notifications");
  };

  return (
    <Badge count={isLoading ? null : data?.count}>
      <IconMailbox onClick={changePageNotification} color="gray" size={24} />
      {/* <BellOutlined
        style={{
          color: "gray",
        }}
        onClick={changePageNotification}
      /> */}
    </Badge>
  );
}

export default Notifications;
