import {
  employeesByUnitOrganisasi,
  unitOrganisasi,
} from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Col, Row, Skeleton, Table, TreeSelect } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";

function HRWithEmployees() {
  const router = useRouter();

  const {
    data: employees,
    isLoading: isLoadingEmployees,
    refetch,
    isFetching,
  } = useQuery(
    ["ref-unor-employees", router?.query?.id],
    () => employeesByUnitOrganisasi(router?.query?.id),
    {
      enabled: !!router?.query?.id,
    }
  );

  const { data: unor, isLoading: isLoadingUnor } = useQuery(
    ["ref-unor-new"],
    () => unitOrganisasi(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const handleChange = (value) => {
    router.push({
      pathname: "/apps-managements/integrasi/siasn",
      query: { id: value },
    });
  };

  const columns = [
    {
      title: "Nama",
      key: "nama_pegawai",
      render: (row) => (
        <Link href={`/apps-managements/integrasi/siasn/${row?.nip_baru}`}>
          {row?.nama_pegawai}
        </Link>
      ),
    },
    { title: "NIP", dataIndex: "nip_baru" },
    { title: "Kedudukan Hukum", dataIndex: "kedudukan_hukum" },
    { title: "Golongan", dataIndex: "golongan" },
    { title: "Jabatan", dataIndex: "nama_jabatan" },
  ];

  return (
    <Skeleton loading={isLoadingUnor}>
      <Row
        gutter={[
          {
            md: 10,
          },
        ]}
      >
        <Col md={8}>
          <TreeSelect
            value={router?.query?.id || null}
            onChange={handleChange}
            style={{
              width: "100%",
            }}
            treeNodeFilterProp="label"
            treeData={unor}
            showSearch
          />
        </Col>
        <Col md={16}>
          {/* {JSON.stringify(employees)} */}
          <Table
            columns={columns}
            dataSource={employees?.data?.records}
            loading={isFetching}
            rowKey={(row) => row?.id}
          />
        </Col>
      </Row>
    </Skeleton>
  );
}

export default HRWithEmployees;
