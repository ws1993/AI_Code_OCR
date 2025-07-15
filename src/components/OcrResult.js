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
  const [imgScale, setImgScale] = useState(1);
  const [imgOffset, setImgOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const MIN_SCALE = 0.2;
  const MAX_SCALE = 5;

  const handleWheel = (e) => {
    e.preventDefault();
    e.stopPropagation(); // 阻止事件冒泡到页面
    let newScale = imgScale + (e.deltaY < 0 ? 0.5 : -0.5);
    newScale = Math.max(MIN_SCALE, Math.min(newScale, MAX_SCALE));
    setImgScale(newScale);
  };

  const handleZoomIn = () => {
    if (imgScale < MAX_SCALE) setImgScale(prev => Math.min(prev + 0.5, MAX_SCALE));
  };
  const handleZoomOut = () => {
    if (imgScale > MIN_SCALE) setImgScale(prev => Math.max(prev - 0.5, MIN_SCALE));
  };

  const handleMouseDown = (e) => {
    setDragging(true);
    setStartPos({ x: e.clientX - imgOffset.x, y: e.clientY - imgOffset.y });
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      setImgOffset({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y
      });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

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
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            {/* 识别代码图标（代码相关） */}
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ marginRight: 8 }}>
              <rect x="2" y="2" width="18" height="18" rx="4" fill="#6366f1" />
              <path d="M7 11l2-2m0 0l2 2m-2-2v6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15 8l-2 2m0 0l2 2m-2-2v6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', margin: 0 }}>识别代码</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ marginRight: '12px', color: '#4b5563' }}>选择语言:</span>
            <Select
              showSearch
              value={language}
              placeholder="请选择语言"
              optionFilterProp="children"
              onChange={value => setLanguage(value)}
              filterOption={(input, option) =>
                option?.children?.toLowerCase().includes(input.toLowerCase())
              }
              style={{ minWidth: 180, width: 220 }}
            >
              {LANGUAGE_OPTIONS.map(lang => (
                <Select.Option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </Select.Option>
              ))}
            </Select>
            <button
              onClick={() => formatCode(codeBlock)}
              style={{
                marginLeft: '16px',
                padding: '8px 16px',
                backgroundColor: '#e5e7eb',
                borderRadius: '8px',
                color: '#374151',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              格式化代码
            </button>
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
          <div
            style={{
              flex: 1,
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              background: '#f9fafb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '350px',
              height: '350px',
              overflow: 'hidden',
              position: 'relative',
              userSelect: 'none'
            }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* 缩放按钮 */}
            <div style={{
              position: 'absolute',
              top: 12,
              right: 16,
              display: 'flex',
              gap: 8,
              zIndex: 2
            }}>
              <button
                onClick={handleZoomOut}
                disabled={imgScale <= MIN_SCALE}
                style={{
                  background: imgScale <= MIN_SCALE ? '#e5e7eb' : '#fff',
                  border: '1px solid #d1d5db',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: imgScale <= MIN_SCALE ? 'not-allowed' : 'pointer',
                  color: imgScale <= MIN_SCALE ? '#9ca3af' : '#6366f1'
                }}
                title="缩小"
              >
                {/* 缩小图标 */}
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="3" y="8" width="12" height="2" rx="1" fill="currentColor"/>
                </svg>
              </button>
              <button
                onClick={handleZoomIn}
                disabled={imgScale >= MAX_SCALE}
                style={{
                  background: imgScale >= MAX_SCALE ? '#e5e7eb' : '#fff',
                  border: '1px solid #d1d5db',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: imgScale >= MAX_SCALE ? 'not-allowed' : 'pointer',
                  color: imgScale >= MAX_SCALE ? '#9ca3af' : '#6366f1'
                }}
                title="放大"
              >
                {/* 放大图标 */}
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="3" y="8" width="12" height="2" rx="1" fill="currentColor"/>
                  <rect x="8" y="3" width="2" height="12" rx="1" fill="currentColor"/>
                </svg>
              </button>
            </div>
            {ocrImage ? (
              <img
                src={typeof ocrImage === 'string' ? ocrImage : URL.createObjectURL(ocrImage)}
                alt="OCR原图"
                style={{
                  transform: `scale(${imgScale}) translate(${imgOffset.x / imgScale}px, ${imgOffset.y / imgScale}px)`,
                  transition: dragging ? 'none' : 'transform 0.2s',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  borderRadius: '8px',
                  cursor: dragging ? 'grabbing' : 'grab',
                  background: '#fff'
                }}
                draggable={false}
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