export type FieldType = 'text' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'time' | 'phone' | 'image' | 'address';

export interface FormField {
    key: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    options?: { label: string; value: string }[];
    required?: boolean;
}

export interface FormStep {
    title: string;
    description?: string;
    fields: FormField[];
}

export interface ServiceTemplate {
    id: string;
    name: string;
    steps: FormStep[];
}

// MOCK DATA: "Moving" Service - Reorganized into Steps
export const MOVING_SERVICE_TEMPLATE: ServiceTemplate = {
    id: 'moving',
    name: '搬家服务',
    steps: [
        {
            title: '基本信息',
            description: '确定搬家的时间和地点',
            fields: [
                {
                    key: 'move_date',
                    label: '搬家日期',
                    type: 'date',
                    required: true,
                    placeholder: '请选择预计搬家日期'
                },
                {
                    key: 'from_address',
                    label: '出发地地址',
                    type: 'address',
                    required: true,
                    placeholder: '请输入详细地址'
                },
                {
                    key: 'to_address',
                    label: '目的地地址',
                    type: 'address',
                    required: true,
                    placeholder: '请输入详细地址'
                }
            ]
        },
        {
            title: '详细需求',
            description: '补充楼层和物品信息，以便估价',
            fields: [
                {
                    key: 'from_floor',
                    label: '出发地楼层',
                    type: 'select',
                    required: true,
                    options: [
                        { label: 'House/Townhouse (地面)', value: '0' },
                        { label: 'Condo/Apartment (有电梯)', value: 'lift' },
                        { label: '2楼 (无电梯)', value: '2' },
                        { label: '3楼 (无电梯)', value: '3' },
                    ]
                },
                {
                    key: 'to_floor',
                    label: '目的地楼层',
                    type: 'select',
                    required: true,
                    options: [
                        { label: 'House/Townhouse (地面)', value: '0' },
                        { label: 'Condo/Apartment (有电梯)', value: 'lift' },
                        { label: '2楼 (无电梯)', value: '2' },
                        { label: '3楼 (无电梯)', value: '3' },
                    ]
                },
                {
                    key: 'items_desc',
                    label: '物品描述',
                    type: 'textarea',
                    required: false,
                    placeholder: '例如：一张King Size床，两个床头柜，20个纸箱，一架钢琴...'
                },
                {
                    key: 'photos',
                    label: '物品照片',
                    type: 'image',
                    required: false,
                    placeholder: '上传物品照片帮助估价'
                }
            ]
        },
        {
            title: '联系方式',
            description: '方便服务商与您取得联系',
            fields: [
                {
                    key: 'contact_name',
                    label: '联系人',
                    type: 'text',
                    required: true,
                    placeholder: '怎么称呼您'
                },
                {
                    key: 'phone',
                    label: '联系电话',
                    type: 'number',
                    required: true,
                    placeholder: '服务商将通过此号码联系您'
                }
            ]
        }
    ]
};

// MOCK DATA: "Pickup" Service
export const PICKUP_SERVICE_TEMPLATE: ServiceTemplate = {
    id: 'pickup',
    name: '接机服务',
    steps: [
        {
            title: '航班信息',
            description: '请填写准确的航班详情，以便安排司机',
            fields: [
                { key: 'flight_no', label: '航班号', type: 'text', required: true, placeholder: '例如：AC025' },
                { key: 'arrival_date', label: '到达日期', type: 'date', required: true },
                { key: 'arrival_time', label: '预计到达时间', type: 'text', required: true, placeholder: '例如：14:30' },
                { key: 'airport', label: '到达机场', type: 'text', required: true, placeholder: '例如：温哥华国际机场 (YVR)' }
            ]
        },
        {
            title: '行程详情',
            description: '请详细描述您的人数及行李情况',
            fields: [
                { key: 'destination', label: '目的地地址', type: 'address', required: true, placeholder: '请输入要把您送到哪里' },
                { key: 'passengers', label: '乘客人数', type: 'text', required: true, placeholder: '例如：2位大人，1位小孩' },
                { key: 'luggage', label: '行李件数', type: 'text', required: true, placeholder: '例如：3件大行李箱，2个手提包' },
                {
                    key: 'car_type', label: '期望车型', type: 'select', required: true,
                    options: [
                        { label: '经济轿车 (5座)', value: 'economy' },
                        { label: '舒适SUV (5座)', value: 'suv' },
                        { label: '豪华商务 (7座)', value: 'van' },
                        { label: '大型小巴 (12座+)', value: 'bus' }
                    ]
                }
            ]
        },
        {
            title: '联系方式',
            fields: [
                { key: 'contact_name', label: '联系人姓名', type: 'text', required: true },
                { key: 'contact_phone', label: '联系电话', type: 'number', required: true, placeholder: '请输入手机号' },
                { key: 'remark', label: '特殊备注', type: 'textarea', required: false, placeholder: '是否有特殊需求（如需儿童座椅等）' }
            ]
        }
    ]
};
