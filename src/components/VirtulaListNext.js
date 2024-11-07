import dynamic from "next/dynamic";

const VirtualListNext = dynamic(
  () => import("rc-virtual-list").then((mod) => mod.default),
  {
    ssr: false,
  }
);

export default VirtualListNext;
