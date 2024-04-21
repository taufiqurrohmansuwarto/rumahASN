import { getEvents } from "@/services/asn-connect-events.services";
import { useQuery } from "@tanstack/react-query";
import { Card } from "antd";
import { useRouter } from "next/router";
import CreateEvent from "./CreateEvent";

function AdminEvents() {
  const router = useRouter();
  const { data, isLoading } = useQuery(["events"], () => getEvents(), {});

  const handleCreateEvent = () => {
    router.push("/fasilitator/smart-asn-connect/events/create");
  };

  return (
    <div>
      <Card>
        {JSON.stringify(data)}
        <CreateEvent />
      </Card>
    </div>
  );
}

export default AdminEvents;
