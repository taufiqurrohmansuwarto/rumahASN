import { getWebinars } from "@/services/esign-signer.services";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";

function WebinarsCertificates() {
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useQuery(
    ["webinars-certificates", query],
    () => getWebinars(query),
    {
      keepPreviousData: true,
      enabled: !!query,
    }
  );

  return <div>{JSON.stringify(data)}</div>;
}

export default WebinarsCertificates;
