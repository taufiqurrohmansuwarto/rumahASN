import dynamic from "next/dynamic";
import { forwardRef } from "react";

const BubbleList = dynamic(
  () => import("@ant-design/x").then((mod) => mod.Bubble.List),
  {
    loading: () => <div>loading...</div>,
    ssr: false,
  }
);

export default BubbleList;
