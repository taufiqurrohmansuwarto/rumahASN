import { NOTIFICATION_ATTR } from "@/utils/client-utils";
import { IconMail } from "@tabler/icons";
import { Badge } from "antd";

function NotifikasiPrivateMessage() {
  return (
    <Badge>
      <IconMail color={NOTIFICATION_ATTR.color} size={NOTIFICATION_ATTR.size} />
    </Badge>
  );
}

export default NotifikasiPrivateMessage;
