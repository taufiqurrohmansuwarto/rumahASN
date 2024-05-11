import { Typography } from "antd";
import React from "react";

function UserText({ userId, fontSize = 16, text }) {
  return <Typography.Link style={{ fontSize }}>{text}</Typography.Link>;
}

export default UserText;
