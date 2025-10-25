import React from "react";
import { useEmailSubmissions } from "@/hooks/kominfo-submissions";

function DaftarPengajuanEmailUser() {
  const { data } = useEmailSubmissions();
  return <div>{JSON.stringify(data, null, 2)}</div>;
}

export default DaftarPengajuanEmailUser;
