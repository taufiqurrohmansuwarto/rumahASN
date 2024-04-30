import dynamic from "next/dynamic";

const Bar = dynamic(() => import("@ant-design/plots").then((mod) => mod.Bar), {
  ssr: false,
});

export default Bar;
