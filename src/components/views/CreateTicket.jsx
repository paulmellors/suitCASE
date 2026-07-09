import { useState } from 'react';
import { AlertCircle, Lightbulb } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const TYPES = ['Incident', 'Service Request', 'Change Request', 'Problem'];
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];
const CHANGE_TYPES = ['Standard', 'Normal', 'Emergency'];
const RISK_LEVELS = ['Low', 'Medium', 'High'];
const PROBLEM_STATUSES = ['Identified', 'Root Cause Analysis', 'Workaround Available', 'Resolved'];

const SLA_LABELS = { Critical: '1 hour', High: '4 hours', Medium: '8 hours', Low: '24 hours' };

export function CreateTicket() {
  const { state, actions } = useApp();
  const [form, setForm] = useState({
    type: 'Incident', title: '', description: '', priority: 'Medium',
    requester: '', assignee: '', tags: '',
    changeType: 'Normal', riskLevel: 'Medium',
    implementationPlan: '', rollbackPlan: '',
    scheduledStart: '', scheduledEnd: '',
    rootCause: '', workaround: '', isKnownError: false,
    approvalStatus: 'Not Required',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Suggested KB articles based on title
  const suggestedArticles = form.title.length > 3
    ? state.kbArticles.filter(a =>
        a.status === 'Published' &&
        form.title.toLowerCase().split(' ').some(word =>
          word.length > 3 && (a.title.toLowerCase().includes(word) || a.tags.some(t => t.includes(word)))
        )
      ).slice(0, 3)
    : [];

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.requester.trim()) e.requester = 'Requester is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const ticket = {
      ...form,
      category: form.type,
      status: 'Open',
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      approvalStatus: form.type === 'Service Request' ? form.approvalStatus : undefined,
      changeStatus: form.type === 'Change Request' ? 'Submitted' : undefined,
      problemStatus: form.type === 'Problem' ? 'Identified' : undefined,
    };
    actions.createTicket(ticket);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Ticket Created!</h2>
          <p className="text-gray-500 mb-6">Your ticket has been submitted to suitCASE and assigned an ID.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setSubmitted(false); setForm({ type: 'Incident', title: '', description: '', priority: 'Medium', requester: '', assignee: '', tags: '', changeType: 'Normal', riskLevel: 'Medium', implementationPlan: '', rollbackPlan: '', scheduledStart: '', scheduledEnd: '', rootCause: '', workaround: '', isKnownError: false, approvalStatus: 'Not Required' }); }} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
              Create Another
            </button>
            <button onClick={() => actions.setView('tickets')} className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              View All Tickets
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Create New Ticket</h1>
        <p className="text-sm text-gray-500 mt-0.5">Submit an incident, request, change, or problem record to suitCASE</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Type selector */}
          <div className="grid grid-cols-4 gap-2">
            {TYPES.map(t => (
              <button
                key={t} type="button"
                onClick={() => set('type', t)}
                className={`text-xs py-2.5 px-2 rounded-lg border font-medium transition-colors text-center ${form.type === t ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 bg-white'}`}
              >
                {t}
              </button>
            ))}
          </div>

          <Field label="Title *" error={errors.title}>
            <input
              className={inputCls(errors.title)}
              placeholder="Brief description of the issue or request"
              value={form.title}
              onChange={e => set('title', e.target.value)}
            />
          </Field>

          <Field label="Description *" error={errors.description}>
            <textarea
              className={`${inputCls(errors.description)} resize-none`}
              placeholder="Provide full details, steps to reproduce, business impact, etc."
              rows={5}
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </Field>

          {/* Change-specific fields */}
          {form.type === 'Change Request' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Change Type">
                  <select className={inputCls()} value={form.changeType} onChange={e => set('changeType', e.target.value)}>
                    {CHANGE_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Risk Level">
                  <select className={inputCls()} value={form.riskLevel} onChange={e => set('riskLevel', e.target.value)}>
                    {RISK_LEVELS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Scheduled Start">
                  <input type="datetime-local" className={inputCls()} value={form.scheduledStart} onChange={e => set('scheduledStart', e.target.value)} />
                </Field>
                <Field label="Scheduled End">
                  <input type="datetime-local" className={inputCls()} value={form.scheduledEnd} onChange={e => set('scheduledEnd', e.target.value)} />
                </Field>
              </div>
              <Field label="Implementation Plan">
                <textarea className={`${inputCls()} resize-none`} rows={3} placeholder="Step-by-step implementation plan…" value={form.implementationPlan} onChange={e => set('implementationPlan', e.target.value)} />
              </Field>
              <Field label="Rollback Plan">
                <textarea className={`${inputCls()} resize-none`} rows={3} placeholder="How to revert if something goes wrong…" value={form.rollbackPlan} onChange={e => set('rollbackPlan', e.target.value)} />
              </Field>
            </>
          )}

          {/* Problem-specific fields */}
          {form.type === 'Problem' && (
            <>
              <Field label="Root Cause Analysis">
                <textarea className={`${inputCls()} resize-none`} rows={3} placeholder="Describe the root cause (if known)…" value={form.rootCause} onChange={e => set('rootCause', e.target.value)} />
              </Field>
              <Field label="Workaround">
                <textarea className={`${inputCls()} resize-none`} rows={2} placeholder="Describe any available workaround…" value={form.workaround} onChange={e => set('workaround', e.target.value)} />
              </Field>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="knownError" checked={form.isKnownError} onChange={e => set('isKnownError', e.target.checked)} className="w-4 h-4 accent-indigo-600" />
                <label htmlFor="knownError" className="text-sm text-gray-700">Mark as Known Error</label>
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-4">
            <Field label="Priority">
              <select className={inputCls()} value={form.priority} onChange={e => set('priority', e.target.value)}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
              {form.type !== 'Change Request' && form.type !== 'Problem' && (
                <p className="text-xs text-gray-400 mt-1">SLA target: {SLA_LABELS[form.priority]}</p>
              )}
            </Field>

            <Field label="Requester *" error={errors.requester}>
              <input className={inputCls(errors.requester)} placeholder="Full name of requester" value={form.requester} onChange={e => set('requester', e.target.value)} />
            </Field>

            <Field label="Assignee">
              <select className={inputCls()} value={form.assignee} onChange={e => set('assignee', e.target.value)}>
                <option value="">Unassigned</option>
                {state.agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </Field>

            {form.type === 'Service Request' && (
              <Field label="Approval Required">
                <select className={inputCls()} value={form.approvalStatus} onChange={e => set('approvalStatus', e.target.value)}>
                  <option value="Not Required">Not Required</option>
                  <option value="Awaiting Approval">Awaiting Approval</option>
                </select>
              </Field>
            )}

            <Field label="Tags">
              <input className={inputCls()} placeholder="email, vpn, hardware (comma-separated)" value={form.tags} onChange={e => set('tags', e.target.value)} />
            </Field>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Ticket
            </button>
          </div>

          {/* KB suggestions */}
          {suggestedArticles.length > 0 && (
            <div className="bg-amber-50 rounded-xl border border-amber-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={14} className="text-amber-500" />
                <span className="text-xs font-semibold text-amber-700">Suggested Knowledge Base Articles</span>
              </div>
              <div className="space-y-2">
                {suggestedArticles.map(a => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => actions.setView('knowledge')}
                    className="w-full text-left text-xs text-amber-800 hover:text-amber-900 underline leading-snug"
                  >
                    {a.title}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-amber-600 mt-2">Review these articles before submitting — this may already be documented.</p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      {children}
      {error && (
        <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
          <AlertCircle size={11} />{error}
        </div>
      )}
    </div>
  );
}

function inputCls(error) {
  return `w-full text-sm border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 transition-colors ${error ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-400'}`;
}
