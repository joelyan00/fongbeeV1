import React, { useState, useEffect } from 'react';
import {
    Calendar, Clock, DollarSign, Image as ImageIcon, MapPin,
    Type, CheckSquare, List, Phone, AlignLeft
} from 'lucide-react';

// Types mimicking the Vue structure
interface Option {
    label: string;
    value: string;
}

interface Field {
    key?: string; // Unique ID for keying data
    label: string;
    type: 'text' | 'phone' | 'number' | 'currency' | 'date' | 'time' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'image' | 'address';
    placeholder?: string;
    required?: boolean;
    currency?: string;
    options?: Option[];
}

interface Step {
    title: string;
    description?: string;
    fields: Field[];
}

interface FormTemplate {
    steps: Step[];
}

interface FormRendererProps {
    template: FormTemplate;
    value: Record<string, any>;
    onChange: (newValue: Record<string, any>) => void;
    readOnly?: boolean;
}

export const FormRenderer: React.FC<FormRendererProps> = ({ template, value, onChange, readOnly = false }) => {

    const handleChange = (fieldKey: string, fieldValue: any) => {
        if (readOnly) return;
        onChange({
            ...value,
            [fieldKey]: fieldValue
        });
    };

    // Helper to determine the key to store data
    // Ideally the template has a unique 'key', if not use label fallback
    const getFieldKey = (field: Field) => field.key || field.label;

    const renderField = (field: Field) => {
        const fieldKey = getFieldKey(field);
        const fieldValue = value[fieldKey] || '';

        const commonInputClasses = "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all";
        const readOnlyClasses = "bg-gray-50 text-gray-500 cursor-not-allowed";

        switch (field.type) {
            case 'textarea':
                return (
                    <textarea
                        disabled={readOnly}
                        value={fieldValue}
                        onChange={(e) => handleChange(fieldKey, e.target.value)}
                        placeholder={field.placeholder || `请输入${field.label}`}
                        className={`${commonInputClasses} min-h-[100px] ${readOnly ? readOnlyClasses : ''}`}
                    />
                );

            case 'select':
                return (
                    <div className="relative">
                        <select
                            disabled={readOnly}
                            value={fieldValue}
                            onChange={(e) => handleChange(fieldKey, e.target.value)}
                            className={`${commonInputClasses} appearance-none ${readOnly ? readOnlyClasses : ''}`}
                        >
                            <option value="">{field.placeholder || '请选择'}</option>
                            {field.options?.map((opt, idx) => (
                                <option key={idx} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <List size={16} />
                        </div>
                    </div>
                );

            case 'radio':
                return (
                    <div className="flex flex-wrap gap-4 mt-2">
                        {field.options?.map((opt, idx) => (
                            <label key={idx} className={`flex items-center gap-2 cursor-pointer ${readOnly ? 'opacity-70 pointer-events-none' : ''}`}>
                                <input
                                    type="radio"
                                    name={fieldKey}
                                    checked={fieldValue === opt.value}
                                    onChange={() => handleChange(fieldKey, opt.value)}
                                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                                    disabled={readOnly}
                                />
                                <span className="text-gray-700">{opt.label}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'checkbox':
                const selectedValues: string[] = Array.isArray(fieldValue) ? fieldValue : [];
                return (
                    <div className="flex flex-wrap gap-4 mt-2">
                        {field.options?.map((opt, idx) => (
                            <label key={idx} className={`flex items-center gap-2 cursor-pointer ${readOnly ? 'opacity-70 pointer-events-none' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={selectedValues.includes(opt.value)}
                                    onChange={(e) => {
                                        if (readOnly) return;
                                        if (e.target.checked) {
                                            handleChange(fieldKey, [...selectedValues, opt.value]);
                                        } else {
                                            handleChange(fieldKey, selectedValues.filter(v => v !== opt.value));
                                        }
                                    }}
                                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                                    disabled={readOnly}
                                />
                                <span className="text-gray-700">{opt.label}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'currency':
                return (
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">
                            {field.currency || '$'}
                        </div>
                        <input
                            type="number"
                            disabled={readOnly}
                            value={fieldValue}
                            onChange={(e) => handleChange(fieldKey, e.target.value)}
                            placeholder={field.placeholder || '0.00'}
                            className={`${commonInputClasses} pl-8 ${readOnly ? readOnlyClasses : ''}`}
                            step="0.01"
                        />
                    </div>
                );

            case 'date':
                return (
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Calendar size={18} />
                        </div>
                        <input
                            type="date"
                            disabled={readOnly}
                            value={fieldValue}
                            onChange={(e) => handleChange(fieldKey, e.target.value)}
                            className={`${commonInputClasses} pl-10 ${readOnly ? readOnlyClasses : ''}`}
                        />
                    </div>
                );

            case 'time':
                return (
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Clock size={18} />
                        </div>
                        <input
                            type="time"
                            disabled={readOnly}
                            value={fieldValue}
                            onChange={(e) => handleChange(fieldKey, e.target.value)}
                            className={`${commonInputClasses} pl-10 ${readOnly ? readOnlyClasses : ''}`}
                        />
                    </div>
                );

            default: // text, phone, number, address, etc.
                return (
                    <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        disabled={readOnly}
                        value={fieldValue}
                        onChange={(e) => handleChange(fieldKey, e.target.value)}
                        placeholder={field.placeholder || `请输入${field.label}`}
                        className={`${commonInputClasses} ${readOnly ? readOnlyClasses : ''}`}
                    />
                );
        }
    };

    if (!template || !template.steps || template.steps.length === 0) {
        return <div className="text-gray-400 text-center py-4">暂无表单内容</div>;
    }

    return (
        <div className="space-y-8">
            {template.steps.map((step, sIdx) => (
                <div key={sIdx} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                            {sIdx + 1}
                        </span>
                        {step.title}
                    </h4>
                    {step.description && <p className="text-sm text-gray-500 mb-4 ml-8">{step.description}</p>}

                    <div className="space-y-5 ml-1 md:ml-8">
                        {step.fields.map((field, fIdx) => (
                            <div key={fIdx}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {field.required && <span className="text-red-500 mr-1">*</span>}
                                    {field.label}
                                </label>
                                {renderField(field)}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
