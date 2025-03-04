
import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

// Function to syntax highlight HTML code
const highlightHtml = (code: string): string => {
  // Replace HTML tags
  let highlighted = code.replace(/(&lt;|<)(\/?)([\w\-]+)(&gt;|>)/g, 
    '<span class="code-token-tag">&lt;$2$3&gt;</span>');
  
  // Replace attribute names
  highlighted = highlighted.replace(/(\s+)([\w\-]+)(\s*=\s*)/g, 
    '$1<span class="code-token-attr-name">$2</span>$3');
  
  // Replace attribute values
  highlighted = highlighted.replace(/(=\s*)(['"])(.*?)(['"])/g, 
    '$1<span class="code-token-attr-value">$2$3$4</span>');
  
  // Replace CSS properties
  highlighted = highlighted.replace(/([\w\-]+)(\s*:\s*)/g, 
    '<span class="code-token-property">$1</span>$2');
  
  // Replace CSS values
  highlighted = highlighted.replace(/(:)([^;{]+)(;|})/g, 
    '$1<span class="code-token-value">$2</span>$3');
  
  return highlighted;
};

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'html' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Prepare code for display with syntax highlighting
  let displayCode = code;
  if (language === 'html') {
    // displayCode = highlightHtml(code);
  }

  return (
    <div className="my-2 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-800">
        <span className="text-xs font-medium text-zinc-400 capitalize">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          {copied ? (
            <>
              <Check size={14} className="text-green-500" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto scrollbar-thin bg-[#121212] text-white">
        {language === 'html' ? (
          <code 
            className="text-sm font-mono leading-relaxed block" 
            dangerouslySetInnerHTML={{ 
              __html: code
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/(&lt;\!DOCTYPE\s+)(\w+)(&gt;)/g, '$1<span class="code-token-tag">$2</span>$3')
                .replace(/(&lt;|&lt;\/)([\w\-]+)(&gt;)/g, '$1<span class="code-token-tag">$2</span>$3')
                .replace(/(\s+)([\w\-]+)(\s*=\s*)/g, '$1<span class="code-token-attr-name">$2</span>$3')
                .replace(/(=\s*)(["'])(.*?)(["'])/g, '$1<span class="code-token-string">$2$3$4</span>')
                .replace(/([\w\-]+)(\s*:\s*)/g, '<span class="code-token-property">$1</span>$2')
                .replace(/(:)([^;{]+)(;|})/g, '$1<span class="code-token-value">$2</span>$3')
            }}
          />
        ) : (
          <code className="text-sm font-mono leading-relaxed block">{code}</code>
        )}
      </pre>
    </div>
  );
};

export default CodeBlock;
