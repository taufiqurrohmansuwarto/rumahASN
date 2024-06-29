import { getUnorMasterDetail, unorASN } from "@/services/master.services";
import { SearchOutlined } from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Button, Form, Tree, TreeSelect } from "antd";
import { useState } from "react";

function DisparitasUnorSIMASTER() {
  const [treeId, setTreeId] = useState(null);
  const handleChange = (value) => {
    setTreeId(value);
  };

  const { data, isLoading } = useQuery(["unor-simaster"], () => unorASN(), {
    refetchOnWindowFocus: false,
  });

  const {
    data: detailUnor,
    isLoading: loadingDetailUnor,
    refetch,
    isFetching,
  } = useQuery(
    ["detail-unor-master", treeId],
    () => getUnorMasterDetail(treeId),
    {
      refetchOnWindowFocus: false,
      enabled: false,
    }
  );

  return (
    <Stack>
      {data && (
        <>
          <Form.Item help="Unit Organisasi SIMASTER">
            <TreeSelect
              value={treeId}
              treeNodeFilterProp="title"
              onChange={handleChange}
              showSearch
              style={{ width: "100%" }}
              treeData={data}
              allowClear
            />
          </Form.Item>
          <Button
            icon={<SearchOutlined />}
            type="primary"
            disabled={isFetching}
            loading={isFetching}
            onClick={refetch}
          >
            Cari
          </Button>
        </>
      )}

      {detailUnor && (
        <Tree showLine height={600} defaultExpandAll treeData={detailUnor} />
      )}
    </Stack>
  );
}

export default DisparitasUnorSIMASTER;
