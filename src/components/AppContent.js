import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import ConfigModal from './ConfigModal';
import 'antd/dist/reset.css'; // Ant Design v5推荐用reset.css
import UploadImage from './UploadImage';
import OcrResult from './OcrResult';
import fileToBase64 from '../utils/fileToBase64';
import validateConfig from '../utils/validateConfig';
import formatCode from '../utils/formatCode';
import highlightCode from '../utils/highlightCode';

const LANGUAGE_OPTIONS = [
  "javascript", "typescript", "python", "java", "html", "css", "xml", "bash", "c", "cpp", "csharp", "go", "php", "ruby", "swift", "kotlin", "r", "scala", "sql", "perl", "dart", "json", "yaml", "markdown", "powershell", "objectivec", "matlab", "rust", "groovy", "lua", "shell"
];

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
  const [progress, setProgress] = useState(0);
  // 新增弹窗显示状态
  const [showConfig, setShowConfig] = useState(false);
  const [languageSearch, setLanguageSearch] = useState('');

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
    setProgress(0);

    try {
      // 模拟进度条（实际可根据API返回进度调整）
      let fakeProgress = 0;
      const timer = setInterval(() => {
        fakeProgress += Math.floor(Math.random() * 10) + 5;
        setProgress(Math.min(fakeProgress, 95));
      }, 300);

      // ...existing OCR fetch logic...
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
      clearInterval(timer);
      setProgress(100);

      if (response.ok) {
        // ...existing result extraction...
        const content = data.choices?.[0]?.message?.content || '识别失败';
        let lang = 'javascript';
        const langMatch = content.match(/```(\w+)/);
        if (langMatch && langMatch[1]) {
          lang = langMatch[1].toLowerCase();
        }
        setLanguage(lang);

        const codeMatch = content.match(/```(\w+)?\s*([\s\S]*?)```/);
        setCodeBlock(codeMatch ? codeMatch[2] : '');

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
      setTimeout(() => setProgress(0), 800); // 识别结束后自动隐藏进度条
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f3f4f6 60%, #e0e7ff 100%)',
      padding: '32px 16px',
      position: 'relative'
    }}>
      <div style={{
        maxWidth: '896px',
        margin: '0 auto',
        background: 'linear-gradient(120deg, #fff 80%, #f0fdf4 100%)',
        borderRadius: '16px',
        boxShadow: '0 6px 24px -4px rgba(60, 80, 180, 0.10)',
        padding: '32px 28px 28px 28px'
      }}>
        {/* 顶部标题与配置入口 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* 标题前图标 */}
             <svg width="38" height="38" viewBox="0 0 38 38" fill="none" style={{ marginRight: 12 }}>
              <rect x="2" y="2" width="34" height="34" rx="8" fill="#22d3ee"/>
              <path d="M12 19h14M19 12v14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
              <rect x="10" y="10" width="18" height="18" rx="4" stroke="#fff" strokeWidth="2"/>
            </svg>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#1e293b',
              letterSpacing: '1px',
              background: 'linear-gradient(90deg, #2563eb 60%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>代码OCR识别工具</h1>
          </div>
          {/* 配置入口（右侧） */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* Github 图标按钮 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                marginRight: '14px',
                padding: '6px',
                borderRadius: '6px',
                transition: 'background 0.2s'
              }}
              title="GitHub 仓库"
              onClick={() => window.open('https://github.com/ws1993/AI_Code_OCR', '_blank')}
            >
              <svg height="24" width="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C6.48 2 2 6.58 2 12.26c0 4.48 2.87 8.28 6.84 9.63.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.38 9.38 0 0112 6.84c.85.004 1.71.12 2.51.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .26.18.57.69.48A10.01 10.01 0 0022 12.26C22 6.58 17.52 2 12 2z"
                  fill="#6366f1"
                />
              </svg>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '6px 16px',
                borderRadius: '8px',
                background: '#eef2ff',
                boxShadow: '0 2px 8px rgba(60,80,180,0.04)',
                transition: 'background 0.2s',
                border: '1px solid #c7d2fe'
              }}
              onClick={() => setShowConfig(true)}
              title="配置"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span style={{
                marginLeft: 8,
                color: '#6366f1',
                fontSize: 17,
                fontWeight: 500,
                userSelect: 'none'
              }}>配置</span>
            </div>
          </div>
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
          validateConfig={() => validateConfig({ apiKey, baseUrl, model })}
          DEFAULT_PROMPT={DEFAULT_PROMPT}
        />
        {/* 文件上传区域 */}
        <UploadImage
          files={files}
          setFiles={setFiles}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          isProcessing={isProcessing}
          progress={progress}
        />
        {/* OCR按钮 */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <button
            onClick={handleOcrClick}
            disabled={files.length === 0 || isProcessing}
            style={{
              padding: '13px 28px',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '17px',
              background: files.length === 0 || isProcessing ? '#d1d5db' : '#059669',
              color: files.length === 0 || isProcessing ? '#6b7280' : '#fff',
              border: 'none',
              boxShadow: files.length === 0 || isProcessing ? 'none' : '0 2px 8px rgba(60,80,180,0.08)',
              cursor: files.length === 0 || isProcessing ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {isProcessing ? '正在识别...' : '识别代码'}
          </button>
        </div>
        {/* 识别结果分区 */}
        <OcrResult
          report={report}
          codeBlock={codeBlock}
          language={language}
          setLanguage={setLanguage}
          LANGUAGE_OPTIONS={LANGUAGE_OPTIONS}
          formatCode={(code) => formatCode(code, language, setCodeBlock)}
          highlightCode={(code) => highlightCode(code, language)}
          languageSearch={languageSearch}
          setLanguageSearch={setLanguageSearch}
          setCodeBlock={setCodeBlock}
          ocrImage={files[0]} // 这里要传递图片文件或URL
        />
      </div>
    </div>
  );
};

export default AppContent;