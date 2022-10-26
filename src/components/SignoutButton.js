import { LogoutOutlined } from "@ant-design/icons";
import { Modal } from "antd";
import { signOut } from "next-auth/react";

function SignoutButton() {
  const handleLogout = () => {
    Modal.confirm({
      title: "Apakah anda yakin ingin keluar?",
      centered: true,
      onOk: () => signOut(),
    });
  };

  return <LogoutOutlined onClick={handleLogout} />;
}

export default SignoutButton;
