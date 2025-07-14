// 代码格式化修正
const formatCode = async (code, language, setCodeBlock) => {
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
      python: async (code) => code.split('\n').map(line => line.trimEnd()).join('\n'),
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

export default formatCode;