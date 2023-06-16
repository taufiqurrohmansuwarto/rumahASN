import Layout from "@/components/Layout";
import { getPodcastDetail, uploadPodcast } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Upload } from "antd";
import { useRouter } from "next/router";
import React, { useState } from "react";

const UpdateForm = ({ data }) => {};

function DetailPodcast() {
  const router = useRouter();
  const { data, isLoading } = useQuery(
    ["podcasts", router?.query?.id],
    () => getPodcastDetail(router?.query?.id),
    {}
  );

  const [fileListAudio, setFileListAudio] = useState([]);
  const [fileListImage, setFileListImage] = useState([]);

  // handle upload
  const handleUpload = async (file) => {
    if (file.fileList.length > 1) {
      file.fileList.shift();
    }

    const currentFile = file.fileList[0]?.originFileObj;

    console.log(currentFile);
  };

  return (
    <div>
      <Card loading={isLoading}>
        <Upload
          fileList={fileListAudio}
          multiple={false}
          maxCount={1}
          showUploadList={{
            showRemoveIcon: false,
          }}
          onChange={(file) => handleUpload(file)}
          accept=".mp3"
        >
          <Button>Upload</Button>
        </Upload>
      </Card>
    </div>
  );
}

DetailPodcast.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

DetailPodcast.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default DetailPodcast;
