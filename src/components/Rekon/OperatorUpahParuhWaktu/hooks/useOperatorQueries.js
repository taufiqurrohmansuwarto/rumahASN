import { useQuery } from "@tanstack/react-query";
import { getOpdFasilitator } from "@/services/master.services";
import { cekFasilitatorByOpdIdServices } from "@/services/master.services";
import { getOperatorGajiPW } from "@/services/siasn-services";

// Hook untuk mendapatkan daftar unor
export const useUnor = () => {
  return useQuery({
    queryKey: ["unor-fasilitator"],
    queryFn: () => getOpdFasilitator(),
    refetchOnWindowFocus: false,
  });
};

// Hook untuk mendapatkan fasilitator berdasarkan unor_id
export const useUnorFasilitator = (unorId) => {
  return useQuery({
    queryKey: ["unor-fasilitator-fasilitator", unorId],
    queryFn: () => cekFasilitatorByOpdIdServices(unorId),
    enabled: !!unorId,
    refetchOnWindowFocus: false,
  });
};

// Hook untuk mendapatkan operator yang sudah ada
export const useOperatorGajiPW = (unorId) => {
  return useQuery({
    queryKey: ["operator-gaji-pw", unorId],
    queryFn: () => getOperatorGajiPW({ unor_id: unorId }),
    enabled: !!unorId,
    refetchOnWindowFocus: false,
  });
};

