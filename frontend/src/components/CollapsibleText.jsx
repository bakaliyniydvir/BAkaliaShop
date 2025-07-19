import React, { useState, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'

export default function CollapsibleText({
    text,
    className = '',
    moreLabel = '…докладніше',
    lessLabel = 'згорнути',
    lineHeight = 24,
    maxLines = 3
}) {
    const [showModal, setShowModal] = useState(false)
    const [shouldCollapse, setShouldCollapse] = useState(false)
    const [rect, setRect] = useState(null)

    const containerRef = useRef(null)
    const measureRef = useRef(null)

    const maxTextHeight = lineHeight * maxLines
    const reserveButtonHeight = 20 // height for "...докладніше" even if hidden
    const totalReservedHeight = maxTextHeight + reserveButtonHeight

    useEffect(() => {
        if (containerRef.current && measureRef.current) {
            const width = containerRef.current.getBoundingClientRect().width
            measureRef.current.style.width = `${width}px`
            const fullHeight = measureRef.current.scrollHeight
            if (fullHeight > maxTextHeight + 2) setShouldCollapse(true)
        }
    }, [text, maxTextHeight])

    const openModal = () => {
        const { top, left, width } = containerRef.current.getBoundingClientRect()
        setRect({ top, left, width })
        setShowModal(true)
    }

    const closeModal = () => setShowModal(false)

    return (
        <>
            <div
                ref={containerRef}
                className={`relative overflow-visible ${className}`}
                style={{ minHeight: `${totalReservedHeight}px` }}
            >
                <p
                    className="whitespace-pre-wrap break-words text-gray-800"
                    style={{
                        display: '-webkit-box',
                        WebkitLineClamp: maxLines,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: `${lineHeight}px`,
                    }}
                >
                    {text}
                </p>

                {/* Even when button is hidden, we reserve height here */}
                <div style={{ height: `${reserveButtonHeight}px` }}>
                    {shouldCollapse && (
                        <button
                            onClick={openModal}
                            className="text-sm text-blue-600 hover:underline focus:outline-none"
                        >
                            {moreLabel}
                        </button>
                    )}
                </div>
            </div>

            {/* Hidden measure block */}
            <div
                ref={measureRef}
                className="invisible fixed top-0 left-0 whitespace-pre-wrap break-words"
                style={{ lineHeight: `${lineHeight}px`, zIndex: -1 }}
            >
                {text}
            </div>

            {/* Modal */}
            {showModal && rect &&
                ReactDOM.createPortal(
                    <div
                        className="absolute bg-white shadow-xl z-40 max-h-[80vh] overflow-auto border rounded-lg p-4"
                        style={{
                            top: rect.top + window.scrollY,
                            left: rect.left + window.scrollX,
                            width: rect.width,
                        }}
                    >
                        <p className="whitespace-pre-wrap break-words mb-4 text-gray-900">
                            {text}
                        </p>
                        <button
                            onClick={closeModal}
                            className="text-sm text-blue-600 hover:underline focus:outline-none"
                        >
                            {lessLabel}
                        </button>
                    </div>,
                    document.body
                )}
        </>
    )
}
