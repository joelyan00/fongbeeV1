import MobileHeader from '../components/MobileHeader';
import DeviceManagement from '../components/DeviceManagement';

export default function DeviceSettings() {
    return (
        <div className="min-h-screen bg-gray-50 pt-14">
            <MobileHeader title="已登录设备" />

            <div className="p-4">
                <DeviceManagement />
            </div>
        </div>
    );
}
