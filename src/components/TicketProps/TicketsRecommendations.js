import { getTicketRecommendations } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { List, Typography, Skeleton, Row, Col } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";

const { Text } = Typography;

// create list recommendation component
const Tickets = ({ tickets }) => {
  return (
    <List
      dataSource={tickets}
      header={<Text strong>Pertanyaan Terkait</Text>}
      rowKey={(row) => row?.id}
      renderItem={(item) => (
        <List.Item>
          <Link href={`/customers-tickets/${item?.id}`}>
            <Typography.Link>{item?.title}</Typography.Link>
          </Link>
        </List.Item>
      )}
    />
  );
};

function TicketsRecommendations() {
  const router = useRouter();
  const id = router?.query?.id;
  const { data, isLoading } = useQuery(
    ["tickets-recommendations"],
    () => getTicketRecommendations(id),
    {
      enabled: !!id,
    }
  );

  return (
    <Skeleton loading={isLoading}>
      {data?.length > 0 ? (
        <Row
          style={{
            marginTop: 32,
          }}
        >
          <Col span={24}>
            <Tickets tickets={data} />
          </Col>
        </Row>
      ) : null}
    </Skeleton>
  );
}

export default TicketsRecommendations;
