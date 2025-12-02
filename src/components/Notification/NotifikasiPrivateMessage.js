import { useEmailStats } from "@/hooks/useEmails";
import { NOTIFICATION_ATTR } from "@/utils/client-utils";
import { IconMail } from "@tabler/icons-react";
import { Badge, Tooltip } from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

function NotifikasiPrivateMessage({ url, title }) {
  const { data: session } = useSession();
  const router = useRouter();

  // Get unread email count
  const { data: stats, isLoading } = useEmailStats();

  const changePageNotification = () => {
    router.push(`/${url}`);
  };

  // jika usertype umum tampilkan null
  if (session?.user?.status_kepegawaian === "UMUM") {
    return null;
  }

  const unreadCount = stats?.data?.unread_count || 0;

  return (
    <Badge count={isLoading ? 0 : unreadCount} size="small">
      <Tooltip title={title}>
        <IconMail
          onClick={changePageNotification}
          color={NOTIFICATION_ATTR.color}
          size={NOTIFICATION_ATTR.size}
          style={{ cursor: "pointer" }}
        />
      </Tooltip>
    </Badge>
  );
}

export default NotifikasiPrivateMessage;
