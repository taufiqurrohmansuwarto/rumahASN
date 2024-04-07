import { listNotifications } from "@/services/index";
import { NOTIFICATION_ATTR } from "@/utils/client-utils";
import { IconBell } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { Badge, Tooltip } from "antd";
import { useRouter } from "next/router";

function NotifikasiForumKepegawaian({ url, title }) {
  const { data, isLoading } = useQuery(
    [`notifications-total-${url}`],
    () => listNotifications({ symbol: "yes" }),
    {}
  );

  const router = useRouter();

  const changePageNotification = () => {
    router.push(`/notifications/${url}`);
  };

  return (
    <Badge count={isLoading ? null : data?.count}>
      <Tooltip title={title}>
        <IconBell
          onClick={changePageNotification}
          color={NOTIFICATION_ATTR.color}
          size={NOTIFICATION_ATTR.size}
        />
      </Tooltip>
    </Badge>
  );
}

export default NotifikasiForumKepegawaian;
