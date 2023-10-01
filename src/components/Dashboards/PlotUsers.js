import React from "react";
import { Pie, measureTextWidth } from "@ant-design/plots";

function PlotUsers({ data }) {
  const config = {
    appendPadding: 10,
    data,
    angleField: "value",
    colorField: "title",
    radius: 1,
    innerRadius: 0.64,
    label: {
      type: "inner",
      offset: "-50%",
      style: {
        textAlign: "center",
      },
      autoRotate: false,
      content: "{value}",
    },
    statistic: {},
    // 添加 中心统计文本 交互
    interactions: [
      {
        type: "element-selected",
      },
      {
        type: "element-active",
      },
      {
        type: "pie-statistic-active",
      },
    ],
  };

  return <Pie {...config} />;
}

export default PlotUsers;
