import PageContainer from "@/components/PageContainer";
import { agentsPerformances } from "@/services/admin.services";
import { Paper } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Avatar, BackTop, Card, List, Rate, Typography } from "antd";
import { toNumber } from "lodash";
import { Avatar as AvatarMantine, Text as TextMantine } from "@mantine/core";

const { default: AdminLayout } = require("@/components/AdminLayout");

const Description = ({ agent }) => {
  return (
    <div>
      {/* <Typography.Paragraph>
        Total Tiket : {agent?.total_tickets_handled}
      </Typography.Paragraph>
      <Typography.Paragraph>
        Rerata waktu response : {agent?.avg_response_time_minutes}
      </Typography.Paragraph> */}
      <Rate
        allowHalf
        value={toNumber(agent?.avg_satisfaction_rating)}
        disabled
      />
    </div>
  );
};

const CardAgent = ({ agent }) => {
  return (
    <Card hoverable>
      <Card.Meta
        avatar={<Avatar src={agent?.agent_image} />}
        title={agent.agent_username}
        description={<Description agent={agent} />}
      />
    </Card>
  );
};

const PerformaAgent = () => {
  const { data, isLoading } = useQuery(
    ["analysis-performa-agent"],
    () => agentsPerformances(),
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <PageContainer loading={isLoading} title="Analisis Performa Penerima Tugas">
      <BackTop />
      {/* <Row gutter={[8, 8]}>
        {data?.map((agent) => (
          <Col md={6} xs={24} key={agent?.agent_id}>
            <CardAgent agent={agent} />
          </Col>
        ))}
      </Row> */}
      <List
        dataSource={data}
        rowKey={(row) => row?.agent_id}
        grid={{
          gutter: 16,
          md: 4,
          lg: 4,
          column: 4,
        }}
        renderItem={(item) => (
          <List.Item>
            <Paper
              radius="md"
              withBorder
              p="lg"
              sx={(theme) => ({
                backgroundColor:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[8]
                    : theme.white,
              })}
            >
              <AvatarMantine
                src={item?.agent_image}
                size={80}
                radius={80}
                mx="auto"
              />
              <TextMantine ta="center" fz="lg" weight={500} mt="md">
                {item?.agent_username}
              </TextMantine>
            </Paper>
          </List.Item>
        )}
      />
    </PageContainer>
  );
};

PerformaAgent.getLayout = function getLayout(page) {
  return <AdminLayout active="/admin/analisis">{page}</AdminLayout>;
};

PerformaAgent.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default PerformaAgent;
