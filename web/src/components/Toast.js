import { jsx as _jsx } from "react/jsx-runtime";
export default function Toast({ message, type, onClose }) {
    setTimeout(onClose, 3000);
    const bgColor = type === 'success' ? 'bg-green-900 border-green-700' : 'bg-red-900 border-red-700';
    const textColor = type === 'success' ? 'text-green-200' : 'text-red-200';
    return (_jsx("div", { className: `fixed bottom-4 right-4 px-4 py-3 rounded border ${bgColor} ${textColor} z-50 shadow-lg`, children: message }));
}
