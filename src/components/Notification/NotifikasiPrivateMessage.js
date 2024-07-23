import { NOTIFICATION_ATTR } from "@/utils/client-utils";
import { IconMail } from "@tabler/icons";
import { Badge, Tooltip } from "antd";
import { useRouter } from "next/router";

function NotifikasiPrivateMessage({ url, title }) {
  const router = useRouter();

  const changePageNotification = () => {
    router.push(`/${url}`);
  };

  return (
    <Badge>
      <Tooltip title={title}>
        <IconMail
          onClick={changePageNotification}
          color={NOTIFICATION_ATTR.color}
          size={NOTIFICATION_ATTR.size}
        />
      </Tooltip>
    </Badge>
  );
}

export default NotifikasiPrivateMessage;
