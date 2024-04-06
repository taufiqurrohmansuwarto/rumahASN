import { usulanKenaikanPangkat } from "@/services/usulan-siasn.services";
import { useQuery } from "@tanstack/react-query";
import React from "react";

function RwUsulanKenaikanPangkat() {
  const { data, isLoading } = useQuery(
    ["rw-usulan-kp-personal"],
    () => usulanKenaikanPangkat(),
    {}
  );

  return <div>{JSON.stringify(data)}</div>;
}

export default RwUsulanKenaikanPangkat;
