import {
  getRoles,
  getUsers,
  updateUserRole,
} from "@/services/managements.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Form, Input, Modal, Select, Table, message } from "antd";
import { useEffect } from "react";
import { useState } from "react";

const ModalChangeRole = ({
  open,
  onCancel,
  update,
  roles,
  loading,
  selectedUser,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      app_role_id: selectedUser?.app_role?.id,
    });
  });

  const handleOk = async () => {
    try {
      const result = await form.validateFields();
      const payload = {
        id: selectedUser?.custom_id,
        data: {
          app_role_id: result.app_role_id,
        },
      };
      await update(payload);
      form.resetFields();
      onCancel();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Modal
        confirmLoading={loading}
        onOk={handleOk}
        open={open}
        onCancel={onCancel}
        centered
        title="Change Role"
      >
        <Form form={form} layout="vertical">
          <Form.Item required name="app_role_id" label="Role">
            <Select showSearch optionFilterProp="name">
              {roles?.map((role) => (
                <Select.Option
                  name={role?.name}
                  key={role?.id}
                  value={role?.id}
                >
                  {role?.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

function UserRoles() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selecteduser, setSelectedUser] = useState(null);

  const { mutateAsync: changeRole, isLoading: loadingChangeRole } = useMutation(
    (data) => updateUserRole(data),
    {
      onSuccess: () => {
        message.success("Berhasil mengubah role");
      },
      onError: () => {
        message.error("Gagal mengubah role");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["users-roles", query]);
      },
    }
  );

  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    search: "",
  });

  const { data: roles, isLoading: isLoadingRoles } = useQuery(
    ["roles"],
    () => getRoles(),
    {}
  );

  const { data, isLoading } = useQuery(
    ["users-roles", query],
    () => getUsers(query),
    {
      enabled: !!query,
      keepPreviousData: true,
    }
  );

  const handleOpen = (data) => {
    setOpen(true);
    setSelectedUser(data);
  };

  const handleCancel = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  const columns = [
    { title: "Nama", dataIndex: "username" },
    { title: "Employee Number", dataIndex: "employee_number" },
    { title: "Group", dataIndex: "group" },
    {
      title: "App Role",
      key: "app_role",
      render: (_, record) => {
        return <>{record?.app_role?.name || "Tidak ada role"}</>;
      },
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, record) => {
        return <a onClick={() => handleOpen(record)}>Change Role</a>;
      },
    },
  ];

  const handleSearch = (value) => {
    setQuery({ ...query, search: value });
  };

  return (
    <div>
      <ModalChangeRole
        roles={roles}
        selectedUser={selecteduser}
        update={changeRole}
        loading={loadingChangeRole}
        open={open}
        onCancel={handleCancel}
      />
      <Table
        title={() => {
          return (
            <Input.Search
              allowClear
              placeholder="Cari user"
              onSearch={handleSearch}
              enterButton
            />
          );
        }}
        pagination={{
          current: query?.page,
          pageSize: query?.limit,
          total: data?.total,
          showSizeChanger: false,
          onChange: (page, perPage) =>
            setQuery({ ...query, page, limit: perPage }),
        }}
        loading={isLoading}
        columns={columns}
        dataSource={data?.data}
      />
    </div>
  );
}

export default UserRoles;
