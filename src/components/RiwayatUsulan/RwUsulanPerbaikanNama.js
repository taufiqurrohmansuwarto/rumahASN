import { usulanPerbaikanNama } from "@/services/usulan-siasn.services";
import { useQuery } from "@tanstack/react-query";
import TableUsulan from "./TableUsulan";

function RwUsulanPerbaikanNama() {
  const { data, isLoading } = useQuery(
    ["rw-usulan-perbaikan-nama-personal"],
    () => usulanPerbaikanNama(),
    {}
  );

  return <TableUsulan data={data} isLoading={isLoading} />;
}

export default RwUsulanPerbaikanNama;
