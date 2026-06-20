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
  TimePicker,
  Card,
  Statistic,
  Row,
  Col,
  message,
  Tabs,
  Checkbox,
  Upload,
  Switch,
  Descriptions,
} from 'antd';
import {
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UploadOutlined,
  ClockCircleOutlined,
  FireOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import api from '../api';
import dayjs from 'dayjs';

const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = TimePicker;

const mockOpenings = [
  {
    id: 1,
    date: dayjs().subtract(1, 'day').toDate(),
    openTime: dayjs().subtract(1, 'day').hour(8).minute(0).toDate(),
    closeTime: dayjs().subtract(1, 'day').hour(22).minute(0).toDate(),
    stall: { id: 1, stallNumber: 'A-001', name: '老北京炸酱面摊位' },
  },
  {
    id: 2,
    date: dayjs().subtract(1, 'day').toDate(),
    openTime: dayjs().subtract(1, 'day').hour(8).minute(30).toDate(),
    closeTime: dayjs().subtract(1, 'day').hour(21).minute(30).toDate(),
    stall: { id: 2, stallNumber: 'A-002', name: '川味麻辣烫摊位' },
  },
  {
    id: 3,
    date: dayjs().subtract(1, 'day').toDate(),
    openTime: dayjs().subtract(1, 'day').hour(9).minute(0).toDate(),
    closeTime: dayjs().subtract(1, 'day').hour(23).minute(0).toDate(),
    stall: { id: 3, stallNumber: 'A-003', name: '粤式茶餐厅摊位' },
  },
  {
    id: 4,
    date: dayjs().subtract(1, 'day').toDate(),
    openTime: dayjs().subtract(1, 'day').hour(8).minute(15).toDate(),
    closeTime: dayjs().subtract(1, 'day').hour(22).minute(30).toDate(),
    stall: { id: 4, stallNumber: 'B-001', name: '日式料理摊位' },
  },
];

const mockFireInspections = [
  {
    id: 1,
    date: dayjs().subtract(1, 'day').toDate(),
    gasValveClosed: true,
    firePassageClear: true,
    inspector: '李主管',
    remark: '',
    photoUrl: null,
    stall: { id: 1, stallNumber: 'A-001', name: '老北京炸酱面摊位' },
  },
  {
    id: 2,
    date: dayjs().subtract(1, 'day').toDate(),
    gasValveClosed: true,
    firePassageClear: false,
    inspector: '李主管',
    remark: '消防通道有杂物',
    photoUrl: null,
    stall: { id: 2, stallNumber: 'A-002', name: '川味麻辣烫摊位' },
  },
  {
    id: 3,
    date: dayjs().subtract(1, 'day').toDate(),
    gasValveClosed: false,
    firePassageClear: true,
    inspector: '李主管',
    remark: '燃气阀门未关闭！',
    photoUrl: null,
    stall: { id: 6, stallNumber: 'C-001', name: '鲜果吧摊位' },
  },
];

const mockWasteRecords = [
  {
    id: 1,
    date: dayjs().subtract(1, 'day').toDate(),
    wasteType: '餐厨垃圾',
    weight: 5,
    collector: '清运公司A',
    remark: '',
    stall: { id: 1, stallNumber: 'A-001', name: '老北京炸酱面摊位' },
  },
  {
    id: 2,
    date: dayjs().subtract(1, 'day').toDate(),
    wasteType: '餐厨垃圾',
    weight: 7,
    collector: '清运公司A',
    remark: '',
    stall: { id: 2, stallNumber: 'A-002', name: '川味麻辣烫摊位' },
  },
  {
    id: 3,
    date: dayjs().subtract(1, 'day').toDate(),
    wasteType: '餐厨垃圾',
    weight: 12,
    collector: '清运公司A',
    remark: '桶较多',
    stall: { id: 3, stallNumber: 'A-003', name: '粤式茶餐厅摊位' },
  },
  {
    id: 4,
    date: dayjs().subtract(2, 'day').toDate(),
    wasteType: '餐厨垃圾',
    weight: 9,
    collector: '清运公司A',
    remark: '',
    stall: { id: 4, stallNumber: 'B-001', name: '日式料理摊位' },
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

function Daily() {
  const [openings, setOpenings] = useState(mockOpenings);
  const [fireInspections, setFireInspections] = useState(mockFireInspections);
  const [wasteRecords, setWasteRecords] = useState(mockWasteRecords);
  const [isOpeningModalOpen, setIsOpeningModalOpen] = useState(false);
  const [isFireModalOpen, setIsFireModalOpen] = useState(false);
  const [isWasteModalOpen, setIsWasteModalOpen] = useState(false);
  const [openingForm] = Form.useForm();
  const [fireForm] = Form.useForm();
  const [wasteForm] = Form.useForm();
  const [filterDate, setFilterDate] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [o, f, w] = await Promise.all([
        api.get('/daily/openings'),
        api.get('/daily/fire-inspections'),
        api.get('/daily/waste-records'),
      ]);
      if (o.data?.length) setOpenings(o.data);
      if (f.data?.length) setFireInspections(f.data);
      if (w.data?.length) setWasteRecords(w.data);
    } catch (e) {
      console.log('使用mock数据');
    }
  };

  const handleOpeningSubmit = async (values) => {
    try {
      const data = {
        stallId: values.stallId,
        date: values.date.toDate(),
        openTime: values.date.hour(values.openTime.hour()).minute(values.openTime.minute()).toDate(),
        closeTime: values.closeTime
          ? values.date.hour(values.closeTime.hour()).minute(values.closeTime.minute()).toDate()
          : null,
      };
      const res = await api.post('/daily/openings', data);
      setOpenings([res.data, ...openings]);
    } catch (e) {
      const stall = mockStalls.find((s) => s.id === values.stallId);
      setOpenings([
        {
          id: Date.now(),
          date: values.date.toDate(),
          openTime: values.date.hour(values.openTime.hour()).minute(values.openTime.minute()).toDate(),
          closeTime: values.closeTime
            ? values.date.hour(values.closeTime.hour()).minute(values.closeTime.minute()).toDate()
            : null,
          stall,
        },
        ...openings,
      ]);
    }
    message.success('开店记录已登记');
    setIsOpeningModalOpen(false);
    openingForm.resetFields();
  };

  const handleFireSubmit = async (values) => {
    try {
      const data = {
        ...values,
        date: values.date.toDate(),
      };
      const res = await api.post('/daily/fire-inspections', data);
      setFireInspections([res.data, ...fireInspections]);
    } catch (e) {
      const stall = mockStalls.find((s) => s.id === values.stallId);
      setFireInspections([
        {
          id: Date.now(),
          ...values,
          date: values.date.toDate(),
          stall,
        },
        ...fireInspections,
      ]);
    }
    message.success('消防检查已记录');
    setIsFireModalOpen(false);
    fireForm.resetFields();
  };

  const handleWasteSubmit = async (values) => {
    try {
      const data = {
        ...values,
        date: values.date.toDate(),
      };
      const res = await api.post('/daily/waste-records', data);
      setWasteRecords([res.data, ...wasteRecords]);
    } catch (e) {
      const stall = mockStalls.find((s) => s.id === values.stallId);
      setWasteRecords([
        {
          id: Date.now(),
          ...values,
          date: values.date.toDate(),
          stall,
        },
        ...wasteRecords,
      ]);
    }
    message.success('垃圾清运记录已创建');
    setIsWasteModalOpen(false);
    wasteForm.resetFields();
  };

  const openingColumns = [
    {
      title: '摊位',
      dataIndex: ['stall', 'stallNumber'],
      key: 'stall',
      render: (v, row) => (
        <Space>
          <Tag color="blue">{v}</Tag>
          <span>{row.stall?.name}</span>
        </Space>
      ),
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (v) => dayjs(v).format('YYYY-MM-DD'),
    },
    {
      title: '开店时间',
      dataIndex: 'openTime',
      key: 'openTime',
      render: (v) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#52c41a' }} />
          {dayjs(v).format('HH:mm')}
        </Space>
      ),
    },
    {
      title: '闭店时间',
      dataIndex: 'closeTime',
      key: 'closeTime',
      render: (v) =>
        v ? (
          <Space>
            <ClockCircleOutlined style={{ color: '#fa541c' }} />
            {dayjs(v).format('HH:mm')}
          </Space>
        ) : (
          <Tag color="orange">营业中</Tag>
        ),
    },
    {
      title: '营业时长',
      key: 'duration',
      render: (_, row) => {
        if (!row.closeTime) return '-';
        const duration = dayjs(row.closeTime).diff(dayjs(row.openTime), 'hour', true);
        return <span style={{ fontWeight: 600 }}>{duration.toFixed(1)}小时</span>;
      },
    },
  ];

  const fireColumns = [
    {
      title: '摊位',
      dataIndex: ['stall', 'stallNumber'],
      key: 'stall',
      render: (v, row) => (
        <Space>
          <Tag color="blue">{v}</Tag>
          <span>{row.stall?.name}</span>
        </Space>
      ),
    },
    {
      title: '检查日期',
      dataIndex: 'date',
      key: 'date',
      render: (v) => dayjs(v).format('YYYY-MM-DD'),
    },
    {
      title: '燃气阀门',
      dataIndex: 'gasValveClosed',
      key: 'gas',
      align: 'center',
      render: (v) =>
        v ? (
          <Tag color="green" icon={<CheckCircleOutlined />}>已关闭</Tag>
        ) : (
          <Tag color="red" icon={<CloseCircleOutlined />}>未关闭</Tag>
        ),
    },
    {
      title: '消防通道',
      dataIndex: 'firePassageClear',
      key: 'passage',
      align: 'center',
      render: (v) =>
        v ? (
          <Tag color="green" icon={<CheckCircleOutlined />}>畅通</Tag>
        ) : (
          <Tag color="orange" icon={<CloseCircleOutlined />}>不畅通</Tag>
        ),
    },
    {
      title: '检查员',
      dataIndex: 'inspector',
      key: 'inspector',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      render: (v) => v || '-',
    },
  ];

  const wasteColumns = [
    {
      title: '摊位',
      dataIndex: ['stall', 'stallNumber'],
      key: 'stall',
      render: (v, row) => (
        <Space>
          <Tag color="blue">{v}</Tag>
          <span>{row.stall?.name}</span>
        </Space>
      ),
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (v) => dayjs(v).format('YYYY-MM-DD'),
    },
    {
      title: '垃圾类型',
      dataIndex: 'wasteType',
      key: 'wasteType',
      render: (v) => <Tag color="purple">{v}</Tag>,
    },
    {
      title: '重量(kg)',
      dataIndex: 'weight',
      key: 'weight',
      render: (v) => <span style={{ fontWeight: 600 }}>{v} kg</span>,
    },
    {
      title: '清运人员/公司',
      dataIndex: 'collector',
      key: 'collector',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      render: (v) => v || '-',
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
              <Statistic title="今日开店" value={openings.length} valueStyle={{ color: '#52c41a' }} prefix={<ClockCircleOutlined />} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <Statistic
                title="消防检查合格"
                value={fireInspections.filter((f) => f.gasValveClosed && f.firePassageClear).length}
                valueStyle={{ color: '#13c2c2' }}
                prefix={<FireOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <Statistic
                title="消防异常"
                value={fireInspections.filter((f) => !f.gasValveClosed || !f.firePassageClear).length}
                valueStyle={{ color: '#fa541c' }}
                prefix={<FireOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <Statistic
                title="垃圾清运量"
                value={wasteRecords.reduce((sum, w) => sum + w.weight, 0)}
                suffix="kg"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
      </motion.div>

      <Card>
        <Tabs defaultActiveKey="opening">
          <TabPane tab="开店时间登记" key="opening">
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
              <Space>
                <DatePicker placeholder="选择日期" onChange={setFilterDate} allowClear />
              </Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsOpeningModalOpen(true)}>
                登记开店
              </Button>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Table
                columns={openingColumns}
                dataSource={openings}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </motion.div>
          </TabPane>

          <TabPane tab="消防检查" key="fire">
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsFireModalOpen(true)}>
                新增检查记录
              </Button>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Table
                columns={fireColumns}
                dataSource={fireInspections}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </motion.div>
          </TabPane>

          <TabPane tab="垃圾清运记录" key="waste">
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
              <Space>
                <Select placeholder="垃圾类型" allowClear style={{ width: 140 }}>
                  <Option value="餐厨垃圾">餐厨垃圾</Option>
                  <Option value="可回收垃圾">可回收垃圾</Option>
                  <Option value="其他垃圾">其他垃圾</Option>
                </Select>
              </Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsWasteModalOpen(true)}>
                创建清运记录
              </Button>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Table
                columns={wasteColumns}
                dataSource={wasteRecords}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </motion.div>
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title="登记开店"
        open={isOpeningModalOpen}
        onCancel={() => setIsOpeningModalOpen(false)}
        onOk={() => openingForm.submit()}
        maskClosable={false}
      >
        <Form form={openingForm} layout="vertical" onFinish={handleOpeningSubmit}>
          <Form.Item name="stallId" label="选择摊位" rules={[{ required: true }]}>
            <Select placeholder="选择摊位">
              {mockStalls.map((s) => (
                <Option key={s.id} value={s.id}>
                  {s.stallNumber} - {s.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="date" label="日期" rules={[{ required: true }]} initialValue={dayjs()}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="openTime" label="开店时间" rules={[{ required: true }]}>
            <TimePicker style={{ width: '100%' }} format="HH:mm" />
          </Form.Item>
          <Form.Item name="closeTime" label="闭店时间">
            <TimePicker style={{ width: '100%' }} format="HH:mm" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="消防检查"
        open={isFireModalOpen}
        onCancel={() => setIsFireModalOpen(false)}
        onOk={() => fireForm.submit()}
        maskClosable={false}
      >
        <Form form={fireForm} layout="vertical" onFinish={handleFireSubmit}>
          <Form.Item name="stallId" label="选择摊位" rules={[{ required: true }]}>
            <Select placeholder="选择摊位">
              {mockStalls.map((s) => (
                <Option key={s.id} value={s.id}>
                  {s.stallNumber} - {s.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="date" label="检查日期" rules={[{ required: true }]} initialValue={dayjs()}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="inspector" label="检查员" rules={[{ required: true }]}>
            <Input placeholder="请输入检查员姓名" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="gasValveClosed"
                label="燃气阀门已关闭"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="firePassageClear"
                label="消防通道畅通"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="photoUrl" label="现场照片">
            <Upload
              listType="picture"
              maxCount={1}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>上传照片</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="创建垃圾清运记录"
        open={isWasteModalOpen}
        onCancel={() => setIsWasteModalOpen(false)}
        onOk={() => wasteForm.submit()}
        maskClosable={false}
      >
        <Form form={wasteForm} layout="vertical" onFinish={handleWasteSubmit}>
          <Form.Item name="stallId" label="选择摊位" rules={[{ required: true }]}>
            <Select placeholder="选择摊位">
              {mockStalls.map((s) => (
                <Option key={s.id} value={s.id}>
                  {s.stallNumber} - {s.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="date" label="日期" rules={[{ required: true }]} initialValue={dayjs()}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="wasteType" label="垃圾类型" rules={[{ required: true }]} initialValue="餐厨垃圾">
            <Select>
              <Option value="餐厨垃圾">餐厨垃圾</Option>
              <Option value="可回收垃圾">可回收垃圾</Option>
              <Option value="其他垃圾">其他垃圾</Option>
            </Select>
          </Form.Item>
          <Form.Item name="weight" label="重量(kg)" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入重量" />
          </Form.Item>
          <Form.Item name="collector" label="清运人员/公司" rules={[{ required: true }]}>
            <Input placeholder="请输入清运人员或公司名称" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

export default Daily;
