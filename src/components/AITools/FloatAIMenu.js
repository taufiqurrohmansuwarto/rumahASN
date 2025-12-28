import { FloatButton } from "antd";
import { useRouter } from "next/router";
import {
  IconLayoutDashboard,
  IconMail,
  IconRobot,
  IconFileText,
  IconSparkles,
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { getUserType } from "@/utils/appLists";

const FloatAIMenu = () => {
  const router = useRouter();
  const { data } = useSession();
  const { userType } = getUserType(data?.user || {});

  if (!userType?.includes("asn")) {
    return null;
  }

  return (
    <FloatButton.Group
      trigger="click"
      style={{ bottom: 24, right: 24 }}
      icon={<IconSparkles size={20} />}
      tooltip={{ title: "Layanan AI", placement: "left" }}
      type="primary"
    >
      <FloatButton
        tooltip={{
          title: "ASN Board",
          placement: "left",
        }}
        onClick={() => router.push("/kanban")}
        icon={<IconLayoutDashboard size={18} />}
      />
      <FloatButton
        onClick={() => router.push("/mails/inbox")}
        tooltip={{ title: "ASN Mail", placement: "left" }}
        icon={<IconMail size={18} />}
      />
      <FloatButton
        onClick={() => router.push("/chat-ai")}
        tooltip={{ title: "Bestie AI", placement: "left" }}
        icon={<IconRobot size={18} />}
      />
      <FloatButton
        tooltip={{ title: "Naskah AI", placement: "left" }}
        icon={<IconFileText size={18} />}
      />
    </FloatButton.Group>
  );
};

export default FloatAIMenu;
