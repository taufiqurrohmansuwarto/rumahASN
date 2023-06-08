import dynamic from "next/dynamic";

// create server component using zoom

const ZoomMtg = dynamic(
  () => import("@zoomus/websdk").then((mod) => mod.ZoomMtg),
  {
    ssr: false,
  }
);

export default ZoomMtg;
