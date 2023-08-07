import { compareText } from "@/utils/client-utils";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import React from "react";

function CheckHasil({ firstData, secondData }) {
  return (
    <div>
      {compareText(firstData, secondData) ? (
        <CheckOutlined />
      ) : (
        <CloseOutlined />
      )}
    </div>
  );
}

export default CheckHasil;
