import React from 'react';
import { Calendar, Clock, AlertCircle, DollarSign, ShieldCheck } from 'lucide-react';

export const TimelineView = ({ analysis }) => {
  const entities = analysis?.keyEntities || {};
  const importantDates = entities.importantDates || [];

  const timelineItems = [
    {
      id: 'effective-date',
      label: 'Effective Start Date',
      date: entities.effectiveDate || 'Not specified',
      type: 'start',
      icon: Calendar,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 'notice-deadline',
      label: 'Notice Period Deadline',
      date: entities.noticePeriod || 'Standard notice',
      type: 'notice',
      icon: Clock,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      id: 'payment-schedule',
      label: 'Financial Commitment & Payment Due',
      date: entities.paymentTerms || entities.totalFinancialCommitment || 'As invoice schedule',
      type: 'payment',
      icon: DollarSign,
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      id: 'expiry-date',
      label: 'Agreement Expiration / Termination',
      date: entities.expiryDate || 'End of Term',
      type: 'expiry',
      icon: AlertCircle,
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs space-y-6">
      {/* Header */}
      <div className="border-b border-stone-100 pb-4">
        <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-stone-700" />
          <span>Key Dates, Deadlines & Performance Timeline</span>
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Extracted milestones, notice deadlines, payment obligations, and expiration schedules.
        </p>
      </div>

      {/* Timeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {timelineItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-stone-200/80 bg-stone-50/60 hover:bg-stone-50 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${item.badgeColor}`}>
                  {item.type}
                </span>
                <IconComponent className="w-4 h-4 text-stone-500" />
              </div>

              <div>
                <span className="text-[11px] font-semibold text-stone-600 block">
                  {item.label}
                </span>
                <span className="text-sm font-bold text-stone-900 block mt-0.5 font-mono">
                  {item.date}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Structured 18-Entity Summary Overview */}
      <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-3">
        <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Extracted Contractual Obligations & Provisions</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="font-bold text-stone-700 block">Parties Involved</span>
            <span className="text-stone-600">
              {(entities.parties || []).map(p => `${p.name} (${p.role})`).join(', ') || 'Not detected'}
            </span>
          </div>

          <div>
            <span className="font-bold text-stone-700 block">Renewal Terms</span>
            <span className="text-stone-600">{entities.renewalPeriod || 'Standard'}</span>
          </div>

          <div>
            <span className="font-bold text-stone-700 block">Governing Law & Jurisdiction</span>
            <span className="text-stone-600">{entities.governingLaw || 'State Law'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
