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
  Radio,
  Card,
  Statistic,
  Row,
  Col,
  message,
  Tabs,
  Radio as AntRadio,
  Steps,
  Timeline,
  Descriptions,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  ToolOutlined,
  UserAddOutlined,
  CheckOutlined,
  EnvironmentOutlined,
  ShopOutlined,

  ExclamationCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Pie, Column } from '@ant-design/charts';
import api, { downloadFile } from '../api';
import dayjs from 'dayjs';

const { Option } = Select;
const { TabPane } = Tabs;
const { Step } = Steps;

const statusMap = {
  pending: { color: 'orange', text: '待派工', icon: <ClockCircleOutlined /> },
  processing: { color: 'blue', text: '维修中', icon: <ToolOutlined /> },
  completed: { color: 'green', text: '已完成', icon: <CheckOutlined /> },
};

const equipmentTypeColor = {
  卫生间: '#1890ff',
  电梯: '#722ed1',
  空调: '#13c2c2',
  停车场: '#fa541c',
  其他: '#8c8c8c',
};

function Repairs() {
  const [repairs, setRepairs] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [stalls, setStalls] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentRepair, setCurrentRepair] = useState(null);
  const [createForm] = Form.useForm();
  const [assignForm] = Form.useForm();
  const [completeForm] = Form.useForm();
  const [repairType, setRepairType] = useState('public');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [r, e, s, a] = await Promise.all([
        api.get('/repairs'),
        api.get('/repairs/equipments'),
        api.get('/stalls'),
        api.get('/daily/admins'),
      ]);
      setRepairs(r.data || []);
      setEquipments(e.data || []);
      setStalls(s.data || []);
      setAdmins(a.data || []);
    } catch (e) {
      message.error('加载数据失败');
    }
  };

  const handleCreate = async (values) => {
    try {
      await api.post('/repairs', values);
      message.success('报修单已提交');
      setIsCreateModalOpen(false);
      createForm.resetFields();
      setRepairType('public');
      loadData();
    } catch (e) {
      message.error('提交报修单失败');
    }
  };

  const handleAssign = async (values) => {
    try {
      await api.put(`/repairs/${currentRepair.id}/assign`, values);
      message.success('已派工');
      setIsAssignModalOpen(false);
      assignForm.resetFields();
      loadData();
    } catch (e) {
      message.error('派工失败');
    }
  };

  const handleComplete = async (values) => {
    try {
      await api.put(`/repairs/${currentRepair.id}/complete`, values);
      message.success('维修完成');
      setIsCompleteModalOpen(false);
      completeForm.resetFields();
      loadData();
    } catch (e) {
      message.error('完成维修失败');
    }
  };

  const openDetail = (record) => {
    setCurrentRepair(record);
    setIsDetailModalOpen(true);
  };

  const openAssign = (record) => {
    setCurrentRepair(record);
    assignForm.resetFields();
    setIsAssignModalOpen(true);
  };

  const openComplete = (record) => {
    setCurrentRepair(record);
    completeForm.resetFields();
    setIsCompleteModalOpen(true);
  };

  const filteredRepairs = statusFilter === 'all' ? repairs : repairs.filter((r) => r.status === statusFilter);

  const getSteps = (status) => {
    const steps = [
      { title: '报修', status: 'finish' },
      { title: '派工', status: status === 'pending' ? 'process' : 'finish' },
      { title: '维修中', status: status === 'processing' ? 'process' : status === 'completed' ? 'finish' : 'wait' },
      { title: '完成', status: status === 'completed' ? 'finish' : 'wait' },
    ];
    return steps;
  };

  const columns = [
    {
      title: '报修类型',
      key: 'type',
      width: 100,
      align: 'center',
      render: (_, row) =>
        row.isPublic ? (
          <Tag color="blue" icon={<EnvironmentOutlined />}>
            公共区域
          </Tag>
        ) : (
          <Tag color="purple" icon={<ShopOutlined />}>
            商户内部
          </Tag>
        ),
    },
    {
      title: '设备/摊位',
      key: 'target',
      render: (_, row) =>
        row.equipment ? (
          <div>
            <Space>
              <Tag color={equipmentTypeColor[row.equipment.type] || '#8c8c8c'}>
                {row.equipment.type}
              </Tag>
              <span style={{ fontWeight: 500 }}>{row.equipment.name}</span>
            </Space>
            <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
              <EnvironmentOutlined /> {row.equipment.location}
            </div>
          </div>
        ) : row.stall ? (
          <Space>
            <Tag color="blue">{row.stall.stallNumber}</Tag>
            <span style={{ fontWeight: 500 }}>{row.stall.name}</span>
          </Space>
        ) : (
          '-'
        ),
    },
    {
      title: '故障描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '报修人',
      dataIndex: 'reporter',
      key: 'reporter',
      width: 120,
      render: (v) => (
        <Space>
          <UserOutlined />
          {v || '匿名'}
        </Space>
      ),
    },
    {
      title: '维修人',
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
          <Tag color="orange" icon={<ExclamationCircleOutlined />}>
            待派工
          </Tag>
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
              派工
            </Button>
          )}
          {row.status === 'processing' && (
            <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => openComplete(row)}>
              完成维修
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const statusPieData = [
    { type: '待派工', value: repairs.filter((r) => r.status === 'pending').length, color: '#fa8c16' },
    { type: '维修中', value: repairs.filter((r) => r.status === 'processing').length, color: '#1890ff' },
    { type: '已完成', value: repairs.filter((r) => r.status === 'completed').length, color: '#52c41a' },
  ];

  const statusPieConfig = {
    data: statusPieData,
    angleField: 'value',
    colorField: 'type',
    color: ['#fa8c16', '#1890ff', '#52c41a'],
    radius: 0.8,
    label: { text: 'value', style: { fontWeight: 'bold' } },
    legend: { color: { position: 'bottom' } },
  };

  const typeStats = {
    public: repairs.filter((r) => r.isPublic).length,
    private: repairs.filter((r) => !r.isPublic).length,
  };

  const typeColumnData = [
    { type: '公共区域', value: typeStats.public },
    { type: '商户内部', value: typeStats.private },
  ];

  const typeColumnConfig = {
    data: typeColumnData,
    xField: 'type',
    yField: 'value',
    color: ['#1890ff', '#722ed1'],
    label: { position: 'top' },
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
              <Statistic
                title="待派工"
                value={repairs.filter((r) => r.status === 'pending').length}
                valueStyle={{ color: '#fa8c16' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <Statistic
                title="维修中"
                value={repairs.filter((r) => r.status === 'processing').length}
                valueStyle={{ color: '#1890ff' }}
                prefix={<ToolOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <Statistic
                title="已完成"
                value={repairs.filter((r) => r.status === 'completed').length}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <Statistic
                title="设备总数"
                value={equipments.length}
                valueStyle={{ color: '#722ed1' }}
                prefix={<ToolOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </motion.div>

      <Row gutter={16}>
        <Col xs={24} lg={17}>
          <Card>
            <Tabs defaultActiveKey="list">
              <TabPane tab="报修工单" key="list">
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                  <Radio.Group value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <Radio.Button value="all">全部</Radio.Button>
                    <Radio.Button value="pending">待派工</Radio.Button>
                    <Radio.Button value="processing">维修中</Radio.Button>
                    <Radio.Button value="completed">已完成</Radio.Button>
                  </Radio.Group>
                  <Space>
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={async () => {
                        try {
                          message.loading({ content: '正在导出...', key: 'export' });
                          await downloadFile('/reports/repairs', '设备报修报表.xlsx');
                          message.success({ content: '导出成功', key: 'export' });
                        } catch (e) {
                          message.error({ content: '导出失败', key: 'export' });
                        }
                      }}
                    >
                      导出报表
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>
                      发起报修
                    </Button>
                  </Space>
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
                      dataSource={filteredRepairs}
                      rowKey="id"
                      pagination={{ pageSize: 10 }}
                      scroll={{ x: 1200 }}
                    />
                  </motion.div>
                </AnimatePresence>
              </TabPane>

              <TabPane tab="公共设备列表" key="equipments">
                <Table
                  dataSource={equipments}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  columns={[
                    { title: '设备名称', dataIndex: 'name', key: 'name' },
                    {
                      title: '类型',
                      dataIndex: 'type',
                      key: 'type',
                      render: (v) => (
                        <Tag color={equipmentTypeColor[v]} style={{ border: 'none' }}>
                          {v}
                        </Tag>
                      ),
                    },
                    { title: '位置', dataIndex: 'location', key: 'location' },
                    {
                      title: '状态',
                      dataIndex: 'status',
                      key: 'status',
                      render: (v) =>
                        v === 'normal' ? (
                          <Tag color="green" icon={<CheckOutlined />}>正常</Tag>
                        ) : v === 'faulty' ? (
                          <Tag color="red" icon={<ExclamationCircleOutlined />}>故障</Tag>
                        ) : v === 'repairing' ? (
                          <Tag color="orange" icon={<ToolOutlined />}>维修中</Tag>
                        ) : (
                          <Tag>{v}</Tag>
                        ),
                    },
                  ]}
                />
              </TabPane>
            </Tabs>
          </Card>
        </Col>
        <Col xs={24} lg={7}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card title="工单状态分布">
              <Pie {...statusPieConfig} style={{ height: 260 }} />
            </Card>
            <Card title="报修类型统计">
              <Column {...typeColumnConfig} style={{ height: 260 }} />
            </Card>
          </Space>
        </Col>
      </Row>

      <Modal
        title="发起报修"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          createForm.resetFields();
          setRepairType('public');
        }}
        onOk={() => createForm.submit()}
        maskClosable={false}
        width={600}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          <Form.Item label="报修类型" required>
            <AntRadio.Group
              value={repairType}
              onChange={(e) => {
                setRepairType(e.target.value);
                createForm.setFieldsValue({ equipmentId: undefined, stallId: undefined });
              }}
            >
              <AntRadio.Button value="public">
                <EnvironmentOutlined /> 公共区域设备
              </AntRadio.Button>
              <AntRadio.Button value="private">
                <ShopOutlined /> 商户内部设备
              </AntRadio.Button>
            </AntRadio.Group>
          </Form.Item>
          {repairType === 'public' ? (
            <Form.Item name="equipmentId" label="选择设备" rules={[{ required: true }]}>
              <Select placeholder="请选择报修的公共设备">
                {equipments.map((e) => (
                  <Option key={e.id} value={e.id}>
                    {e.name} - {e.location}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          ) : (
            <Form.Item name="stallId" label="选择摊位" rules={[{ required: true }]}>
              <Select placeholder="请选择摊位">
                {stalls.map((s) => (
                  <Option key={s.id} value={s.id}>
                    {s.stallNumber} - {s.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
          <Form.Item name="isPublic" hidden initialValue={repairType === 'public'}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="故障描述" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="请详细描述故障情况" />
          </Form.Item>
          <Form.Item name="reporter" label="报修人">
            <Input placeholder="请输入报修人姓名（可选）" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="维修派工"
        open={isAssignModalOpen}
        onCancel={() => setIsAssignModalOpen(false)}
        onOk={() => assignForm.submit()}
        maskClosable={false}
      >
        <Form form={assignForm} layout="vertical" onFinish={handleAssign}>
          <Form.Item name="assigneeId" label="指派维修人员" rules={[{ required: true }]}>
            <Select placeholder="请选择维修人员">
              {admins
                .filter((a) => a.department === '维修组')
                .map((a) => (
                  <Option key={a.id} value={a.id}>
                    {a.name} - {a.role} ({a.phone})
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="完成维修"
        open={isCompleteModalOpen}
        onCancel={() => setIsCompleteModalOpen(false)}
        onOk={() => completeForm.submit()}
        maskClosable={false}
      >
        <Form form={completeForm} layout="vertical" onFinish={handleComplete}>
          <Form.Item name="handleResult" label="维修结果" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="请详细描述维修过程和结果" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="报修详情"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={700}
      >
        {currentRepair && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card size="small">
              <Steps current={['pending', 'processing', 'completed'].indexOf(currentRepair.status)} size="small">
                {getSteps(currentRepair.status).map((s, i) => (
                  <Step key={i} title={s.title} status={s.status} />
                ))}
              </Steps>
            </Card>

            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="报修类型">
                {currentRepair.isPublic ? (
                  <Tag color="blue">公共区域</Tag>
                ) : (
                  <Tag color="purple">商户内部</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusMap[currentRepair.status]?.color}>
                  {statusMap[currentRepair.status]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="设备/摊位" span={2}>
                {currentRepair.equipment
                  ? `${currentRepair.equipment.name} (${currentRepair.equipment.location})`
                  : currentRepair.stall
                  ? `${currentRepair.stall.stallNumber} - ${currentRepair.stall.name}`
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="报修人">{currentRepair.reporter || '匿名'}</Descriptions.Item>
              <Descriptions.Item label="报修时间">
                {dayjs(currentRepair.createdAt).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="故障描述">{currentRepair.description}</Descriptions.Item>
            </Descriptions>

            {currentRepair.assignee && (
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="维修人员">
                  {currentRepair.assignee.name}（{currentRepair.assignee.role}）
                </Descriptions.Item>
                <Descriptions.Item label="联系电话">{currentRepair.assignee.phone}</Descriptions.Item>
              </Descriptions>
            )}

            {currentRepair.handleResult && (
              <>
                <Divider orientation="left">维修结果</Divider>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="维修结果" span={2}>
                    {currentRepair.handleResult}
                  </Descriptions.Item>
                  <Descriptions.Item label="完成时间">
                    {dayjs(currentRepair.completedAt).format('YYYY-MM-DD HH:mm')}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}

            <Timeline
              items={[
                {
                  color: 'green',
                  children: (
                    <div>
                      <div>报修提交</div>
                      <div style={{ color: '#999', fontSize: 12 }}>
                        {dayjs(currentRepair.createdAt).format('YYYY-MM-DD HH:mm')}
                      </div>
                    </div>
                  ),
                },
                currentRepair.assignee && {
                  color: 'blue',
                  children: (
                    <div>
                      <div>已派工 - {currentRepair.assignee.name}</div>
                    </div>
                  ),
                },
                currentRepair.completedAt && {
                  color: 'green',
                  children: (
                    <div>
                      <div>维修完成</div>
                      <div style={{ color: '#999', fontSize: 12 }}>
                        {dayjs(currentRepair.completedAt).format('YYYY-MM-DD HH:mm')}
                      </div>
                    </div>
                  ),
                },
              ].filter(Boolean)}
            />
          </Space>
        )}
      </Modal>
    </Space>
  );
}

export default Repairs;
