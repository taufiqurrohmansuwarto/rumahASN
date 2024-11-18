import { getRwPotensiByNip } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";

function CompareRwPotensiByNip({ nip }) {
  const { data, isLoading } = useQuery({
    queryKey: ["rw-potensi-by-nip", nip],
    queryFn: () => getRwPotensiByNip(nip),
  });
  return <div>{JSON.stringify(data)}</div>;
}

export default CompareRwPotensiByNip;
