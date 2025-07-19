import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function AlertModal({
    isOpen,
    title,
    message,
    onClose,
    onConfirm,
    confirmMode = false,
}) {
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden'
        else document.body.style.overflow = 'auto'

        return () => {
            document.body.style.overflow = 'auto'
        }
    }, [isOpen])

    if (!isOpen) return null

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-fade-in">
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                <p className="mt-3 text-gray-600 whitespace-pre-line">{message}</p>

                <div className="mt-6 flex justify-center gap-4">
                    {confirmMode ? (
                        <>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
                            >
                                Скасувати
                            </button>
                            <button
                                onClick={onConfirm}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                            >
                                Підтвердити
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                        >
                            OK
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    )
}
