import useScrollRestoration from "@/hooks/useScrollRestoration";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button, Table, Upload, message } from "antd";
import { useRouter } from "next/router";
import { UploadOutlined } from "@ant-design/icons";
import { showRefJft, uploadRefJft } from "@/services/siasn-services";

const UploadExcel = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [fileList, setFileList] = useState([]);

  const { mutateAsync, isLoading } = useMutation((data) => uploadRefJft(data));

  const handleUpload = async () => {
    try {
      const file = fileList[0];
      const formData = new FormData();
      formData.append("file", file);
      await mutateAsync(formData);
      queryClient.invalidateQueries("getRefJft");

      router.push({
        query: {
          ...router.query,
          page: 1,
        },
      });

      message.success("Berhasil mengunggah file");
    } catch (error) {
      console.log(error);
      message.error("Gagal mengunggah file");
    }
  };
  const props = {
    beforeUpload: (file) => {
      // console.log(file);
      setFileList([file]);
      return false;
    },
    fileList,
  };

  return (
    <>
      <Upload
        showUploadList={{
          downloadIcon: false,
          previewIcon: false,
          removeIcon: false,
          showDownloadIcon: false,
          showPreviewIcon: false,
          showRemoveIcon: false,
        }}
        {...props}
        multiple={false}
        fileList={fileList}
        maxCount={1}
      >
        <Button icon={<UploadOutlined />}>Select File</Button>
      </Upload>
      <Button
        type="primary"
        onClick={handleUpload}
        disabled={isLoading || fileList.length === 0}
        loading={isLoading}
        style={{
          marginTop: 16,
        }}
      >
        {isLoading ? "Uploading" : "Start Upload"}
      </Button>
    </>
  );
};

function RefJft() {
  useScrollRestoration();
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: "Nama",
      dataIndex: "nama",
    },
    {
      title: "BUP",
      dataIndex: "bup_usia",
    },
    {
      title: "Kelas Jabatan ID",
      dataIndex: "kel_jabatan_id",
    },
    {
      title: "Cepat Kode",
      dataIndex: "cepat_kode",
    },
    {
      title: "Status",
      dataIndex: "status",
    },
    {
      title: "Jenjang",
      dataIndex: "jenjang",
    },
  ];

  const router = useRouter();
  const { data, isLoading } = useQuery(
    ["getRefJft", router.query],
    () => showRefJft(router.query),
    {
      enabled: !!router.query,
      keepPreviousData: true,
    }
  );

  const handleSearch = (value) => {
    if (value) {
      router.push({
        query: {
          ...router.query,
          search: value,
        },
      });
    } else {
      router.push({
        query: {
          ...router.query,
          search: undefined,
        },
      });
    }
  };

  return (
    <div>
      <UploadExcel />
      <Table
        // title={() => <Input.Search onSearch={handleSearch} />}
        columns={columns}
        pagination={{
          showSizeChanger: false,
          position: ["bottomRight", "topRight"],
          current: data?.pagination?.page,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
          total: data?.pagination?.total,
          pageSize: data?.pagination?.limit,
          onChange: (page, pageSize) => {
            router.push({
              query: {
                ...router.query,
                page,
              },
            });
          },
        }}
        rowKey={(row) => row?.id}
        dataSource={data?.data}
        loading={isLoading}
      />
    </div>
  );
}

export default RefJft;
