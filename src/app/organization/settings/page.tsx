import React from 'react';
import { Settings, Lock, Bell, Shield } from 'lucide-react';

export default function OrgSettingsPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber-400" />
          <span>Organization Account Settings</span>
        </h1>
        <p className="text-xs text-slate-400">
          Manage your organization notification preferences and security credentials.
        </p>
      </div>

      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" />
          <span>Notification Alerts</span>
        </h3>

        <div className="space-y-3 text-xs sm:text-sm text-slate-300">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded text-amber-500 bg-slate-900 border-slate-700" />
            <span>Notify me when an administrator reviews or verifies our event submissions</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded text-amber-500 bg-slate-900 border-slate-700" />
            <span>Receive alerts when community members submit corrections or reports</span>
          </label>
        </div>
      </div>
    </div>
  );
}
