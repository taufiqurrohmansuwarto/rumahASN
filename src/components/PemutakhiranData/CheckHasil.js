import { compareText } from "@/utils/client-utils";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { IconCircleCheck } from "@tabler/icons";
import React from "react";

function CheckHasil({ firstData, secondData }) {
  return (
    <div>
      {compareText(firstData, secondData) ? (
        <IconCircleCheck />
      ) : (
        <CloseOutlined />
      )}
    </div>
  );
}

export default CheckHasil;
