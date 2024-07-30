import { dataNilaiIPASN } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import React from "react";

function IPASNWs() {
  const { data, isLoading } = useQuery(
    ["ipasn-ws"],
    () => dataNilaiIPASN(),
    {}
  );

  return <div>{data && <div>{JSON.stringify(data?.subtotal)}</div>}</div>;
}

export default IPASNWs;
