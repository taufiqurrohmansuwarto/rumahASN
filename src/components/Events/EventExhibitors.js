import { eventExhibitors } from "@/services/events.services";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";

function EventExhibitors() {
  const router = useRouter();
  const { eventId } = router.query;
  const { data, isLoading } = useQuery(
    ["event-exhibitors", eventId],
    () => eventExhibitors(id),
    {}
  );

  return <div>{JSON.stringify(data)}</div>;
}

export default EventExhibitors;
