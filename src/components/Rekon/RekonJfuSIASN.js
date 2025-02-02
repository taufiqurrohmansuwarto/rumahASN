import {
  getJfuSiasn,
  getJfuSimaster,
  syncJfuSiasn,
  syncJfuSimaster,
} from "@/services/rekon.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Form, message, Select, TreeSelect } from "antd";
import { debounce } from "lodash";
import { useState } from "react";

const queryConfig = {
  refetchOnWindowFocus: false,
};

const RekonJfuSIASN = () => {
  const queryClient = useQueryClient();

  const { data: jfuSimaster } = useQuery(
    ["rekon-jfu-simaster"],
    getJfuSimaster,
    queryConfig
  );

  const { data: jfuSiasn } = useQuery(
    ["rekon-jfu-siasn"],
    getJfuSiasn,
    queryConfig
  );

  const [searchText, setSearchText] = useState("");

  const { mutate: syncMaster, isLoading: isLoadingMaster } = useMutation(
    () => syncJfuSimaster(),
    {
      onSuccess: () => {
        message.success("Berhasil sinkronasi data");
        queryClient.invalidateQueries(["rekon-jfu-simaster"]);
      },
      onSettled: () => {
        queryClient.invalidateQueries(["rekon-jfu-siasn"]);
      },
    }
  );

  const { mutate: syncSiasn, isLoading: isLoadingSiasn } = useMutation(
    () => syncJfuSiasn(),
    {
      onSuccess: () => {
        message.success("Berhasil sinkronasi data");
        queryClient.invalidateQueries(["rekon-jfu-siasn"]);
      },
      onSettled: () => {
        queryClient.invalidateQueries(["rekon-jfu-siasn"]);
      },
    }
  );

  const handleSearch = debounce((value) => {
    setSearchText(value);
  }, 3000);

  const filteredOptions = jfuSiasn?.filter((item) =>
    item.nama.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Card title="Padanan Jabatan Pelaksana">
      <Form layout="vertical">
        <Form.Item
          label={
            <>
              Jabatan Pelaksana SIMASTER
              <Button
                type="link"
                onClick={syncMaster}
                loading={isLoadingMaster}
              >
                sinkron
              </Button>
            </>
          }
        >
          <TreeSelect
            treeNodeFilterProp="title"
            placeholder="Ketik nama jabatan fungsional"
            showSearch
            style={{ width: "100%" }}
            treeData={jfuSimaster}
          />
        </Form.Item>
        <Form.Item
          label={
            <>
              Jabatan Pelaksana SIASN
              <Button type="link" onClick={syncSiasn} loading={isLoadingSiasn}>
                sinkron
              </Button>
            </>
          }
        >
          <Select
            listItemHeight={50}
            listHeight={100}
            showSearch
            optionFilterProp="nama"
            placeholder="Pilih Jabatan Pelaksana SIASN"
            filterOption={false}
            onSearch={handleSearch}
          >
            {filteredOptions?.map((item) => (
              <Select.Option key={item?.id} value={item?.id} nama={item?.nama}>
                {item?.nama} ({item?.cepat_kode})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Simpan
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default RekonJfuSIASN;
