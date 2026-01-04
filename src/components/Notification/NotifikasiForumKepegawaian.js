import { listNotifications } from "@/services/index";
import { NOTIFICATION_ATTR } from "@/utils/client-utils";
import { IconMessages } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Badge, Tooltip } from "antd";
import { useRouter } from "next/router";

function NotifikasiForumKepegawaian({ url, title }) {
  const { data, isLoading } = useQuery({
    queryKey: ["notifications-total", url],
    queryFn: () => listNotifications({ symbol: "yes" }),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const router = useRouter();

  const changePageNotification = () => {
    router.push(`/notifications/${url}`);
  };

  return (
    <Badge count={isLoading ? null : data?.count} size="small">
      <Tooltip title={title}>
        <IconMessages
          onClick={changePageNotification}
          color={NOTIFICATION_ATTR.color}
          size={NOTIFICATION_ATTR.size}
          style={{ cursor: "pointer" }}
        />
      </Tooltip>
    </Badge>
  );
}

export default NotifikasiForumKepegawaian;
