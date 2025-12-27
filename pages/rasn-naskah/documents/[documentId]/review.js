// Redirect to main document page - review is now integrated
import { useRouter } from "next/router";
import { useEffect } from "react";

const RasnNaskahDocumentReview = () => {
  const router = useRouter();
  const { documentId } = router.query;

  useEffect(() => {
    if (documentId) {
      router.replace(`/rasn-naskah/documents/${documentId}`);
    }
  }, [documentId, router]);

  return null;
};

export default RasnNaskahDocumentReview;
