import dynamic from "next/dynamic";

const LoginFormPage = dynamic(
  () => import("@ant-design/pro-components").then((mod) => mod?.LoginFormPage),
  {
    ssr: false,
  }
);

export default LoginFormPage;
