import dayjs from "dayjs";
import { toNumber } from "lodash";
import { List, Rate, Space } from "antd";
import { Comment } from "@ant-design/compatible";

function BKDRating({ data }) {
  return (
    <List
      rowKey={(row) => row?.id}
      renderItem={(item) => (
        <>
          <Comment
            content={
              <Space direction="vertical">
                <Rate
                  style={{
                    fontSize: 16,
                  }}
                  disabled
                  value={toNumber(item?.stars)}
                />
                {item?.requester_comment}
              </Space>
            }
            author={item?.customer?.username}
            avatar={item?.customer?.image}
            datetime={dayjs(item?.created_at).format("DD-MM-YYYY")}
          />
        </>
      )}
      dataSource={data}
    />
  );
}

export default BKDRating;
