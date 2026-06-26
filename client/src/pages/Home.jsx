import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Clock from './Clock';
import Pomodoro from './Pomodoro';
import Alarm from './Alarm';
import WorldClock from './WorldClock';
import Analytics from './Analytics';
import Tasks from './Tasks';
import Settings from './Settings';

export default function Home() {
    var _a = useState('clock'), activeTab = _a[0], setActiveTab = _a[1];
    var renderContent = function () {
        switch (activeTab) {
            case 'clock':
                return <Clock />;
            case 'pomodoro':
                return <Pomodoro />;
            case 'alarm':
                return <Alarm />;
            case 'world':
                return <WorldClock />;
            case 'analytics':
                return <Analytics />;
            case 'tasks':
                return <Tasks />;
            case 'settings':
                return <Settings />;
            default:
                return <Clock />;
        }
    };
    return (<DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>);
}
