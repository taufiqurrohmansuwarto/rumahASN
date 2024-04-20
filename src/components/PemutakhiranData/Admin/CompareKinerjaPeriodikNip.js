import { getRwKinerjaPeriodikByNip } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Card } from "antd";
import React from "react";

const CompareKinerjaPeriodikNip = ({ nip }) => {
  const { data, isLoading } = useQuery(
    ["kinerja-periodik", nip],
    () => getRwKinerjaPeriodikByNip(nip),
    {}
  );

  return (
    <Card title="Kinerja Periodik" id="kinerja-periodik">
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </Card>
  );
};

export default CompareKinerjaPeriodikNip;
