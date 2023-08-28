import { formatDateFull, participantType } from "@/utils/client-utils";
import { Col, Descriptions, Image, Row } from "antd";

function DetailWebinar({ data, withDownload = false }) {
  return (
    <Row>
      <Col md={18} xs={24}>
        <Descriptions
          title="Informasi Webinar Series"
          layout="vertical"
          bordered
        >
          <Descriptions.Item label="Series">{data?.episode}</Descriptions.Item>
          <Descriptions.Item label="Judul">{data?.title}</Descriptions.Item>
          <Descriptions.Item label="Sub Judul">
            {data?.subtitle}
          </Descriptions.Item>
          <Descriptions.Item label="Deskripsi">
            {data?.description}
          </Descriptions.Item>
          <Descriptions.Item label="Poster">
            {data?.image_url && (
              <Image src={data?.image_url} width={200} alt="image" />
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Jumlah Jam">{data?.hour}</Descriptions.Item>
          <Descriptions.Item label="Tanggal">
            {formatDateFull(data?.start_date)} -{" "}
            {formatDateFull(data?.end_date)}
          </Descriptions.Item>
          <Descriptions.Item label="Tanggal Registrasi">
            {formatDateFull(data?.open_registration)} -{" "}
            {formatDateFull(data?.close_registration)}
          </Descriptions.Item>
          <Descriptions.Item label="Tipe Peserta">
            {participantType(data?.type_participant)}
          </Descriptions.Item>
          <Descriptions.Item label="Link Zoom">
            {data?.zoom_url && (
              <span>
                <a target="_blank" href={data?.zoom_url} rel="noreferrer">
                  Zoom
                </a>
              </span>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Link Youtube">
            {data?.youtube_url && (
              <span>
                <a target="_blank" href={data?.youtube_url} rel="noreferrer">
                  Youtube
                </a>
              </span>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Link Materi">
            {data?.reference_link && (
              <span>
                <a target="_blank" href={data?.reference_link} rel="noreferrer">
                  Materi
                </a>
              </span>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Col>
    </Row>
  );
}

export default DetailWebinar;
