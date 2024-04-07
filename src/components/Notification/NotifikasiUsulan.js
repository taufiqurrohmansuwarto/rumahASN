import { NOTIFICATION_ATTR } from "@/utils/client-utils";
import { IconNotebook } from "@tabler/icons";
import { Badge, Tooltip } from "antd";
import { useRouter } from "next/router";

function NotifikasiUsulan({ url, title }) {
  const router = useRouter();

  const changePageNotification = () => {
    router.push(`/notifications/${url}`);
  };

  return (
    <Badge>
      <Tooltip title={title}>
        <IconNotebook
          onClick={changePageNotification}
          color={NOTIFICATION_ATTR.color}
          size={NOTIFICATION_ATTR.size}
        />
      </Tooltip>
    </Badge>
  );
}

export default NotifikasiUsulan;
