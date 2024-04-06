import { NOTIFICATION_ATTR } from "@/utils/client-utils";
import { IconMessageCircle } from "@tabler/icons";
import { Badge } from "antd";

function NotifikasiASNConnect() {
  return (
    <Badge>
      <IconMessageCircle
        color={NOTIFICATION_ATTR.color}
        size={NOTIFICATION_ATTR.size}
      />
    </Badge>
  );
}

export default NotifikasiASNConnect;
