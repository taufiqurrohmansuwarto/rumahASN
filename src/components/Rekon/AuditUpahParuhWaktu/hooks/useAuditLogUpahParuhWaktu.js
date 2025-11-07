import { getAuditLogOperatorGajiPW } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";

const useAuditLogUpahParuhWaktu = (query) => {
  const { data, isLoading, isFetching, refetch, isRefetching } = useQuery({
    queryKey: ["audit-log-upah-paruh-waktu", query],
    queryFn: () => getAuditLogOperatorGajiPW(query),
    enabled: !!query,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    keepPreviousData: true,
  });

  return { data, isLoading, isFetching, refetch, isRefetching };
};

export default useAuditLogUpahParuhWaktu;

