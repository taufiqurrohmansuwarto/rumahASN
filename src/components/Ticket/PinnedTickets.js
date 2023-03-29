import { pinnetdTickets } from "@/services/index";
import { PushpinOutlined } from "@ant-design/icons";
import { Grid, Paper, Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Card, Typography } from "antd";
import Link from "next/link";

const CardPinnedTickets = ({ ticket }) => {
  return (
    <Grid.Col md={4} xs={12}>
      <Card
        title={
          <Link href={`/customers-tickets/${ticket?.id}`}>
            <Typography.Link>{ticket?.title}</Typography.Link>
          </Link>
        }
        extra={<PushpinOutlined />}
      >
        <Card.Meta description={`oleh ${ticket?.customer?.username}`} />
      </Card>
    </Grid.Col>
  );
};

function PinnedTickets() {
  const { data, isLoading } = useQuery(["pinned-tickets"], () =>
    pinnetdTickets()
  );

  if (!data?.length) return null;

  return (
    <Grid>
      {data?.map((ticket) => (
        <CardPinnedTickets key={ticket?.id} ticket={ticket} />
      ))}
    </Grid>
  );
}

export default PinnedTickets;
