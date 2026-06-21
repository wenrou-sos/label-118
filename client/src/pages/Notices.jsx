import React, { useState, useEffect } from 'react';
import {
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Card,
  Statistic,
  Row,
  Col,
  message,
  Popconfirm,
  Drawer,
  Divider,
  Switch,
} from 'antd';
import {
  PlusOutlined,
  BellOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PushpinOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const priorityMap = {
  high: { color: 'red', text: '重要' },
  normal: { color: 'blue', text: '普通' },
  low: { color: 'default', text: '一般' },
};

const statusMap = {
  published: { color: 'green', text: '已发布' },
  draft: { color: 'default', text: '草稿' },
  archived: { color: 'gray', text: '已归档' },
};

function Notices() {
  const [notices, setNotices] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [currentNotice, setCurrentNotice] = useState(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/notices');
      setNotices(res.data || []);
    } catch (e) {
      message.error('加载数据失败');
    }
  };

  const handleCreate = async (values) => {
    try {
      await api.post('/notices', values);
      message.success('通知已发布');
      setIsCreateModalOpen(false);
      createForm.resetFields();
      loadData();
    } catch (e) {
      message.error('发布通知失败');
    }
  };

  const handleEdit = async (values) => {
    try {
      await api.put(`/notices/${currentNotice.id}`, values);
      message.success('通知已更新');
      setIsEditModalOpen(false);
      editForm.resetFields();
      loadData();
    } catch (e) {
      message.error('更新通知失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notices/${id}`);
      message.success('通知已删除');
      loadData();
    } catch (e) {
      message.error('删除通知失败');
    }
  };

  const handleToggleTop = async (record) => {
    try {
      await api.put(`/notices/${record.id}`, { isTop: !record.isTop });
      message.success(record.isTop ? '已取消置顶' : '已置顶');
      loadData();
    } catch (e) {
      message.error('操作失败');
    }
  };

  const openCreate = () => {
    createForm.resetFields();
    setIsCreateModalOpen(true);
  };

  const openEdit = (record) => {
    setCurrentNotice(record);
    editForm.setFieldsValue({
      title: record.title,
      content: record.content,
      priority: record.priority,
      isTop: record.isTop,
    });
    setIsEditModalOpen(true);
  };

  const openDetail = (record) => {
    setCurrentNotice(record);
    setIsDetailDrawerOpen(true);
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (v, row) => (
        <Space>
          {row.isTop && (
            <Tag color="red" icon={<PushpinOutlined />}>
              置顶
            </Tag>
          )}
          <a onClick={() => openDetail(row)} style={{ fontWeight: 500 }}>
            {v}
          </a>
        </Space>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (v) => {
        const p = priorityMap[v] || { color: 'default', text: v };
        return <Tag color={p.color}>{p.text}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v) => {
        const s = statusMap[v] || { color: 'default', text: v };
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    {
      title: '发布人',
      dataIndex: 'publisher',
      key: 'publisher',
      width: 120,
      render: (v) => v?.name || '系统管理员',
    },
    {
      title: '发布时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 220,
      fixed: 'right',
      render: (_, row) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => openDetail(row)}>
            查看
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(row)}>
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            icon={<PushpinOutlined />}
            onClick={() => handleToggleTop(row)}
          >
            {row.isTop ? '取消置顶' : '置顶'}
          </Button>
          <Popconfirm title="确定删除此通知？" onConfirm={() => handleDelete(row.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const publishedCount = notices.filter((n) => n.status === 'published').length;
  const topCount = notices.filter((n) => n.isTop).length;
  const highPriorityCount = notices.filter((n) => n.priority === 'high').length;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Row gutter={16}>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <Statistic
                title="通知总数"
                value={notices.length}
                valueStyle={{ color: '#1890ff' }}
                prefix={<BellOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <Statistic
                title="已发布"
                value={publishedCount}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <Statistic
                title="置顶通知"
                value={topCount}
                valueStyle={{ color: '#f5222d' }}
                prefix={<PushpinOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <Statistic
                title="重要通知"
                value={highPriorityCount}
                valueStyle={{ color: '#fa541c' }}
              />
            </Card>
          </Col>
        </Row>
      </motion.div>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>通知公告列表</h3>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            发布通知
          </Button>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Table
              columns={columns}
              dataSource={notices}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 900 }}
            />
          </motion.div>
        </AnimatePresence>
      </Card>

      <Modal
        title="发布通知"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onOk={() => createForm.submit()}
        maskClosable={false}
        width={600}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="title" label="通知标题" rules={[{ required: true, message: '请输入通知标题' }]}>
            <Input placeholder="请输入通知标题" maxLength={100} showCount />
          </Form.Item>
          <Form.Item name="priority" label="优先级" initialValue="normal">
            <Select placeholder="请选择优先级">
              <Option value="high">重要</Option>
              <Option value="normal">普通</Option>
              <Option value="low">一般</Option>
            </Select>
          </Form.Item>
          <Form.Item name="isTop" label="置顶" valuePropName="checked" initialValue={false}>
            <Switch />
          </Form.Item>
          <Form.Item name="content" label="通知内容" rules={[{ required: true, message: '请输入通知内容' }]}>
            <TextArea rows={6} placeholder="请输入通知内容" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="编辑通知"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={() => editForm.submit()}
        maskClosable={false}
        width={600}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Form.Item name="title" label="通知标题" rules={[{ required: true, message: '请输入通知标题' }]}>
            <Input placeholder="请输入通知标题" maxLength={100} showCount />
          </Form.Item>
          <Form.Item name="priority" label="优先级">
            <Select placeholder="请选择优先级">
              <Option value="high">重要</Option>
              <Option value="normal">普通</Option>
              <Option value="low">一般</Option>
            </Select>
          </Form.Item>
          <Form.Item name="isTop" label="置顶" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="content" label="通知内容" rules={[{ required: true, message: '请输入通知内容' }]}>
            <TextArea rows={6} placeholder="请输入通知内容" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="通知详情"
        placement="right"
        width={600}
        open={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
      >
        {currentNotice && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Space style={{ marginBottom: 12 }}>
                {currentNotice.isTop && (
                  <Tag color="red" icon={<PushpinOutlined />}>
                    置顶
                  </Tag>
                )}
                <Tag color={priorityMap[currentNotice.priority]?.color || 'default'}>
                  {priorityMap[currentNotice.priority]?.text || '普通'}
                </Tag>
                <Tag color={statusMap[currentNotice.status]?.color || 'default'}>
                  {statusMap[currentNotice.status]?.text || '已发布'}
                </Tag>
              </Space>
              <h2 style={{ marginTop: 0 }}>{currentNotice.title}</h2>
              <div style={{ color: '#666', marginBottom: 16 }}>
                <Space size="large">
                  <span>
                    <UserOutlined style={{ marginRight: 4 }} />
                    {currentNotice.publisher?.name || '系统管理员'}
                    {currentNotice.publisher?.role && ` (${currentNotice.publisher.role})`}
                  </span>
                  <span>
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    {dayjs(currentNotice.createdAt).format('YYYY-MM-DD HH:mm')}
                  </span>
                </Space>
              </div>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <div
              className="notice-content"
              style={{
                whiteSpace: 'pre-wrap',
                lineHeight: 1.8,
                fontSize: 14,
                color: '#333',
              }}
            >
              {currentNotice.content}
            </div>
          </Space>
        )}
      </Drawer>
    </Space>
  );
}

export default Notices;
