import PageContainer from "@/components/PageContainer";
import { agentsPerformances } from "@/services/admin.services";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  Avatar,
  BackTop,
  Card,
  Col,
  Divider,
  List,
  Rate,
  Row,
  Typography,
} from "antd";
import { toNumber } from "lodash";

const { default: AdminLayout } = require("@/components/AdminLayout");

const Description = ({ agent }) => {
  return (
    <div>
      <Typography.Paragraph>
        Total Tiket : {agent?.total_tickets_handled}
      </Typography.Paragraph>
      <Typography.Paragraph>
        Rerata waktu response (Menit) : {agent?.avg_response_time_minutes}
      </Typography.Paragraph>
      <Rate
        allowHalf
        value={toNumber(agent?.avg_satisfaction_rating)}
        disabled
      />
      <Divider />
      <>
        {agent?.feedbacks !== null && (
          <List
            size="small"
            dataSource={agent?.feedbacks}
            renderItem={(data) => {
              return (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar size="small" src={data?.requester_image} />}
                    description={
                      <>
                        <Stack>
                          <Typography.Paragraph style={{ fontSize: 10 }}>
                            {data?.requester_comment}
                          </Typography.Paragraph>
                          <Rate value={data?.stars} disabled />
                        </Stack>
                      </>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </>
    </div>
  );
};

const CardAgent = ({ agent }) => {
  return (
    <Card>
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
      <Row gutter={[8, 8]}>
        {data?.map((agent) => (
          <Col md={6} xs={24} key={agent?.agent_id}>
            <CardAgent agent={agent} />
          </Col>
        ))}
      </Row>
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
