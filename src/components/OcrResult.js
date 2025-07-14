import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Select } from 'antd';
import Editor from 'react-simple-code-editor';

const OcrResult = ({
  report,
  codeBlock,
  language,
  setLanguage,
  LANGUAGE_OPTIONS,
  formatCode,
  highlightCode,
  setCodeBlock,
  ocrImage // 新增：传入图片 File 或 URL
}) => {
  const [compareMode, setCompareMode] = useState(false);

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
        {/* 识别报告图标 */}
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ marginRight: 8 }}>
          <rect x="2" y="2" width="18" height="18" rx="4" fill="#22d3ee" />
          <path d="M7 7h8v8H7V7z" stroke="#fff" strokeWidth="2" />
          <path d="M7 11h8" stroke="#fff" strokeWidth="2" />
        </svg>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', margin: 0 }}>识别报告</h2>
        <button
          onClick={() => setCompareMode(!compareMode)}
          style={{
            marginLeft: 'auto',
            padding: '8px 16px',
            backgroundColor: compareMode ? '#6366f1' : '#e5e7eb',
            color: compareMode ? '#fff' : '#374151',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {compareMode ? '关闭对比' : '开启对比'}
        </button>
      </div>

      {!compareMode ? (
        // 保持原有单窗模式
        <>
          {/* 识别报告 */}
          <div style={{ border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px', background: '#f9fafb', minHeight: '60px', color: '#374151', marginBottom: '24px' }}>
            {report ? (
              <ReactMarkdown
                children={report}
                components={{
                  h1: ({ node, ...props }) => <h3 style={{ color: '#2563eb', fontSize: '18px', margin: '8px 0' }} {...props} />,
                  h2: ({ node, ...props }) => <h4 style={{ color: '#2563eb', fontSize: '16px', margin: '6px 0' }} {...props} />,
                  ul: ({ node, ...props }) => <ul style={{ paddingLeft: '20px', margin: '6px 0' }} {...props} />,
                  li: ({ node, ...props }) => <li style={{ marginBottom: '2px' }} {...props} />,
                  p: ({ node, ...props }) => <p style={{ margin: '4px 0' }} {...props} />,
                  code: ({ node, ...props }) => <code style={{ background: '#e5e7eb', borderRadius: '4px', padding: '2px 4px' }} {...props} />,
                  table: ({ node, ...props }) => <table style={{ borderCollapse: 'collapse', width: '100%' }} {...props} />,
                  th: ({ node, ...props }) => <th style={{ border: '1px solid #d1d5db', background: '#f3f4f6', padding: '4px' }} {...props} />,
                  td: ({ node, ...props }) => <td style={{ border: '1px solid #d1d5db', padding: '4px' }} {...props} />,
                }}
              />
            ) : <span style={{ color: '#9ca3af' }}>暂无报告</span>}
          </div>
          {/* 代码编辑器 */}
          <div style={{ border: '1px solid #d1d5db', borderRadius: '8px', overflow: 'hidden' }}>
            <Editor
              value={codeBlock}
              onValueChange={code => setCodeBlock(code)}
              highlight={highlightCode}
              padding={10}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 14,
                minHeight: '200px'
              }}
            />
          </div>
        </>
      ) : (
        // 对比模式：左图右码
        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{
            flex: 1,
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            background: '#f9fafb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px'
          }}>
            {ocrImage ? (
              <img
                src={typeof ocrImage === 'string' ? ocrImage : URL.createObjectURL(ocrImage)}
                alt="OCR原图"
                style={{ maxWidth: '100%', maxHeight: '350px', borderRadius: '8px' }}
              />
            ) : (
              <span style={{ color: '#9ca3af' }}>暂无图片</span>
            )}
          </div>
          <div style={{
            flex: 1,
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            overflow: 'hidden',
            background: '#fff'
          }}>
            <Editor
              value={codeBlock}
              onValueChange={code => setCodeBlock(code)}
              highlight={highlightCode}
              padding={10}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 14,
                minHeight: '200px'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OcrResult;