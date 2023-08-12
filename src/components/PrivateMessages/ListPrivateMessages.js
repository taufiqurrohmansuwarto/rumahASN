import { getPrivateMessages } from "@/services/index";
import { timeFormat, truncate } from "@/utils/client-utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  List,
  Row,
  Space,
  Tooltip,
  Typography,
} from "antd";
import CreatePrivateMessage from "./CreatePrivateMessage";
import { useRouter } from "next/router";

const fetchItems =
  (type) =>
  async ({ pageParam = 1, queryKey }) => {
    const [_, limit] = queryKey;
    const response = await getPrivateMessages({
      page: pageParam,
      limit: limit,
      type,
    });

    return response;
  };

function ListPrivateMessages({ type }) {
  const router = useRouter();
  const { data, isLoading, hasNextPage, fetchNextPage } = useInfiniteQuery(
    [`mails_${type}`, 10],
    fetchItems(type),
    {
      getNextPageParam: (lastPage) => {
        if (lastPage.hasNextPage) return lastPage.page + 1;
        return false;
      },
    }
  );

  const gotoDetail = (id) => router.push(`/mails/${id}`);

  return (
    <div>
      <Row>
        <Col span={18}>
          <Card>
            <List
              header={<CreatePrivateMessage />}
              size="small"
              loading={isLoading}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Typography.Text strong key="time">
                      {timeFormat(item?.created_at)}
                    </Typography.Text>,
                    <a key="detail" onClick={() => gotoDetail(item?.id)}>
                      Lihat
                    </a>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <>
                        {type === "inbox" ? (
                          <Tooltip title={item?.sender?.username}>
                            <Avatar size="small" src={item?.sender?.image} />
                          </Tooltip>
                        ) : (
                          <Tooltip title={item?.receiver?.username}>
                            <Avatar size="small" src={item?.receiver?.image} />
                          </Tooltip>
                        )}
                      </>
                    }
                    title={
                      <Space size="small">
                        <Typography.Text
                          strong={type === "inbox" ? !item?.is_read : false}
                        >
                          {item?.title}
                        </Typography.Text>
                        <Divider type="vertical" />
                        {type === "inbox" ? (
                          <div
                            style={{
                              color: item?.is_read ? "grey" : "black",
                            }}
                            dangerouslySetInnerHTML={{
                              __html: truncate(item?.message, 30),
                            }}
                          />
                        ) : (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: truncate(item?.message, 30),
                            }}
                          />
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
              footer={
                hasNextPage && (
                  <Button
                    onClick={() => fetchNextPage()}
                    style={{
                      textAlign: "center",
                    }}
                  >
                    Load More
                  </Button>
                )
              }
              dataSource={data?.pages?.flatMap((page) => page?.data)}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default ListPrivateMessages;
