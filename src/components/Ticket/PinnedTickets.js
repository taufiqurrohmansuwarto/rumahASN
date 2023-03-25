import { pinnetdTickets } from "@/services/index";
import { Grid, Paper, Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Typography } from "antd";
import Link from "next/link";

const CardPinnedTickets = ({ ticket }) => {
  return (
    <Grid.Col span={4}>
      <Paper
        p="sm"
        sx={{
          height: 120,
          borderRadius: 10,
        }}
      >
        <Stack spacing="sm" justify="space-around" align="stretch">
          <Link href={`/customers-tickets/${ticket?.id}`}>
            <Typography.Link
              style={{
                fontSize: 13,
              }}
            >
              {ticket?.title}
            </Typography.Link>
          </Link>
          <Typography.Text
            ellipsis={{
              rows: 1,
              symbol: "...",
            }}
            type="secondary"
            style={{
              fontSize: 10,
            }}
          >
            #{ticket?.ticket_number} oleh {ticket?.customer?.username}
          </Typography.Text>
        </Stack>
      </Paper>
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
