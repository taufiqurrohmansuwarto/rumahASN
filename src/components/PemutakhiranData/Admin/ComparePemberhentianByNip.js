import { dataRiwayatPemberhentian } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Card } from "antd";
import React from "react";

function ComparePemberhentianByNip({ nip }) {
  const { data, isLoading } = useQuery(
    ["rw-pemberhentian", nip],
    () => dataRiwayatPemberhentian(nip),
    {
      enabled: !!nip,
    }
  );

  return (
    <Card title="Riwayat Pemberhentian" loading={isLoading}>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </Card>
  );
}

export default ComparePemberhentianByNip;
