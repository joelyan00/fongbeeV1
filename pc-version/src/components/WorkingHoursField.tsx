/**
 * Working Hours Field Component
 * Renders a weekly schedule picker with checkboxes for each day and time range inputs
 */
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface DaySchedule {
    enabled: boolean;
    start: string;
    end: string;
}

interface WorkingHoursData {
    monday: DaySchedule;
    tuesday: DaySchedule;
    wednesday: DaySchedule;
    thursday: DaySchedule;
    friday: DaySchedule;
    saturday: DaySchedule;
    sunday: DaySchedule;
}

interface WorkingHoursFieldProps {
    value?: WorkingHoursData;
    onChange: (value: WorkingHoursData) => void;
    label?: string;
    required?: boolean;
}

const DAYS = [
    { key: 'monday', label: '周一' },
    { key: 'tuesday', label: '周二' },
    { key: 'wednesday', label: '周三' },
    { key: 'thursday', label: '周四' },
    { key: 'friday', label: '周五' },
    { key: 'saturday', label: '周六' },
    { key: 'sunday', label: '周日' },
] as const;

const DEFAULT_SCHEDULE: WorkingHoursData = {
    monday: { enabled: true, start: '09:00', end: '18:00' },
    tuesday: { enabled: true, start: '09:00', end: '18:00' },
    wednesday: { enabled: true, start: '09:00', end: '18:00' },
    thursday: { enabled: true, start: '09:00', end: '18:00' },
    friday: { enabled: true, start: '09:00', end: '18:00' },
    saturday: { enabled: false, start: '', end: '' },
    sunday: { enabled: false, start: '', end: '' },
};

export default function WorkingHoursField({ value, onChange, label, required }: WorkingHoursFieldProps) {
    const [schedule, setSchedule] = useState<WorkingHoursData>(value || DEFAULT_SCHEDULE);

    useEffect(() => {
        if (value) {
            setSchedule(value);
        }
    }, [value]);

    const handleDayToggle = (dayKey: keyof WorkingHoursData) => {
        const newSchedule = {
            ...schedule,
            [dayKey]: {
                ...schedule[dayKey],
                enabled: !schedule[dayKey].enabled,
                // Set default times when enabling
                start: !schedule[dayKey].enabled ? '09:00' : schedule[dayKey].start,
                end: !schedule[dayKey].enabled ? '18:00' : schedule[dayKey].end,
            }
        };
        setSchedule(newSchedule);
        onChange(newSchedule);
    };

    const handleTimeChange = (dayKey: keyof WorkingHoursData, field: 'start' | 'end', value: string) => {
        const newSchedule = {
            ...schedule,
            [dayKey]: {
                ...schedule[dayKey],
                [field]: value
            }
        };
        setSchedule(newSchedule);
        onChange(newSchedule);
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-4 text-gray-600">
                    <Clock size={18} />
                    <span className="text-sm font-medium">设置工作时间</span>
                </div>
                <div className="space-y-3">
                    {DAYS.map(({ key, label }) => {
                        const day = schedule[key];
                        return (
                            <div
                                key={key}
                                className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${day.enabled ? 'bg-white border border-emerald-200' : 'bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                <label className="flex items-center gap-3 cursor-pointer flex-shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={day.enabled}
                                        onChange={() => handleDayToggle(key)}
                                        className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className={`font-medium w-10 ${day.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                                        {label}
                                    </span>
                                </label>

                                <div className="flex items-center gap-2 flex-1">
                                    <input
                                        type="time"
                                        value={day.start}
                                        onChange={(e) => handleTimeChange(key, 'start', e.target.value)}
                                        disabled={!day.enabled}
                                        className={`px-3 py-2 border rounded-lg text-sm w-28 ${day.enabled
                                                ? 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
                                                : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                    />
                                    <span className={`${day.enabled ? 'text-gray-500' : 'text-gray-300'}`}>—</span>
                                    <input
                                        type="time"
                                        value={day.end}
                                        onChange={(e) => handleTimeChange(key, 'end', e.target.value)}
                                        disabled={!day.enabled}
                                        className={`px-3 py-2 border rounded-lg text-sm w-28 ${day.enabled
                                                ? 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
                                                : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                    />
                                </div>

                                {day.enabled && (
                                    <span className="text-xs text-emerald-600 font-medium px-2 py-1 bg-emerald-50 rounded">
                                        工作日
                                    </span>
                                )}
                                {!day.enabled && (
                                    <span className="text-xs text-gray-400 font-medium px-2 py-1 bg-gray-100 rounded">
                                        休息
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
