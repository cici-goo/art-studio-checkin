import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Modal, Form, Popconfirm, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { saveClassTypes, getClassTypes } from '../utils/storage';

function ClassManagement() {
  const { message } = App.useApp();
  const [classTypes, setClassTypes] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    async function loadClassTypes() {
      try {
        const types = await getClassTypes();
        if (types && types.length > 0) {
          setClassTypes(types);
        }
      } catch (error) {
        console.error('Error loading class types:', error);
      }
    }
    loadClassTypes();
  }, []);

  const handleSubmit = async (values) => {
    let newTypes;
    if (editingClass) {
      newTypes = classTypes.map(type => 
        type === editingClass ? values.type : type
      );
    } else {
      newTypes = [...classTypes, values.type];
    }
    
    await saveClassTypes(newTypes);
    setClassTypes(newTypes);
    setIsModalVisible(false);
    form.resetFields();
    setEditingClass(null);
    message.success(`${editingClass ? '编辑' : '添加'}班级成功！`);
  };

  const handleDelete = async (type) => {
    const newTypes = classTypes.filter(t => t !== type);
    await saveClassTypes(newTypes);
    setClassTypes(newTypes);
    message.success('删除班级成功！');
  };

  const columns = [
    {
      title: '班级类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => `${type}班`,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => {
              setEditingClass(record.type);
              form.setFieldsValue({ type: record.type });
              setIsModalVisible(true);
            }}
          />
          <Popconfirm
            title="确定要删除这个班级吗？"
            onConfirm={() => handleDelete(record.type)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              danger 
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingClass(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          添加班级类型
        </Button>
      </Space>
      
      <Table 
        columns={columns} 
        dataSource={classTypes.map(type => ({ key: type, type }))}
      />

      <Modal
        title={editingClass ? "编辑班级" : "添加班级"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingClass(null);
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item 
            label="班级类型" 
            name="type" 
            rules={[
              { required: true, message: '请输入班级类型' },
              {
                validator: async (_, value) => {
                  if (value && classTypes.includes(value) && value !== editingClass) {
                    throw new Error('班级类型已存在');
                  }
                }
              }
            ]}
          >
            <Input placeholder="请输入班级类型（如：A、B、C）" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
                setEditingClass(null);
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ClassManagement; 