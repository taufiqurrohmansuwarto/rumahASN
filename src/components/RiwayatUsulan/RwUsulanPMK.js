import { usulanPenyesuaianMasaKerja } from "@/services/usulan-siasn.services";
import { useQuery } from "@tanstack/react-query";

function RwUsulanPMK() {
  const { data, isLoading } = useQuery(
    ["rw-usulan-pmk"],
    () => usulanPenyesuaianMasaKerja(),
    {}
  );

  return <div>{JSON.stringify(data)}</div>;
}

export default RwUsulanPMK;
