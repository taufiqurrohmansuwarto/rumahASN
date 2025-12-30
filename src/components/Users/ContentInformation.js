import { getUserInformationDetail } from "@/services/index";
import { Spin } from "antd";
import { useQuery } from "@tanstack/react-query";
import DetailUser from "./DetailUser";

function ContentInformation({ userId, status }) {
  const { data, isLoading } = useQuery(
    ["user-info-detail", userId],
    () => getUserInformationDetail(userId),
    {
      enabled: !!userId, // Hanya run jika userId ada
      staleTime: 5 * 60 * 1000, // Cache 5 menit
      cacheTime: 10 * 60 * 1000, // Keep cache 10 menit
    }
  );

  return (
    <Spin spinning={isLoading}>
      <DetailUser user={data} status={status} />
    </Spin>
  );
}

export default ContentInformation;
