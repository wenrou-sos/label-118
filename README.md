# 美食街物业运营管理平台

一个功能完善的美食街物业运营管理平台，采用 React + Ant Design + Framer Motion 构建前端界面，Node.js + Express + PostgreSQL + Prisma 构建后端服务。

## 功能模块

### 1. 摊位管理模块
- 租约到期预警系统，自动提醒即将到期的摊位租约
- 租金账单生成、展示及缴费记录管理功能
- 经营品类变更申请与审批流程
- 卫生等级公示系统，采用A级/B级/C级笑脸图标直观展示

### 2. 商户日常管理模块
- 每日开店时间登记功能
- 消防检查管理，包括闭店前燃气阀门关闭确认及消防通道畅通拍照上传
- 餐厨垃圾清运记录的创建、查询与管理

### 3. 顾客服务模块
- 顾客投诉受理系统，支持菜品质量、卫生问题、服务态度、价格争议等投诉类型
- 投诉派单功能，可将投诉任务分配给指定管理员
- 投诉处理结果记录与顾客回访功能

### 4. 美食街活动模块
- 活动策划功能，支持美食节、夜市集市、周末特惠、打卡集章等活动类型
- 商户活动报名参与管理系统
- 活动数据统计分析功能，包括客流量统计和参与商户销售额增长分析

### 5. 设备报修模块
- 公共区域（卫生间、电梯、空调、停车场）设备故障报修功能
- 商户内部设备故障报修功能
- 维修派工系统，可将报修任务分配给物业维修组
- 维修进度跟踪与状态更新功能

## 技术栈

### 前端
- React 18
- Ant Design 5
- React Router 6
- Framer Motion (动画效果)
- @ant-design/charts (数据可视化)
- Axios
- Day.js
- Vite

### 后端
- Node.js
- Express
- Prisma (ORM)
- PostgreSQL
- Day.js
- Multer (文件上传)

## 项目结构

```
label-118/
├── client/                 # 前端应用
│   ├── src/
│   │   ├── api/            # API 请求封装
│   │   ├── pages/          # 页面组件
│   │   │   ├── Dashboard.jsx      # 运营看板
│   │   │   ├── Stalls.jsx         # 摊位管理
│   │   │   ├── Rents.jsx          # 租金管理
│   │   │   ├── Daily.jsx          # 商户日常
│   │   │   ├── Complaints.jsx     # 顾客服务
│   │   │   ├── Activities.jsx     # 活动管理
│   │   │   └── Repairs.jsx        # 设备报修
│   │   ├── styles/         # 全局样式
│   │   ├── App.jsx         # 主应用组件
│   │   └── main.jsx        # 应用入口
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                 # 后端服务
│   ├── src/
│   │   ├── routes/         # API 路由
│   │   │   ├── stalls.js
│   │   │   ├── merchants.js
│   │   │   ├── rents.js
│   │   │   ├── complaints.js
│   │   │   ├── activities.js
│   │   │   ├── repairs.js
│   │   │   ├── daily.js
│   │   │   └── dashboard.js
│   │   └── index.js        # 服务器入口
│   ├── prisma/
│   │   ├── schema.prisma   # 数据库模型
│   │   └── seed.js         # 种子数据
│   ├── .env
│   └── package.json
├── package.json
└── README.md
```

## 快速开始

### 前置条件
- Node.js >= 16
- PostgreSQL >= 13
- npm 或 yarn

### 1. 安装依赖

```bash
# 方式一：一键安装所有依赖
npm run install:all

# 方式二：分别安装
# 安装根目录依赖
npm install

# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install
```

### 2. 配置数据库

1. 创建 PostgreSQL 数据库：
```sql
CREATE DATABASE food_street;
```

2. 修改 `server/.env` 中的数据库连接配置：
```
DATABASE_URL="postgresql://用户名:密码@localhost:5432/food_street?schema=public"
```

3. 初始化数据库并生成种子数据：
```bash
cd server

# 生成 Prisma Client
npm run prisma:generate

# 执行数据库迁移
npm run prisma:migrate

# 插入种子数据
npm run prisma:seed
```

### 3. 启动开发服务

```bash
# 同时启动前后端（推荐）
cd ..
npm run dev

# 或者分别启动：
# 启动后端（端口 3001）
npm run dev:server

# 启动前端（端口 5173）
npm run dev:client
```

### 4. 访问应用

打开浏览器访问：http://localhost:5173

> **注意**：如果数据库未配置，前端仍可正常使用（内置 Mock 数据用于演示）。

## 动画效果说明

平台采用 Framer Motion 实现了丰富的动画效果：

1. **页面切换动画**：页面切换时的淡入淡出 + 滑入效果
2. **统计卡片动画**：鼠标悬停时卡片上浮 + 阴影加深效果
3. **列表数据动画**：数据加载时的错峰淡入效果
4. **筛选切换动画**：筛选状态切换时的平滑过渡
5. **Tab 切换动画**：内容切换时的淡入效果
6. **模态框动画**：Ant Design 内置平滑过渡动画

所有动画均遵循用户体验优先原则，不影响系统性能。

## API 接口

所有 API 接口以 `/api` 为前缀：

| 模块 | 接口 | 说明 |
|------|------|------|
| 运营看板 | GET /api/dashboard/summary | 获取概览统计 |
| | GET /api/dashboard/recent-activities | 获取最新动态 |
| 摊位管理 | GET /api/stalls | 获取摊位列表 |
| | GET /api/stalls/lease/warning | 获取租约到期预警 |
| | GET /api/stalls/category-requests | 获取品类变更申请 |
| | PUT /api/stalls/category-requests/:id/approve | 批准变更 |
| | PUT /api/stalls/category-requests/:id/reject | 拒绝变更 |
| 租金管理 | GET /api/rents | 获取租金账单 |
| | GET /api/rents/statistics | 获取租金统计 |
| | PUT /api/rents/:id/pay | 确认缴费 |
| 顾客服务 | GET /api/complaints | 获取投诉列表 |
| | PUT /api/complaints/:id/assign | 投诉派单 |
| | PUT /api/complaints/:id/complete | 处理完成 |
| | PUT /api/complaints/:id/revisit | 顾客回访 |
| 活动管理 | GET /api/activities | 获取活动列表 |
| | POST /api/activities/:id/participations | 商户报名 |
| 设备报修 | GET /api/repairs | 获取报修列表 |
| | PUT /api/repairs/:id/assign | 维修派工 |
| | PUT /api/repairs/:id/complete | 完成维修 |
| 商户日常 | GET /api/daily/openings | 获取开店记录 |
| | GET /api/daily/fire-inspections | 获取消防检查 |
| | GET /api/daily/waste-records | 获取垃圾清运记录 |
| | GET /api/daily/admins | 获取管理员列表 |
