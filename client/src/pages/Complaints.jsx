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
  Tabs,
  Radio,
  Descriptions,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  CheckOutlined,
  PhoneOutlined,
  UserOutlined,
  UserAddOutlined,
  MessageOutlined,
  ExclamationCircleOutlined,
  SmileOutlined,
  MehOutlined,
  FrownOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Pie } from '@ant-design/charts';
import api from '../api';
import dayjs from 'dayjs';

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const statusMap = {
  pending: { color: 'orange', text: '待处理', icon: <ExclamationCircleOutlined /> },
  processing: { color: 'blue', text: '处理中', icon: <MessageOutlined /> },
  completed: { color: 'green', text: '已完成', icon: <CheckOutlined /> },
  revisited: { color: 'purple', text: '已回访', icon: <PhoneOutlined /> },
};

const typeIconMap = {
  菜品质量: <FrownOutlined style={{ color: '#f5222d' }} />,
  卫生问题: <MehOutlined style={{ color: '#fa8c16' }} />,
  服务态度: <MehOutlined style={{ color: '#1890ff' }} />,
  价格争议: <FrownOutlined style={{ color: '#722ed1' }} />,
  其他: <SmileOutlined />,
};

function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isRevisitModalOpen, setIsRevisitModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentComplaint, setCurrentComplaint] = useState(null);
  const [createForm] = Form.useForm();
  const [assignForm] = Form.useForm();
  const [completeForm] = Form.useForm();
  const [revisitForm] = Form.useForm();
  const [typeStats, setTypeStats] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [c, stats, adminsRes] = await Promise.all([
        api.get('/complaints'),
        api.get('/complaints/statistics/summary'),
        api.get('/daily/admins'),
      ]);
      setComplaints(c.data || []);
      setAdmins(adminsRes.data || []);
      setTypeStats(
        stats.data?.typeStats
          ? Object.entries(stats.data.typeStats).map(([type, value]) => ({
              type,
              value,
              color: typeIconMap[type]?.props?.style?.color || '#1890ff',
            }))
          : []
      );
    } catch (e) {
      message.error('加载数据失败');
    }
  };

  const handleCreate = async (values) => {
    try {
      await api.post('/complaints', values);
      message.success('投诉已受理');
      setIsCreateModalOpen(false);
      createForm.resetFields();
      loadData();
    } catch (e) {
      message.error('提交失败');
    }
  };

  const handleAssign = async (values) => {
    try {
      await api.put(`/complaints/${currentComplaint.id}/assign`, values);
      message.success('已派单');
      setIsAssignModalOpen(false);
      assignForm.resetFields();
      loadData();
    } catch (e) {
      message.error('派单失败');
    }
  };

  const handleComplete = async (values) => {
    try {
      await api.put(`/complaints/${currentComplaint.id}/complete`, values);
      message.success('处理完成');
      setIsCompleteModalOpen(false);
      completeForm.resetFields();
      loadData();
    } catch (e) {
      message.error('提交失败');
    }
  };

  const handleRevisit = async (values) => {
    try {
      await api.put(`/complaints/${currentComplaint.id}/revisit`, values);
      message.success('回访记录已保存');
      setIsRevisitModalOpen(false);
      revisitForm.resetFields();
      loadData();
    } catch (e) {
      message.error('提交失败');
    }
  };

  const openDetail = (record) => {
    setCurrentComplaint(record);
    setIsDetailModalOpen(true);
  };

  const openAssign = (record) => {
    setCurrentComplaint(record);
    assignForm.resetFields();
    setIsAssignModalOpen(true);
  };

  const openComplete = (record) => {
    setCurrentComplaint(record);
    completeForm.resetFields();
    setIsCompleteModalOpen(true);
  };

  const openRevisit = (record) => {
    setCurrentComplaint(record);
    revisitForm.resetFields();
    setIsRevisitModalOpen(true);
  };

  const filteredComplaints = statusFilter === 'all' ? complaints : complaints.filter((c) => c.status === statusFilter);

  const columns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (v) => (
        <Space>
          {typeIconMap[v]}
          <Tag color={statusMap[v]?.color || 'default'}>{v}</Tag>
        </Space>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '关联摊位',
      dataIndex: ['stall', 'name'],
      key: 'stall',
      width: 180,
      render: (v, row) =>
        v ? (
          <Space>
            <Tag color="blue">{row.stall?.stallNumber}</Tag>
            {v}
          </Space>
        ) : (
          <Tag>未关联</Tag>
        ),
    },
    {
      title: '投诉人',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 120,
      render: (v, row) => (
        <div>
          <div>
            <UserOutlined style={{ marginRight: 4 }} />
            {v || '匿名'}
          </div>
          {row.customerPhone && (
            <div style={{ color: '#999', fontSize: 12 }}>
              <PhoneOutlined style={{ marginRight: 4 }} />
              {row.customerPhone}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '处理人',
      dataIndex: ['assignee', 'name'],
      key: 'assignee',
      width: 120,
      render: (v, row) =>
        v ? (
          <div>
            <div>{v}</div>
            <div style={{ color: '#999', fontSize: 12 }}>{row.assignee?.role}</div>
          </div>
        ) : (
          <Tag color="orange">未派单</Tag>
        ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v) => {
        const s = statusMap[v] || { color: 'default', text: v };
        return (
          <Tag color={s.color} icon={s.icon}>
            {s.text}
          </Tag>
        );
      },
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, row) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => openDetail(row)}>
            详情
          </Button>
          {row.status === 'pending' && (
            <Button type="primary" size="small" icon={<UserAddOutlined />} onClick={() => openAssign(row)}>
              派单
            </Button>
          )}
          {row.status === 'processing' && (
            <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => openComplete(row)}>
              处理完成
            </Button>
          )}
          {row.status === 'completed' && !row.revisitResult && (
            <Button type="primary" size="small" icon={<PhoneOutlined />} onClick={() => openRevisit(row)}>
              回访
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const pieConfig = {
    data: typeStats,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: { text: 'value', style: { fontWeight: 'bold' } },
    legend: { color: { position: 'bottom' } },
  };

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
              <Statistic title="待处理" value={complaints.filter((c) => c.status === 'pending').length} valueStyle={{ color: '#fa8c16' }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <Statistic title="处理中" value={complaints.filter((c) => c.status === 'processing').length} valueStyle={{ color: '#1890ff' }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <Statistic title="已完成" value={complaints.filter((c) => c.status === 'completed').length} valueStyle={{ color: '#52c41a' }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <Statistic title="已回访" value={complaints.filter((c) => c.status === 'revisited').length} valueStyle={{ color: '#722ed1' }} />
            </Card>
          </Col>
        </Row>
      </motion.div>

      <Row gutter={16}>
        <Col xs={24} lg={18}>
          <Card>
            <Tabs defaultActiveKey="list">
              <TabPane tab="投诉列表" key="list">
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                  <Radio.Group value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <Radio.Button value="all">全部</Radio.Button>
                    <Radio.Button value="pending">待处理</Radio.Button>
                    <Radio.Button value="processing">处理中</Radio.Button>
                    <Radio.Button value="completed">已完成</Radio.Button>
                    <Radio.Button value="revisited">已回访</Radio.Button>
                  </Radio.Group>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>
                    受理投诉
                  </Button>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={statusFilter}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Table
                      columns={columns}
                      dataSource={filteredComplaints}
                      rowKey="id"
                      pagination={{ pageSize: 10 }}
                      scroll={{ x: 1200 }}
                    />
                  </motion.div>
                </AnimatePresence>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
        <Col xs={24} lg={6}>
          <Card title="投诉类型分布">
            <Pie {...pieConfig} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      <Modal
        title="受理投诉"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onOk={() => createForm.submit()}
        maskClosable={false}
        width={600}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="type" label="投诉类型" rules={[{ required: true }]}>
            <Select placeholder="请选择投诉类型">
              <Option value="菜品质量">菜品质量</Option>
              <Option value="卫生问题">卫生问题</Option>
              <Option value="服务态度">服务态度</Option>
              <Option value="价格争议">价格争议</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item name="stallId" label="关联摊位">
            <Select placeholder="请选择关联摊位（可选）" allowClear>
              {[
                { id: 1, stallNumber: 'A-001', name: '老北京炸酱面摊位' },
                { id: 2, stallNumber: 'A-002', name: '川味麻辣烫摊位' },
                { id: 3, stallNumber: 'A-003', name: '粤式茶餐厅摊位' },
              ].map((s) => (
                <Option key={s.id} value={s.id}>
                  {s.stallNumber} - {s.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="投诉内容" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="请详细描述投诉内容" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="customerName" label="投诉人姓名">
                <Input placeholder="请输入姓名（可选）" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="customerPhone" label="联系电话">
                <Input placeholder="请输入联系电话（可选）" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title="投诉派单"
        open={isAssignModalOpen}
        onCancel={() => setIsAssignModalOpen(false)}
        onOk={() => assignForm.submit()}
        maskClosable={false}
      >
        <Form form={assignForm} layout="vertical" onFinish={handleAssign}>
          <Form.Item name="assigneeId" label="指派处理人" rules={[{ required: true }]}>
            <Select placeholder="请选择处理人">
              {admins.map((a) => (
                <Option key={a.id} value={a.id}>
                  {a.name} - {a.role} ({a.department})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="投诉处理完成"
        open={isCompleteModalOpen}
        onCancel={() => setIsCompleteModalOpen(false)}
        onOk={() => completeForm.submit()}
        maskClosable={false}
      >
        <Form form={completeForm} layout="vertical" onFinish={handleComplete}>
          <Form.Item name="handleResult" label="处理结果" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="请详细描述处理结果" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="顾客回访"
        open={isRevisitModalOpen}
        onCancel={() => setIsRevisitModalOpen(false)}
        onOk={() => revisitForm.submit()}
        maskClosable={false}
      >
        <Form form={revisitForm} layout="vertical" onFinish={handleRevisit}>
          <Form.Item name="revisitResult" label="回访结果" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="请记录顾客回访结果及满意度" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="投诉详情"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={700}
      >
        {currentComplaint && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="投诉类型">
                <Space>
                  {typeIconMap[currentComplaint.type]}
                  <Tag color={statusMap[currentComplaint.status]?.color}>{currentComplaint.type}</Tag>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusMap[currentComplaint.status]?.color}>
                  {statusMap[currentComplaint.status]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="关联摊位">
                {currentComplaint.stall ? `${currentComplaint.stall.stallNumber} - ${currentComplaint.stall.name}` : '无'}
              </Descriptions.Item>
              <Descriptions.Item label="提交时间">
                {dayjs(currentComplaint.createdAt).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="投诉人">
                {currentComplaint.customerName || '匿名'}
              </Descriptions.Item>
              <Descriptions.Item label="联系电话">
                {currentComplaint.customerPhone || '-'}
              </Descriptions.Item>
            </Descriptions>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="投诉内容">{currentComplaint.description}</Descriptions.Item>
            </Descriptions>
            {currentComplaint.assignee && (
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="处理人">
                  {currentComplaint.assignee.name}（{currentComplaint.assignee.role}）
                </Descriptions.Item>
                <Descriptions.Item label="所属部门">
                  {currentComplaint.assignee.department}
                </Descriptions.Item>
              </Descriptions>
            )}
            {currentComplaint.handleResult && (
              <>
                <Divider orientation="left">处理结果</Divider>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="处理结果" span={2}>
                    {currentComplaint.handleResult}
                  </Descriptions.Item>
                  <Descriptions.Item label="处理时间">
                    {dayjs(currentComplaint.handleAt).format('YYYY-MM-DD HH:mm')}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}
            {currentComplaint.revisitResult && (
              <>
                <Divider orientation="left">回访记录</Divider>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="回访结果" span={2}>
                    {currentComplaint.revisitResult}
                  </Descriptions.Item>
                  <Descriptions.Item label="回访时间">
                    {dayjs(currentComplaint.revisitAt).format('YYYY-MM-DD HH:mm')}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}
          </Space>
        )}
      </Modal>
    </Space>
  );
}

export default Complaints;
