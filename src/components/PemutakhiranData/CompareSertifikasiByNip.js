import { useQuery } from "@tanstack/react-query";
import { riwayatSertifikasiByNip } from "@/services/siasn-services";

const CompareSertifikasiByNip = ({ nip }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["sertifikasi", nip],
    queryFn: () => riwayatSertifikasiByNip(nip),
  });

  return <div>{JSON.stringify(data)}</div>;
};

export default CompareSertifikasiByNip;
