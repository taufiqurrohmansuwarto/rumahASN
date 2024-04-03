import {
  detailSubmissionSubmitters,
  uploadSubmitter,
} from "@/services/submissions.services";
import { InboxOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Form, List, Row, Skeleton, Upload } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";

const UploadDokumen = ({
  kode,
  namaFile,
  upload,
  id,
  currentFile,
  enabled,
}) => {
  const [file, setFile] = useState([
    {
      uid: currentFile?.uid,
      name: currentFile?.name,
      url: currentFile?.url,
      status: "done",
    },
  ]);

  const customRequest = async ({ file, onSuccess, onError }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kode_file", kode);
      formData.append("submission_id", id);

      const payload = {
        id,
        data: formData,
      };

      try {
        // Show loading state
        setFile([
          {
            uid: file.uid,
            name: file.name,
            url: URL.createObjectURL(file),
            status: "uploading",
          },
        ]);

        const result = await upload(payload);

        // Update file status to "done" after successful upload
        setFile([
          {
            uid: file.uid,
            name: file.name,
            url: URL.createObjectURL(file),
            status: "done",
          },
        ]);

        onSuccess(result, file);
      } catch (error) {
        onError(error);
      }
    } catch (error) {
      onError(error);
    }
  };

  return (
    <Form.Item name={currentFile?.uid}>
      <Upload.Dragger
        disabled={!enabled}
        fileList={file}
        customRequest={customRequest}
        maxCount={1}
        accept=".pdf"
        multiple={false}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Uggah {namaFile}</p>
      </Upload.Dragger>
    </Form.Item>
  );
};

function DetailUsulan({ id }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isLoading } = useQuery(
    ["detail-usulan", id],
    () => detailSubmissionSubmitters(id),
    {}
  );

  const { mutateAsync: upload, isLoading: isLoadingUpload } = useMutation(
    (data) => uploadSubmitter(data),
    {
      onSettled: () => {
        queryClient.invalidateQueries(["detail-usulan", id]);
      },
    }
  );

  const [form] = Form.useForm();

  const handleFinish = async () => {
    try {
      const values = await form.validateFields();
      console.log(values);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Skeleton loading={isLoading}>
      <Form onFinish={handleFinish} form={form}>
        <>
          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 2,
              md: 2,
              lg: 3,
              xl: 3,
              xxl: 3,
            }}
            dataSource={data?.reference?.submission_files}
            rowKey={(row) => row?.id}
            renderItem={(item) => (
              <UploadDokumen
                id={router?.query?.id}
                upload={upload}
                isLoading={isLoadingUpload}
                key={item?.id}
                enabled={
                  data?.status === "INPUT_USUL" || data?.status === "PERBAIKAN"
                }
                kode={item?.kode_file}
                namaFile={item?.file?.description}
                currentFile={
                  data?.files?.find((file) => file?.uid === item?.kode_file) ||
                  null
                }
              />
            )}
          />
        </>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Simpan
          </Button>
        </Form.Item>
      </Form>
    </Skeleton>
  );
}

export default DetailUsulan;
