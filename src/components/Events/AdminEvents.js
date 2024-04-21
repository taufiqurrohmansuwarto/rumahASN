import { getEvents } from "@/services/asn-connect-events.services";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, List } from "antd";
import { useRouter } from "next/router";
import CreateEvent from "./CreateEvent";

function AdminEvents() {
  const router = useRouter();
  const { data, isLoading } = useQuery(["events"], () => getEvents(), {});

  const gotoDetailEvent = (id) =>
    router.push(`/fasilitator/smart-asn-connect/events/${id}/detail`);

  return (
    <div>
      <Card>
        {JSON.stringify(data)}
        <CreateEvent />
        <List
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta title={item.title} description={item.startDate} />
              <Button onClick={() => gotoDetailEvent(item.id)}>Detail</Button>
            </List.Item>
          )}
          dataSource={data}
          loading={isLoading}
          rowKey={(row) => row?.id}
        />
      </Card>
    </div>
  );
}

export default AdminEvents;
