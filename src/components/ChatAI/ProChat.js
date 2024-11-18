import dynamic from "next/dynamic";
import "antd/dist/reset.css";

const ProChat = dynamic(
  () => import("@ant-design/pro-chat").then((mod) => mod.ProChat),
  {
    ssr: false,
  }
);

export default ProChat;
