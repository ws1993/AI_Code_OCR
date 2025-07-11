import React, { useState, useCallback } from 'react';
import Dropzone from 'react-dropzone';
import { Editor } from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';

function App() {
  // 状态管理
  const [files, setFiles] = useState([]);
  const [ocrResult, setOcrResult] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [model, setModel] = useState('');
  const [prompt, setPrompt] = useState(''); // 新增：添加提示词状态

  // 处理文件上传
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFiles(acceptedFiles);
    }
  }, []);

  // 识别按钮点击
  const handleOcrClick = async () => {
    if (files.length === 0) {
      alert('请先上传图片');
      return;
    }
    setIsProcessing(true);
    try {
      const response = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          image: files[0] // 假设文件已正确处理
        })
      });
      const data = await response.json();
      if (response.ok) {
        setOcrResult(data.result);
      } else {
        throw new Error(data.message || 'OCR处理失败');
      }
    } catch (error) {
      console.error('OCR处理错误:', error);
      alert(`OCR处理失败: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 验证AI配置
  const validateConfig = () => {
    if (!apiKey || !baseUrl || !model) {
      alert('请填写完整的AI配置');
      return false;
    }
    // 额外验证：检查API Key是否有效（模拟）
    if (!apiKey.startsWith('sk-')) {
      alert('API Key格式不正确');
      return false;
    }
    // 额外验证：检查BaseUrl格式
    if (!baseUrl) {
      alert('请输入有效的BaseUrl');
      return false;
    }
    // 额外验证：检查模型名称
    const validModels = ['gpt-4', 'claude-2', 'llama-2'];
    if (!validModels.includes(model)) {
      alert('请选择有效的模型名称');
      return false;
    }
    return true;
  };

  // 格式化代码
  const formatCode = (code) => {
    const prettier = require('prettier');
    
    // 根据选择的语言设置格式化选项
    let options = {
      parser: language,
      printWidth: 80,
      tabWidth: 2,
      singleQuote: false,
      trailingComma: 'es5',
      bracketSpacing: true,
      jsxBracketSameLine: false,
      arrowFunction: true,
      templateStringsQuotes: 'double'
    };
    
    try {
      return prettier.format(code, options);
    } catch (error) {
      console.error('代码格式化错误:', error);
      return code; // 出错时返回原代码
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">代码OCR识别工具</h1>
        
        {/* 文件上传区域 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">上传图片</h2>
          <Dropzone onDrop={onDrop}>
            {({ getRootProps, getInputProps }) => (
              <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                <input {...getInputProps()} />
                <div className="flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-600">拖拽图片到这里，或者点击选择文件</p>
                  <p className="text-sm text-gray-500 mt-1">(支持JPG, PNG格式)</p>
                </div>
              </div>
            )}
          </Dropzone>
          {files.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-gray-600">已选择: {files[0].name}</p>
            </div>
          )}
        </div>

        {/* OCR按钮 */}
        <div className="flex justify-center mb-8">
          <button 
            onClick={handleOcrClick} 
            disabled={files.length === 0 || isProcessing}
            className={`px-6 py-3 rounded-lg font-medium ${files.length === 0 || isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white transition-colors`}
          >
            {isProcessing ? '正在识别...' : '识别代码'}
          </button>
        </div>

        {/* 识别结果 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">识别结果</h2>
          <div className="flex items-center mb-3">
            <span className="mr-3 text-gray-600">选择语言:</span>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="typescript">TypeScript</option>
            </select>
            <button 
              onClick={() => formatCode(ocrResult)}
              className="ml-4 px-4 py-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300 transition-colors"
            >
              格式化代码
            </button>
          </div>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <Editor
              value={ocrResult}
              onValueChange={code => setOcrResult(code)}
              highlight={code => Prism.highlight(code, Prism.languages[language] || Prism.languages.js, language)}
              padding={10}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 14,
                minHeight: '200px'
              }}
              className="editor"
            />
          </div>
        </div>

        {/* AI配置 */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-3">AI配置</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="baseUrl">
                Base URL
              </label>
              <input 
                id="baseUrl"
                type="text" 
                value={baseUrl} 
                onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例如: https://api.example.com/v1"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="apiKey">
                API Key
              </label>
              <input 
                id="apiKey"
                type="password" 
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="输入API密钥"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="model">
                模型名称
              </label>
              <input 
                id="model"
                type="text" 
                value={model} 
                onChange={(e) => setModel(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例如: gpt-4"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="prompt">
                提示词
              </label>
              <input 
                id="prompt"
                type="text" 
                value={prompt} 
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="输入提示词"
              />
            </div>
          </div>
          <button 
            onClick={() => validateConfig()}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            验证配置
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
