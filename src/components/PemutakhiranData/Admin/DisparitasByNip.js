import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { getDisparitasByNip } from "@/services/master.services";
import DisparitasData from "@/components/LayananSIASN/DisparitasData";

const useDisparitasByNip = (nip) => {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["disparitasByNip", nip],
    queryFn: () => getDisparitasByNip(nip),
    enabled: !!nip,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    staleTime: 500000,
  });

  return { data, isLoading, refetch, isFetching };
};

function DisparitasByNip() {
  const router = useRouter();
  const nip = router.query.nip;

  const { data, isLoading, refetch, isFetching } = useDisparitasByNip(nip);

  return (
    <DisparitasData
      data={data}
      isLoading={isLoading}
      refetch={refetch}
      isFetching={isFetching}
    />
  );
}

export default DisparitasByNip;
