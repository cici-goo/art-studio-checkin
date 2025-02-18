import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Modal, Form, Select, Popconfirm, Tabs, InputNumber, Divider, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { saveStudents, getStudents, addLessonRecord } from '../utils/storage';

const { Search } = Input;

function StudentManagement({ classTypes }) {
  const { message } = App.useApp();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form] = Form.useForm();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // 修改为异步加载
    async function loadData() {
      try {
        const savedStudents = await getStudents();
        if (savedStudents && savedStudents.length > 0) {  // 添加检查
          setStudents(savedStudents);
          setFilteredStudents(savedStudents);
        }
      } catch (error) {
        console.error('Error loading students:', error);
      }
    }
    loadData();
  }, []); // 依赖数组保持空

  const handleSearch = (value) => {
    const filtered = students.filter(student => 
      student.name.includes(value) || 
      student.studentId.includes(value)
    );
    setFilteredStudents(filtered);
  };

  const handleCheckin = async (studentId) => {
    const student = students.find(s => s.studentId === studentId);
    if (!student) return;

    const currentLessons = student.lessons || 0;
    if (currentLessons <= 0) {
      message.error('打卡失败，课时数不足');
      return;
    }

    const newStudents = students.map(s => {
      if (s.studentId === studentId) {
        return addLessonRecord(s, -1, '课程打卡');
      }
      return s;
    });

    // 异步保存
    await saveStudents(newStudents);
    setStudents(newStudents);
    setFilteredStudents(newStudents);
    message.success('打卡成功');
  };

  const handleSubmit = async (values) => {
    const oldStudent = editingStudent || { records: [] };
    const newLessons = Number(values.lessons) || 0;
    
    let updatedStudent = {
      ...values,
      key: editingStudent ? editingStudent.key : Date.now().toString(),
      records: oldStudent.records || [],
      lessons: newLessons
    };

    let newStudents;
    if (editingStudent) {
      updatedStudent = {
        ...updatedStudent,
        lastCheckin: oldStudent.lastCheckin,
        records: [
          ...(oldStudent.records || []),
          {
            time: new Date().toISOString(),
            change: newLessons - (oldStudent.lessons || 0),
            remaining: newLessons,
            note: '课时调整',
            id: Date.now().toString()
          }
        ]
      };
      
      newStudents = students.map(student => 
        student.key === editingStudent.key ? updatedStudent : student
      );
    } else {
      updatedStudent = {
        ...updatedStudent,
        records: [{
          time: new Date().toISOString(),
          change: newLessons,
          remaining: newLessons,
          note: '初始课时',
          id: Date.now().toString()
        }]
      };
      newStudents = [...students, updatedStudent];
    }

    // 异步保存
    await saveStudents(newStudents);
    setStudents(newStudents);
    setFilteredStudents(newStudents);
    setIsModalVisible(false);
    form.resetFields();
    setEditingStudent(null);
    message.success(`${editingStudent ? '编辑' : '添加'}学生成功！`);
  };

  const handleEdit = (record) => {
    setEditingStudent(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (studentId) => {
    const newStudents = students.filter(student => student.studentId !== studentId);
    // 异步保存
    await saveStudents(newStudents);
    setStudents(newStudents);
    setFilteredStudents(newStudents);
    message.success('删除成功！');
  };

  const exportToExcel = () => {
    // 获取今天的开始时间（零点）
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const data = filteredStudents.map(({ name, studentId, lessons, classType, lastCheckin }) => {
      // 检查最后打卡时间是否是今天
      const checkinTime = lastCheckin ? new Date(lastCheckin) : null;
      const isCheckedToday = checkinTime && checkinTime >= today;

      return {
        姓名: name,
        学号: studentId,
        课时数: lessons || 0,
        班级: classType,
        最后打卡时间: isCheckedToday ? checkinTime.toLocaleString() : '未打卡'
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "学生信息");
    
    // 在文件名中添加日期
    const dateStr = today.toLocaleDateString().replace(/\//g, '-');
    XLSX.writeFile(wb, `学生打卡记录-${dateStr}.xlsx`);
  };

  const exportPersonalRecord = (student) => {
    const records = student.records || [];
    const data = records.map(record => ({
      时间: new Date(record.time).toLocaleString(),
      变动: record.change > 0 ? `+${record.change}` : record.change,
      剩余课时: record.remaining,
      备注: record.note || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "课时记录");
    XLSX.writeFile(wb, `${student.name}-课时记录.xlsx`);
  };

  const showRecords = (student) => {
    setSelectedStudent(student);
    setRecordModalVisible(true);
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '学号',
      dataIndex: 'studentId',
      key: 'studentId',
    },
    {
      title: '课时数',
      dataIndex: 'records',
      key: 'lessons',
      render: (records = [], record) => {
        return Math.max(0, record.lessons || 0);
      },
    },
    {
      title: '班级类型',
      dataIndex: 'classType',
      key: 'classType',
    },
    {
      title: '最后打卡时间',
      dataIndex: 'lastCheckin',
      key: 'lastCheckin',
      render: (time) => time ? new Date(time).toLocaleString() : '未打卡',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            onClick={() => handleCheckin(record.studentId)}
          >
            打卡
          </Button>
          <Button 
            onClick={() => showRecords(record)}
          >
            课时记录
          </Button>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确定要删除这个学生吗？"
            onConfirm={() => handleDelete(record.studentId)}
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
            setEditingStudent(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          添加学生
        </Button>
        <Search
          placeholder="搜索学生姓名或学号"
          allowClear
          style={{ width: 300 }}
          onSearch={handleSearch}
        />
        <Button 
          icon={<DownloadOutlined />}
          onClick={exportToExcel}
        >
          导出Excel
        </Button>
      </Space>
      
      <Divider orientation="left">班级分区</Divider>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        items={[
          { key: 'all', label: '全部学生' },
          ...classTypes.map(type => ({
            key: type,
            label: `${type}班`
          }))
        ]}
        style={{ marginBottom: 16 }}
      />

      <Table 
        columns={columns} 
        dataSource={activeTab === 'all' 
          ? filteredStudents 
          : filteredStudents.filter(s => s.classType === activeTab)
        }
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingStudent ? "编辑学生" : "添加学生"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingStudent(null);
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item 
            label="姓名" 
            name="name" 
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item 
            label="学号" 
            name="studentId" 
            rules={[
              { required: true, message: '请输入学号' },
              {
                validator: async (_, value) => {
                  if (value && students.some(s => 
                    s.studentId === value && 
                    (!editingStudent || s.key !== editingStudent.key)
                  )) {
                    throw new Error('学号已存在');
                  }
                }
              }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item 
            label="班级类型" 
            name="classType" 
            rules={[{ required: true, message: '请选择班级类型' }]}
          >
            <Select>
              {classTypes.map(type => (
                <Select.Option key={type} value={type}>{type}班</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item 
            label="课时数" 
            name="lessons" 
            initialValue={0}
            rules={[
              { required: true, message: '请输入课时数' },
              { type: 'number', min: 0, message: '课时数必须大于或等于0' }
            ]}
          >
            <InputNumber min={0} precision={0} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
                setEditingStudent(null);
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`${selectedStudent?.name || ''} 的课时记录`}
        open={recordModalVisible}
        onCancel={() => setRecordModalVisible(false)}
        footer={[
          <Button key="export" onClick={() => exportPersonalRecord(selectedStudent)}>
            导出记录
          </Button>,
          <Button key="close" onClick={() => setRecordModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        <Table
          dataSource={selectedStudent?.records || []}
          columns={[
            {
              title: '时间',
              dataIndex: 'time',
              key: 'time',
              render: (time) => new Date(time).toLocaleString()
            },
            {
              title: '变动',
              dataIndex: 'change',
              key: 'change',
              render: (change) => change > 0 ? `+${change}` : change
            },
            {
              title: '剩余课时',
              dataIndex: 'remaining',
              key: 'remaining'
            },
            {
              title: '备注',
              dataIndex: 'note',
              key: 'note'
            }
          ]}
          pagination={false}
        />
      </Modal>
    </div>
  );
}

export default StudentManagement; 