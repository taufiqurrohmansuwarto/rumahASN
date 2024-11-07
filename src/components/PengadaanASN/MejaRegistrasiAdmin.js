import useScrollRestoration from "@/hooks/useScrollRestoration";
import {
  getMejaRegistrasi,
  uploadMejaRegistrasi,
} from "@/services/admin.services";
import { UploadOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Table, Upload, message } from "antd";
import { useState } from "react";

const UploadExcel = () => {
  const queryClient = useQueryClient();
  const [fileList, setFileList] = useState([]);

  const { mutateAsync, isLoading } = useMutation(
    (data) => uploadMejaRegistrasi(data),
    {
      onSettled: () => {
        queryClient.invalidateQueries("get-all-meja-registrasi");
      },
    }
  );

  const handleUpload = async () => {
    try {
      const file = fileList[0];
      const formData = new FormData();
      formData.append("file", file);
      await mutateAsync(formData);
      queryClient.invalidateQueries("getAllEmployeesSiasn");

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
        <Button icon={<UploadOutlined />}>Meja Registrasi</Button>
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

function MejaRegistrasiAdmin() {
  useScrollRestoration();
  const columns = [
    {
      title: "no",
      dataIndex: "no",
    },
    {
      title: "Nomor Peserta",
      dataIndex: "nomor_peserta",
    },
    {
      title: "Nama",
      dataIndex: "nama",
    },
  ];

  const { data, isLoading } = useQuery(
    ["get-all-meja-registrasi"],
    () => getMejaRegistrasi(),
    {}
  );

  return (
    <>
      <UploadExcel />
      <Table
        // title={() => <Input.Search onSearch={handleSearch} />}
        columns={columns}
        pagination={false}
        rowKey={(row) => row?.id}
        dataSource={data}
        loading={isLoading}
      />
    </>
  );
}

export default MejaRegistrasiAdmin;
