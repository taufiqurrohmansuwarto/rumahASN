import { listNotifications } from "@/services/index";
import { NOTIFICATION_ATTR } from "@/utils/client-utils";
import { IconBell } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "antd";
import { useRouter } from "next/router";

function NotifikasiForumKepegawaian() {
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
      <IconBell
        onClick={changePageNotification}
        color={NOTIFICATION_ATTR.color}
        size={NOTIFICATION_ATTR.size}
      />
    </Badge>
  );
}

export default NotifikasiForumKepegawaian;
