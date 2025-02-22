import React, { useState, useEffect } from 'react';
import { Button, Input, Space, Modal, Form, Popconfirm, App, List } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { saveClassTypes, getClassTypes } from '../utils/storage';

function ClassManagement({ onClassTypesUpdate }) {
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
    onClassTypesUpdate();
  };

  const handleDelete = async (type) => {
    const newTypes = classTypes.filter(t => t !== type);
    await saveClassTypes(newTypes);
    setClassTypes(newTypes);
    message.success('删除班级成功！');
    onClassTypesUpdate();
  };

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

      <List
        bordered
        dataSource={classTypes}
        renderItem={item => (
          <List.Item
            actions={[
              <Button 
                icon={<EditOutlined />} 
                onClick={() => {
                  setEditingClass(item);
                  form.setFieldsValue({ type: item });
                  setIsModalVisible(true);
                }}
              />,
              <Popconfirm
                title="确定要删除这个班级吗？"
                onConfirm={() => handleDelete(item)}
                okText="确定"
                cancelText="取消"
              >
                <Button 
                  danger 
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            ]}
          >
            {item}班
          </List.Item>
        )}
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
        width={520}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          style={{ 
            maxWidth: '100%',
            padding: '20px'
          }}
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
            <Space style={{ 
              display: 'flex',
              justifyContent: 'flex-start',
              width: '100%'
            }}>
              <Button 
                type="primary" 
                htmlType="submit"
              >
                确定
              </Button>
              <Button 
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                  setEditingClass(null);
                }}
              >
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