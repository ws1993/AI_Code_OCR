import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-markup'; // html
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-r';
import 'prismjs/components/prism-scala';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-perl';
import 'prismjs/components/prism-dart';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-powershell';
import 'prismjs/components/prism-objectivec';
import 'prismjs/components/prism-matlab';
import 'prismjs/components/prism-rust';
import 'prismjs/themes/prism.css';

// 语言映射
const LANGUAGE_MAP = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  java: 'java',
  html: 'markup',
  css: 'css',
  xml: 'xml',
  bash: 'bash',
  c: 'c',
  cpp: 'cpp',
  csharp: 'csharp',
  go: 'go',
  ruby: 'ruby',
  swift: 'swift',
  kotlin: 'kotlin',
  r: 'r',
  scala: 'scala',
  sql: 'sql',
  perl: 'perl',
  dart: 'dart',
  json: 'json',
  yaml: 'yaml',
  markdown: 'markdown',
  powershell: 'powershell',
  objectivec: 'objectivec',
  matlab: 'matlab',
  rust: 'rust',
};

// 代码高亮函数，返回 { html, error }
const highlightCode = (code, language) => {
  try {
    const prismLang = LANGUAGE_MAP[language] || LANGUAGE_MAP['html'];
    return highlight(code, languages[prismLang], prismLang);
  } catch (error) {
    console.error('代码高亮错误:', error);
    return code;
  }
};

export default highlightCode;