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
  message,
  Tabs,
  Radio,
} from 'antd';
import { PlusOutlined, CheckOutlined, FileOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import api from '../api';
import dayjs from 'dayjs';

const { Option } = Select;
const { TabPane } = Tabs;

const mockBills = [
  {
    id: 1,
    billMonth: '2026-06',
    amount: 5000,
    status: 'unpaid',
    dueDate: dayjs().endOf('month').toDate(),
    paidDate: null,
    stall: { id: 1, stallNumber: 'A-001', name: '老北京炸酱面摊位' },
    merchant: { id: 1, name: '老北京炸酱面' },
  },
  {
    id: 2,
    billMonth: '2026-06',
    amount: 5500,
    status: 'unpaid',
    dueDate: dayjs().endOf('month').toDate(),
    paidDate: null,
    stall: { id: 2, stallNumber: 'A-002', name: '川味麻辣烫摊位' },
    merchant: { id: 2, name: '川味麻辣烫' },
  },
  {
    id: 3,
    billMonth: '2026-05',
    amount: 6000,
    status: 'paid',
    dueDate: dayjs().subtract(1, 'month').endOf('month').toDate(),
    paidDate: dayjs().subtract(1, 'month').date(10).toDate(),
    stall: { id: 3, stallNumber: 'A-003', name: '粤式茶餐厅摊位' },
    merchant: { id: 3, name: '粤式茶餐厅' },
  },
  {
    id: 4,
    billMonth: '2026-05',
    amount: 6500,
    status: 'paid',
    dueDate: dayjs().subtract(1, 'month').endOf('month').toDate(),
    paidDate: dayjs().subtract(1, 'month').date(12).toDate(),
    stall: { id: 4, stallNumber: 'B-001', name: '日式料理摊位' },
    merchant: { id: 4, name: '日式料理' },
  },
  {
    id: 5,
    billMonth: '2026-04',
    amount: 7000,
    status: 'paid',
    dueDate: dayjs().subtract(2, 'month').endOf('month').toDate(),
    paidDate: dayjs().subtract(2, 'month').date(8).toDate(),
    stall: { id: 5, stallNumber: 'B-002', name: '韩式烤肉摊位' },
    merchant: { id: 5, name: '韩式烤肉' },
  },
  {
    id: 6,
    billMonth: '2026-06',
    amount: 5500,
    status: 'unpaid',
    dueDate: dayjs().endOf('month').toDate(),
    paidDate: null,
    stall: { id: 6, stallNumber: 'B-003', name: '甜品工坊摊位' },
    merchant: { id: 6, name: '甜品工坊' },
  },
];

function Rents() {
  const [bills, setBills] = useState(mockBills);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    total: 6,
    paid: 3,
    unpaid: 3,
    paidAmount: 19500,
    unpaidAmount: 16000,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [billsRes, statsRes] = await Promise.all([
        api.get('/rents'),
        api.get('/rents/statistics'),
      ]);
      if (billsRes.data?.length) setBills(billsRes.data);
      if (statsRes.data) setStats(statsRes.data);
    } catch (e) {
      console.log('使用mock数据');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const data = {
        ...values,
        dueDate: values.dueDate.toDate(),
      };
      const res = await api.post('/rents', data);
      setBills([res.data, ...bills]);
    } catch (e) {
      const stall = { id: values.stallId, stallNumber: 'A-001', name: '测试摊位' };
      setBills([
        {
          id: Date.now(),
          ...values,
          status: 'unpaid',
          stall,
          merchant: { id: 1, name: '测试商户' },
          paidDate: null,
        },
        ...bills,
      ]);
    }
    message.success('账单创建成功');
    setIsModalOpen(false);
    form.resetFields();
  };

  const handlePay = async (id) => {
    try {
      await api.put(`/rents/${id}/pay`);
    } catch (e) {}
    setBills(
      bills.map((b) =>
        b.id === id ? { ...b, status: 'paid', paidDate: new Date() } : b
      )
    );
    message.success('缴费成功');
  };

  const filteredBills = statusFilter === 'all' ? bills : bills.filter((b) => b.status === statusFilter);

  const columns = [
    {
      title: '摊位编号',
      dataIndex: ['stall', 'stallNumber'],
      key: 'stallNumber',
      width: 100,
      render: (v) => <Tag color="blue">{v}</Tag>,
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
    },
    {
      title: '账期',
      dataIndex: 'billMonth',
      key: 'billMonth',
      width: 120,
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (v) => <span style={{ fontWeight: 600, color: '#fa541c' }}>¥{v.toLocaleString()}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v) =>
        v === 'paid' ? (
          <Tag color="green" icon={<CheckOutlined />}>已缴费</Tag>
        ) : (
          <Tag color="orange" icon={<FileOutlined />}>待缴费</Tag>
        ),
    },
    {
      title: '缴费截止日',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 130,
      render: (v) => dayjs(v).format('YYYY-MM-DD'),
    },
    {
      title: '缴费时间',
      dataIndex: 'paidDate',
      key: 'paidDate',
      width: 130,
      render: (v) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_, row) =>
        row.status === 'unpaid' ? (
          <Button type="primary" size="small" onClick={() => handlePay(row.id)}>
            确认缴费
          </Button>
        ) : (
          <Button size="small" disabled>
            已缴费
          </Button>
        ),
    },
  ];

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
              <Statistic title="账单总数" value={stats.total} valueStyle={{ color: '#1890ff' }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <Statistic title="已缴费" value={stats.paid} valueStyle={{ color: '#52c41a' }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <Statistic
                title="已收金额"
                value={stats.paidAmount}
                precision={0}
                prefix="¥"
                valueStyle={{ color: '#13c2c2' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <Statistic
                title="待收金额"
                value={stats.unpaidAmount}
                precision={0}
                prefix="¥"
                valueStyle={{ color: '#fa541c' }}
              />
            </Card>
          </Col>
        </Row>
      </motion.div>

      <Card>
        <Tabs defaultActiveKey="list">
          <TabPane tab="账单列表" key="list">
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
              <Radio.Group value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <Radio.Button value="all">全部</Radio.Button>
                <Radio.Button value="unpaid">待缴费</Radio.Button>
                <Radio.Button value="paid">已缴费</Radio.Button>
              </Radio.Group>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                生成账单
              </Button>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Table
                columns={columns}
                dataSource={filteredBills}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </motion.div>
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title="生成租金账单"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        maskClosable={false}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="stallId" label="选择摊位" rules={[{ required: true }]}>
            <Select placeholder="选择摊位">
              <Option value={1}>A-001 - 老北京炸酱面摊位</Option>
              <Option value={2}>A-002 - 川味麻辣烫摊位</Option>
              <Option value={3}>A-003 - 粤式茶餐厅摊位</Option>
            </Select>
          </Form.Item>
          <Form.Item name="merchantId" label="商户ID" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} placeholder="商户ID" />
          </Form.Item>
          <Form.Item name="billMonth" label="账期月份" rules={[{ required: true }]}>
            <Input placeholder="如2026-06" />
          </Form.Item>
          <Form.Item name="amount" label="金额(元)" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入金额" />
          </Form.Item>
          <Form.Item name="dueDate" label="缴费截止日" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

export default Rents;
