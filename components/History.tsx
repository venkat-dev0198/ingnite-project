
import React from 'react';
import { Clock, MapPin, AlertTriangle, ChevronRight } from 'lucide-react';
import { AlertLog } from '../types';

interface HistoryProps {
  logs: AlertLog[];
}

const History: React.FC<HistoryProps> = ({ logs }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold">Activity Log</h2>
        <p className="text-sm opacity-60">Previous emergency history</p>
      </div>

      <div className="space-y-3">
        {logs.length > 0 ? logs.map(log => (
          <div key={log.id} className="glass p-5 rounded-[2rem] flex items-center justify-between group cursor-pointer hover:bg-white dark:hover:bg-zinc-800 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm">Emergency Alert</h4>
                <div className="flex flex-col text-[10px] opacity-50 mt-1 uppercase tracking-wider">
                  <span className="flex items-center gap-1"><Clock size={10}/> {new Date(log.timestamp).toLocaleString()}</span>
                  <span className="flex items-center gap-1 mt-0.5"><MapPin size={10}/> {log.location.lat.toFixed(4)}, {log.location.lng.toFixed(4)}</span>
                </div>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-300 group-hover:text-red-500 transition-colors" />
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center h-64 opacity-20">
             <Clock size={64} className="mb-4" />
             <p className="font-medium">No alerts triggered recently.</p>
          </div>
        )}
      </div>

      {logs.length > 0 && (
        <div className="p-4 text-center">
          <p className="text-[10px] opacity-40 uppercase font-black tracking-widest">Logs are kept for 30 days locally</p>
        </div>
      )}
    </div>
  );
};

export default History;
