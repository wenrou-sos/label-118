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
  Popconfirm,
  Drawer,
  List,
  Avatar,
  Divider,
  Progress,
} from 'antd';
import {
  PlusOutlined,
  CalendarOutlined,
  UserAddOutlined,
  DeleteOutlined,
  EditOutlined,
  RiseOutlined,
  TeamOutlined,
  ShopOutlined,
  DollarOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Column, Line, Pie } from '@ant-design/charts';
import api from '../api';
import dayjs from 'dayjs';

const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const mockActivities = [
  {
    id: 1,
    name: '夏日美食节',
    type: '美食节',
    startDate: dayjs().add(5, 'day').toDate(),
    endDate: dayjs().add(12, 'day').toDate(),
    description: '汇聚各地美食，特价优惠，精彩表演不断',
    expectedVisitors: 5000,
    actualVisitors: null,
    status: 'planning',
    participations: [
      { id: 1, stallId: 1, stall: { id: 1, stallNumber: 'A-001', name: '老北京炸酱面摊位' }, signupAt: new Date(), beforeSales: null, duringSales: null },
      { id: 2, stallId: 2, stall: { id: 2, stallNumber: 'A-002', name: '川味麻辣烫摊位' }, signupAt: new Date(), beforeSales: null, duringSales: null },
    ],
    createdAt: new Date(),
  },
  {
    id: 2,
    name: '周末夜市',
    type: '周末特惠',
    startDate: dayjs().add(3, 'day').toDate(),
    endDate: dayjs().add(4, 'day').toDate(),
    description: '周末特惠活动，所有摊位8折起',
    expectedVisitors: 2000,
    actualVisitors: 1500,
    status: 'ongoing',
    participations: [
      { id: 3, stallId: 1, stall: { id: 1, stallNumber: 'A-001', name: '老北京炸酱面摊位' }, signupAt: new Date(), beforeSales: 8000, duringSales: 12000 },
      { id: 4, stallId: 2, stall: { id: 2, stallNumber: 'A-002', name: '川味麻辣烫摊位' }, signupAt: new Date(), beforeSales: 7500, duringSales: 11000 },
      { id: 5, stallId: 3, stall: { id: 3, stallNumber: 'A-003', name: '粤式茶餐厅摊位' }, signupAt: new Date(), beforeSales: 10000, duringSales: 15500 },
      { id: 6, stallId: 4, stall: { id: 4, stallNumber: 'B-001', name: '日式料理摊位' }, signupAt: new Date(), beforeSales: 9000, duringSales: 14000 },
      { id: 7, stallId: 5, stall: { id: 5, stallNumber: 'B-002', name: '韩式烤肉摊位' }, signupAt: new Date(), beforeSales: 8500, duringSales: 13000 },
      { id: 8, stallId: 6, stall: { id: 6, stallNumber: 'B-003', name: '甜品工坊摊位' }, signupAt: new Date(), beforeSales: 6000, duringSales: 9500 },
    ],
    createdAt: new Date(),
  },
  {
    id: 3,
    name: '打卡集章赢好礼',
    type: '打卡集章',
    startDate: dayjs().subtract(10, 'day').toDate(),
    endDate: dayjs().subtract(3, 'day').toDate(),
    description: '在5个以上摊位消费即可集章，集满10章赢取精美礼品',
    expectedVisitors: 3000,
    actualVisitors: 2800,
    status: 'completed',
    participations: [
      { id: 9, stallId: 1, stall: { id: 1, stallNumber: 'A-001', name: '老北京炸酱面摊位' }, signupAt: new Date(), beforeSales: 7000, duringSales: 9500 },
      { id: 10, stallId: 3, stall: { id: 3, stallNumber: 'A-003', name: '粤式茶餐厅摊位' }, signupAt: new Date(), beforeSales: 9000, duringSales: 12000 },
    ],
    createdAt: new Date(),
  },
];

const mockStalls = [
  { id: 1, stallNumber: 'A-001', name: '老北京炸酱面摊位' },
  { id: 2, stallNumber: 'A-002', name: '川味麻辣烫摊位' },
  { id: 3, stallNumber: 'A-003', name: '粤式茶餐厅摊位' },
  { id: 4, stallNumber: 'B-001', name: '日式料理摊位' },
  { id: 5, stallNumber: 'B-002', name: '韩式烤肉摊位' },
  { id: 6, stallNumber: 'B-003', name: '甜品工坊摊位' },
  { id: 7, stallNumber: 'C-001', name: '鲜果吧摊位' },
  { id: 8, stallNumber: 'C-002', name: '汉堡之家摊位' },
];

const statusMap = {
  planning: { color: 'blue', text: '策划中', icon: <CalendarOutlined /> },
  ongoing: { color: 'green', text: '进行中', icon: <RiseOutlined /> },
  completed: { color: 'gray', text: '已结束', icon: <BarChartOutlined /> },
};

const typeColorMap = {
  美食节: '#fa541c',
  周末特惠: '#52c41a',
  打卡集章: '#722ed1',
  夜市集市: '#13c2c2',
  其他: '#1890ff',
};

function Activities() {
  const [activities, setActivities] = useState(mockActivities);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [currentParticipation, setCurrentParticipation] = useState(null);
  const [createForm] = Form.useForm();
  const [signupForm] = Form.useForm();
  const [salesForm] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/activities');
      if (res.data?.length) setActivities(res.data);
    } catch (e) {
      console.log('使用mock数据');
    }
  };

  const handleCreate = async (values) => {
    try {
      const data = {
        ...values,
        startDate: values.dateRange[0].toDate(),
        endDate: values.dateRange[1].toDate(),
      };
      delete data.dateRange;
      const res = await api.post('/activities', data);
      setActivities([res.data, ...activities]);
    } catch (e) {
      const activity = {
        id: Date.now(),
        ...values,
        startDate: values.dateRange[0].toDate(),
        endDate: values.dateRange[1].toDate(),
        status: 'planning',
        participations: [],
        createdAt: new Date(),
      };
      delete activity.dateRange;
      setActivities([activity, ...activities]);
    }
    message.success('活动已创建');
    setIsCreateModalOpen(false);
    createForm.resetFields();
  };

  const handleSignup = async (values) => {
    try {
      await api.post(`/activities/${currentActivity.id}/participations`, values);
    } catch (e) {}
    const stall = mockStalls.find((s) => s.id === values.stallId);
    const updated = activities.map((a) => {
      if (a.id === currentActivity.id) {
        return {
          ...a,
          participations: [
            ...a.participations,
            { id: Date.now(), stallId: values.stallId, stall, signupAt: new Date() },
          ],
        };
      }
      return a;
    });
    setActivities(updated);
    message.success('报名成功');
    setIsSignupModalOpen(false);
    signupForm.resetFields();
  };

  const handleDeleteParticipation = (activityId, participationId) => {
    const updated = activities.map((a) => {
      if (a.id === activityId) {
        return {
          ...a,
          participations: a.participations.filter((p) => p.id !== participationId),
        };
      }
      return a;
    });
    setActivities(updated);
    if (currentActivity?.id === activityId) {
      setCurrentActivity({
        ...currentActivity,
        participations: currentActivity.participations.filter((p) => p.id !== participationId),
      });
    }
    message.success('已取消报名');
  };

  const handleDeleteActivity = (id) => {
    setActivities(activities.filter((a) => a.id !== id));
    message.success('活动已删除');
  };

  const handleSalesSubmit = async (values) => {
    try {
      await api.put(`/activities/participations/${currentParticipation.id}`, values);
    } catch (e) {}
    const updated = activities.map((a) => {
      if (a.id === currentActivity.id) {
        return {
          ...a,
          participations: a.participations.map((p) =>
            p.id === currentParticipation.id ? { ...p, ...values } : p
          ),
        };
      }
      return a;
    });
    setActivities(updated);
    if (currentActivity?.id === currentActivity.id) {
      setCurrentActivity({
        ...currentActivity,
        participations: currentActivity.participations.map((p) =>
          p.id === currentParticipation.id ? { ...p, ...values } : p
        ),
      });
    }
    message.success('销售数据已更新');
    setIsSalesModalOpen(false);
    salesForm.resetFields();
  };

  const openSignup = (activity) => {
    setCurrentActivity(activity);
    signupForm.resetFields();
    setIsSignupModalOpen(true);
  };

  const openDetail = (activity) => {
    setCurrentActivity(activity);
    setIsDetailDrawerOpen(true);
  };

  const openSalesEdit = (activity, participation) => {
    setCurrentActivity(activity);
    setCurrentParticipation(participation);
    salesForm.setFieldsValue({
      beforeSales: participation.beforeSales,
      duringSales: participation.duringSales,
    });
    setIsSalesModalOpen(true);
  };

  const columns = [
    {
      title: '活动名称',
      dataIndex: 'name',
      key: 'name',
      render: (v, row) => (
        <Space>
          <Tag color={typeColorMap[row.type]} style={{ border: 'none' }}>
            {row.type}
          </Tag>
          <a onClick={() => openDetail(row)} style={{ fontWeight: 500 }}>
            {v}
          </a>
        </Space>
      ),
    },
    {
      title: '活动时间',
      key: 'time',
      width: 240,
      render: (_, row) => (
        <div>
          <div>{dayjs(row.startDate).format('YYYY-MM-DD')}</div>
          <div style={{ color: '#999' }}>至 {dayjs(row.endDate).format('YYYY-MM-DD')}</div>
        </div>
      ),
    },
    {
      title: '参与商户',
      key: 'participants',
      width: 100,
      align: 'center',
      render: (_, row) => (
        <Tag color="purple" icon={<TeamOutlined />}>
          {row.participations?.length || 0}
        </Tag>
      ),
    },
    {
      title: '客流量',
      key: 'visitors',
      width: 160,
      render: (_, row) => (
        <div>
          <div>预计: {row.expectedVisitors?.toLocaleString() || '-'}</div>
          {row.actualVisitors && (
            <div style={{ color: '#52c41a', fontWeight: 600 }}>
              实际: {row.actualVisitors.toLocaleString()}
            </div>
          )}
        </div>
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
      title: '操作',
      key: 'actions',
      width: 220,
      fixed: 'right',
      render: (_, row) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => openDetail(row)}>
            详情
          </Button>
          {row.status !== 'completed' && (
            <Button type="primary" size="small" icon={<UserAddOutlined />} onClick={() => openSignup(row)}>
              商户报名
            </Button>
          )}
          <Popconfirm title="确定删除此活动？" onConfirm={() => handleDeleteActivity(row.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const visitorTrend = activities
    .filter((a) => a.status === 'completed' || a.status === 'ongoing')
    .map((a) => ({
      name: a.name,
      expected: a.expectedVisitors || 0,
      actual: a.actualVisitors || 0,
    }));

  const visitorConfig = {
    data: visitorTrend,
    isGroup: true,
    xField: 'name',
    yField: ['expected', 'actual'],
    seriesField: 'type',
    label: {
      position: 'top',
      layout: [{ type: 'interval-adjust-position' }],
    },
    color: ['#1890ff', '#fa541c'],
  };

  const typeStats = activities.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {});

  const typePieData = Object.entries(typeStats).map(([type, value]) => ({
    type,
    value,
    color: typeColorMap[type] || '#1890ff',
  }));

  const typePieConfig = {
    data: typePieData,
    angleField: 'value',
    colorField: 'type',
    color: Object.values(typeColorMap),
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
              <Statistic title="活动总数" value={activities.length} valueStyle={{ color: '#1890ff' }} prefix={<CalendarOutlined />} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <Statistic title="策划中" value={activities.filter((a) => a.status === 'planning').length} valueStyle={{ color: '#722ed1' }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <Statistic title="进行中" value={activities.filter((a) => a.status === 'ongoing').length} valueStyle={{ color: '#52c41a' }} prefix={<RiseOutlined />} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <Statistic
                title="累计参与商户"
                value={activities.reduce((sum, a) => sum + (a.participations?.length || 0), 0)}
                valueStyle={{ color: '#fa541c' }}
                prefix={<ShopOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </motion.div>

      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card>
            <Tabs defaultActiveKey="list">
              <TabPane tab="活动列表" key="list">
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>
                    策划活动
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
                      dataSource={activities}
                      rowKey="id"
                      pagination={{ pageSize: 10 }}
                      scroll={{ x: 1100 }}
                    />
                  </motion.div>
                </AnimatePresence>
              </TabPane>
              <TabPane tab="数据分析" key="analysis">
                <Row gutter={16}>
                  <Col xs={24} md={14}>
                    <Card title="客流量对比">
                      <Column {...visitorConfig} style={{ height: 320 }} />
                    </Card>
                  </Col>
                  <Col xs={24} md={10}>
                    <Card title="活动类型分布">
                      <Pie {...typePieConfig} style={{ height: 320 }} />
                    </Card>
                  </Col>
                </Row>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="活动类型">
            <List
              dataSource={Object.entries(typeColorMap)}
              renderItem={([type, color]) => (
                <List.Item>
                  <Space>
                    <Tag color={color} style={{ border: 'none', minWidth: 80, textAlign: 'center' }}>
                      {type}
                    </Tag>
                    <span>{typeStats[type] || 0} 场</span>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="策划活动"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onOk={() => createForm.submit()}
        maskClosable={false}
        width={600}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="活动名称" rules={[{ required: true }]}>
            <Input placeholder="请输入活动名称" />
          </Form.Item>
          <Form.Item name="type" label="活动类型" rules={[{ required: true }]}>
            <Select placeholder="请选择活动类型">
              <Option value="美食节">美食节</Option>
              <Option value="周末特惠">周末特惠</Option>
              <Option value="打卡集章">打卡集章</Option>
              <Option value="夜市集市">夜市集市</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item name="dateRange" label="活动时间" rules={[{ required: true }]}>
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="expectedVisitors" label="预计客流量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入预计客流量" />
          </Form.Item>
          <Form.Item name="description" label="活动描述">
            <Input.TextArea rows={4} placeholder="请输入活动描述" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="商户活动报名"
        open={isSignupModalOpen}
        onCancel={() => setIsSignupModalOpen(false)}
        onOk={() => signupForm.submit()}
        maskClosable={false}
      >
        <Form form={signupForm} layout="vertical" onFinish={handleSignup}>
          <Form.Item name="stallId" label="选择摊位" rules={[{ required: true }]}>
            <Select placeholder="选择参与活动的摊位">
              {mockStalls
                .filter(
                  (s) =>
                    !currentActivity?.participations?.some((p) => p.stallId === s.id)
                )
                .map((s) => (
                  <Option key={s.id} value={s.id}>
                    {s.stallNumber} - {s.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="更新销售数据"
        open={isSalesModalOpen}
        onCancel={() => setIsSalesModalOpen(false)}
        onOk={() => salesForm.submit()}
        maskClosable={false}
      >
        <Form form={salesForm} layout="vertical" onFinish={handleSalesSubmit}>
          <Form.Item name="beforeSales" label="活动前销售额(元)">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入活动前销售额" />
          </Form.Item>
          <Form.Item name="duringSales" label="活动期间销售额(元)">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入活动期间销售额" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="活动详情"
        placement="right"
        width={560}
        open={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
      >
        {currentActivity && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Space>
                <Tag color={typeColorMap[currentActivity.type]} style={{ border: 'none', fontSize: 14 }}>
                  {currentActivity.type}
                </Tag>
                <Tag color={statusMap[currentActivity.status]?.color} icon={statusMap[currentActivity.status]?.icon}>
                  {statusMap[currentActivity.status]?.text}
                </Tag>
              </Space>
              <h2 style={{ marginTop: 12 }}>{currentActivity.name}</h2>
              <p style={{ color: '#666', marginTop: 8 }}>{currentActivity.description}</p>
            </div>

            <Row gutter={16}>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title={<Space><CalendarOutlined />活动时间</Space>}
                    value={`${dayjs(currentActivity.startDate).format('MM-DD')} ~ ${dayjs(currentActivity.endDate).format('MM-DD')}`}
                    valueStyle={{ fontSize: 16 }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title={<Space><TeamOutlined />参与商户</Space>}
                    value={currentActivity.participations?.length || 0}
                    suffix="家"
                    valueStyle={{ fontSize: 16 }}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="预计客流量"
                    value={currentActivity.expectedVisitors?.toLocaleString() || 0}
                    suffix="人"
                    valueStyle={{ fontSize: 16, color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="实际客流量"
                    value={currentActivity.actualVisitors?.toLocaleString() || '-'}
                    suffix={currentActivity.actualVisitors ? '人' : ''}
                    valueStyle={{ fontSize: 16, color: '#52c41a' }}
                  />
                </Card>
              </Col>
            </Row>

            {currentActivity.actualVisitors && currentActivity.expectedVisitors && (
              <Card size="small" title="客流量完成度">
                <Progress
                  percent={Math.round((currentActivity.actualVisitors / currentActivity.expectedVisitors) * 100)}
                  strokeColor="#fa541c"
                  status={
                    currentActivity.actualVisitors >= currentActivity.expectedVisitors ? 'success' : 'active'
                  }
                />
              </Card>
            )}

            <Divider orientation="left">参与商户 ({currentActivity.participations?.length || 0})</Divider>
            <List
              size="small"
              dataSource={currentActivity.participations || []}
              locale={{ emptyText: '暂无商户报名' }}
              renderItem={(p) => (
                <List.Item
                  actions={
                    currentActivity.status !== 'completed'
                      ? [
                          currentActivity.status === 'ongoing' && (
                            <Button
                              type="link"
                              size="small"
                              onClick={() => openSalesEdit(currentActivity, p)}
                            >
                              更新销售数据
                            </Button>
                          ),
                          <Popconfirm
                            title="取消报名？"
                            onConfirm={() => handleDeleteParticipation(currentActivity.id, p.id)}
                          >
                            <Button type="link" size="small" danger>
                              移除
                            </Button>
                          </Popconfirm>,
                        ].filter(Boolean)
                      : null
                  }
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<ShopOutlined />} style={{ backgroundColor: '#fa541c' }} />}
                    title={
                      <Space>
                        <Tag color="blue">{p.stall?.stallNumber}</Tag>
                        {p.stall?.name}
                      </Space>
                    }
                    description={
                      p.beforeSales && p.duringSales ? (
                        <Space>
                          <span>
                            <DollarOutlined style={{ color: '#999' }} /> 活动前: ¥{p.beforeSales.toLocaleString()}
                          </span>
                          <span style={{ color: '#52c41a', fontWeight: 600 }}>
                            活动中: ¥{p.duringSales.toLocaleString()}
                          </span>
                          <Tag color="green">
                            增长 +{Math.round(((p.duringSales - p.beforeSales) / p.beforeSales) * 100)}%
                          </Tag>
                        </Space>
                      ) : (
                        <span style={{ color: '#999' }}>
                          报名时间: {dayjs(p.signupAt).format('YYYY-MM-DD HH:mm')}
                        </span>
                      )
                    }
                  />
                </List.Item>
              )}
            />

            {currentActivity.status !== 'completed' && (
              <Button
                type="primary"
                block
                icon={<UserAddOutlined />}
                onClick={() => openSignup(currentActivity)}
              >
                添加商户报名
              </Button>
            )}
          </Space>
        )}
      </Drawer>
    </Space>
  );
}

export default Activities;
