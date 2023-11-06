import { ratingMeetingConsultant } from "@/services/coaching-clinics.services";
import { Rating } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "antd";
import { useRouter } from "next/router";

function ConsultantRatingMeeting() {
  const router = useRouter();

  const id = router?.query?.id;
  const { data, isLoading } = useQuery(
    ["consultantRatingMeeting"],
    () => ratingMeetingConsultant(id),
    {}
  );

  return (
    <Skeleton loading={isLoading}>
      <Rating value={data?.avg} readOnly fractions={2} />
    </Skeleton>
  );
}

export default ConsultantRatingMeeting;
