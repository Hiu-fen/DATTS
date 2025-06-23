import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Popconfirm, Modal, Form, Input, Tabs, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface VariantValue {
  value: string;
  key: number;
}

const VariantList = () => {
  const [variantNames, setVariantNames] = useState<string[]>([]);
  const [variantValues, setVariantValues] = useState<Record<string, VariantValue[]>>({});
  const [activeName, setActiveName] = useState<string>('');
  const [isEditNameModal, setIsEditNameModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [isEditValueModal, setIsEditValueModal] = useState(false);
  const [editValue, setEditValue] = useState<VariantValue | null>(null);
  const [formName] = Form.useForm();
  const [formValue] = Form.useForm();

  useEffect(() => {
    const names = JSON.parse(localStorage.getItem('variantNames') || '[]');
    const values = JSON.parse(localStorage.getItem('variantValues') || '{}');
    setVariantNames(names);
    setVariantValues(values);
    setActiveName(names[0] || '');
  }, []);

  // Sửa tên biến thể
  const handleEditName = () => {
    setEditName(activeName);
    formName.setFieldsValue({ name: activeName });
    setIsEditNameModal(true);
  };

  const handleUpdateName = (values: { name: string }) => {
    if (variantNames.includes(values.name)) {
      message.error('Tên biến thể đã tồn tại!');
      return;
    }
    // Cập nhật tên trong danh sách tên
    const newNames = variantNames.map((n) => (n === activeName ? values.name : n));
    // Cập nhật key trong variantValues
    const newValues: Record<string, VariantValue[]> = {};
    Object.keys(variantValues).forEach((k) => {
      if (k === activeName) {
        newValues[values.name] = variantValues[k];
      } else {
        newValues[k] = variantValues[k];
      }
    });
    setVariantNames(newNames);
    setVariantValues(newValues);
    setActiveName(values.name);
    localStorage.setItem('variantNames', JSON.stringify(newNames));
    localStorage.setItem('variantValues', JSON.stringify(newValues));
    setIsEditNameModal(false);
    message.success('Đã cập nhật tên biến thể!');
  };

  // Xóa tên biến thể
  const handleDeleteName = () => {
    const newNames = variantNames.filter((n) => n !== activeName);
    const newValues = { ...variantValues };
    delete newValues[activeName];
    setVariantNames(newNames);
    setVariantValues(newValues);
    setActiveName(newNames[0] || '');
    localStorage.setItem('variantNames', JSON.stringify(newNames));
    localStorage.setItem('variantValues', JSON.stringify(newValues));
    message.success('Đã xóa tên biến thể!');
  };

  // Sửa giá trị biến thể
  const handleEditValue = (record: VariantValue) => {
    setEditValue(record);
    formValue.setFieldsValue({ value: record.value });
    setIsEditValueModal(true);
  };

  const handleUpdateValue = (values: { value: string }) => {
    if (!editValue) return;
    const list = (variantValues[activeName] || []).map((item) =>
      item.key === editValue.key ? { ...item, value: values.value } : item
    );
    const newValues = { ...variantValues, [activeName]: list };
    setVariantValues(newValues);
    localStorage.setItem('variantValues', JSON.stringify(newValues));
    setIsEditValueModal(false);
    setEditValue(null);
    message.success('Đã cập nhật giá trị!');
  };

  // Xóa giá trị biến thể
  const handleDeleteValue = (key: number) => {
    const list = (variantValues[activeName] || []).filter((item) => item.key !== key);
    const newValues = { ...variantValues, [activeName]: list };
    setVariantValues(newValues);
    localStorage.setItem('variantValues', JSON.stringify(newValues));
    message.success('Đã xóa giá trị!');
  };

  const columns = [
    {
      title: 'Giá trị',
      dataIndex: 'value',
      key: 'value',
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center' as const,
      render: (_: any, record: VariantValue) => (
        <>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEditValue(record)}
            size="small"
            style={{ marginRight: 8 }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn chắc chắn muốn xóa giá trị này?"
            onConfirm={() => handleDeleteValue(record.key)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Xóa
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div className="flex justify-center items-center min-h-[60vh] bg-gray-50">
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 22 }}>Danh sách biến thể</span>
            {activeName && (
              <>
                <Button type="link" onClick={handleEditName} icon={<EditOutlined />}>
                  Sửa tên
                </Button>
                <Popconfirm
                  title="Bạn chắc chắn muốn xóa tên biến thể này và toàn bộ giá trị?"
                  onConfirm={handleDeleteName}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Button type="link" danger icon={<DeleteOutlined />}>
                    Xóa tên
                  </Button>
                </Popconfirm>
              </>
            )}
          </div>
        }
        bordered={false}
        style={{ width: 600, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
      >
        <Tabs
          activeKey={activeName}
          onChange={setActiveName}
          items={variantNames.map((name) => ({
            key: name,
            label: name,
          }))}
        />
        <Table
          columns={columns}
          dataSource={variantValues[activeName] || []}
          pagination={false}
          rowKey="key"
        />
      </Card>

      {/* Modal sửa tên biến thể */}
      <Modal
        title="Sửa tên biến thể"
        open={isEditNameModal}
        onCancel={() => setIsEditNameModal(false)}
        onOk={() => formName.submit()}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={formName} layout="vertical" onFinish={handleUpdateName}>
          <Form.Item
            label="Tên biến thể"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên biến thể!' }]}
          >
            <Input placeholder="Nhập tên biến thể mới" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal sửa giá trị biến thể */}
      <Modal
        title="Sửa giá trị biến thể"
        open={isEditValueModal}
        onCancel={() => setIsEditValueModal(false)}
        onOk={() => formValue.submit()}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={formValue} layout="vertical" onFinish={handleUpdateValue}>
          <Form.Item
            label="Giá trị"
            name="value"
            rules={[{ required: true, message: 'Vui lòng nhập giá trị!' }]}
          >
            <Input placeholder="Nhập giá trị mới" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VariantList;