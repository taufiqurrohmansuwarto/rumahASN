import { parseMarkdown, uploadFiles } from "@/services/index";
import {
  getLayananById,
  updateStandarLayanan,
} from "@/services/layanan.services";
import { MarkdownEditor } from "@primer/react/drafts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Space, Tabs, message } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";
import ReactMarkdownCustom from "../MarkdownEditor/ReactMarkdownCustom";

const uploadFile = async (file) => {
  try {
    const formData = new FormData();

    // if file not image png, jpg, jpeg, gif
    const allowedTypes = ["image/png", "image/jpg", "image/jpeg", "image/gif"];

    if (!allowedTypes.includes(file.type)) {
      return;
    } else {
      formData.append("file", file);
      const result = await uploadFiles(formData);
      return {
        url: result?.data,
        file,
      };
    }
  } catch (error) {
    console.log(error);
  }
};

const renderMarkdown = async (markdown) => {
  if (!markdown) return;
  const result = await parseMarkdown(markdown);
  return result?.html;
};

const FormIsianLayanan = ({ myValue, type, id }) => {
  const queryClient = useQueryClient();
  const [value, setValue] = useState(myValue);
  const [showEdit, setShowEdit] = useState(false);

  const openShowEdit = () => setShowEdit(true);
  const closeShowEdit = () => setShowEdit(false);

  const { mutate: update, isLoading: isLoadingUpdate } = useMutation({
    mutationFn: (data) => updateStandarLayanan(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["standar-pelayanan", id]);
      message.success("Berhasil mengubah isian layanan");
    },
    onError: () => {
      message.error("Gagal mengubah isian layanan");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["standar-pelayanan", id]);
    },
  });

  const submitMessage = () => {
    const payload = {
      id,
      data: {
        [type]: value,
      },
    };

    update(payload);
  };

  return (
    <>
      {showEdit ? (
        <MarkdownEditor
          acceptedFileTypes={[
            "image/png",
            "image/jpg",
            "image/jpeg",
            "image/gif",
          ]}
          value={value}
          onChange={setValue}
          onRenderPreview={renderMarkdown}
          onUploadFile={uploadFile}
          savedReplies={false}
          mentionSuggestions={false}
        >
          <MarkdownEditor.Actions>
            <MarkdownEditor.ActionButton
              variant="danger"
              size="medium"
              onClick={closeShowEdit}
            >
              Cancel
            </MarkdownEditor.ActionButton>
            <MarkdownEditor.ActionButton
              disabled={!value || isLoadingUpdate}
              variant="primary"
              size="medium"
              onClick={submitMessage}
            >
              {isLoadingUpdate ? "Loading..." : "Submit"}
            </MarkdownEditor.ActionButton>
          </MarkdownEditor.Actions>
        </MarkdownEditor>
      ) : (
        <div>
          <Space direction="vertical">
            <ReactMarkdownCustom>{value || ""}</ReactMarkdownCustom>
            <Button type="link" onClick={openShowEdit}>
              Edit
            </Button>
          </Space>
        </div>
      )}
    </>
  );
};

function DetailStandarLayanan() {
  const router = useRouter();
  const id = router.query.id;

  const { data, isLoading } = useQuery(
    ["standar-pelayanan", id],
    () => getLayananById(id),
    {
      enabled: !!id,
    }
  );

  return (
    <Tabs>
      <Tabs.TabPane tab="Definisi" key="definisi">
        <FormIsianLayanan myValue={data?.definisi} type="definisi" id={id} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Persyaratan" key="persyaratan">
        <FormIsianLayanan
          myValue={data?.persyaratan}
          type="persyaratan"
          id={id}
        />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Mekanisme" key="mekanisme">
        <FormIsianLayanan myValue={data?.mekanisme} type="mekanisme" id={id} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Dasar Hukum" key="dasar-hukum">
        <FormIsianLayanan
          myValue={data?.dasar_hukum}
          type="dasar_hukum"
          id={id}
        />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Jangka Waktu Layanan" key="waktu">
        <FormIsianLayanan
          myValue={data?.jangka_waktu_layanan}
          type="waktu"
          id={id}
        />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Biaya" key="biaya">
        <FormIsianLayanan myValue={data?.biaya} type="biaya" id={id} />
      </Tabs.TabPane>
    </Tabs>
  );
}

export default DetailStandarLayanan;
