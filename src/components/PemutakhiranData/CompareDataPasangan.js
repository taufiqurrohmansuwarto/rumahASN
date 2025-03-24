import { rwPasanganMaster } from "@/services/master.services";
import { useQuery } from "@tanstack/react-query";
import FormKeluarga from "./FormKeluarga";

const CompareDataPasangan = () => {
  const { data: pasanganMaster, isLoading: isLoadingPasanganMaster } = useQuery(
    ["pasangan-master"],
    () => rwPasanganMaster(),
    {}
  );

  return (
    <div>
      {JSON.stringify(pasanganMaster)}
      <FormKeluarga />
    </div>
  );
};

export default CompareDataPasangan;
