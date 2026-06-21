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
  InputNumber,
  DatePicker,
  Card,
  Statistic,
  Row,
  Col,
  Tabs,
  message,
  Popconfirm,
  Avatar,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  DeleteOutlined,
  WarningOutlined,
  ExclamationCircleFilled,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import dayjs from 'dayjs';

const { Option } = Select;
const { TabPane } = Tabs;

const mockStalls = [
  {
    id: 1,
    stallNumber: 'A-001',
    name: '老北京炸酱面摊位',
    location: 'A区1号',
    area: 25,
    hygieneLevel: 'A',
    status: 'normal',
    merchant: { id: 1, name: '老北京炸酱面', contactPerson: '王老板', phone: '13900139001', businessCategory: '面食' },
    lease: { id: 1, startDate: '2025-05-20T00:00:00.000Z', endDate: '2026-05-20T00:00:00.000Z', monthlyRent: 5000, deposit: 10000, status: 'active' },
  },
  {
    id: 2,
    stallNumber: 'A-002',
    name: '川味麻辣烫摊位',
    location: 'A区2号',
    area: 20,
    hygieneLevel: 'B',
    status: 'normal',
    merchant: { id: 2, name: '川味麻辣烫', contactPerson: '李老板', phone: '13900139002', businessCategory: '小吃' },
    lease: { id: 2, startDate: '2025-04-20T00:00:00.000Z', endDate: '2026-07-20T00:00:00.000Z', monthlyRent: 5500, deposit: 10000, status: 'active' },
  },
  {
    id: 3,
    stallNumber: 'A-003',
    name: '粤式茶餐厅摊位',
    location: 'A区3号',
    area: 40,
    hygieneLevel: 'A',
    status: 'normal',
    merchant: { id: 3, name: '粤式茶餐厅', contactPerson: '张老板', phone: '13900139003', businessCategory: '茶餐厅' },
    lease: { id: 3, startDate: '2025-03-20T00:00:00.000Z', endDate: '2026-09-20T00:00:00.000Z', monthlyRent: 6000, deposit: 15000, status: 'active' },
  },
  {
    id: 4,
    stallNumber: 'B-001',
    name: '日式料理摊位',
    location: 'B区1号',
    area: 35,
    hygieneLevel: 'A',
    status: 'normal',
    merchant: { id: 4, name: '日式料理', contactPerson: '刘老板', phone: '13900139004', businessCategory: '日料' },
    lease: { id: 4, startDate: '2025-02-20T00:00:00.000Z', endDate: '2026-07-20T00:00:00.000Z', monthlyRent: 6500, deposit: 15000, status: 'active' },
  },
  {
    id: 5,
    stallNumber: 'B-002',
    name: '韩式烤肉摊位',
    location: 'B区2号',
    area: 30,
    hygieneLevel: 'B',
    status: 'normal',
    merchant: { id: 5, name: '韩式烤肉', contactPerson: '金老板', phone: '13900139005', businessCategory: '烧烤' },
    lease: { id: 5, startDate: '2025-01-20T00:00:00.000Z', endDate: '2026-06-20T00:00:00.000Z', monthlyRent: 7000, deposit: 15000, status: 'active' },
  },
  {
    id: 6,
    stallNumber: 'B-003',
    name: '甜品工坊摊位',
    location: 'B区3号',
    area: 15,
    hygieneLevel: 'A',
    status: 'normal',
    merchant: { id: 6, name: '甜品工坊', contactPerson: '陈老板', phone: '13900139006', businessCategory: '甜品' },
    lease: { id: 6, startDate: '2024-12-20T00:00:00.000Z', endDate: '2026-06-25T00:00:00.000Z', monthlyRent: 5500, deposit: 10000, status: 'active' },
  },
  {
    id: 7,
    stallNumber: 'C-001',
    name: '鲜果吧摊位',
    location: 'C区1号',
    area: 12,
    hygieneLevel: 'C',
    status: 'normal',
    merchant: { id: 7, name: '鲜果吧', contactPerson: '周老板', phone: '13900139007', businessCategory: '饮品' },
    lease: { id: 7, startDate: '2024-11-20T00:00:00.000Z', endDate: '2026-06-30T00:00:00.000Z', monthlyRent: 6000, deposit: 10000, status: 'active' },
  },
  {
    id: 8,
    stallNumber: 'C-002',
    name: '汉堡之家摊位',
    location: 'C区2号',
    area: 22,
    hygieneLevel: 'B',
    status: 'normal',
    merchant: { id: 8, name: '汉堡之家', contactPerson: '吴老板', phone: '13900139008', businessCategory: '快餐' },
    lease: { id: 8, startDate: '2024-10-20T00:00:00.000Z', endDate: '2026-07-10T00:00:00.000Z', monthlyRent: 6500, deposit: 10000, status: 'active' },
  },
];

const mockWarningLeases = [
  {
    id: 5,
    stall: { id: 5, stallNumber: 'B-002', name: '韩式烤肉摊位' },
    merchant: { id: 5, name: '韩式烤肉', contactPerson: '金老板', phone: '13900139005' },
    startDate: '2025-01-20T00:00:00.000Z',
    endDate: dayjs().add(10, 'day').toISOString(),
    monthlyRent: 7000,
    status: 'active',
  },
  {
    id: 6,
    stall: { id: 6, stallNumber: 'B-003', name: '甜品工坊摊位' },
    merchant: { id: 6, name: '甜品工坊', contactPerson: '陈老板', phone: '13900139006' },
    startDate: '2024-12-20T00:00:00.000Z',
    endDate: dayjs().add(5, 'day').toISOString(),
    monthlyRent: 5500,
    status: 'active',
  },
  {
    id: 7,
    stall: { id: 7, stallNumber: 'C-001', name: '鲜果吧摊位' },
    merchant: { id: 7, name: '鲜果吧', contactPerson: '周老板', phone: '13900139007' },
    startDate: '2024-11-20T00:00:00.000Z',
    endDate: dayjs().add(10, 'day').toISOString(),
    monthlyRent: 6000,
    status: 'active',
  },
  {
    id: 8,
    stall: { id: 8, stallNumber: 'C-002', name: '汉堡之家摊位' },
    merchant: { id: 8, name: '汉堡之家', contactPerson: '吴老板', phone: '13900139008' },
    startDate: '2024-10-20T00:00:00.000Z',
    endDate: dayjs().add(20, 'day').toISOString(),
    monthlyRent: 6500,
    status: 'active',
  },
];

const mockCategoryRequests = [
  {
    id: 1,
    stall: { id: 2, stallNumber: 'A-002', name: '川味麻辣烫摊位' },
    merchant: { id: 2, name: '川味麻辣烫' },
    oldCategory: '小吃',
    newCategory: '火锅',
    reason: '想增加火锅品类',
    status: 'pending',
    createdAt: new Date(),
  },
];

function HygieneIcon({ level }) {
  const map = {
    A: { emoji: '😊', class: 'hygiene-a', tip: 'A级 - 优秀' },
    B: { emoji: '🙂', class: 'hygiene-b', tip: 'B级 - 良好' },
    C: { emoji: '😐', class: 'hygiene-c', tip: 'C级 - 需改进' },
  };
  const info = map[level] || map.B;
  return (
    <Tooltip title={info.tip}>
      <span className={`hygiene-icon ${info.class}`}>{info.emoji}</span>
    </Tooltip>
  );
}

function Stalls() {
  const [stalls, setStalls] = useState([]);
  const [warningLeases, setWarningLeases] = useState([]);
  const [categoryRequests, setCategoryRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [editingStall, setEditingStall] = useState(null);
  const [form] = Form.useForm();
  const [requestForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('list');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [stallsRes, leaseRes, requestsRes] = await Promise.all([
        api.get('/stalls'),
        api.get('/stalls/lease/warning'),
        api.get('/stalls/category-requests'),
      ]);
      setStalls(stallsRes.data || []);
      setWarningLeases(leaseRes.data || []);
      setCategoryRequests(requestsRes.data || []);
    } catch (e) {
      message.error('加载数据失败');
    }
  };

  const openCreateModal = () => {
    setEditingStall(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (stall) => {
    setEditingStall(stall);
    form.setFieldsValue({
      ...stall,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingStall) {
        await api.put(`/stalls/${editingStall.id}`, values);
        message.success('摊位信息更新成功');
      } else {
        await api.post('/stalls', values);
        message.success('摊位创建成功');
      }
      setIsModalOpen(false);
      loadData();
    } catch (e) {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/stalls/${id}`);
      message.success('摊位已删除');
      loadData();
    } catch (e) {
      message.error('删除失败');
    }
  };

  const handleApproveRequest = async (id) => {
    try {
      await api.put(`/stalls/category-requests/${id}/approve`, { approvedBy: '管理员' });
      message.success('已批准品类变更');
      loadData();
    } catch (e) {
      message.error('操作失败');
    }
  };

  const handleRejectRequest = async (id) => {
    try {
      await api.put(`/stalls/category-requests/${id}/reject`, { approvedBy: '管理员' });
      message.success('已拒绝品类变更');
      loadData();
    } catch (e) {
      message.error('操作失败');
    }
  };

  const handleSubmitRequest = async (values) => {
    try {
      await api.post('/stalls/category-requests', values);
      message.success('品类变更申请已提交');
      setIsRequestModalOpen(false);
      requestForm.resetFields();
      loadData();
    } catch (e) {
      message.error('提交失败');
    }
  };

  const stallColumns = [
    {
      title: '摊位编号',
      dataIndex: 'stallNumber',
      key: 'stallNumber',
      width: 100,
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: '摊位名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '面积(㎡)',
      dataIndex: 'area',
      key: 'area',
      width: 100,
    },
    {
      title: '商户',
      dataIndex: ['merchant', 'name'],
      key: 'merchant',
      render: (v, row) => (
        <div>
          <div>{v || '-'}</div>
          <div style={{ color: '#999', fontSize: 12 }}>
            {row.merchant?.contactPerson} · {row.merchant?.phone}
          </div>
        </div>
      ),
    },
    {
      title: '卫生等级',
      dataIndex: 'hygieneLevel',
      key: 'hygieneLevel',
      width: 100,
      align: 'center',
      render: (v) => <HygieneIcon level={v} />,
    },
    {
      title: '租约到期',
      dataIndex: ['lease', 'endDate'],
      key: 'leaseEnd',
      width: 140,
      render: (v, row) => {
        if (!v) return '-';
        const daysLeft = dayjs(v).diff(dayjs(), 'day');
        const isWarning = daysLeft <= 30;
        return (
          <Space>
            {dayjs(v).format('YYYY-MM-DD')}
            {isWarning && (
              <Tag color="orange" icon={<WarningOutlined />}>
                {daysLeft}天
              </Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 160,
      render: (_, row) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(row)}>
            编辑
          </Button>
          <Popconfirm title="确定要删除这个摊位吗？" onConfirm={() => handleDelete(row.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const warningColumns = [
    {
      title: '摊位编号',
      dataIndex: ['stall', 'stallNumber'],
      key: 'stallNumber',
      render: (v) => <Tag color="orange">{v}</Tag>,
    },
    {
      title: '摊位名称',
      dataIndex: ['stall', 'name'],
      key: 'stallName',
    },
    {
      title: '商户',
      dataIndex: ['merchant', 'name'],
      key: 'merchant',
      render: (v, row) => (
        <div>
          <div>{v}</div>
          <div style={{ color: '#999', fontSize: 12 }}>
            {row.merchant?.contactPerson} · {row.merchant?.phone}
          </div>
        </div>
      ),
    },
    {
      title: '到期时间',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (v) => dayjs(v).format('YYYY-MM-DD'),
    },
    {
      title: '剩余天数',
      dataIndex: 'endDate',
      key: 'daysLeft',
      render: (v) => {
        const days = dayjs(v).diff(dayjs(), 'day');
        if (days <= 7) return <Tag color="red" icon={<ExclamationCircleFilled />}>{days}天(紧急)</Tag>;
        if (days <= 15) return <Tag color="orange">{days}天</Tag>;
        return <Tag color="yellow">{days}天</Tag>;
      },
    },
    {
      title: '月租金',
      dataIndex: 'monthlyRent',
      key: 'rent',
      render: (v) => `¥${v.toLocaleString()}`,
    },
    {
      title: '操作',
      key: 'actions',
      render: () => (
        <Space>
          <Button type="link" size="small">发送提醒</Button>
          <Button type="link" size="small">查看详情</Button>
        </Space>
      ),
    },
  ];

  const requestColumns = [
    {
      title: '摊位',
      dataIndex: ['stall', 'stallNumber'],
      key: 'stall',
      render: (v, row) => (
        <div>
          <Tag color="blue">{v}</Tag>
          <span style={{ marginLeft: 8 }}>{row.stall?.name}</span>
        </div>
      ),
    },
    {
      title: '商户',
      dataIndex: ['merchant', 'name'],
      key: 'merchant',
    },
    {
      title: '原品类',
      dataIndex: 'oldCategory',
      key: 'oldCategory',
      render: (v) => <Tag color="default">{v}</Tag>,
    },
    {
      title: '新申请品类',
      dataIndex: 'newCategory',
      key: 'newCategory',
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: '申请原因',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v) => {
        const map = {
          pending: { color: 'orange', text: '待审批' },
          approved: { color: 'green', text: '已批准' },
          rejected: { color: 'red', text: '已拒绝' },
        };
        return <Tag color={map[v]?.color}>{map[v]?.text || v}</Tag>;
      },
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, row) =>
        row.status === 'pending' ? (
          <Space>
            <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => handleApproveRequest(row.id)}>
              批准
            </Button>
            <Button size="small" danger icon={<CloseOutlined />} onClick={() => handleRejectRequest(row.id)}>
              拒绝
            </Button>
          </Space>
        ) : null,
    },
  ];

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Row gutter={16}>
            <Col xs={12} sm={6}>
              <Card className="stat-card">
                <Statistic title="摊位总数" value={stalls.length} valueStyle={{ color: '#1890ff' }} />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="stat-card">
                <Statistic title="卫生A级" value={stalls.filter((s) => s.hygieneLevel === 'A').length} valueStyle={{ color: '#52c41a' }} />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="stat-card">
                <Statistic
                  title="租约到期预警"
                  value={warningLeases.length}
                  valueStyle={{ color: '#fa541c' }}
                  prefix={<WarningOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="stat-card">
                <Statistic
                  title="待审批变更"
                  value={categoryRequests.filter((r) => r.status === 'pending').length}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>
        </motion.div>

        <Card>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="摊位列表" key="list">
              <div style={{ marginBottom: 16 }}>
                <Space>
                  <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                    新增摊位
                  </Button>
                  <Select
                    placeholder="卫生等级"
                    allowClear
                    style={{ width: 120 }}
                    onChange={(v) => {
                      if (!v) setStalls(mockStalls);
                      else setStalls(mockStalls.filter((s) => s.hygieneLevel === v));
                    }}
                  >
                    <Option value="A">A级 😊</Option>
                    <Option value="B">B级 🙂</Option>
                    <Option value="C">C级 😐</Option>
                  </Select>
                </Space>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key="stall-table"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Table
                    columns={stallColumns}
                    dataSource={stalls}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                  />
                </motion.div>
              </AnimatePresence>
            </TabPane>
            <TabPane tab="租约到期预警" key="warning">
              <Table
                columns={warningColumns}
                dataSource={warningLeases}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </TabPane>
            <TabPane tab="品类变更审批" key="requests">
              <div style={{ marginBottom: 16 }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsRequestModalOpen(true)}>
                  发起变更申请
                </Button>
              </div>
              <Table
                columns={requestColumns}
                dataSource={categoryRequests}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </TabPane>
          </Tabs>
        </Card>
      </Space>

      <Modal
        title={editingStall ? '编辑摊位' : '新增摊位'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        maskClosable={false}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="stallNumber" label="摊位编号" rules={[{ required: true, message: '请输入摊位编号' }]}>
                <Input placeholder="如A-001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="name" label="摊位名称" rules={[{ required: true, message: '请输入摊位名称' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="location" label="位置" rules={[{ required: true, message: '请输入位置' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="area" label="面积(㎡)" rules={[{ required: true, message: '请输入面积' }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="hygieneLevel" label="卫生等级" rules={[{ required: true }]}>
            <Select>
              <Option value="A">A级 - 优秀 😊</Option>
              <Option value="B">B级 - 良好 🙂</Option>
              <Option value="C">C级 - 需改进 😐</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="normal">
            <Select>
              <Option value="normal">正常</Option>
              <Option value="closed">关闭</Option>
              <Option value="maintenance">维护中</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="品类变更申请"
        open={isRequestModalOpen}
        onCancel={() => setIsRequestModalOpen(false)}
        onOk={() => requestForm.submit()}
        maskClosable={false}
      >
        <Form form={requestForm} layout="vertical" onFinish={handleSubmitRequest}>
          <Form.Item name="stallId" label="选择摊位" rules={[{ required: true, message: '请选择摊位' }]}>
            <Select placeholder="选择摊位">
              {stalls.map((s) => (
                <Option key={s.id} value={s.id}>
                  {s.stallNumber} - {s.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="newCategory" label="新经营品类" rules={[{ required: true, message: '请输入新品类' }]}>
            <Input placeholder="请输入新品类" />
          </Form.Item>
          <Form.Item name="reason" label="变更原因" rules={[{ required: true, message: '请输入变更原因' }]}>
            <Input.TextArea rows={4} placeholder="请说明变更原因" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Stalls;
