import { useQuery } from "@tanstack/react-query";
import { getOperatorGajiPW } from "@/services/siasn-services";

// Hook untuk mendapatkan semua operator (tanpa filter unor_id)
export const useAllOperators = () => {
  return useQuery({
    queryKey: ["operator-gaji-pw-all"],
    queryFn: () => getOperatorGajiPW({}),
    refetchOnWindowFocus: false,
  });
};

