import { getRwPotensi } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";

function CompareRwPotensi() {
  const { data, isLoading } = useQuery(
    ["data-rw-potensi"],
    () => getRwPotensi(),
    {}
  );
  return <div> {JSON.stringify(data)}</div>;
}

export default CompareRwPotensi;
