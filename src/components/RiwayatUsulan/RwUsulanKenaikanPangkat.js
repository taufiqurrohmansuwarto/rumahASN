import { usulanKenaikanPangkat } from "@/services/usulan-siasn.services";
import { useQuery } from "@tanstack/react-query";
import TableUsulan from "./TableUsulan";

function RwUsulanKenaikanPangkat() {
  const { data, isLoading } = useQuery(
    ["rw-usulan-kp-personal"],
    () => usulanKenaikanPangkat(),
    {}
  );

  return <TableUsulan data={data} isLoading={isLoading} />;
}

export default RwUsulanKenaikanPangkat;
