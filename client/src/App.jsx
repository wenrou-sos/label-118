import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme } from 'antd';
import {
  ShopOutlined,
  DollarOutlined,
  CoffeeOutlined,
  CustomerServiceOutlined,
  CalendarOutlined,
  ToolOutlined,
  DashboardOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from './pages/Dashboard.jsx';
import Stalls from './pages/Stalls.jsx';
import Rents from './pages/Rents.jsx';
import Daily from './pages/Daily.jsx';
import Complaints from './pages/Complaints.jsx';
import Activities from './pages/Activities.jsx';
import Repairs from './pages/Repairs.jsx';
import Notices from './pages/Notices.jsx';

const { Header, Content, Sider } = Layout;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '运营看板' },
  { key: '/notices', icon: <BellOutlined />, label: '通知公告' },
  { key: '/stalls', icon: <ShopOutlined />, label: '摊位管理' },
  { key: '/rents', icon: <DollarOutlined />, label: '租金管理' },
  { key: '/daily', icon: <CoffeeOutlined />, label: '商户日常' },
  { key: '/complaints', icon: <CustomerServiceOutlined />, label: '顾客服务' },
  { key: '/activities', icon: <CalendarOutlined />, label: '活动管理' },
  { key: '/repairs', icon: <ToolOutlined />, label: '设备报修' },
];

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const pageVariants = {
    initial: { opacity: 0, x: -20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: 20 },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.3,
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: 'linear-gradient(180deg, #fa541c 0%, #d4380d 100%)',
        }}
      >
        <div className="logo">
          {collapsed ? '美' : '美食街管理平台'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: 'transparent',
            borderInlineEnd: 'none',
          }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#fa541c' }}>
            {menuItems.find((item) => item.key === location.pathname)?.label || '美食街物业运营管理平台'}
          </h2>
          <div style={{ color: '#666', fontSize: 14 }}>
            欢迎使用美食街物业运营管理系统
          </div>
        </Header>
        <Content
          style={{
            margin: '0px',
            padding: '0px',
            minHeight: 280,
            background: '#f0f2f5',
          }}
        >
          <div
            className="page-container"
            style={{
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/notices" element={<Notices />} />
                  <Route path="/stalls" element={<Stalls />} />
                  <Route path="/rents" element={<Rents />} />
                  <Route path="/daily" element={<Daily />} />
                  <Route path="/complaints" element={<Complaints />} />
                  <Route path="/activities" element={<Activities />} />
                  <Route path="/repairs" element={<Repairs />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
