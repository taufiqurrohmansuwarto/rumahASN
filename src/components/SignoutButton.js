import { LogoutOutlined } from "@ant-design/icons";
import { Modal } from "antd";
import Tooltip from "antd/es/tooltip";
import { signOut } from "next-auth/react";

function SignoutButton() {
  const handleLogout = () => {
    Modal.confirm({
      title: "Apakah anda yakin ingin keluar?",
      centered: true,
      onOk: () => signOut(),
    });
  };

  return (
    <Tooltip title="Keluar">
      <LogoutOutlined onClick={handleLogout} />
    </Tooltip>
  );
}

export default SignoutButton;
