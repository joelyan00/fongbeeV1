import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { ChevronLeft, Save, Send, Clock, AlertCircle } from 'lucide-react';
import { formTemplatesApi, submissionsApi } from '../services/api';
import { useToast } from '../contexts/ToastContext';

export default function ServiceRequestPage() {
    const { id } = useParams(); // templateId
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [template, setTemplate] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form data state
    const [formData, setFormData] = useState<any>({});

    // Current step in stepper (if multiple steps)
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        loadTemplate();
    }, [id]);

    const loadTemplate = async () => {
        if (!id) return;
        try {
            const res = await formTemplatesApi.getById(id);
            setTemplate(res.template);
        } catch (error) {
            console.error(error);
            showToast('加载模板失败', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (key: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [key]: value
        }));
    };

    const validateStep = (stepIndex: number) => {
        const step = template.steps[stepIndex];
        for (const field of step.fields) {
            if (field.required && !formData[field.key]) {
                showToast(`请填写${field.label}`, 'error');
                return false;
            }
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = async (isDraft: boolean = false) => {
        // Validate all steps if submitting
        if (!isDraft) {
            for (let i = 0; i < template.steps.length; i++) {
                if (!validateStep(i)) return; // Stop if any step invalid
            }
        }

        if (isDraft) setSaving(true);
        else setSubmitting(true);

        try {
            const payload = {
                form_template_id: template.id,
                data: formData,
                status: isDraft ? 'draft' : 'pending',
                submission_type: 'user_request'
            };

            await submissionsApi.create(payload);

            showToast(isDraft ? '草稿保存成功' : '提交成功', 'success');
            navigate('/orders'); // Redirect to orders list
        } catch (error: any) {
            console.error(error);
            showToast(error.message || '操作失败', 'error');
        } finally {
            setSaving(false);
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (!template) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">模板不存在</div>;
    }

    const currentStepData = template.steps[currentStep];
    const isLastStep = currentStep === template.steps.length - 1;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="pt-24 pb-20">
                <div className="max-w-3xl mx-auto px-4">

                    {/* Header */}
                    <div className="mb-6 flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-full">
                            <ChevronLeft className="w-6 h-6 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded ${template.type === 'complex' ? 'bg-purple-100 text-purple-700' :
                                        (template.type === 'custom' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700')
                                    }`}>
                                    {template.type === 'complex' ? '复杂定制' : (template.type === 'custom' ? '简单定制' : '标准服务')}
                                </span>
                                {template.type === 'complex' && (
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                        <AlertCircle className="w-3 h-3" /> 支持草稿
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar (if multiple steps) */}
                    {template.steps.length > 1 && (
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-2">
                                {template.steps.map((step: any, idx: number) => (
                                    <div key={idx} className={`flex flex-col items-center ${idx <= currentStep ? 'text-emerald-600' : 'text-gray-400'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-1 transition-colors ${idx <= currentStep ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
                                            }`}>
                                            {idx + 1}
                                        </div>
                                        <span className="text-xs">{step.title}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-600 transition-all duration-300"
                                    style={{ width: `${((currentStep + 1) / template.steps.length) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Form Content */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">{currentStepData.title}</h2>

                        <div className="space-y-6">
                            {currentStepData.fields.map((field: any) => (
                                <div key={field.key}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {field.label}
                                        {field.required && <span className="text-red-500 ml-1">*</span>}
                                    </label>

                                    {field.type === 'text' && (
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                            placeholder={field.placeholder}
                                            value={formData[field.key] || ''}
                                            onChange={(e) => handleInputChange(field.key, e.target.value)}
                                        />
                                    )}

                                    {field.type === 'number' && (
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                            placeholder={field.placeholder}
                                            value={formData[field.key] || ''}
                                            onChange={(e) => handleInputChange(field.key, e.target.value)}
                                        />
                                    )}

                                    {field.type === 'textarea' && (
                                        <textarea
                                            rows={4}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                                            placeholder={field.placeholder}
                                            value={formData[field.key] || ''}
                                            onChange={(e) => handleInputChange(field.key, e.target.value)}
                                        />
                                    )}

                                    {field.type === 'select' && (
                                        <select
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
                                            value={formData[field.key] || ''}
                                            onChange={(e) => handleInputChange(field.key, e.target.value)}
                                        >
                                            <option value="">{field.placeholder || '请选择'}</option>
                                            {field.options?.map((opt: any) => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    )}

                                    {/* Add other field types (radio, checkbox, image, address) as needed */}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 flex gap-4">
                        {currentStep > 0 && (
                            <button
                                onClick={prevStep}
                                className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 flex-1"
                            >
                                上的一步
                            </button>
                        )}

                        {/* Save Draft Button - Only for Complex forms or generally allowed */}
                        {template.type === 'complex' && (
                            <button
                                onClick={() => handleSubmit(true)}
                                disabled={saving || submitting}
                                className="px-6 py-3 rounded-xl border border-gray-200 text-emerald-600 font-bold hover:bg-emerald-50 flex-1 flex items-center justify-center gap-2"
                            >
                                <Save className="w-5 h-5" />
                                {saving ? '保存中...' : '保存草稿'}
                            </button>
                        )}

                        {!isLastStep ? (
                            <button
                                onClick={nextStep}
                                className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 flex-[2]"
                            >
                                下一步
                            </button>
                        ) : (
                            <button
                                onClick={() => handleSubmit(false)}
                                disabled={submitting || saving}
                                className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 flex-[2] flex items-center justify-center gap-2"
                            >
                                <Send className="w-5 h-5" />
                                {submitting ? '提交申请' : '提交申请'}
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
