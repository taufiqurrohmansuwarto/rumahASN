import { OpenAIOutlined } from "@ant-design/icons";
import { FloatButton } from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

function AntdCallToActionAI() {
  const { data } = useSession();
  const router = useRouter();

  const { user } = data;
  const organization_id = user?.organization_id;

  const handleClick = () => {
    router.push("/chat-ai");
  };

  // jika organization_id awalan dari 123
  if (organization_id.startsWith("123")) {
    return (
      <FloatButton
        shape="square"
        onClick={handleClick}
        tooltip="Tanya Bestie-AI"
        icon={<OpenAIOutlined />}
      />
    );
  } else {
    return null;
  }
}

export default AntdCallToActionAI;
