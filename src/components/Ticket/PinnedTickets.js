import { pinnetdTickets } from "@/services/index";
import { formatDate } from "@/utils/index";
import { Grid } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import CheckCard from "../CheckCard";

const CardPinnedTicket = ({ ticket }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/customers-tickets/${ticket?.id}`);
  };

  return (
    <Grid.Col md={4} xs={12}>
      <CheckCard
        onClick={handleClick}
        title={ticket?.title}
        description={`oleh ${
          ticket?.customer?.username
        } pada tanggal ${formatDate(ticket?.created_at)}`}
      />
      {/* <Card
        title={
          <Link href={`/customers-tickets/${ticket?.id}`}>
            <Typography.Link>{ticket?.title}</Typography.Link>
          </Link>
        }
        extra={<PushpinOutlined />}
      >
        <Card.Meta description={`oleh ${ticket?.customer?.username}`} />
      </Card> */}
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
        <CardPinnedTicket key={ticket?.id} ticket={ticket} />
      ))}
    </Grid>
  );
}

export default PinnedTickets;
