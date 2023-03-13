import { detailPublishTickets } from "@/services/index";
import { useQuery } from "@tanstack/react-query";

function DetailTicketPublish({ id }) {
  const { data, isLoading } = useQuery(
    ["publish-ticket", id],
    () => detailPublishTickets(id),
    {}
  );
  return <div>{JSON.stringify(data)}</div>;
}

export default DetailTicketPublish;
