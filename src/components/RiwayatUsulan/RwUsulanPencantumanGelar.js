import { usulanPencantumanGelar } from "@/services/usulan-siasn.services";
import { useQuery } from "@tanstack/react-query";

import TableUsulan from "./TableUsulan";

function RwUsulanPencantumanGelar() {
  const { data, isLoading } = useQuery(
    ["rw-usulan-pencantuman-gelar-personal"],
    () => usulanPencantumanGelar(),
    {}
  );

  return <TableUsulan data={data} isLoading={isLoading} />;
}

export default RwUsulanPencantumanGelar;
