import dynamic from "next/dynamic";

const Pie = dynamic(() => import("@ant-design/plots").then((mod) => mod.Pie), {
  ssr: false,
});

export default Pie;
