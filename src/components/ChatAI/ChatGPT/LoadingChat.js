import { Skeleton } from "antd";

function LoadingChat({ isLoading }) {
  return <Skeleton avatar paragraph={{ rows: 1 }} active loading={isLoading} />;
}

export default LoadingChat;
