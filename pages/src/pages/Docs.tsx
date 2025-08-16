import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkSlug from 'remark-slug'

interface TableOfContentsProps {
    content: string
    onHeadingClick: (id: string) => void
}

const TableOfContents = (
    { content, onHeadingClick } : TableOfContentsProps
) => {
    const [headings, setHeadings] = useState<Array<{ id: string; text: string; level: number }>>([])

    useEffect(() => {
        const headingRegex = /^(#{1,6})\s+(.+)$/gm
        const matches = Array.from(content.matchAll(headingRegex))
        
        const parsedHeadings = matches.map(match => {
            const level = match[1].length
            const text = match[2]
            const id = text
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .trim()
            
            return { id, text, level }
        })
        
        setHeadings(parsedHeadings)
    }, [content])

    return (
        <div className="space-y-2">
            <h3 className="font-semibold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
                📚 Table of Contents
            </h3>
            <nav className="space-y-1">
                {headings.map((heading, index) => (
                    <button
                        key={index}
                        onClick={() => onHeadingClick(heading.id)}
                        className="block w-full text-left py-1 px-2 rounded text-sm hover:opacity-80 transition-colors"
                        style={{
                            paddingLeft: `${(heading.level - 1) * 12 + 8}px`,
                            color: 'var(--text-secondary)'
                        }}
                    >
                        {heading.text}
                    </button>
                ))}
            </nav>
        </div>
    )
}

interface DocsMarkdownRendererProps {
    content: string
    className?: string
}

const DocsMarkdownRenderer = (
    { content, className = '' } : DocsMarkdownRendererProps
) => {
    return (
        <div className={`prose prose-lg max-w-none ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkSlug]}
                components={{
                    h1: ({ children, id }) => (
                        <h1 id={id} className="text-4xl font-bold mb-6 pb-2 border-b-2" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
                            {children}
                        </h1>
                    ),
                    h2: ({ children, id }) => (
                        <h2 id={id} className="text-3xl font-semibold mt-8 mb-4" style={{ color: 'var(--text-primary)' }}>
                            {children}
                        </h2>
                    ),
                    h3: ({ children, id }) => (
                        <h3 id={id} className="text-2xl font-semibold mt-6 mb-3" style={{ color: 'var(--text-primary)' }}>
                            {children}
                        </h3>
                    ),
                    h4: ({ children, id }) => (
                        <h4 id={id} className="text-xl font-semibold mt-4 mb-2" style={{ color: 'var(--text-primary)' }}>
                            {children}
                        </h4>
                    ),
                    p: ({ children }) => (
                        <p className="mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            {children}
                        </p>
                    ),
                    ul: ({ children }) => (
                        <ul className="list-disc list-inside mb-4 space-y-2" style={{ color: 'var(--text-secondary)' }}>
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal list-inside mb-4 space-y-2" style={{ color: 'var(--text-secondary)' }}>
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="ml-4">{children}</li>
                    ),
                    code: ({ children, className }) => {
                        const isInline = !className
                        if (isInline) {
                            return (
                                <code className="px-2 py-1 rounded text-sm" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                                    {children}
                                </code>
                            )
                        }
                        return (
                            <code className="block p-4 rounded-lg overflow-x-auto" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                                {children}
                            </code>
                        )
                    },
                    pre: ({ children }) => (
                        <pre className="p-4 rounded-lg overflow-x-auto mb-4" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                            {children}
                        </pre>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 pl-4 italic my-4" style={{ borderColor: 'var(--accent)', color: 'var(--text-muted)' }}>
                            {children}
                        </blockquote>
                    ),
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            className="underline transition-colors"
                            style={{ color: 'var(--accent)' }}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {children}
                        </a>
                    ),
                    table: ({ children }) => (
                        <div className="overflow-x-auto mb-4">
                            <table className="min-w-full" style={{ border: '1px solid var(--border-color)' }}>
                                {children}
                            </table>
                        </div>
                    ),
                    th: ({ children }) => (
                        <th className="px-4 py-2 text-left font-semibold" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="px-4 py-2" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                            {children}
                        </td>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}

const Docs = () => {
    const [content, setContent] = useState<string>('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadContent = async () => {
            try {
                const response = await fetch('/src/content/refactoring.md')
                const text = await response.text()
                setContent(text)
            } catch (error) {
                console.error('Error loading documentation:', error)
            } finally {
                setLoading(false)
            }
        }

        loadContent()
    }, [])

    const handleHeadingClick = (id: string) => {
        const element = document.getElementById(id)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
        }
    }

    if (loading) {
        return (
            <div className="rounded-xl shadow-lg p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <div className="animate-pulse">
                    <div className="h-8 rounded mb-4" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
                    <div className="h-4 rounded mb-2" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
                    <div className="h-4 rounded mb-2" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
                </div>
            </div>
        )
    }

    return (
        <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
                <div className="sticky top-8 rounded-xl shadow-lg p-6" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                    <TableOfContents 
                        content={content} 
                        onHeadingClick={handleHeadingClick}
                    />
                </div>
            </div>
            
            {/* Main content */}
            <div className="lg:col-span-3">
                <div className="rounded-xl shadow-lg p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
                    <DocsMarkdownRenderer content={content} />
                    
                    <div className="mt-8 p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                        <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                            💡 Need Help?
                        </h3>
                        <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                            Can't find what you're looking for? We're here to help!
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <a 
                                href="https://github.com/Impirs/Razvivashka/issues" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-4 py-2 rounded-lg font-medium transition-colors"
                                style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                            >
                                🐛 Report Bug
                            </a>
                            <a 
                                href="https://github.com/Impirs/Razvivashka/discussions" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-4 py-2 rounded-lg font-medium transition-colors"
                                style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                            >
                                💬 Ask Question
                            </a>
                            <a 
                                href="https://github.com/Impirs/Razvivashka" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-4 py-2 rounded-lg font-medium transition-colors"
                                style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                            >
                                📝 Contribute
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Docs
