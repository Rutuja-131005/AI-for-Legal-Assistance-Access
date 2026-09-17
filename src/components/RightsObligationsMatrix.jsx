import React from 'react';
import { CheckCircle2, AlertCircle, Ban, Shield } from 'lucide-react';

const RightsObligationsMatrixComponent = ({ items = [] }) => {
  const rights = React.useMemo(() => items.filter(i => i.type === 'right'), [items]);
  const obligations = React.useMemo(() => items.filter(i => i.type === 'obligation'), [items]);
  const restrictions = React.useMemo(() => items.filter(i => i.type === 'restriction'), [items]);

  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs space-y-4">
      <div>
        <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
          <Shield className="w-5 h-5 text-stone-700" />
          <span>Rights & Obligations Balance</span>
        </h2>
        <p className="text-xs text-stone-600 mt-0.5">
          Clear distinction between what you are legally entitled to receive versus burdens and restrictions placed on you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Your Rights */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                Your Entitlements & Rights
              </h3>
            </div>
            <ul className="space-y-2.5 text-xs text-stone-700">
              {rights.length === 0 ? (
                <li className="text-stone-500 italic">No explicit rights recognized for consumer.</li>
              ) : (
                rights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item.description}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="mt-4 pt-2 border-t border-emerald-100 text-[11px] text-emerald-800 font-medium">
            {rights.length} recognized consumer rights
          </div>
        </div>

        {/* Your Obligations */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                !
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950">
                Your Mandatory Obligations
              </h3>
            </div>
            <ul className="space-y-2.5 text-xs text-stone-700">
              {obligations.length === 0 ? (
                <li className="text-stone-500 italic">No direct obligations listed.</li>
              ) : (
                obligations.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{item.description}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="mt-4 pt-2 border-t border-amber-100 text-[11px] text-amber-800 font-medium">
            {obligations.length} legal duties & payments
          </div>
        </div>

        {/* Restrictions & Prohibitions */}
        <div className="rounded-xl border border-red-200 bg-red-50/30 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                ✕
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-950">
                Restrictions & Prohibitions
              </h3>
            </div>
            <ul className="space-y-2.5 text-xs text-stone-700">
              {restrictions.length === 0 ? (
                <li className="text-stone-500 italic">No standard restrictions detected.</li>
              ) : (
                restrictions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Ban className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                    <span>{item.description}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="mt-4 pt-2 border-t border-red-100 text-[11px] text-red-800 font-medium">
            {restrictions.length} behavioral or legal limits
          </div>
        </div>
      </div>
    </div>
  );
};

export const RightsObligationsMatrix = React.memo(RightsObligationsMatrixComponent);
