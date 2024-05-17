import { usulanPenyesuaianMasaKerja } from "@/services/usulan-siasn.services";
import { useQuery } from "@tanstack/react-query";
import { Table } from "antd";
import TableUsulan from "./TableUsulan";

function RwUsulanPMK() {
  const { data, isLoading } = useQuery(
    ["rw-usulan-pmk"],
    () => usulanPenyesuaianMasaKerja(),
    {}
  );

  return <TableUsulan data={data} isLoading={isLoading} />;
}

export default RwUsulanPMK;
