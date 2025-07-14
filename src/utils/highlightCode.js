import { highlight, languages } from 'prismjs/components/prism-core';

// 代码高亮函数
const highlightCode = (code, language) => {
  try {
    return highlight(code, languages[language] || languages.js, language);
  } catch (error) {
    console.error('代码高亮错误:', error);
    return code;
  }
};

export default highlightCode;