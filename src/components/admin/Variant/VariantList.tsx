import React, { useEffect, useState } from 'react';
import { Button, Card, Form, Input, Modal, message } from 'antd';
import axios from 'axios';

interface VariantData {
  id: number;
  ram: string[];
  color: string[];
}

const VariantPage = () => {
  const [form] = Form.useForm();
  const [variants, setVariants] = useState<VariantData | null>(null);
  const [modalType, setModalType] = useState<'ram' | 'color' | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isEdit, setIsEdit] = useState(false);

  const fetchVariants = async () => {
    try {
      const res = await axios.get('http://localhost:4000/variants');
      setVariants(res.data[0]);
    } catch {
      message.error('Không thể tải dữ liệu biến thể');
    }
  };

  useEffect(() => {
    fetchVariants();
  }, []);

  const handleAdd = async (values: { value: string }) => {
    if (!modalType || !variants) return;
    const value = values.value.trim();
    const currentList = variants[modalType];
    if (currentList.map(v => v.toLowerCase()).includes(value.toLowerCase())) {
      return message.error('Giá trị đã tồn tại');
    }
    const updated = { ...variants, [modalType]: [...currentList, value] };
    await axios.put(`http://localhost:4000/variants/${variants.id}`, updated);
    message.success(`Đã thêm ${modalType}`);
    setModalType(null);
    form.resetFields();
    fetchVariants();
  };

  const handleEdit = async () => {
    if (editIndex === null || !modalType || !variants) return;
    const value = editValue.trim();
    if (!value) return message.error('Không được để trống');

    const list = [...variants[modalType]];
    if (
      list.some((v, i) => i !== editIndex && v.toLowerCase() === value.toLowerCase())
    ) {
      return message.error('Giá trị đã tồn tại');
    }

    list[editIndex] = value;
    const updated = { ...variants, [modalType]: list };
    await axios.put(`http://localhost:4000/variants/${variants.id}`, updated);
    message.success('Sửa thành công');
    setIsEdit(false);
    setModalType(null); // ✅ Reset modal sau khi sửa
    setEditIndex(null);
    setEditValue('');
    fetchVariants();
  };

  const handleDelete = (index: number, type: 'ram' | 'color') => {
    Modal.confirm({
      title: `Bạn có chắc chắn muốn xóa giá trị này khỏi ${type.toUpperCase()}?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        if (!variants) return;
        const list = [...variants[type]];
        list.splice(index, 1);
        const updated = { ...variants, [type]: list };
        await axios.put(`http://localhost:4000/variants/${variants.id}`, updated);
        message.success('Xóa thành công');
        fetchVariants();
      },
    });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-[80vh] grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* RAM Card */}
      <Card
        title="RAM"
        extra={
          <Button type="primary" onClick={() => {
            setModalType('ram');
            setIsEdit(false);
          }}>
            ➕ Thêm RAM
          </Button>
        }
      >
        {variants?.ram?.map((val, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center py-1 border-b last:border-none"
          >
            <span>{val}</span>
            <div className="flex gap-2">
              <Button
                size="small"
                type="link"
                onClick={() => {
                  setModalType('ram');
                  setEditValue(val);
                  setEditIndex(idx);
                  setIsEdit(true);
                }}
              >
                Sửa
              </Button>
              <Button
                size="small"
                type="link"
                danger
                onClick={() => handleDelete(idx, 'ram')}
              >
                Xóa
              </Button>
            </div>
          </div>
        ))}
      </Card>

      {/* COLOR Card */}
      <Card
        title="Color"
        extra={
          <Button type="primary" onClick={() => {
            setModalType('color');
            setIsEdit(false);
          }}>
            ➕ Thêm Color
          </Button>
        }
      >
        {variants?.color?.map((val, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center py-1 border-b last:border-none"
          >
            <span>{val}</span>
            <div className="flex gap-2">
              <Button
                size="small"
                type="link"
                onClick={() => {
                  setModalType('color');
                  setEditValue(val);
                  setEditIndex(idx);
                  setIsEdit(true);
                }}
              >
                Sửa
              </Button>
              <Button
                size="small"
                type="link"
                danger
                onClick={() => handleDelete(idx, 'color')}
              >
                Xóa
              </Button>
            </div>
          </div>
        ))}
      </Card>

      {/* Modal Thêm */}
      <Modal
        open={!!modalType && !isEdit}
        title={`Thêm ${modalType?.toUpperCase()}`}
        onCancel={() => {
          setModalType(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Thêm"
      >
        <Form form={form} onFinish={handleAdd} layout="vertical">
          <Form.Item
            label={`Giá trị ${modalType?.toUpperCase()}`}
            name="value"
            rules={[{ required: true, message: 'Vui lòng nhập giá trị!' }]}
          >
            <Input placeholder="Nhập giá trị mới" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Sửa */}
      <Modal
        open={isEdit}
        title={`Sửa ${modalType?.toUpperCase()}`}
        onCancel={() => {
          setIsEdit(false);
          setModalType(null);
          setEditIndex(null);
          setEditValue('');
        }}
        onOk={handleEdit}
        okText="Lưu"
      >
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder="Nhập giá trị mới"
        />
      </Modal>
    </div>
  );
};

export default VariantPage;
