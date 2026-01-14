import React, { useState, useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';
import { addressApi } from '../services/api';
import { useToast } from '../contexts/ToastContext';

interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editData?: any;
}

export default function AddressModal({ isOpen, onClose, onSuccess, editData }: AddressModalProps) {
    const [form, setForm] = useState({
        name: '', phone: '', address_line1: '', address_line2: '',
        city: '', state: '', postal_code: '', country: 'Canada', is_default: false
    });
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const autoCompleteRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (editData) {
                setForm({ ...editData });
            } else {
                setForm({
                    name: '', phone: '', address_line1: '', address_line2: '',
                    city: '', state: '', postal_code: '', country: 'Canada', is_default: false
                });
            }
        }
    }, [isOpen, editData]);

    useEffect(() => {
        if (isOpen && autoCompleteRef.current && (window as any).google) {
            const autocomplete = new (window as any).google.maps.places.Autocomplete(autoCompleteRef.current, {
                types: ['address'],
                fields: ['address_components', 'geometry'],
            });
            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (!place.address_components) return;

                let address1 = '';
                let city = '';
                let state = '';
                let zip = '';
                let country = '';
                let route = '';
                let streetNum = '';

                place.address_components.forEach((component: any) => {
                    const types = component.types;
                    if (types.includes('street_number')) streetNum = component.long_name;
                    if (types.includes('route')) route = component.long_name;
                    if (types.includes('locality')) city = component.long_name;
                    if (types.includes('administrative_area_level_1')) state = component.short_name;
                    if (types.includes('postal_code')) zip = component.long_name;
                    if (types.includes('country')) country = component.long_name;
                });

                address1 = `${streetNum} ${route}`.trim();
                setForm(prev => ({
                    ...prev,
                    address_line1: address1 || prev.address_line1,
                    city: city || prev.city,
                    state: state || prev.state,
                    postal_code: zip || prev.postal_code,
                    country: country || 'Canada'
                }));
            });
        }
    }, [isOpen]);

    const handleSave = async () => {
        if (!form.name || !form.phone || !form.address_line1 || !form.city || !form.postal_code) {
            showToast('请填写完整信息', 'error');
            return;
        }
        setLoading(true);
        try {
            if (editData && editData.id) {
                // Remove non-data fields if necessary, but API assumes standard payload
                await addressApi.update(editData.id, form);
            } else {
                await addressApi.create(form);
            }
            onSuccess();
            onClose();
        } catch (e) {
            console.error(e);
            showToast('保存失败', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold mb-6">{editData ? '编辑地址' : '添加新地址'}</h2>

                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">联系人</label>
                        <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="请输入姓名" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">手机号码</label>
                        <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="请输入手机号码" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">街道地址</label>
                        <input ref={autoCompleteRef} type="text" value={form.address_line1} onChange={e => setForm({ ...form, address_line1: e.target.value })} placeholder="街道名，门牌号" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">公寓/单元 (选填)</label>
                        <input type="text" value={form.address_line2} onChange={e => setForm({ ...form, address_line2: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="例如：Unit 101" />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">城市</label>
                            <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="City" />
                        </div>
                        <div className="w-32">
                            <label className="block text-sm font-medium text-gray-700 mb-1">邮编</label>
                            <input type="text" value={form.postal_code} onChange={e => setForm({ ...form, postal_code: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Zip" />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">省份</label>
                            <input type="text" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Province/State" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">国家</label>
                            <input type="text" value={form.country || 'Canada'} disabled className="w-full border border-gray-300 bg-gray-50 rounded px-3 py-2 text-sm text-gray-500" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 cursor-pointer mt-2" onClick={() => setForm({ ...form, is_default: !form.is_default })}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${form.is_default ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}>
                            {form.is_default && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-gray-700 text-sm">设为默认地址</span>
                    </div>
                </div>

                <div className="mt-8">
                    <button onClick={handleSave} disabled={loading} className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-bold hover:bg-primary-700 transition-colors disabled:opacity-50 text-sm">
                        {loading ? '保存中...' : '保存'}
                    </button>
                </div>
            </div>
        </div>
    );
}
