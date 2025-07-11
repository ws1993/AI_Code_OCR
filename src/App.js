import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-typescript';
import 'prismjs/themes/prism.css';
import ReactMarkdown from 'react-markdown'; // 新增：用于渲染报告md

function App() {
  // 优先从localStorage读取配置
  const [DEFAULT_PROMPT, setDefaultPrompt] = useState('');
  const [prompt, setPrompt] = useState(() => localStorage.getItem('prompt') || '');
  const [baseUrl, setBaseUrl] = useState(() => localStorage.getItem('baseUrl') || '');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('apiKey') || '');
  const [model, setModel] = useState(() => localStorage.getItem('model') || '');

  useEffect(() => {
    fetch(require('./prompt.md'))
      .then(res => res.text())
      .then(text => setDefaultPrompt(text));
  }, []);

  useEffect(() => {
    if (DEFAULT_PROMPT && !prompt) setPrompt(DEFAULT_PROMPT);
  }, [DEFAULT_PROMPT]);

  // 自动保存配置到localStorage
  useEffect(() => {
    localStorage.setItem('prompt', prompt);
  }, [prompt]);
  useEffect(() => {
    localStorage.setItem('baseUrl', baseUrl);
  }, [baseUrl]);
  useEffect(() => {
    localStorage.setItem('apiKey', apiKey);
  }, [apiKey]);
  useEffect(() => {
    localStorage.setItem('model', model);
  }, [model]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <AppContent
            baseUrl={baseUrl}
            setBaseUrl={setBaseUrl}
            DEFAULT_PROMPT={DEFAULT_PROMPT}
            prompt={prompt}
            setPrompt={setPrompt}
            apiKey={apiKey}
            setApiKey={setApiKey}
            model={model}
            setModel={setModel}
          />
        }
      />
      <Route
        path="*"
        element={
          <AppContent
            baseUrl={baseUrl}
            setBaseUrl={setBaseUrl}
            DEFAULT_PROMPT={DEFAULT_PROMPT}
            prompt={prompt}
            setPrompt={setPrompt}
            apiKey={apiKey}
            setApiKey={setApiKey}
            model={model}
            setModel={setModel}
          />
        }
      />
    </Routes>
  );
}

// AppContent和ConfigModal参数补充
const AppContent = ({
  baseUrl, setBaseUrl,
  DEFAULT_PROMPT, prompt, setPrompt,
  apiKey, setApiKey,
  model, setModel
}) => {
  // 状态管理
  const [files, setFiles] = useState([]);
  const [ocrResult, setOcrResult] = useState('');
  const [report, setReport] = useState('');
  const [codeBlock, setCodeBlock] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isProcessing, setIsProcessing] = useState(false);
  // 新增弹窗显示状态
  const [showConfig, setShowConfig] = useState(false);

  // 处理文件上传
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFiles(acceptedFiles);
    }
  }, []);

  // 使用 useDropzone hook
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: false
  });

  // 识别按钮点击（去掉识别时的配置验证）
  const handleOcrClick = async () => {
    if (files.length === 0) {
      alert('请先上传图片');
      return;
    }

    setIsProcessing(true);
    try {
      // 将图片转换为 base64
      const file = files[0];
      const base64 = await fileToBase64(file);

      const response = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt || "请识别图片中的代码并转换为文本格式"
                },
                {
                  type: "image_url",
                  image_url: {
                    url: base64
                  }
                }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      if (response.ok) {
        const content = data.choices?.[0]?.message?.content || '识别失败';
        // 自动识别语言
        let lang = 'javascript';
        const langMatch = content.match(/```(\w+)/);
        if (langMatch && langMatch[1]) {
          lang = langMatch[1].toLowerCase();
        }
        setLanguage(lang);

        // 提取代码块
        const codeMatch = content.match(/```(\w+)?\s*([\s\S]*?)```/);
        setCodeBlock(codeMatch ? codeMatch[2] : '');

        // 提取报告部分
        const reportMatch = content.replace(/```[\s\S]*?```/, '').trim();
        setReport(reportMatch);
        setOcrResult(content);
      } else {
        throw new Error(data.error?.message || 'OCR处理失败');
      }
    } catch (error) {
      console.error('OCR处理错误:', error);
      alert(`OCR处理失败: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 添加文件转 base64 的辅助函数
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // 1. AI配置接口验证
  const validateConfig = async () => {
    if (!apiKey || !baseUrl || !model) {
      alert('请填写完整的AI配置');
      return false;
    }
    try {
      // 这里以OpenAI兼容接口为例，实际可根据你的API调整
      const response = await fetch(`${baseUrl}/v1/models`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      if (response.ok) {
        alert('配置验证成功');
        return true;
      } else {
        alert('配置验证失败，请检查API Key和Base URL');
        return false;
      }
    } catch (error) {
      alert('配置验证异常: ' + error.message);
      return false;
    }
  };

  // 2. 代码格式化修正（保留原有缩进和空行，不做trim）
  const formatCode = (code) => {
    try {
      // 这里只做简单格式化，可根据语言类型调用 prettier 或其他库
      // 保留原有格式
      setCodeBlock(code);
      return code;
    } catch (error) {
      console.error('代码格式化错误:', error);
      return code;
    }
  };

  // 代码高亮函数
  const highlightCode = (code) => {
    try {
      return highlight(code, languages[language] || languages.js, language);
    } catch (error) {
      console.error('代码高亮错误:', error);
      return code;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '32px 16px', position: 'relative' }}>
      {/* 右上角齿轮图标入口 */}
      <div style={{
        position: 'absolute',
        top: 32,
        right: 32,
        zIndex: 100,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center'
      }}
        onClick={() => setShowConfig(true)}
        title="配置"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        <span style={{
          marginLeft: 8,
          color: '#374151',
          fontSize: 16,
          fontWeight: 500,
          userSelect: 'none'
        }}>配置</span>
      </div>
      {/* 配置弹窗 */}
      <ConfigModal
        visible={showConfig}
        onClose={() => setShowConfig(false)}
        baseUrl={baseUrl}
        setBaseUrl={setBaseUrl}
        apiKey={apiKey}
        setApiKey={setApiKey}
        model={model}
        setModel={setModel}
        prompt={prompt}
        setPrompt={setPrompt}
        validateConfig={validateConfig}
        DEFAULT_PROMPT={DEFAULT_PROMPT}
      />
      <div style={{ maxWidth: '896px', margin: '0 auto', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '24px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px' }}>代码OCR识别工具</h1>

        {/* 文件上传区域 */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>上传图片</h2>
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
            <div style={{ marginTop: '12px' }}>
              <p style={{ fontSize: '14px', color: '#4b5563' }}>已选择: {files[0].name}</p>
            </div>
          )}
        </div>

        {/* OCR按钮 */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <button
            onClick={handleOcrClick}
            disabled={files.length === 0 || isProcessing}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: '500',
              backgroundColor: files.length === 0 || isProcessing ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              cursor: files.length === 0 || isProcessing ? 'not-allowed' : 'pointer'
            }}
          >
            {isProcessing ? '正在识别...' : '识别代码'}
          </button>
        </div>

        {/* 识别结果分区 */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>识别报告</h2>
          <div style={{ border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px', background: '#f9fafb', minHeight: '60px', color: '#374151', marginBottom: '24px' }}>
            {report ? (
              <ReactMarkdown
                children={report}
                components={{
                  h1: ({node, ...props}) => <h3 style={{color:'#2563eb', fontSize:'18px', margin:'8px 0'}} {...props} />,
                  h2: ({node, ...props}) => <h4 style={{color:'#2563eb', fontSize:'16px', margin:'6px 0'}} {...props} />,
                  ul: ({node, ...props}) => <ul style={{paddingLeft:'20px', margin:'6px 0'}} {...props} />,
                  li: ({node, ...props}) => <li style={{marginBottom:'2px'}} {...props} />,
                  p: ({node, ...props}) => <p style={{margin:'4px 0'}} {...props} />,
                  code: ({node, ...props}) => <code style={{background:'#e5e7eb', borderRadius:'4px', padding:'2px 4px'}} {...props} />,
                  table: ({node, ...props}) => <table style={{borderCollapse:'collapse', width:'100%'}} {...props} />,
                  th: ({node, ...props}) => <th style={{border:'1px solid #d1d5db', background:'#f3f4f6', padding:'4px'}} {...props} />,
                  td: ({node, ...props}) => <td style={{border:'1px solid #d1d5db', padding:'4px'}} {...props} />,
                }}
              />
            ) : <span style={{ color: '#9ca3af' }}>暂无报告</span>}
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>识别代码</h2>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ marginRight: '12px', color: '#4b5563' }}>选择语言:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{ border: '1px solid #d1d5db', borderRadius: '6px', padding: '8px 12px' }}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="typescript">TypeScript</option>
            </select>
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
        </div>
      </div>
    </div>
  );
}

// 修改ConfigModal参数和使用
const ConfigModal = ({
  visible,
  onClose,
  baseUrl,
  setBaseUrl,
  apiKey,
  setApiKey,
  model,
  setModel,
  prompt,
  setPrompt,
  validateConfig,
  DEFAULT_PROMPT
}) => {
  if (!visible) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.2)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        padding: '32px',
        minWidth: '400px',
        maxWidth: '90vw',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            fontSize: 22,
            cursor: 'pointer',
            color: '#888'
          }}
          aria-label="关闭"
        >×</button>
        <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#374151', marginBottom: '18px' }}>AI配置</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              Base URL
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '8px 12px' }}
              placeholder="例如: https://api.example.com"
            />
          </div>
          <div>
            <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '8px 12px' }}
              placeholder="输入API密钥"
            />
          </div>
          <div>
            <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              模型名称
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '8px 12px' }}
              placeholder="例如: gpt-4-vision-preview"
            />
          </div>
        </div>
        <div style={{ marginTop: '16px', position: 'relative' }}>
          <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
            提示词 (Markdown格式)
          </label>
          <button
            onClick={() => setPrompt(DEFAULT_PROMPT)}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              padding: '4px 10px',
              fontSize: '13px',
              background: '#e5e7eb',
              border: 'none',
              borderRadius: '6px',
              color: '#374151',
              cursor: 'pointer'
            }}
            title="重置为默认提示词"
          >
            使用默认
          </button>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '8px 12px', marginTop: '6px', fontFamily: 'monospace' }}
            placeholder={DEFAULT_PROMPT}
            rows="10"
          />
        </div>
        <button
          onClick={async () => await validateConfig()}
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            backgroundColor: '#059669',
            color: 'white',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          验证配置
        </button>
      </div>
    </div>
  );
};

export default App;
