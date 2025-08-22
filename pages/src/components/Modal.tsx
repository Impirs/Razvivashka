import React, { useEffect } from 'react'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    // Закрытие по Escape
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            // Предотвращаем скролл фона
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'var(--overlay)' }}
            onClick={onClose}
        >
            <div 
                className="modal-content relative w-full max-w-md rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
                style={{ 
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                    style={{ 
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-color)'
                    }}
                    aria-label="Close modal"
                >
                    ✕
                </button>

                {/* Modal header */}
                <div className="mb-6">
                    <h2 
                        className="text-2xl font-bold mb-2 pr-8"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        {title}
                    </h2>
                    <div 
                        className="w-16 h-1 rounded-full"
                        style={{ backgroundColor: 'var(--accent)' }}
                    ></div>
                </div>

                {/* Modal content */}
                <div 
                    className="text-base leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                >
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Modal
