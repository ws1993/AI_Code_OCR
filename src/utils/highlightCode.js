import Prism from 'prismjs';
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
import 'prismjs/components/prism-php';
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
import 'prismjs/components/prism-groovy';
import 'prismjs/components/prism-lua';
import 'prismjs/components/prism-shell-session';
import 'prismjs/themes/prism.css';

// 语言映射
const LANGUAGE_MAP = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  java: 'java',
  html: 'markup',
  css: 'css',
  xml: 'markup',
  bash: 'bash',
  c: 'c',
  cpp: 'cpp',
  csharp: 'csharp',
  go: 'go',
  php: 'php',
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
  groovy: 'groovy',
  lua: 'lua',
  shell: 'shell-session'
};

// 代码高亮函数，返回 { html, error }
const highlightCode = (code, language) => {
  const prismLang = LANGUAGE_MAP[language];
  if (!prismLang || !Prism.languages[prismLang]) {
    return {
      html: `<pre style="color:#ef4444;background:#f9fafb;padding:12px;border-radius:8px;">暂不支持该语言的高亮：${language}</pre>`,
      error: `暂不支持该语言的高亮：${language}`
    };
  }
  try {
    const html = Prism.highlight(code, Prism.languages[prismLang], prismLang);
    return { html, error: null };
  } catch {
    return {
      html: `<pre style="color:#ef4444;background:#f9fafb;padding:12px;border-radius:8px;">代码高亮失败</pre>`,
      error: '代码高亮失败'
    };
  }
};

export default highlightCode;