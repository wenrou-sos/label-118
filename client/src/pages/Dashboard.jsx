import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, List, Avatar, Tag, Space, Typography, message } from 'antd';
import {
  ShopOutlined,
  UserOutlined,
  WarningOutlined,
  DollarOutlined,
  MessageOutlined,
  ToolOutlined,
  CalendarOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Pie, Line, Column } from '@ant-design/charts';
import api from '../api';
import dayjs from 'dayjs';

const { Title } = Typography;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recentActivities, setRecentActivities] = useState(null);
  const [hygieneData, setHygieneData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, recentRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/recent-activities'),
      ]);
      setSummary(summaryRes.data);
      setRecentActivities(recentRes.data);

      if (summaryRes.data.hygiene) {
        const h = summaryRes.data.hygiene;
        setHygieneData([
          { type: 'A级', value: h.A, color: '#52c41a' },
          { type: 'B级', value: h.B, color: '#fa8c16' },
          { type: 'C级', value: h.C, color: '#f5222d' },
        ]);
      }
    } catch (e) {
      message.error('加载数据失败');
    }
  };

  const statCards = summary
    ? [
        { title: '摊位总数', value: summary.stallCount, icon: <ShopOutlined />, color: '#1890ff' },
        { title: '商户数量', value: summary.merchantCount, icon: <UserOutlined />, color: '#52c41a' },
        { title: '今日开店', value: summary.todayOpenings, icon: <RiseOutlined />, color: '#13c2c2' },
        { title: '到期预警', value: summary.expiringLeases, icon: <WarningOutlined />, color: '#fa541c' },
        { title: '未缴租金', value: summary.unpaidBills, icon: <DollarOutlined />, color: '#eb2f96' },
        { title: '待处理投诉', value: summary.pendingComplaints, icon: <MessageOutlined />, color: '#722ed1' },
        { title: '待维修', value: summary.pendingRepairs, icon: <ToolOutlined />, color: '#fa8c16' },
        { title: '进行中活动', value: summary.ongoingActivities, icon: <CalendarOutlined />, color: '#2f54eb' },
      ]
    : [];

  const complaintStatusMap = {
    pending: { color: 'orange', text: '待处理' },
    processing: { color: 'blue', text: '处理中' },
    completed: { color: 'green', text: '已完成' },
    revisited: { color: 'purple', text: '已回访' },
  };

  const repairStatusMap = {
    pending: { color: 'orange', text: '待派工' },
    processing: { color: 'blue', text: '维修中' },
    completed: { color: 'green', text: '已完成' },
  };

  const activityStatusMap = {
    planning: { color: 'blue', text: '策划中' },
    ongoing: { color: 'green', text: '进行中' },
    completed: { color: 'gray', text: '已结束' },
  };

  const pieConfig = {
    data: hygieneData,
    angleField: 'value',
    colorField: 'type',
    color: ['#52c41a', '#fa8c16', '#f5222d'],
    radius: 0.8,
    label: {
      text: 'value',
      style: { fontWeight: 'bold' },
    },
    legend: { color: { position: 'bottom' } },
  };

  const visitorTrend = [
    { date: '1月', visitors: 3200 },
    { date: '2月', visitors: 4100 },
    { date: '3月', visitors: 3800 },
    { date: '4月', visitors: 5200 },
    { date: '5月', visitors: 6100 },
    { date: '6月', visitors: 5800 },
  ];

  const lineConfig = {
    data: visitorTrend,
    xField: 'date',
    yField: 'visitors',
    point: { size: 5, shape: 'diamond' },
    smooth: true,
    color: '#fa541c',
  };

  const monthlySales = [
    { month: '1月', sales: 580000 },
    { month: '2月', sales: 620000 },
    { month: '3月', sales: 590000 },
    { month: '4月', sales: 720000 },
    { month: '5月', sales: 810000 },
    { month: '6月', sales: 780000 },
  ];

  const columnConfig = {
    data: monthlySales,
    xField: 'month',
    yField: 'sales',
    color: '#fa541c',
    label: {
      position: 'top',
      formatter: (v) => (v.sales / 10000).toFixed(0) + '万',
    },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={3} style={{ marginTop: 0 }}>
          运营概览
        </Title>

        <motion.div variants={containerVariants}>
          <Row gutter={[16, 16]}>
            {statCards.map((card, idx) => (
              <Col xs={12} sm={8} md={6} lg={3} key={idx}>
                <motion.div variants={itemVariants}>
                  <Card className="stat-card" hoverable>
                    <Statistic
                      title={card.title}
                      value={card.value}
                      valueStyle={{ color: card.color }}
                      prefix={card.icon}
                    />
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Row gutter={16}>
            <Col xs={24} lg={8}>
              <Card title="卫生等级分布" className="dashboard-card">
                <Pie {...pieConfig} style={{ height: 280 }} />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="客流量趋势（月）" className="dashboard-card">
                <Line {...lineConfig} style={{ height: 280 }} />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="营业额统计（月）" className="dashboard-card">
                <Column {...columnConfig} style={{ height: 280 }} />
              </Card>
            </Col>
          </Row>
        </motion.div>

        <motion.div variants={containerVariants}>
          <Row gutter={16}>
            <Col xs={24} lg={8}>
              <motion.div variants={itemVariants}>
                <Card title="最新投诉" className="dashboard-card">
                  <List
                    dataSource={recentActivities?.complaints?.slice(0, 5) || []}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<MessageOutlined />} style={{ backgroundColor: '#722ed1' }} />}
                          title={
                            <Space>
                              <Tag color={complaintStatusMap[item.status]?.color || 'default'}>
                                {complaintStatusMap[item.status]?.text || item.type}
                              </Tag>
                              {item.type}
                            </Space>
                          }
                          description={
                            <div>
                              <div>{item.description}</div>
                              <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                                {dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} lg={8}>
              <motion.div variants={itemVariants}>
                <Card title="最新报修" className="dashboard-card">
                  <List
                    dataSource={recentActivities?.repairs?.slice(0, 5) || []}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<ToolOutlined />} style={{ backgroundColor: '#fa8c16' }} />}
                          title={
                            <Space>
                              <Tag color={repairStatusMap[item.status]?.color || 'default'}>
                                {repairStatusMap[item.status]?.text || '待派工'}
                              </Tag>
                              {item.equipment?.name || item.stall?.name || '商户设备'}
                            </Space>
                          }
                          description={
                            <div>
                              <div>{item.description}</div>
                              <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                                {dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} lg={8}>
              <motion.div variants={itemVariants}>
                <Card title="最新活动" className="dashboard-card">
                  <List
                    dataSource={recentActivities?.activities?.slice(0, 5) || []}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<CalendarOutlined />} style={{ backgroundColor: '#2f54eb' }} />}
                          title={
                            <Space>
                              <Tag color={activityStatusMap[item.status]?.color || 'default'}>
                                {activityStatusMap[item.status]?.text || '策划中'}
                              </Tag>
                              {item.name}
                            </Space>
                          }
                          description={
                            <div>
                              <div>{item.type}</div>
                              <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                                {dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </motion.div>
            </Col>
          </Row>
        </motion.div>
      </Space>
    </motion.div>
  );
}

export default Dashboard;
