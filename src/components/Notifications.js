import { listNotifications } from "@/services/index";
import { IconMailbox } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "antd";
import { useRouter } from "next/router";

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
      <IconMailbox onClick={changePageNotification} color="#8c8c8c" size={22} />
    </Badge>
  );
}

export default Notifications;
