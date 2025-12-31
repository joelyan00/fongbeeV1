import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { ArrowLeft, Plus, MapPin, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { addressApi, getUserInfo } from '../services/api';
import { useToast } from '../contexts/ToastContext';

export default function AddressList() {
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState<any>(null);
    const { showToast } = useToast();

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const res = await addressApi.getAll();
            setAddresses(res.addresses || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('确定要删除这个地址吗？')) return;
        try {
            await addressApi.delete(id);
            showToast('已删除地址', 'success');
            fetchAddresses();
        } catch (e) {
            showToast('删除失败', 'error');
        }
    };

    const handleEdit = (addr: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingAddress(addr);
        setShowModal(true);
    };

    const handleSetDefault = async (addr: any) => {
        if (addr.is_default) return;
        try {
            // Optimistic
            setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === addr.id })));
            await addressApi.update(addr.id, { ...addr, is_default: true });
            fetchAddresses();
        } catch (e) {
            fetchAddresses();
        }
    };

    const handleSave = async (data: any) => {
        try {
            if (editingAddress) {
                await addressApi.update(editingAddress.id, data);
            } else {
                await addressApi.create(data);
            }
            setShowModal(false);
            setEditingAddress(null);
            showToast(editingAddress ? '地址已更新' : '地址已添加', 'success');
            fetchAddresses();
        } catch (e) {
            showToast('保存失败', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header />
            <div className="max-w-4xl mx-auto pt-28 px-4 sm:px-6 lg:px-8 pb-12">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/profile')} className="p-2 -ml-2 rounded-full hover:bg-white transition-all text-gray-600">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">地址管理</h1>
                    </div>
                    <button
                        onClick={() => { setEditingAddress(null); setShowModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
                    >
                        <Plus className="w-5 h-5" />
                        添加新地址
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-gray-400">加载中...</div>
                ) : addresses.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                            <MapPin className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">暂无收货地址</h3>
                        <p className="text-gray-500 mb-8">添加地址以便更快下单</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-6 py-3 bg-white border-2 border-primary-600 text-primary-600 rounded-xl font-bold hover:bg-primary-50 transition-colors"
                        >
                            添加地址
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {addresses.map(addr => (
                            <div
                                key={addr.id}
                                className={`bg-white rounded-2xl p-6 border transition-all hover:shadow-md cursor-pointer group relative ${addr.is_default ? 'border-primary-500 ring-1 ring-primary-500 shadow-sm' : 'border-gray-100 hover:border-gray-300'}`}
                                onClick={() => handleSetDefault(addr)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                        {addr.name}
                                        {addr.is_default && <span className="text-xs font-normal text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">默认</span>}
                                    </div>
                                    {!addr.is_default && (
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4 flex gap-2">
                                            <button onClick={(e) => handleEdit(addr, e)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-50 rounded-lg">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={(e) => handleDelete(addr.id, e)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                    {addr.is_default && (
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <button onClick={(e) => handleEdit(addr, e)} className="p-2 text-primary-200 hover:text-primary-600 hover:bg-gray-50 rounded-lg">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="text-gray-600 space-y-1 text-sm leading-relaxed">
                                    <div>{addr.address_line1}</div>
                                    {addr.address_line2 && <div>{addr.address_line2}</div>}
                                    <div>{addr.city}, {addr.state} {addr.postal_code}</div>
                                    <div className="mt-2 text-gray-500 font-medium pt-2 border-t border-gray-50 flex items-center gap-2">
                                        {addr.phone}
                                    </div>
                                </div>

                                {addr.is_default && (
                                    <div className="absolute -bottom-px -right-px bg-primary-500 text-white rounded-tl-xl rounded-br-xl px-3 py-1">
                                        <CheckCircle className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Address Modal */}
            {showModal && (
                <AddressModal
                    initialData={editingAddress}
                    onClose={() => { setShowModal(false); setEditingAddress(null); }}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}

function AddressModal({ initialData, onClose, onSave }: any) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'Canada',
        is_default: false
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            // Pre-fill from user info
            const user = getUserInfo();
            if (user) {
                setFormData(prev => ({
                    ...prev,
                    name: user.name || '',
                    phone: user.phone || ''
                }));
            }
        }

        // Google Autocomplete
        const timer = setTimeout(() => {
            const input = document.getElementById('autocomplete-input') as HTMLInputElement;
            if (input && (window as any).google && (window as any).google.maps) {
                const autocomplete = new (window as any).google.maps.places.Autocomplete(input, {
                    types: ['address'],
                    fields: ['address_components', 'geometry'],
                });

                // Restore placeholder (Google Maps overwrites it)
                setTimeout(() => {
                    input.setAttribute('placeholder', '街道地址，门牌号');
                }, 100);

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
                    // If Google returns empty street number (common for some lookups), try to use what was typed or just route
                    if (!address1 && input.value) address1 = input.value;

                    setFormData(prev => ({
                        ...prev,
                        address_line1: address1 || route || input.value,
                        city: city || prev.city,
                        state: state || prev.state,
                        postal_code: zip || prev.postal_code,
                        country: country || 'Canada'
                    }));
                });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 text-3xl leading-none">&times;</button>
                <h2 className="text-2xl font-bold mb-6 text-gray-900">{initialData ? '编辑地址' : '添加新地址'}</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">联系人</label>
                            <input type="text" required className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">电话</label>
                            <input type="tel" required className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">地址</label>
                        <input id="autocomplete-input" type="text" required placeholder="街道地址，门牌号" className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                            value={formData.address_line1} onChange={e => setFormData({ ...formData, address_line1: e.target.value })} />
                    </div>

                    <div>
                        <input type="text" placeholder="公寓号、单元号（选填）" className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                            value={formData.address_line2 || ''} onChange={e => setFormData({ ...formData, address_line2: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">城市</label>
                            <input type="text" required className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">邮编</label>
                            <input type="text" required className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                value={formData.postal_code} onChange={e => setFormData({ ...formData, postal_code: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">省份</label>
                            <input type="text" className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                value={formData.state || ''} onChange={e => setFormData({ ...formData, state: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">国家</label>
                            <input type="text" disabled className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 outline-none"
                                value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} />
                        </div>
                    </div>

                    <label className="flex items-center gap-2 pt-2 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500 border-gray-300"
                            checked={formData.is_default} onChange={e => setFormData({ ...formData, is_default: e.target.checked })} />
                        <span className="text-gray-700 text-sm">设为默认地址</span>
                    </label>

                    <button className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 transition-shadow shadow-lg shadow-primary-600/20 mt-4">
                        保存地址
                    </button>
                </form>
            </div>
        </div>
    );
}
