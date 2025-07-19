import { useState } from 'react'
import AlertModal from '../components/AlertModal'

export function useConfirm() {
    const [modal, setModal] = useState({
        open: false,
        message: '',
        title: '',
        resolve: null,
    })

    const confirm = (message, title = 'Підтвердження') => {
        return new Promise((resolve) => {
            setModal({ open: true, message, title, resolve })
        })
    }

    const handleConfirm = () => {
        modal.resolve(true)
        setModal((prev) => ({ ...prev, open: false }))
    }

    const handleCancel = () => {
        modal.resolve(false)
        setModal((prev) => ({ ...prev, open: false }))
    }

    const ConfirmUI = (
        <AlertModal
            isOpen={modal.open}
            title={modal.title}
            message={modal.message}
            onClose={handleCancel}
            onConfirm={handleConfirm}
            confirmMode
        />
    )

    return [confirm, ConfirmUI]
}
