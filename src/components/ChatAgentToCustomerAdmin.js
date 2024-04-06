import { useQuery } from "@tanstack/react-query";
import { Card, List, Skeleton } from "antd";
import { Comment } from "@ant-design/compatible";
import { commentsCustomersToAgents } from "../../services/admin.services";
import { fromNow } from "../../utils";

const CommentsList = ({ data }) => {
  return (
    <List
      dataSource={data}
      rowKey={(row) => row?.id}
      renderItem={(item) => (
        <Comment
          content={<div dangerouslySetInnerHTML={{ __html: item?.comment }} />}
          author={item?.user?.username}
          datetime={fromNow(item?.created_at)}
          avatar={item?.user?.image}
        />
      )}
    />
  );
};

function ChatAgentToCustomerAdmin({ id }) {
  const { data, isLoading } = useQuery(
    ["messages-agents-to-customers-admin", id],
    () => commentsCustomersToAgents(id)
  );

  return (
    <Skeleton loading={isLoading || status === "loading"}>
      <Card title="Chat">
        <CommentsList data={data} />
      </Card>
    </Skeleton>
  );
}

export default ChatAgentToCustomerAdmin;
