import React, { useState, useEffect } from 'react';
import {
  List,
  Button,
  Upload,
  Modal,
  Tag,
  Space,
  message,
  Popconfirm,
  Spin,
} from 'antd';
import {
  FileOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import api from '../api';
import dayjs from 'dayjs';

const { Dragger } = Upload;

function LeaseDocumentList({ leaseId, stallNumber }) {
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  useEffect(() => {
    if (leaseId) {
      loadDocuments();
    }
  }, [leaseId]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/lease-documents/${leaseId}`);
      const list = res.data || [];
      list.sort((a, b) => b.version - a.version);
      setDocuments(list);
    } catch (e) {
      message.error('加载文件列表失败');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (size) => {
    if (!size) return '0 KB';
    const kb = size / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(2)} KB`;
    }
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const handlePreview = (file) => {
    setPreviewFile(file);
    setPreviewVisible(true);
  };

  const handleDownload = async (id) => {
    try {
      const res = await api.get(`/lease-documents/${id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      const doc = documents.find((d) => d.id === id);
      link.setAttribute('download', doc ? doc.originalName : 'file');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      message.error('下载失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/lease-documents/${id}`);
      message.success('删除成功');
      loadDocuments();
    } catch (e) {
      message.error('删除失败');
    }
  };

  const uploadProps = {
    name: 'file',
    action: `/api/lease-documents/${leaseId}/upload`,
    accept: '.pdf,.jpg,.jpeg,.png,.gif',
    beforeUpload: (file) => {
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
      ];
      const isAllowed = allowedTypes.includes(file.type) || 
        /\.(pdf|jpg|jpeg|png|gif)$/i.test(file.name);
      if (!isAllowed) {
        message.error('仅支持 PDF、JPG、JPEG、PNG、GIF 格式文件!');
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('文件大小不能超过 10MB!');
        return false;
      }
      return true;
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 上传成功`);
        loadDocuments();
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败`);
      }
    },
  };

  const isImage = (file) => {
    if (!file) return false;
    const name = file.originalName || '';
    return /\.(jpg|jpeg|png|gif)$/i.test(name);
  };

  const isPdf = (file) => {
    if (!file) return false;
    const name = file.originalName || '';
    return /\.pdf$/i.test(name);
  };

  const getPreviewUrl = (file) => {
    return `/api/lease-documents/${file.id}/download`;
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Dragger {...uploadProps} style={{ padding: '16px 0' }}>
        <p className="ant-upload-drag-icon">
          <UploadOutlined style={{ color: '#fa541c' }} />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p className="ant-upload-hint">
          支持 PDF、JPG、JPEG、PNG、GIF 格式，单个文件不超过 10MB
        </p>
      </Dragger>

      <div>
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 500, fontSize: 16 }}>
            合同文件列表
            {stallNumber && (
              <Tag color="orange" style={{ marginLeft: 8 }}>
                {stallNumber}
              </Tag>
            )}
          </span>
          <span style={{ color: '#666', fontSize: 13 }}>
            共 {documents.length} 个文件
          </span>
        </div>

        <Spin spinning={loading}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <List
              dataSource={documents}
              rowKey="id"
              locale={{ emptyText: '暂无合同文件' }}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      type="link"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handlePreview(item)}
                    >
                      预览
                    </Button>,
                    <Button
                      type="link"
                      size="small"
                      icon={<DownloadOutlined />}
                      onClick={() => handleDownload(item.id)}
                    >
                      下载
                    </Button>,
                    <Popconfirm
                      title="确定要删除该文件吗？"
                      description="删除后无法恢复"
                      okText="确定"
                      cancelText="取消"
                      onConfirm={() => handleDelete(item.id)}
                    >
                      <Button
                        type="link"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                      >
                        删除
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <FileOutlined
                        style={{ fontSize: 24, color: '#fa541c' }}
                      />
                    }
                    title={
                      <Space>
                        <a
                          onClick={() => handlePreview(item)}
                          style={{ color: '#333' }}
                        >
                          {item.originalName}
                        </a>
                        <Tag color="orange">v{item.version}</Tag>
                      </Space>
                    }
                    description={
                      <Space size="large" style={{ color: '#999', fontSize: 12 }}>
                        <span>{formatFileSize(item.size)}</span>
                        <span>
                          {dayjs(item.uploadTime || item.createdAt).format(
                            'YYYY-MM-DD HH:mm'
                          )}
                        </span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </motion.div>
        </Spin>
      </div>

      <Modal
        title={previewFile?.originalName}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="download" icon={<DownloadOutlined />} onClick={() => handleDownload(previewFile?.id)}>
            下载
          </Button>,
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
        bodyStyle={{ padding: 0, minHeight: 500 }}
      >
        {previewFile && isPdf(previewFile) && (
          <iframe
            src={getPreviewUrl(previewFile)}
            width="100%"
            height="600"
            title="pdf-preview"
            style={{ border: 'none' }}
          />
        )}
        {previewFile && isImage(previewFile) && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
            <img
              src={getPreviewUrl(previewFile)}
              alt={previewFile.originalName}
              style={{ maxWidth: '100%', maxHeight: '600px' }}
            />
          </div>
        )}
        {previewFile && !isPdf(previewFile) && !isImage(previewFile) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 500,
              color: '#999',
            }}
          >
            该文件类型不支持预览，请下载后查看
          </div>
        )}
      </Modal>
    </Space>
  );
}

export default LeaseDocumentList;
