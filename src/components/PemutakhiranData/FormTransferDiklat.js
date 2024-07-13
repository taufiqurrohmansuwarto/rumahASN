import {
  getTokenSIASNService,
  postRwDiklatByNip,
  postRwKursus,
  refDiklatStruktural,
  refJenisDiklat,
} from "@/services/siasn-services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  message,
} from "antd";
import axios from "axios";
import { useState } from "react";

export const API_URL = "https://apimws.bkn.go.id:8243/apisiasn/1.0";

const ModalFormDiklat = ({
  jenisDiklat,
  diklatStruktural,
  form,
  onFinish,
  namaDiklat,
  file,
}) => {
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);

  const { mutateAsync: tambah, isLoading } = useMutation(
    (data) => postRwDiklatByNip(data),
    {}
  );

  const handleOk = async () => {
    try {
      setLoading(true);
      const result = await form.validateFields();
      const type = result?.jenisDiklatId === 1 ? "diklat" : "kursus";
      const id_ref_dokumen = type === "diklat" ? "874" : "881";

      const payload = {
        ...result,
        type,
        tanggalKursus: result?.tanggalKursus?.format("DD-MM-YYYY"),
        tanggalSelesaiKursus:
          result?.tanggalSelesaiKursus?.format("DD-MM-YYYY"),
      };

      if (file) {
        console.log(payload);
        setLoading(false);
      } else {
        setLoading(false);
        console.log(payload);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form layout="vertical" form={form} onFinish={onFinish}>
      <Form.Item
        label="Jenis Diklat"
        name="jenisDiklatId"
        required
        rules={[{ required: true, message: "Jenis Diklat Tidak boleh kosong" }]}
        help={`Jenis Diklat ${namaDiklat}`}
      >
        <Select showSearch optionFilterProp="label" allowClear>
          {jenisDiklat?.map((item) => (
            <Select.Option label={item?.label} key={item.id} value={item.id}>
              {item.label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.jenisDiklatId !== currentValues.jenisDiklatId
        }
      >
        {({ getFieldValue }) =>
          getFieldValue("jenisDiklatId") === 1 && (
            <Form.Item
              rules={[
                {
                  required: true,
                  message: "Diklat Struktural Tidak boleh kosong",
                },
              ]}
              label="Diklat Struktural"
              name="latihanStrukturalId"
            >
              <Select showSearch allowClear optionFilterProp="label">
                {diklatStruktural?.map((item) => (
                  <Select.Option
                    label={item?.label}
                    key={item.id}
                    value={item.id}
                  >
                    {item.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )
        }
      </Form.Item>
      <Form.Item
        label="Nama Diklat"
        rules={[{ required: true, message: "Nama Tidak boleh kosong" }]}
        name="namaKursus"
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="institusiPenyelenggara"
        label="Institusi Penyelenggara"
        rules={[
          {
            required: true,
            message: "Institusi Penyelenggara Tidak boleh kosong",
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Nomor Sertifikat"
        name="nomorSertipikat"
        rules={[
          { required: true, message: "Nomor Sertifikat Tidak boleh kosong" },
        ]}
      >
        <Input />
      </Form.Item>
      <Row>
        <Col xs={24} md={8}>
          <Form.Item
            rules={[
              { required: true, message: "Tahun Diklat Tidak boleh kosong" },
            ]}
            label="Tahun Diklat"
            name="tahunKursus"
          >
            <InputNumber />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            rules={[
              { required: true, message: "Tanggal Mulai Tidak boleh kosong" },
            ]}
            label="Tanggal Mulai"
            name="tanggalKursus"
          >
            <DatePicker format="DD-MM-YYYY" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            rules={[
              {
                required: true,
                message: "Tanggal Selesai Tidak boleh kosong",
              },
            ]}
            label="Tanggal Selesai"
            name="tanggalSelesaiKursus"
          >
            <DatePicker format="DD-MM-YYYY" />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item
        rules={[{ required: true, message: "Durasi(Jam) Tidak boleh kosong" }]}
        label="Durasi(Jam)"
        name="jumlahJam"
      >
        <InputNumber />
      </Form.Item>
    </Form>
  );
};

function FormTransferDiklat({
  data,
  onClose,
  form,
  onFinish,
  namaDiklat,
  file,
}) {
  const { data: jenisDiklat, isLoading: loadingJenisDiklat } = useQuery(
    ["ref-jenis-diklat"],
    () => refJenisDiklat(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: diklatStruktural, isLoading: loadingDiklatStruktural } =
    useQuery(["ref-diklat-struktural"], () => refDiklatStruktural(), {
      refetchOnWindowFocus: false,
    });

  return (
    <>
      <ModalFormDiklat
        file={file}
        form={form}
        onFinish={onFinish}
        jenisDiklat={jenisDiklat}
        diklatStruktural={diklatStruktural}
        data={data}
        onClose={onClose}
        namaDiklat={namaDiklat}
      />
    </>
  );
}

export default FormTransferDiklat;
