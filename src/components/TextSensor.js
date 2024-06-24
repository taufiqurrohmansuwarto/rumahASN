import React, { useState } from "react";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";

const TextSensor = ({ text }) => {
  const [isHidden, setIsHidden] = useState(true);

  const toggleVisibility = () => {
    setIsHidden(!isHidden);
  };

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <span style={{ marginRight: 8 }}>
        {isHidden ? "•".repeat(text?.length) : text}
      </span>
      <Tooltip title={isHidden ? "Show" : "Hide"}>
        {isHidden ? (
          <EyeInvisibleOutlined
            onClick={toggleVisibility}
            style={{ cursor: "pointer" }}
          />
        ) : (
          <EyeOutlined
            onClick={toggleVisibility}
            style={{ cursor: "pointer" }}
          />
        )}
      </Tooltip>
    </div>
  );
};

export default TextSensor;
