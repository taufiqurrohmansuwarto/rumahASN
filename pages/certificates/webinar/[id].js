import { checkCertificateWebinar } from "@/services/webinar.services";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "antd";
import { useRouter } from "next/router";

const WebinarCertificateDetail = () => {
  const router = useRouter();

  const { id } = router.query;

  const { data, isLoading } = useQuery(
    ["check-webinar-certificates", id],
    () => checkCertificateWebinar(id),
    {}
  );

  return <Skeleton loading={isLoading}>{JSON.stringify(data)}</Skeleton>;
};

export default WebinarCertificateDetail;
