import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTheme } from '../contexts/ThemeContext'

interface MarkdownRendererProps {
  content: string
  className?: string
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const { theme } = useTheme()
  
  // Custom syntax highlighting themes with better comment colors
  const customLightTheme = {
    ...vs,
    'comment': {
      color: 'var(--text-muted)',
      fontStyle: 'italic'
    },
    'prolog': {
      color: 'var(--text-muted)',
      fontStyle: 'italic'
    },
    'doctype': {
      color: 'var(--text-muted)',
      fontStyle: 'italic'
    },
    'cdata': {
      color: 'var(--text-muted)',
      fontStyle: 'italic'
    }
  }

  const customDarkTheme = {
    ...vscDarkPlus,
    'comment': {
      color: 'var(--text-muted)',
      fontStyle: 'italic'
    },
    'prolog': {
      color: 'var(--text-muted)',
      fontStyle: 'italic'
    },
    'doctype': {
      color: 'var(--text-muted)',
      fontStyle: 'italic'
    },
    'cdata': {
      color: 'var(--text-muted)',
      fontStyle: 'italic'
    }
  }
  
  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-4xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-indigo-200">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-3xl font-semibold text-gray-700 mt-8 mb-4">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-2xl font-semibold text-gray-600 mt-6 mb-3">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-gray-600 mb-4 leading-relaxed">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-gray-600 mb-4 space-y-2">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="ml-4">{children}</li>
          ),
          input: ({ type, checked, ...props }) => {
            if (type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="markdown-checkbox"
                  {...props}
                />
              )
            }
            return <input type={type} {...props} />
          },
          code: ({ children, className }) => {
            const match = /language-(\w+)/.exec(className || '')
            const language = match ? match[1] : ''
            const isInline = !className
            
            if (isInline) {
              return (
                <code 
                  className="px-2 py-1 rounded text-sm"
                  style={{ 
                    backgroundColor: 'var(--bg-tertiary)', 
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  {children}
                </code>
              )
            }

            return (
              <SyntaxHighlighter
                style={theme === 'dark' ? customDarkTheme : customLightTheme}
                language={language}
                PreTag="div"
                customStyle={{
                  margin: '1rem 0',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-secondary)',
                  padding: '1rem',
                  fontSize: '0.875rem',
                  lineHeight: '1.5'
                }}
                codeTagProps={{
                  style: {
                    backgroundColor: 'transparent',
                    color: 'var(--text-primary)'
                  }
                }}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            )
          },
          pre: ({ children }) => {
            // Prevent double wrapping with SyntaxHighlighter
            return <>{children}</>
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-indigo-300 pl-4 italic text-gray-600 my-4">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-indigo-600 hover:text-indigo-800 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownRenderer
