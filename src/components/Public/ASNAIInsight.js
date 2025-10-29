import React from "react";
import { useQuery } from "@tanstack/react-query";
import { aiInsightByIdService } from "@/services/public.services";

function ASNAIInsight({ id }) {
  const { data, isLoading } = useQuery(
    ["ai-insight", id],
    () => aiInsightByIdService(id),
    {
      refetchOnWindowFocus: false,
      enabled: !!id,
    }
  );
  return (
    <div>
      hello = {id} {JSON.stringify(data)}
    </div>
  );
}

export default ASNAIInsight;
