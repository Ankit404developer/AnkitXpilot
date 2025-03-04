
import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'html' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 text-sm">
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-800">
        <span className="text-xs font-medium text-zinc-400 capitalize">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors p-1 rounded hover:bg-zinc-700"
        >
          {copied ? (
            <Check size={14} className="text-green-500" />
          ) : (
            <Copy size={14} />
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto scrollbar-thin bg-[#121212] text-white text-xs">
        {language === 'html' ? (
          <code 
            className="font-mono leading-relaxed block" 
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
          <code className="font-mono leading-relaxed block">{code}</code>
        )}
      </pre>
    </div>
  );
};

export default CodeBlock;
