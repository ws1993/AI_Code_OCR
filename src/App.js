import React, { useState, useCallback } from 'react';
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

// 定义AppContent组件（提升到App函数之前）
const AppContent = ({ baseUrl, setBaseUrl }) => {
  // 状态管理
  const [files, setFiles] = useState([]);
  const [ocrResult, setOcrResult] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [prompt, setPrompt] = useState('');

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

  // 识别按钮点击
  const handleOcrClick = async () => {
    if (files.length === 0) {
      alert('请先上传图片');
      return;
    }

    if (!validateConfig()) {
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
        setOcrResult(data.choices?.[0]?.message?.content || '识别失败');
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

  // 验证AI配置
  const validateConfig = () => {
    if (!apiKey || !baseUrl || !model) {
      alert('请填写完整的AI配置');
      return false;
    }
    return true;
  };

  // 格式化代码
  const formatCode = (code) => {
    try {
      const formatted = code
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');

      setOcrResult(formatted);
      return formatted;
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '32px 16px' }}>
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

        {/* 识别结果 */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>识别结果</h2>
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
              onClick={() => formatCode(ocrResult)}
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
              value={ocrResult}
              onValueChange={code => setOcrResult(code)}
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

        {/* AI配置 */}
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>AI配置</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
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
          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              提示词
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '8px 12px' }}
              placeholder="请识别图片中的代码并转换为文本格式，保持原有的格式和缩进"
              rows="3"
            />
          </div>
          <button
            onClick={() => validateConfig()}
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
    </div>
  );
}

// 将AppContent移出App函数作用域，并提升到App函数定义之前
function App() {
  const [baseUrl, setBaseUrl] = useState('');

  return (
    <Routes>
      <Route path="/" element={<AppContent baseUrl={baseUrl} setBaseUrl={setBaseUrl} />} />
      <Route path="*" element={<AppContent baseUrl={baseUrl} setBaseUrl={setBaseUrl} />} />
    </Routes>
  );
}

export default App;
