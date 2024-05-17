import { usulanPemberhentian } from "@/services/usulan-siasn.services";
import { useQuery } from "@tanstack/react-query";
import TableUsulan from "./TableUsulan";

function RwUsulanPemberhentian() {
  const { data, isLoading } = useQuery(
    ["rw-usulan-pemberhentian-personal"],
    () => usulanPemberhentian(),
    {}
  );

  return <TableUsulan data={data} isLoading={isLoading} />;
}

export default RwUsulanPemberhentian;
