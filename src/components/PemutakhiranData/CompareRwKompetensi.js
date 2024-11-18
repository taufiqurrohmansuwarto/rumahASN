import { getRwKompetensi } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";

function CompareRwKompetensi() {
  const { data, isLoading } = useQuery(
    ["data-rw-kompetensi"],
    () => getRwKompetensi(),
    {}
  );
  return <div>{JSON.stringify(data)}</div>;
}

export default CompareRwKompetensi;
