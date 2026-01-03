import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Trash2, Clock, DollarSign } from 'lucide-react';
import type { Activity } from '../types';

interface DayColumnProps {
  dayIndex: number;
  date: string;
  activities: Activity[];
  onRemoveActivity: (activityId: string) => void;
}

export const DayColumn: React.FC<DayColumnProps> = ({
  dayIndex,
  date,
  activities,
  onRemoveActivity
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${dayIndex}`,
    data: { dayIndex }
  });

  const totalCost = activities.reduce((sum, act) => sum + (act.estimatedCost || act.cost || 0), 0);
  const totalTime = activities.reduce((sum, act) => sum + (act.estimatedDuration || act.durationMinutes || 0), 0);

  return (
    <div 
      ref={setNodeRef}
      className={`flex flex-col bg-white border-2 rounded-lg p-4 min-h-[400px] transition-all ${
        isOver ? 'border-cyan-500 bg-cyan-50 shadow-lg' : 'border-slate-200'
      }`}
    >
      {/* Day Header */}
      <div className="mb-4 pb-3 border-b border-slate-200">
        <div className="font-bold text-lg text-slate-900">Day {dayIndex + 1}</div>
        <div className="text-sm text-slate-500">{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
        
        {/* Summary */}
        {activities.length > 0 && (
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {Math.floor(totalTime / 60)}h {totalTime % 60}m
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              ${totalCost}
            </span>
          </div>
        )}
      </div>

      {/* Activities */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            Drop activities here
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-slate-50 p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-slate-900 truncate">
                    {activity.name || activity.title}
                  </h4>
                  {(activity.description || activity.category) && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {activity.description || activity.category}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {activity.estimatedDuration || activity.durationMinutes || 60}m
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      ${activity.estimatedCost || activity.cost || 0}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveActivity(activity.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
