import { nilaiCasn } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { Col, Row, Skeleton, Tabs } from "antd";
import { capitalizeWithoutPPPK } from "@/utils/client-utils";

function NilaiWeb() {
  const { data, isLoading } = useQuery(["nilai-casn"], () => nilaiCasn(), {});
  return (
    <Skeleton loading={isLoading}>
      <Row justify="center">
        <Col span={14}>
          <Tabs
            defaultActiveKey="12103"
            tabPosition="top"
            items={data?.map((d) => {
              return {
                label: capitalizeWithoutPPPK(d?.judul_nilai),
                key: d?.id,
                children: (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: d?.text_nilai,
                    }}
                  />
                ),
              };
            })}
          />
        </Col>
      </Row>
    </Skeleton>
  );
}

export default NilaiWeb;
