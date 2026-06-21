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
  const [activities, setActivities] = useState([]);
  const [stalls, setStalls] = useState([]);
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
      const [resActivities, resStalls] = await Promise.all([
        api.get('/activities'),
        api.get('/stalls'),
      ]);
      setActivities(resActivities.data || []);
      setStalls(resStalls.data || []);
    } catch (e) {
      message.error('加载数据失败');
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
      await api.post('/activities', data);
      message.success('活动已创建');
      setIsCreateModalOpen(false);
      createForm.resetFields();
      loadData();
    } catch (e) {
      message.error('创建活动失败');
    }
  };

  const handleSignup = async (values) => {
    try {
      await api.post(`/activities/${currentActivity.id}/participations`, values);
      message.success('报名成功');
      setIsSignupModalOpen(false);
      signupForm.resetFields();
      loadData();
    } catch (e) {
      message.error('报名失败');
    }
  };

  const handleDeleteParticipation = async (activityId, participationId) => {
    try {
      await api.delete(`/activities/${activityId}/participations/${participationId}`);
      message.success('已取消报名');
      loadData();
    } catch (e) {
      message.error('取消报名失败');
    }
  };

  const handleDeleteActivity = async (id) => {
    try {
      await api.delete(`/activities/${id}`);
      message.success('活动已删除');
      loadData();
    } catch (e) {
      message.error('删除活动失败');
    }
  };

  const handleSalesSubmit = async (values) => {
    try {
      await api.put(`/activities/participations/${currentParticipation.id}`, values);
      message.success('销售数据已更新');
      setIsSalesModalOpen(false);
      salesForm.resetFields();
      loadData();
    } catch (e) {
      message.error('更新销售数据失败');
    }
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
              {stalls
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
