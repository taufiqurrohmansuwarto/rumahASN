import { showIPASN, uploadIPASN } from "@/services/siasn-services";
import { UploadOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Input, Table, Upload, message } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";

const UploadExcel = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [fileList, setFileList] = useState([]);

  const { mutateAsync, isLoading } = useMutation((data) => uploadIPASN(data));

  const handleUpload = async () => {
    try {
      const file = fileList[0];
      const formData = new FormData();
      formData.append("file", file);
      await mutateAsync(formData);
      queryClient.invalidateQueries("getIpAsn");

      router.push({
        query: {
          ...router.query,
          page: 1,
        },
      });

      message.success("Berhasil mengunggah file");
    } catch (error) {
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

function ReportIPASN() {
  const columns = [
    {
      title: "NIP",
      dataIndex: "nip",
    },
    {
      title: "Nama",
      dataIndex: "nama",
    },
    {
      title: "Kualifikasi",
      dataIndex: "kualifikasi",
    },
    {
      title: "Kompetensi",
      dataIndex: "kompetensi",
    },

    {
      title: "Kinerja",
      dataIndex: "kinerja",
    },

    {
      title: "Disiplin",
      dataIndex: "disiplin",
    },

    {
      title: "Total",
      dataIndex: "total",
    },
    {
      title: "Tahun",
      dataIndex: "tahun",
    },
  ];

  const router = useRouter();
  const { data, isLoading } = useQuery(
    ["getIpAsn", router.query],
    () => showIPASN(router.query),
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
    <>
      <UploadExcel />
      <Table
        title={() => <Input.Search onSearch={handleSearch} />}
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
        columns={columns}
        rowKey={(row) => row?.id}
        dataSource={data?.data}
        loading={isLoading}
      />
    </>
  );
}

export default ReportIPASN;
