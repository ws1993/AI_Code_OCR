import React from 'react';
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
  languageSearch,
  setLanguageSearch,
  setCodeBlock // 补充此参数
}) => (
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
);

export default OcrResult;