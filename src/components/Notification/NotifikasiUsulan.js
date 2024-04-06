import { NOTIFICATION_ATTR } from "@/utils/client-utils";
import { IconLicense } from "@tabler/icons";
import { Badge } from "antd";

function NotifikasiUsulan() {
  return (
    <Badge>
      <IconLicense
        color={NOTIFICATION_ATTR.color}
        size={NOTIFICATION_ATTR.size}
      />
    </Badge>
  );
}

export default NotifikasiUsulan;
