import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';
import { useEffect } from 'react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, type = 'success', onClose, duration = 3000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />
    };

    const colors = {
        success: 'border-emerald-100 bg-emerald-50 text-emerald-800',
        error: 'border-red-100 bg-red-50 text-red-800',
        info: 'border-blue-100 bg-blue-50 text-blue-800'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-xl ${colors[type]} min-w-[320px]`}
        >
            {icons[type]}
            <p className="flex-1 font-medium text-sm">{message}</p>
            <button
                onClick={onClose}
                className="p-1 hover:bg-black/5 rounded-lg transition-colors"
            >
                <X className="w-4 h-4 opacity-50" />
            </button>
        </motion.div>
    );
}
