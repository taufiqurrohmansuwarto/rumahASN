import { getLayananById } from "@/services/layanan.services";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import React from "react";

function DetailStandarLayanan() {
  const router = useRouter();
  const id = router.query.id;

  const { data, isLoading } = useQuery(
    ["standar-pelayanan", id],
    () => getLayananById(id),
    {
      enabled: !!id,
    }
  );

  return <div> test {JSON.stringify(data)}</div>;
}

export default DetailStandarLayanan;
