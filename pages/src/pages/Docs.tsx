import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkSlug from 'remark-slug'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTheme } from '../contexts/ThemeContext'

interface TableOfContentsProps {
    content: string
    onHeadingClick: (id: string) => void
    activeHeading?: string
}

interface Heading {
    id: string
    text: string
    level: number
    children?: Heading[]
}

const TableOfContents = ({ content, onHeadingClick, activeHeading }: TableOfContentsProps) => {
    const [headings, setHeadings] = useState<Heading[]>([])
    const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
    const [mainTitle, setMainTitle] = useState<Heading | null>(null)

    useEffect(() => {
        const headingRegex = /^(#{1,6})\s+(.+)$/gm
        const matches = Array.from(content.matchAll(headingRegex))
        
        const flatHeadings = matches.map(match => {
            const level = match[1].length
            const text = match[2]
            // More accurate ID generation to match remark-slug behavior
            const id = text
                .toLowerCase()
                .replace(/[&]/g, '') // Remove ampersands
                .replace(/[^\w\s-]/g, '') // Remove other special chars except word chars, spaces, hyphens
                .replace(/\s+/g, '-') // Replace spaces with hyphens
                .replace(/-+/g, '-') // Replace multiple consecutive hyphens with single hyphen
                .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
                .trim()
            
            // Debug logging for problematic headings
            if (text.includes('Performance') || text.includes('Game Logic') || text.includes('Testing')) {
                console.log(`Heading: "${text}" -> ID: "${id}"`)
            }
            
            return { id, text, level }
        })

        // Separate main title (first H1) from other headings
        let processedHeadings = flatHeadings
        let title = null

        if (flatHeadings.length > 0 && flatHeadings[0].level === 1) {
            title = flatHeadings[0]
            processedHeadings = flatHeadings.slice(1)
        }

        // Build nested structure starting from H2 level
        const nestedHeadings: Heading[] = []
        const stack: Heading[] = []

        processedHeadings.forEach(heading => {
            const newHeading: Heading = { ...heading, children: [] }

            // Treat H2 as top level, everything else as nested
            if (heading.level === 2) {
                // Add H2 as top level
                nestedHeadings.push(newHeading)
                stack.length = 0 // Clear stack
                stack.push(newHeading)
            } else {
                // Find the appropriate parent level
                while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
                    stack.pop()
                }

                if (stack.length > 0) {
                    const parent = stack[stack.length - 1]
                    if (!parent.children) parent.children = []
                    parent.children.push(newHeading)
                    stack.push(newHeading)
                }
            }
        })
        
        setMainTitle(title)
        setHeadings(nestedHeadings)
    }, [content])

    const toggleSection = (id: string) => {
        const newCollapsed = new Set(collapsedSections)
        if (newCollapsed.has(id)) {
            newCollapsed.delete(id)
        } else {
            newCollapsed.add(id)
        }
        setCollapsedSections(newCollapsed)
    }

    const renderHeading = (heading: Heading, level: number = 1) => {
        const hasChildren = heading.children && heading.children.length > 0
        const isCollapsed = collapsedSections.has(heading.id)
        const isActive = activeHeading === heading.id

        return (
            <div key={heading.id} className="docs-toc-section">
                <div className="flex items-center">
                    <button
                        onClick={() => onHeadingClick(heading.id)}
                        className={`docs-toc-item ${isActive ? 'active' : ''} flex-1`}
                        data-level={level}
                    >
                        {heading.text}
                    </button>
                    {hasChildren && (
                        <button
                            onClick={() => toggleSection(heading.id)}
                            className="docs-toc-section-toggle ml-2 px-2 py-1 text-xs"
                            style={{ 
                                color: 'var(--text-muted)',
                                transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s'
                            }}
                        >
                            ▼
                        </button>
                    )}
                </div>
                {hasChildren && (
                    <div 
                        className={`docs-toc-section-items ${isCollapsed ? 'collapsed' : 'expanded'}`}
                        style={{ 
                            // maxHeight: isCollapsed ? '0' : `${heading.children!.length * 40}px`,
                            overflow: 'hidden',
                            transition: 'max-height 0.3s ease'
                        }}
                    >
                        {heading.children!.map(child => renderHeading(child, level + 1))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="docs-sidebar-content">
            <div className="docs-sidebar-header">
                <h3 className="docs-sidebar-title">📚 Table of Contents</h3>
            </div>
            <nav className="docs-toc">
                {/* Main title as simple button */}
                {mainTitle && (
                    <div className="docs-toc-section">
                        <button
                            onClick={() => onHeadingClick(mainTitle.id)}
                            className={`docs-toc-item ${activeHeading === mainTitle.id ? 'active' : ''}`}
                            data-level="1"
                            style={{ fontWeight: 'bold' }}
                        >
                            {mainTitle.text}
                        </button>
                    </div>
                )}
                {/* H2 sections as collapsible top-level items */}
                {headings.map(heading => renderHeading(heading, 1))}
            </nav>
        </div>
    )
}

interface DocsMarkdownRendererProps {
    content: string
    className?: string
}

const DocsMarkdownRenderer = ({ content, className = '' }: DocsMarkdownRendererProps) => {
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
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
    const [activeHeading, setActiveHeading] = useState<string>('')

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

    // Track active heading based on scroll position
    useEffect(() => {
        const handleScroll = () => {
            const headings = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id]')
            const mainContent = document.querySelector('.main-content') as HTMLElement
            
            if (!mainContent) return
            
            let current = ''
            const additionalOffset = 0 // Additional space from top
            const scrollPosition = mainContent.scrollTop + additionalOffset

            headings.forEach(heading => {
                const elementTop = (heading as HTMLElement).offsetTop
                
                if (elementTop <= scrollPosition) {
                    current = heading.id
                }
            })

            setActiveHeading(current)
        }

        const mainContent = document.querySelector('.main-content') as HTMLElement
        if (mainContent) {
            mainContent.addEventListener('scroll', handleScroll)
            handleScroll() // Call once to set initial state

            return () => mainContent.removeEventListener('scroll', handleScroll)
        }
    }, [content])

    const handleHeadingClick = (id: string) => {
        const element = document.getElementById(id)
        const mainContent = document.querySelector('.main-content') as HTMLElement
        
        if (element && mainContent) {
            // Calculate the offset from the top of the main content container
            const elementTop = element.offsetTop
            const additionalOffset = -8 // Additional space from top
            const scrollPosition = elementTop - additionalOffset
            
            mainContent.scrollTo({
                top: Math.max(0, scrollPosition),
                behavior: 'smooth'
            })
        }
        setIsMobileSidebarOpen(false)
    }

    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen)
    }

    if (loading) {
        return (
            <div className="rounded-xl shadow-lg p-8" 
                style={{ backgroundColor: 'var(--bg-primary)' }}
            >
                <div className="animate-pulse">
                    <div className="h-8 rounded mb-4" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
                    <div className="h-4 rounded mb-2" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
                    <div className="h-4 rounded mb-2" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
                </div>
            </div>
        )
    }

    return (
        <div className="docs-layout">
            {/* Desktop Sidebar */}
            <div className="docs-sidebar-wrapper">
                <div className="docs-sidebar">
                    <TableOfContents 
                        content={content} 
                        onHeadingClick={handleHeadingClick}
                        activeHeading={activeHeading}
                    />
                </div>
            </div>

            {/* Mobile Sidebar Toggle */}
            <button
                onClick={toggleMobileSidebar}
                className="docs-sidebar-mobile-toggle"
                title="Open documentation navigation"
            >
                📚
            </button>

            {/* Mobile Sidebar Overlay */}
            {isMobileSidebarOpen && (
                <div 
                    className="docs-sidebar-mobile-overlay open"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div className={`docs-sidebar-mobile ${isMobileSidebarOpen ? 'open' : ''}`}>
                <div className="docs-sidebar-mobile-header">
                    <h3 className="docs-sidebar-title">📚 Navigation</h3>
                    <button
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className="docs-sidebar-mobile-close"
                    >
                        ✕
                    </button>
                </div>
                <TableOfContents 
                    content={content} 
                    onHeadingClick={handleHeadingClick}
                    activeHeading={activeHeading}
                />
            </div>
            
            {/* Main content */}
            <div className="docs-content"
                style={{borderRadius: '1rem'}}
            >
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
                            className="px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-80"
                            style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                        >
                            🐛 Report Bug
                        </a>
                        <a 
                            href="https://github.com/Impirs/Razvivashka/discussions" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-80"
                            style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                        >
                            💬 Ask Question
                        </a>
                        <a 
                            href="https://github.com/Impirs/Razvivashka" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-80"
                            style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                        >
                            📝 Contribute
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Docs
