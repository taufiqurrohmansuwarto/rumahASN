import { NOTIFICATION_ATTR } from "@/utils/client-utils";
import { IconMail } from "@tabler/icons";
import { Badge, Tooltip } from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

function NotifikasiPrivateMessage({ url, title }) {
  const { data: session } = useSession();

  const router = useRouter();

  const changePageNotification = () => {
    router.push(`/${url}`);
  };

  // jika usertype umum tampilkan null
  if (session?.user?.status_kepegawaian === "UMUM") {
    return null;
  }

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
