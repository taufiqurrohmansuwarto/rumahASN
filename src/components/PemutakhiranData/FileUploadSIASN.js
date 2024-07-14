mport React from 'react';
import { Upload, Button } from 'antd';
import { FileAddOutlined } from '@ant-design/icons';
import useFileStore from '@/store/useFileStore';

const FileUploadSIASN = ({name = 'Upload Dokumen'}) => {
  const fileList = useFileStore((state) => state.fileList);
  const setFileList = useFileStore((state) => state.setFileList);

  const handleChange = (info) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-1);
    newFileList = newFileList.map((file) => {
      if (file.response) {
        file.url = file.response.url;
      }
      return file;
    });
    setFileList(newFileList);
  };

  return (
    <Upload
      beforeUpload={() => false}
      maxCount={1}
      accept=".pdf"
      onChange={handleChange}
      fileList={fileList}
    >
      <Button icon={<FileAddOutlined />}>
	{name}
      </Button>
    </Upload>
  );
};

export default FileUploadSIASN;