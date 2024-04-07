import { NOTIFICATION_ATTR } from "@/utils/client-utils";
import { IconBrandTelegram } from "@tabler/icons";
import { Badge, Tooltip } from "antd";
import { useRouter } from "next/router";

function NotifikasiKepegawaian({ url, title }) {
  const router = useRouter();

  const changePageNotification = () => {
    router.push(`/notifications/${url}`);
  };

  return (
    <Badge>
      <Tooltip title={title}>
        <IconBrandTelegram
          onClick={changePageNotification}
          color={NOTIFICATION_ATTR.color}
          size={NOTIFICATION_ATTR.size}
        />
      </Tooltip>
    </Badge>
  );
}

export default NotifikasiKepegawaian;
