import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-typescript';
import 'prismjs/themes/prism.css';
import ConfigModal from './ConfigModal';
import 'antd/dist/reset.css'; // Ant Design v5推荐用reset.css
import UploadImage from './UploadImage';
import OcrResult from './OcrResult';

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

  // 2. 代码格式化修正（根据语言类型自动格式化，优化分发逻辑）
  const formatCode = async (code) => {
    try {
      let formatted = code;
      const formatters = {
        javascript: async (code) => {
          const prettier = await import('prettier/standalone');
          const parserBabel = await import('prettier/parser-babel');
          return prettier.format(code, { parser: 'babel', plugins: [parserBabel] });
        },
        typescript: async (code) => {
          const prettier = await import('prettier/standalone');
          const parserTypescript = await import('prettier/parser-typescript');
          return prettier.format(code, { parser: 'typescript', plugins: [parserTypescript] });
        },
        json: async (code) => {
          const prettier = await import('prettier/standalone');
          const parserBabel = await import('prettier/parser-babel');
          return prettier.format(code, { parser: 'json', plugins: [parserBabel] });
        },
        html: async (code) => {
          const prettier = await import('prettier/standalone');
          const parserHtml = await import('prettier/parser-html');
          return prettier.format(code, { parser: 'html', plugins: [parserHtml] });
        },
        css: async (code) => {
          const prettier = await import('prettier/standalone');
          const parserCss = await import('prettier/parser-postcss');
          return prettier.format(code, { parser: 'css', plugins: [parserCss] });
        },
        java: async (code) => {
          const beautify = await import('js-beautify');
          return beautify.js(code, { indent_size: 2 });
        },
        c: async (code) => {
          const beautify = await import('js-beautify');
          return beautify.js(code, { indent_size: 2 });
        },
        cpp: async (code) => {
          const beautify = await import('js-beautify');
          return beautify.js(code, { indent_size: 2 });
        },
        csharp: async (code) => {
          const beautify = await import('js-beautify');
          return beautify.js(code, { indent_size: 2 });
        },
        xml: async (code) => {
          const beautify = await import('js-beautify');
          return beautify.html(code, { indent_size: 2 });
        },
        python: async (code) => {
          // 简单格式化：去除行尾空格
          return code.split('\n').map(line => line.trimEnd()).join('\n');
        },
        bash: async (code) => code.split('\n').map(line => line.trimEnd()).join('\n'),
        shell: async (code) => code.split('\n').map(line => line.trimEnd()).join('\n'),
        go: async (code) => code.split('\n').map(line => line.trimEnd()).join('\n'),
        rust: async (code) => code.split('\n').map(line => line.trimEnd()).join('\n'),
        swift: async (code) => code.split('\n').map(line => line.trimEnd()).join('\n'),
        kotlin: async (code) => code.split('\n').map(line => line.trimEnd()).join('\n'),
        php: async (code) => code.split('\n').map(line => line.trimEnd()).join('\n'),
        ruby: async (code) => code.split('\n').map(line => line.trimEnd()).join('\n'),
        scala: async (code) => code.split('\n').map(line => line.trimEnd()).join('\n'),
        perl: async (code) => code.split('\n').map(line => line.trimEnd()).join('\n'),
        dart: async (code) => code.split('\n').map(line => line.trimEnd()).join('\n'),
        lua: async (code) => code.split('\n').map(line => line.trimEnd()).join('\n'),
        groovy: async (code) => code.split('\n').map(line => line.trimEnd()).join('\n'),
        matlab: async (code) => code.split('\n').map(line => line.trimEnd()).join('\n'),
        yaml: async (code) => code.trim(),
        markdown: async (code) => code.trim(),
        sql: async (code) => code.split('\n').map(line => line.trimEnd()).join('\n'),
        powershell: async (code) => code.split('\n').map(line => line.trimEnd()).join('\n'),
        objectivec: async (code) => code.split('\n').map(line => line.trimEnd()).join('\n'),
        r: async (code) => code.split('\n').map(line => line.trimEnd()).join('\n'),
      };

      if (formatters[language]) {
        formatted = await formatters[language](code);
      }
      setCodeBlock(formatted);
      return formatted;
    } catch (error) {
      console.error('代码格式化错误:', error);
      setCodeBlock(code);
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
        <OcrResult
          report={report}
          codeBlock={codeBlock}
          language={language}
          setLanguage={setLanguage}
          LANGUAGE_OPTIONS={LANGUAGE_OPTIONS}
          formatCode={formatCode}
          highlightCode={highlightCode}
          languageSearch={languageSearch}
          setLanguageSearch={setLanguageSearch}
          setCodeBlock={setCodeBlock}
        />
      </div>
    </div>
  );
};

export default AppContent;