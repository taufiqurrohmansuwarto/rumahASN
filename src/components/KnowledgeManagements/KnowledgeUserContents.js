import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getKnowledgeContents } from "@/services/knowledge-management.services";
import { useParams } from "next/navigation";

const KnowledgeUserContents = () => {
  const params = useParams();
  const { data, isLoading } = useQuery(
    ["fetch-knowledge-user-contents", params],
    () => getKnowledgeContents(params),
    {
      keepPreviousData: true,
    }
  );

  return (
    <div>
      <div>
        <h1>Knowledge User Contents</h1>
        <div>{JSON.stringify(data)}</div>
      </div>
    </div>
  );
};

export default KnowledgeUserContents;
