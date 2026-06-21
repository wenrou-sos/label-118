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
import { PlusOutlined, CheckOutlined, FileOutlined, DownloadOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import api, { downloadFile } from '../api';
import dayjs from 'dayjs';

const { Option } = Select;
const { TabPane } = Tabs;

function Rents() {
  const [bills, setBills] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    unpaid: 0,
    paidAmount: 0,
    unpaidAmount: 0,
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
      setBills(billsRes.data || []);
      setStats(statsRes.data || { total: 0, paid: 0, unpaid: 0, paidAmount: 0, unpaidAmount: 0 });
    } catch (e) {
      message.error('加载数据失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const data = {
        ...values,
        dueDate: values.dueDate.toDate(),
      };
      await api.post('/rents', data);
      message.success('账单创建成功');
      setIsModalOpen(false);
      form.resetFields();
      loadData();
    } catch (e) {
      message.error('账单创建失败');
    }
  };

  const handlePay = async (id) => {
    try {
      await api.put(`/rents/${id}/pay`);
      message.success('缴费成功');
      loadData();
    } catch (e) {
      message.error('缴费失败');
    }
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
              <Space>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={async () => {
                    try {
                      message.loading({ content: '正在导出...', key: 'export' });
                      await downloadFile(
                        `/reports/rents?status=${statusFilter}`,
                        '租金账单报表.xlsx'
                      );
                      message.success({ content: '导出成功', key: 'export' });
                    } catch (e) {
                      message.error({ content: '导出失败', key: 'export' });
                    }
                  }}
                >
                  导出报表
                </Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                  生成账单
                </Button>
              </Space>
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
