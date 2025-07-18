import React, { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';

const ProgressBar = ({ percent }) => (
  <div style={{ width: '100%', background: '#e5e7eb', borderRadius: '6px', height: '8px', marginTop: '10px' }}>
    <div
      style={{
        width: `${percent}%`,
        background: '#2563eb',
        height: '100%',
        borderRadius: '6px',
        transition: 'width 0.3s'
      }}
    />
  </div>
);

const UploadImage = ({ files, setFiles, getRootProps, getInputProps, isProcessing, progress = 0 }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ marginRight: 8 }}>
          <rect x="3" y="3" width="18" height="18" rx="4" fill="#6366f1" />
          <path d="M8 15l4-4 4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9" cy="9" r="2" fill="#fff" />
        </svg>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', margin: 0 }}>上传图片</h2>
      </div>
      <div {...getRootProps()} style={{ border: '2px dashed #d1d5db', borderRadius: '8px', padding: '24px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#f9fafb' }}>
        <input {...getInputProps()} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <svg style={{ height: '48px', width: '48px', color: '#9ca3af', marginBottom: '8px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p style={{ color: '#4b5563' }}>拖拽图片到这里，或者点击选择文件</p>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>(支持JPG, PNG格式)</p>
        </div>
      </div>
      {files.length > 0 && (
        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center' }}>
          <div
            style={{ fontSize: '14px', color: '#4b5563', marginRight: '12px', cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => setIsPreviewOpen(true)}
            title="点击预览图片"
          >
            已选择: {files[0].name}
          </div>
          <div
            onClick={() => setFiles([])}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '12px',
              height: '12px',
              background: '#ef4444',
              borderRadius: '50%',
              cursor: 'pointer',
              color: 'white',
              border: 'none',
              marginLeft: '4px'
            }}
            title="删除图片"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      )}
      {isProcessing && (
        <div style={{ marginTop: '18px', textAlign: 'center' }}>
          <span style={{ color: '#2563eb', fontWeight: 500, fontSize: '15px' }}>
            正在识别中，请稍候...（{progress}%）
          </span>
          <ProgressBar percent={progress} />
        </div>
      )}
      {isPreviewOpen && files.length > 0 && (
        <Lightbox
          open={isPreviewOpen}
          close={() => setIsPreviewOpen(false)}
          slides={[{ src: URL.createObjectURL(files[0]), alt: files[0].name }]}
          plugins={[Zoom]}
        />
      )}
    </div>
  );
};

export default UploadImage;