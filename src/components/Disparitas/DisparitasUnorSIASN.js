import { getDetailUnor, unitOrganisasi } from "@/services/siasn-services";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Button, Col, Row, Space, Tree, TreeSelect } from "antd";
import { useState } from "react";
import DisparitasUnorSIMASTER from "./DisparitasUnorSIMASTER";

function DisparitasUnorSIASN() {
  const [treeId, setTreeId] = useState(null);
  const handleChange = (value) => {
    setTreeId(value);
  };

  const { data, isLoading } = useQuery(
    ["disparitas-unor"],
    () => unitOrganisasi(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const {
    data: detailUnor,
    isLoading: loadingDetailUnor,
    refetch,
    isFetching,
  } = useQuery(["detail-unor", treeId], () => getDetailUnor(treeId), {
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const handleSearch = () => {
    refetch();
  };

  return (
    <div>
      {/* {JSON.stringify(detailUnor)} */}
      <Row gutter={[8, 16]}>
        <Col md={12}>
          <Stack>
            {data && (
              <>
                <TreeSelect
                  onChange={handleChange}
                  value={treeId}
                  showSearch
                  treeNodeFilterProp="label"
                  style={{ width: "100%" }}
                  treeData={data}
                />
                <Button
                  disabled={isFetching}
                  loading={isFetching}
                  onClick={handleSearch}
                >
                  Cari
                </Button>
              </>
            )}
            {detailUnor && (
              <Tree
                showLine
                height={600}
                defaultExpandAll
                treeData={detailUnor}
              />
            )}
          </Stack>
        </Col>
        <Col md={12}>
          <DisparitasUnorSIMASTER />
        </Col>
      </Row>
    </div>
  );
}

export default DisparitasUnorSIASN;
