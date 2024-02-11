import {
  deletePermission,
  deleteRole,
  getPermissions,
  getRoles,
  updatePermission,
  updateRole,
} from "@/services/managements.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Divider,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  message,
} from "antd";
import CreatePermissions from "./CreatePermissions";
import CreateRole from "./CreateRole";
import RolesPermissions from "./RolesPermissions";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import UserRoles from "./UserRoles";

const EditRoleModal = ({ open, onCancel, update, data, loading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        name: data?.name,
        description: data?.description,
      });
    }
  }, [data, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        id: data?.id,
        data: values,
      };
      await update(payload);
      form.resetFields();
      onCancel();
    } catch (error) {
      message.error("Gagal mengubah role");
    }
  };

  return (
    <Modal
      centered
      confirmLoading={loading}
      onOk={handleOk}
      title="Edit Role"
      open={open}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Nama Role">
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Deskripsi">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const RoleTable = ({
  dataSource,
  loading,
  remove,
  update,
  loadingUpdate,
  loadingRemove,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const handleOpen = (data) => {
    setOpen(true);
    setSelectedRole(data);
  };
  const handleClose = () => {
    setOpen(false);
    setSelectedRole(null);
  };

  const handleConfirm = async (id) => {
    await remove(id);
  };

  const columns = [
    { title: "Name", dataIndex: "name" },
    {
      title: "Description",
      dataIndex: "description",
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (text, record) => {
        return (
          <Space>
            <a
              onClick={() => {
                handleOpen(text);
              }}
            >
              Edit
            </a>
            <Divider type="vertical" />
            <Popconfirm
              title="Apakah anda yakin ingin menghapus role"
              onConfirm={async () => await handleConfirm(record?.id)}
            >
              <a>Delete</a>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];
  return (
    <>
      <EditRoleModal
        loading={loadingUpdate}
        open={open}
        onCancel={handleClose}
        update={update}
        data={selectedRole}
      />
      <Table
        pagination={false}
        columns={columns}
        dataSource={dataSource}
        loading={loading}
      />
    </>
  );
};

const EditPermissionModal = ({ open, onCancel, update, data, loading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        name: data?.name,
        description: data?.description,
        resource: data?.resource,
        attributes: data?.attributes,
      });
    }
  }, [data, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        id: data?.id,
        data: values,
      };
      await update(payload);
      form.resetFields();
      onCancel();
    } catch (error) {
      message.error("Gagal mengubah permission");
    }
  };

  return (
    <Modal
      centered
      confirmLoading={loading}
      onOk={handleOk}
      title="Edit Permission"
      open={open}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Nama Permission/Action">
          <Input />
        </Form.Item>
        <Form.Item name="resource" label="Resource">
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Deksripsi">
          <Input.TextArea />
        </Form.Item>
        <Form.Item name="attributes" label="Attribute">
          <Select mode="tags" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const PermissionTable = ({
  dataSource,
  loading,
  remove,
  update,
  loadingUpdate,
  loadingRemove,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);

  const handleOpen = (data) => {
    setOpen(true);
    setSelectedPermission(data);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPermission(null);
  };

  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "Description", dataIndex: "description" },
    { title: "Resource", dataIndex: "resource" },
    {
      title: "Attributes",
      key: "attributes",
      render: (_, record) => {
        return <div>{record?.attributes?.join(",")}</div>;
      },
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, record) => {
        return (
          <Space>
            <a onClick={() => handleOpen(record)}>Edit</a>
            <Divider type="vertical" />
            <Popconfirm
              onConfirm={async () => await remove(record?.id)}
              title="Apakah anda yakin ingin menghapus permission"
            >
              <a>Delete</a>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];
  return (
    <>
      <EditPermissionModal
        loading={loadingUpdate}
        open={open}
        onCancel={handleClose}
        update={update}
        data={selectedPermission}
      />
      <Table
        pagination={false}
        columns={columns}
        dataSource={dataSource}
        loading={loading}
      />
    </>
  );
};

function UserManagements() {
  const queryClient = useQueryClient();
  const { data } = useSession();

  const { data: roles, isLoading: isLoadingRoles } = useQuery(
    ["roles"],
    () => getRoles(),
    {}
  );

  const { mutateAsync: roleUpdate, isLoading: isLoadingRoleUpdate } =
    useMutation((data) => updateRole(data), {
      onSuccess: () => {
        message.success("Berhasil mengubah role");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["roles"]);
      },
    });

  const { mutateAsync: roleDelete, isLoading: isLoadingRoleDelete } =
    useMutation((data) => deleteRole(data), {
      onSuccess: () => {
        message.success("Berhasil menghapus role");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["roles"]);
      },
    });

  const { data: permissions, isLoading: isLoadingPermissions } = useQuery(
    ["permissions"],
    () => getPermissions(),
    {}
  );

  const {
    mutateAsync: permissionUpdate,
    isLoading: isLoadingPermissionUpdate,
  } = useMutation((data) => updatePermission(data), {
    onSuccess: () => {
      message.success("Berhasil mengubah permission");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["permissions"]);
    },
  });

  const {
    mutateAsync: permissionDelete,
    isLoading: isLoadingPermissionDelete,
  } = useMutation((data) => deletePermission(data), {
    onSuccess: () => {
      message.success("Berhasil menghapus permission");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["permissions"]);
    },
  });

  return (
    <div>
      <Tabs type="card">
        <Tabs.TabPane tab="Roles Permissions" key="roles-permissions">
          <RolesPermissions />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Roles" key="roles">
          <CreateRole />
          <RoleTable
            loadingRemove={isLoadingRoleDelete}
            loadingUpdate={isLoadingRoleUpdate}
            remove={roleDelete}
            update={roleUpdate}
            dataSource={roles}
            loading={isLoadingRoles}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Permissions" key="permissions">
          <CreatePermissions />
          <PermissionTable
            dataSource={permissions}
            loading={isLoadingPermissions}
            remove={permissionDelete}
            update={permissionUpdate}
            loadingUpdate={isLoadingPermissionUpdate}
            loadingRemove={isLoadingPermissionDelete}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="User Roles" key="users">
          <UserRoles />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}

export default UserManagements;
