import { getNotifactionsAsnConnect } from "@/services/notifications.services";
import { NOTIFICATION_ATTR } from "@/utils/client-utils";
import { CommentOutlined, LikeOutlined, UserOutlined } from "@ant-design/icons";
import { IconMessageCircle } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { Badge, Tooltip } from "antd";
import { useRouter } from "next/router";

function NotifikasiASNConnect({ url, title }) {
  const router = useRouter();

  const { data, isLoading } = useQuery(
    ["asn-connect-notifications"],
    () => getNotifactionsAsnConnect("yes"),
    {
      refetchInterval: 10000,
    }
  );

  const changePageNotification = () => {
    router.push(`/notifications/${url}`);
  };

  return (
    <Badge count={data?.total}>
      <Tooltip title={title}>
        <IconMessageCircle
          onClick={changePageNotification}
          color={NOTIFICATION_ATTR.color}
          size={NOTIFICATION_ATTR.size}
        />
      </Tooltip>
    </Badge>
  );
}

export default NotifikasiASNConnect;
