import React from 'react';
import { Modal, Descriptions, Tag, Space, Divider, Typography, Button } from 'antd';
import dayjs from 'dayjs';
import LeaseDocumentList from './LeaseDocumentList';

const { Title } = Typography;

function LeaseDetailModal({ visible, onCancel, lease, stall, merchant }) {
  const renderStatus = (status) => {
    if (status === 'active') {
      return <Tag color="green">正常</Tag>;
    }
    if (status === 'expired') {
      return <Tag color="default">已到期</Tag>;
    }
    return <Tag>{status}</Tag>;
  };

  const renderMoney = (value) => {
    if (value === undefined || value === null) return '-';
    return <span style={{ fontWeight: 600, color: '#fa541c' }}>¥{value.toLocaleString()}</span>;
  };

  const footer = [
    <Button key="close" onClick={onCancel}>
      关闭
    </Button>,
  ];

  return (
    <Modal
      title={`租约详情 - ${stall?.stallNumber || ''}`}
      open={visible}
      onCancel={onCancel}
      footer={footer}
      width={800}
      maskClosable={false}
    >
      {lease && (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Descriptions bordered column={2} size="middle">
            <Descriptions.Item label="摊位编号">
              <Tag color="blue">{stall?.stallNumber || '-'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="摊位名称">
              {stall?.name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="商户名称">
              {merchant?.name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="联系人">
              {merchant?.contactPerson || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="联系电话">
              {merchant?.phone || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="租约状态">
              {renderStatus(lease.status)}
            </Descriptions.Item>
            <Descriptions.Item label="开始日期">
              {lease.startDate ? dayjs(lease.startDate).format('YYYY-MM-DD') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="结束日期">
              {lease.endDate ? dayjs(lease.endDate).format('YYYY-MM-DD') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="月租金">
              {renderMoney(lease.monthlyRent)}
            </Descriptions.Item>
            <Descriptions.Item label="押金">
              {renderMoney(lease.deposit)}
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="left" orientationMargin={0}>
            <Title level={5} style={{ margin: 0 }}>
              合同文件
            </Title>
          </Divider>

          <LeaseDocumentList leaseId={lease.id} />
        </Space>
      )}
    </Modal>
  );
}

export default LeaseDetailModal;
