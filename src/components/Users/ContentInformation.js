import { getUserInformationDetail } from "@/services/index";
import { Spin } from "antd";
import { useQuery } from "@tanstack/react-query";
import DetailUser from "./DetailUser";

function ContentInformation({ userId, status }) {
  const { data, isLoading } = useQuery(
    ["user-info-detail", userId],
    () => getUserInformationDetail(userId),
    {}
  );

  return (
    <Spin spinning={isLoading}>
      <DetailUser user={data} status={status} />
    </Spin>
  );
}

export default ContentInformation;
