import { getRwKompetensiByNip } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";

function CompareRwKompetensiByNip({ nip }) {
  const { data, isLoading } = useQuery({
    queryKey: ["rw-kompetensi-by-nip", nip],
    queryFn: () => getRwKompetensiByNip(nip),
  });
  return <div>{JSON.stringify(data)}</div>;
}

export default CompareRwKompetensiByNip;
