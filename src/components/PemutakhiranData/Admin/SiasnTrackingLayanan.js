import RefJenisUsulan from "@/components/RiwayatUsulan/RefJenisUsulan";
import { trackingLayananSIASN } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Space } from "antd";
import { useState } from "react";

function SiasnTrackingLayanan({ nip }) {
  const [tipeLayanan, setTipeLayanan] = useState();

  const { data, isLoading, refetch } = useQuery(
    [`layanan-siasn`, nip, tipeLayanan],
    () => trackingLayananSIASN({ tipeUsulan: tipeLayanan, nip }),
    {
      enabled: !!tipeLayanan,
      refetchOnWindowFocus: false,
    }
  );

  return (
    <>
      <Space direction="vertical" size={10}>
        <RefJenisUsulan nip={nip} />
      </Space>
    </>
  );
}

export default SiasnTrackingLayanan;
