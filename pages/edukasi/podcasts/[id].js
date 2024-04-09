import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import PodcastPlayer from "@/components/PodcastPlayer";
import PodcastsComments from "@/components/PodcastsComments";
import {
  getVotePodcast,
  podcastComment,
  podcastUserDetail,
  votePodcast,
} from "@/services/index";
import { stringToNumber } from "@/utils/client-utils";
import { Comment } from "@ant-design/compatible";
import { FileOutlined } from "@ant-design/icons";
import { Spoiler } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  List,
  Modal,
  Rate,
  Row,
  Space,
  Tabs,
  Typography,
  message,
} from "antd";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

const ModalRatePodcast = ({ id, open, onCancel }) => {
  const [form] = Form.useForm();

  const queryClient = useQueryClient();

  const { mutate: vote, isLoading } = useMutation((data) => votePodcast(data), {
    onSuccess: () => {
      queryClient.invalidateQueries("vote", id);
      message.success("Berhasil memberikan rating");
    },
    onError: (error) => {
      message.error(error?.response?.data?.message);
    },
  });

  const handleConfirm = async () => {
    const data = await form.validateFields();
    const payload = {
      id,
      data,
    };

    vote(payload);
  };

  return (
    <Modal
      onOk={handleConfirm}
      centered
      title="Rating Podcast"
      confirmLoading={isLoading}
      open={open}
      onCancel={onCancel}
    >
      <Form layout="vertical" form={form}>
        <Form.Item name="vote" label="Rating">
          <Rate />
        </Form.Item>
        <Form.Item name="comment" label="Komentar">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

function PodcastUserDetail() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const id = router?.query?.id;
  const { data, isLoading } = useQuery(
    ["podcast-user", id],
    () => podcastUserDetail(id),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: vote, isLoading: isLoadingVote } = useQuery(["vote", id], () =>
    getVotePodcast(id)
  );

  const { data: comments, isLoading: isLoadingComments } = useQuery(
    ["podcasts-comments", id],
    () => podcastComment(id),
    {}
  );

  const handleOpen = () => setOpen(true);
  const handleCancel = () => setOpen(false);

  return (
    <>
      <Head>
        <title>Rumah ASN - Podcast {data?.title}</title>
      </Head>
      <ModalRatePodcast id={id} open={open} onCancel={handleCancel} />
      <PageContainer
        onBack={() => router.back()}
        title="Detail Podcast"
        subTitle={`Epiosde ${data?.episode} • ${data?.title}`}
        loading={isLoading || isLoadingComments || isLoadingVote}
      >
        <Row justify="center">
          <Col md={18} xs={24}>
            <Card>
              <PodcastPlayer data={data} url={data?.audio_url} />
              <div
                style={{
                  marginTop: 16,
                }}
              >
                {vote?.currentUserVote ? (
                  <Space>
                    <Rate disabled value={stringToNumber(vote?.vote)} />(
                    {vote?.count})
                  </Space>
                ) : (
                  <Button
                    onClick={handleOpen}
                    type="primary"
                    icon={<FileOutlined />}
                    style={{
                      marginTop: 16,
                    }}
                  >
                    Tulis Review
                  </Button>
                )}
              </div>
              <Divider />
              <Typography.Title level={3}>Deskripsi</Typography.Title>
              <Spoiler maxHeight={120} showLabel="Show more" hideLabel="Hide">
                <div
                  dangerouslySetInnerHTML={{
                    __html: data?.html,
                  }}
                />
              </Spoiler>
              <Tabs defaultActiveKey="2">
                <Tabs.TabPane tab={`Komentar (${comments?.length})`} key="2">
                  <PodcastsComments
                    id={router?.query?.id}
                    comments={comments}
                  />
                </Tabs.TabPane>

                <Tabs.TabPane tab="Transkrip" key="1">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: data?.transcript_html,
                    }}
                  />
                </Tabs.TabPane>
                <Tabs.TabPane tab={`Rating (${vote?.votes?.length})`} key="3">
                  <List
                    rowKey={(row) => `${row?.podcast_id}-${row?.user_id}`}
                    dataSource={vote?.votes}
                    renderItem={(item) => (
                      <Comment
                        datetime={
                          <Rate disabled value={stringToNumber(item?.vote)} />
                        }
                        author={`${item?.user?.username}`}
                        avatar={<Avatar src={item?.user?.image} />}
                        content={item?.comment}
                      />
                    )}
                  />
                </Tabs.TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>
      </PageContainer>
    </>
  );
}

PodcastUserDetail.getLayout = (page) => {
  return (
    <Layout collapsed active="/edukasi/podcasts">
      {page}
    </Layout>
  );
};

PodcastUserDetail.Auth = {
  action: "manage",
  subject: "tickets",
};

export default PodcastUserDetail;
