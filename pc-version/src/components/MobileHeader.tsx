import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MoreHorizontal, Circle } from 'lucide-react';

interface MobileHeaderProps {
    title: string;
    onBack?: () => void;
    showMenu?: boolean;
}

export default function MobileHeader({ title, onBack, showMenu = true }: MobileHeaderProps) {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 bg-white z-50 px-4 h-14 flex items-center justify-between border-b border-gray-100">
            <button onClick={handleBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full">
                <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-medium text-gray-900 absolute left-1/2 -translate-x-1/2">{title}</h1>
            <div className="flex items-center gap-2">
                {showMenu && (
                    <>
                        <button className="p-2 text-gray-600 rounded-full hover:bg-gray-50"><MoreHorizontal className="w-5 h-5" /></button>
                        <button className="p-2 text-gray-900 rounded-full hover:bg-gray-50"><Circle className="w-5 h-5 fill-current" /></button>
                    </>
                )}
            </div>
        </header>
    );
}
