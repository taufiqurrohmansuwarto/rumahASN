import { useQuery } from "@tanstack/react-query";
import { checkQRDocumentService } from "@/services/public.services";

export const useCheckQRDocument = (documentCode) => {
  return useQuery({
    queryKey: ["checkQRDocument", documentCode],
    queryFn: () => checkQRDocumentService(documentCode),
    enabled: !!documentCode,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
