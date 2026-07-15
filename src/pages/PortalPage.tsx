import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCases } from '../lib/store'
import {
  DECISIONS,
  EVIDENCE_TYPES,
  SECTION_23,
  STAGES,
  STAGE_INDEX,
  stageOf,
} from '../lib/pipeline'
import type { CaseRecord, ComplaintInput, Platform } from '../lib/types'
import { PriorityBadge } from '../components/badges'
import {
  Alert,
  ArrowUp,
  Calendar,
  Check,
  Doc,
  Flag,
  Lock,
  MapPin,
  Monitor,
  People,
  ShieldLock,
  User,
} from '../components/icons'

const PLATFORMS: Platform[] = ['Facebook', 'WhatsApp', 'TikTok', 'Instagram', 'Other']

const PROVINCES = [
  'National Capital District', 'Central', 'Gulf', 'Milne Bay', 'Oro', 'Western',
  'Southern Highlands', 'Hela', 'Enga', 'Western Highlands', 'Jiwaka', 'Simbu',
  'Eastern Highlands', 'Morobe', 'Madang', 'East Sepik', 'West Sepik',
  'Manus', 'New Ireland', 'East New Britain', 'West New Britain', 'Bougainville',
]

const SEVERITY: { id: ComplaintInput['severity']; label: string; hint: string }[] = [
  { id: 'high', label: 'Ongoing threats to my safety', hint: 'Threats of violence or persistent targeting' },
  { id: 'medium', label: 'Serious distress or harm', hint: 'Sustained harassment affecting daily life' },
  { id: 'low', label: 'Offensive, but not urgent', hint: 'Unwanted contact I want on record' },
]

const STEPS = ['The incident', 'Evidence', 'Your details', 'Review & submit']

const RELIEF_OPTIONS = [
  { id: 'investigation', label: 'Immediate investigation of the offender' },
  { id: 'contentRemoval', label: 'Removal of harmful content' },
  { id: 'prosecution', label: 'Prosecution under Section 23' },
  { id: 'protectionOrder', label: 'Protective order or injunction' },
] as const

/** Empty intake form. */
function emptyForm(): ComplaintInput {
  return {
    platform: 'Facebook',
    province: 'National Capital District',
    incidentDate: '',
    offenderAlias: '',
    offenderContact: '',
    natureSummary: '',
    impactSummary: '',
    severity: 'medium',
    immediateDanger: false,
    evidence: [],
    attachedFileCount: 0,
    evidenceFiles: [],
    reliefSought: [],
    complainant: { name: '', contact: '', email: '', address: '' },
    victimSameAsComplainant: true,
    victimName: '',
    victimRelationship: '',
  }
}

/* ------------------------------------------------------------------ */
/* Shared workflow tracker (mirrors the Cyber Harassment Process Flow) */
/* ------------------------------------------------------------------ */

function WorkflowTracker({ stage, decision }: { stage: CaseRecord['stage']; decision?: CaseRecord['decision'] }) {
  const current = STAGE_INDEX[stage]
  return (
    <ol className="portal-flow" aria-label="Complaint progress">
      {STAGES.map((s, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'pending'
        return (
          <li key={s.id} className={`portal-flow-step ${state}`}>
            <span className="portal-flow-node">{state === 'done' ? <Check width={15} height={15} /> : i + 1}</span>
            <span className="portal-flow-copy">
              <strong>{s.label}</strong>
              <small>{state === 'current' ? s.description : s.milestone}</small>
            </span>
            {decision && s.id === 'resolved' && (
              <em className="portal-flow-decision">{DECISIONS[decision].label} · {DECISIONS[decision].penalty}</em>
            )}
          </li>
        )
      })}
    </ol>
  )
}

/* ------------------------------------------------------------------ */
/* Portal                                                             */
/* ------------------------------------------------------------------ */

export default function PortalPage() {
  const { cases, submitComplaint } = useCases()

  const [view, setView] = useState<'home' | 'wizard' | 'done'>('home')
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<ComplaintInput>(emptyForm)
  const [submitted, setSubmitted] = useState<CaseRecord | null>(null)
  const [consent, setConsent] = useState(false)

  const [trackRef, setTrackRef] = useState('')
  const [tracked, setTracked] = useState<CaseRecord | null | 'none'>(null)

  const set = <K extends keyof ComplaintInput>(key: K, value: ComplaintInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const toggleEvidence = (id: string) =>
    setForm((f) => ({
      ...f,
      evidence: f.evidence.includes(id) ? f.evidence.filter((e) => e !== id) : [...f.evidence, id],
    }))

  const stepValid = useMemo(() => {
    switch (step) {
      case 0:
        return !!(form.incidentDate && form.natureSummary.trim() && form.impactSummary.trim())
      case 1:
        return true // evidence is encouraged, not mandatory
      case 2:
        return !!(
          form.complainant.name.trim() &&
          form.complainant.address.trim() &&
          form.complainant.contact.trim() &&
          form.complainant.email.trim() &&
          (form.victimSameAsComplainant || (form.victimName?.trim() && form.victimRelationship?.trim()))
        )
      case 3:
        return consent
      default:
        return false
    }
  }, [step, form, consent])

  function startWizard() {
    setForm(emptyForm())
    setConsent(false)
    setStep(0)
    setView('wizard')
    window.scrollTo({ top: 0 })
  }

  function next() {
    if (!stepValid) return
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
      window.scrollTo({ top: 0 })
    } else {
      const record = submitComplaint(form)
      setSubmitted(record)
      setView('done')
      window.scrollTo({ top: 0 })
    }
  }

  function runTrack(e: React.FormEvent) {
    e.preventDefault()
    const q = trackRef.trim().toLowerCase()
    if (!q) return
    setTracked(cases.find((c) => c.ref.toLowerCase() === q) ?? 'none')
  }

  function selectFiles(files: FileList | null) {
    const selected = Array.from(files ?? []).slice(0, 12).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
    }))
    setForm((current) => ({ ...current, evidenceFiles: selected, attachedFileCount: selected.length }))
  }

  function removeFile(index: number) {
    setForm((current) => {
      const evidenceFiles = current.evidenceFiles.filter((_, fileIndex) => fileIndex !== index)
      return { ...current, evidenceFiles, attachedFileCount: evidenceFiles.length }
    })
  }

  function toggleRelief(id: string) {
    setForm((current) => ({
      ...current,
      reliefSought: current.reliefSought.includes(id)
        ? current.reliefSought.filter((item) => item !== id)
        : [...current.reliefSought, id],
    }))
  }

  return (
    <div className="portal">
      <header className="portal-bar">
        <div className="portal-brand">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/PNG_police_emblem.svg/250px-PNG_police_emblem.svg.png"
            alt="Royal Papua New Guinea Constabulary emblem"
          />
          <span>
            <small>ROYAL PAPUA NEW GUINEA CONSTABULARY</small>
            <strong>Cyber Harassment Reporting Portal</strong>
          </span>
        </div>
        <div className="portal-switch" role="group" aria-label="Choose portal">
          <span className="portal-switch-active">Client Portal</span>
          <Link to="/" className="portal-switch-alt"><Lock width={14} height={14} />Officer Dashboard</Link>
        </div>
      </header>

      <main className="portal-main">
        {/* -------------------------------------------------- HOME */}
        {view === 'home' && (
          <>
            <section className="portal-hero">
              <span className="portal-hero-tag"><ShieldLock width={15} height={15} />Section 23 · Cybercrime Act 2016</span>
              <h1>Report online threats & harassment</h1>
              <p>
                If you are being threatened, harassed, stalked or intimidated online, the RPNGC Cyber
                Unit can help. Lodge a complaint below — your report goes straight to an officer for
                review and you can track its progress with the reference we give you.
              </p>
              <div className="portal-hero-actions">
                <button type="button" className="portal-btn primary" onClick={startWizard}>
                  <Flag width={17} height={17} />Report an incident
                </button>
                <a className="portal-btn ghost" href="#portal-track">Track my complaint</a>
              </div>
              <p className="portal-hero-safety">
                <Alert width={15} height={15} />
                In immediate danger? Call <b>000</b> or your nearest police station first.
              </p>
            </section>

            <section className="portal-flow-overview">
              <h2>What happens after you report</h2>
              <p>Every complaint follows the same process under the Cybercrime Act 2016.</p>
              <WorkflowTracker stage="filed" />
            </section>

            <section className="portal-track" id="portal-track">
              <h2>Track an existing complaint</h2>
              <p>Enter the reference number you were given when you lodged your report.</p>
              <form className="portal-track-form" onSubmit={runTrack}>
                <input
                  value={trackRef}
                  onChange={(e) => setTrackRef(e.target.value)}
                  placeholder="e.g. RPNGC-2026-000192"
                  aria-label="Complaint reference number"
                />
                <button type="submit" className="portal-btn primary">Check status</button>
              </form>
              {tracked === 'none' && (
                <p className="portal-track-empty">No complaint found with that reference. Check the number and try again.</p>
              )}
              {tracked && tracked !== 'none' && (
                <div className="portal-track-result">
                  <div className="portal-track-head">
                    <span>
                      <strong>{tracked.ref}</strong>
                      <small>Lodged {new Date(tracked.filedAt).toLocaleDateString()} · {tracked.platform} · {tracked.province}</small>
                    </span>
                    <span className="portal-track-stage">{stageOf(tracked.stage).label}</span>
                  </div>
                  <WorkflowTracker stage={tracked.stage} decision={tracked.decision} />
                </div>
              )}
            </section>
          </>
        )}

        {/* -------------------------------------------------- WIZARD */}
        {view === 'wizard' && (
          <section className="portal-wizard">
            <button type="button" className="portal-link-back" onClick={() => setView('home')}>← Back to portal home</button>

            <ol className="portal-steps" aria-label="Report steps">
              {STEPS.map((label, i) => (
                <li key={label} className={i === step ? 'current' : i < step ? 'done' : ''}>
                  <span>{i < step ? <Check width={14} height={14} /> : i + 1}</span>
                  <em>{label}</em>
                </li>
              ))}
            </ol>

            <div className="portal-card">
              {/* Step 1 — the incident */}
              {step === 0 && (
                <div className="portal-fields">
                  <h2><Monitor width={18} height={18} />Tell us what happened</h2>
                  <div className="portal-grid-2">
                    <label className="portal-field">
                      <span>Where did it happen?</span>
                      <select value={form.platform} onChange={(e) => set('platform', e.target.value as Platform)}>
                        {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </label>
                    <label className="portal-field">
                      <span>Your province</span>
                      <select value={form.province} onChange={(e) => set('province', e.target.value)}>
                        {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </label>
                    <label className="portal-field">
                      <span><Calendar width={14} height={14} />When did it happen? <i>*</i></span>
                      <input type="date" value={form.incidentDate} max={new Date().toISOString().slice(0, 10)} onChange={(e) => set('incidentDate', e.target.value)} />
                    </label>
                    <label className="portal-field">
                      <span>Offender account / handle <small>(if known)</small></span>
                      <input value={form.offenderAlias} onChange={(e) => set('offenderAlias', e.target.value)} placeholder="@username or profile name" />
                    </label>
                    <label className="portal-field">
                      <span>Offender contact information <small>(if known)</small></span>
                      <input value={form.offenderContact} onChange={(e) => set('offenderContact', e.target.value)} placeholder="Phone, email, profile URL or other details" />
                    </label>
                  </div>
                  <label className="portal-field">
                    <span>What happened? <i>*</i></span>
                    <textarea rows={3} value={form.natureSummary} onChange={(e) => set('natureSummary', e.target.value)} placeholder="Describe the threats, messages or posts in your own words." />
                  </label>
                  <label className="portal-field">
                    <span>How has this affected you? <i>*</i></span>
                    <textarea rows={2} value={form.impactSummary} onChange={(e) => set('impactSummary', e.target.value)} placeholder="For example: fear for your safety, distress, or reputational harm." />
                  </label>

                  <fieldset className="portal-severity">
                    <legend>How would you describe the situation?</legend>
                    {SEVERITY.map((s) => (
                      <label key={s.id} className={form.severity === s.id ? 'selected' : ''}>
                        <input type="radio" name="severity" checked={form.severity === s.id} onChange={() => set('severity', s.id)} />
                        <span><strong>{s.label}</strong><small>{s.hint}</small></span>
                      </label>
                    ))}
                  </fieldset>
                  <label className="portal-danger">
                    <input type="checkbox" checked={form.immediateDanger} onChange={(e) => set('immediateDanger', e.target.checked)} />
                    <span><Alert width={16} height={16} />Someone is in immediate danger — flag this complaint as urgent.</span>
                  </label>
                </div>
              )}

              {/* Step 2 — evidence */}
              {step === 1 && (
                <div className="portal-fields">
                  <h2><Doc width={18} height={18} />Collect your evidence</h2>
                  <p className="portal-help">Evidence helps officers act quickly. Tick anything you already have — you don't need everything to report.</p>
                  <div className="portal-checks">
                    {EVIDENCE_TYPES.map((ev) => (
                      <label key={ev.id} className={form.evidence.includes(ev.id) ? 'checked' : ''}>
                        <input type="checkbox" checked={form.evidence.includes(ev.id)} onChange={() => toggleEvidence(ev.id)} />
                        <span className="portal-check-box">{form.evidence.includes(ev.id) && <Check width={13} height={13} />}</span>
                        {ev.label}
                      </label>
                    ))}
                  </div>
                  <label className="portal-file-picker">
                    <span><Doc width={18} height={18} /><strong>Select evidence files</strong><small>Up to 12 screenshots, recordings or documents</small></span>
                    <input type="file" multiple accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt" onChange={(e) => selectFiles(e.target.files)} />
                  </label>
                  {!!form.evidenceFiles.length && <ul className="portal-file-list">
                    {form.evidenceFiles.map((file, index) => <li key={`${file.name}-${file.size}-${index}`}>
                      <span>{file.name}</span>
                      <span className="portal-file-actions">
                        <small>{Math.max(1, Math.round(file.size / 1024))} KB</small>
                        <button type="button" onClick={() => removeFile(index)} aria-label={`Remove ${file.name}`} title="Remove attachment">×</button>
                      </span>
                    </li>)}
                  </ul>}
                  <p className="portal-note">
                    <ShieldLock width={14} height={14} />
                    Keep your original files safe. An officer will contact you to collect them securely — never send passwords or bank details through this portal.
                  </p>
                </div>
              )}

              {/* Step 3 — your details */}
              {step === 2 && (
                <div className="portal-fields">
                  <h2><User width={18} height={18} />Your contact details</h2>
                  <div className="portal-grid-2">
                    <label className="portal-field">
                      <span>Full name <i>*</i></span>
                      <input value={form.complainant.name} onChange={(e) => set('complainant', { ...form.complainant, name: e.target.value })} />
                    </label>
                    <label className="portal-field">
                      <span>Phone number <i>*</i></span>
                      <input value={form.complainant.contact} onChange={(e) => set('complainant', { ...form.complainant, contact: e.target.value })} placeholder="+675 ..." />
                    </label>
                  </div>
                  <label className="portal-field">
                    <span>Email address <i>*</i></span>
                    <input type="email" value={form.complainant.email} onChange={(e) => set('complainant', { ...form.complainant, email: e.target.value })} placeholder="you@example.com" />
                  </label>
                  <label className="portal-field">
                    <span>Residential or postal address <i>*</i></span>
                    <textarea rows={2} value={form.complainant.address} onChange={(e) => set('complainant', { ...form.complainant, address: e.target.value })} placeholder="Street or village, district and province" />
                  </label>

                  <label className="portal-danger">
                    <input type="checkbox" checked={!form.victimSameAsComplainant} onChange={(e) => set('victimSameAsComplainant', !e.target.checked)} />
                    <span><People width={16} height={16} />I am reporting on behalf of someone else.</span>
                  </label>
                  {!form.victimSameAsComplainant && (
                    <div className="portal-grid-2">
                      <label className="portal-field">
                        <span>Name of the person affected <i>*</i></span>
                        <input value={form.victimName} onChange={(e) => set('victimName', e.target.value)} />
                      </label>
                      <label className="portal-field">
                        <span>Your relationship to them <i>*</i></span>
                        <input value={form.victimRelationship} onChange={(e) => set('victimRelationship', e.target.value)} placeholder="For example: parent, sibling, guardian" />
                      </label>
                    </div>
                  )}

                  <fieldset className="portal-relief">
                    <legend>What help are you asking for? <small>(select any)</small></legend>
                    <div className="portal-checks">
                      {RELIEF_OPTIONS.map((relief) => <label key={relief.id} className={form.reliefSought.includes(relief.id) ? 'checked' : ''}>
                        <input type="checkbox" checked={form.reliefSought.includes(relief.id)} onChange={() => toggleRelief(relief.id)} />
                        <span className="portal-check-box">{form.reliefSought.includes(relief.id) && <Check width={13} height={13} />}</span>
                        {relief.label}
                      </label>)}
                    </div>
                  </fieldset>
                </div>
              )}

              {/* Step 4 — review */}
              {step === 3 && (
                <div className="portal-fields">
                  <h2><Check width={18} height={18} />Review your report</h2>
                  <dl className="portal-review">
                    <div><dt>Platform</dt><dd>{form.platform}</dd></div>
                    <div><dt>Province</dt><dd>{form.province}</dd></div>
                    <div><dt>Incident date</dt><dd>{form.incidentDate || '—'}</dd></div>
                    <div><dt>Offender handle</dt><dd>{form.offenderAlias || '—'}</dd></div>
                    <div><dt>Offender contact</dt><dd>{form.offenderContact || 'Not provided'}</dd></div>
                    <div className="wide"><dt>What happened</dt><dd>{form.natureSummary}</dd></div>
                    <div className="wide"><dt>Impact</dt><dd>{form.impactSummary}</dd></div>
                    <div><dt>Severity</dt><dd>{form.immediateDanger ? 'Urgent — immediate danger' : SEVERITY.find((s) => s.id === form.severity)?.label}</dd></div>
                    <div><dt>Evidence</dt><dd>{form.evidence.length ? form.evidence.map((id) => EVIDENCE_TYPES.find((e) => e.id === id)?.label).join(', ') : 'None yet'} · {form.attachedFileCount} file(s)</dd></div>
                    <div><dt>Complainant</dt><dd>{form.complainant.name || '—'} · {form.complainant.contact || '—'}</dd></div>
                    <div><dt>Address</dt><dd>{form.complainant.address || 'Not provided'}</dd></div>
                    <div><dt>Reporting for</dt><dd>{form.victimSameAsComplainant ? 'Myself' : `${form.victimName || 'Someone else'} (${form.victimRelationship || 'relationship not given'})`}</dd></div>
                    <div><dt>Relief sought</dt><dd>{form.reliefSought.length ? form.reliefSought.map((id) => RELIEF_OPTIONS.find((item) => item.id === id)?.label).join(', ') : 'Not specified'}</dd></div>
                    {!!form.evidenceFiles.length && <div className="wide"><dt>Selected files</dt><dd>{form.evidenceFiles.map((file) => file.name).join(', ')}</dd></div>}
                  </dl>

                  <blockquote className="portal-statute">{SECTION_23}</blockquote>

                  <label className="portal-consent">
                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                    <span>I confirm this information is true to the best of my knowledge and consent to the RPNGC Cyber Unit contacting me about this complaint.</span>
                  </label>
                </div>
              )}

              <div className="portal-actions">
                {step > 0 && <button type="button" className="portal-btn ghost" onClick={() => { setStep((s) => s - 1); window.scrollTo({ top: 0 }) }}>Back</button>}
                <button type="button" className="portal-btn primary" disabled={!stepValid} onClick={next}>
                  {step === STEPS.length - 1 ? <><ShieldLock width={16} height={16} />Submit complaint</> : 'Continue'}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* -------------------------------------------------- DONE */}
        {view === 'done' && submitted && (
          <section className="portal-done">
            <div className="portal-done-mark"><Check width={34} height={34} /></div>
            <h1>Complaint lodged</h1>
            <p>Thank you. Your report has been sent to the RPNGC Cyber Unit and registered for review.</p>

            <div className="portal-ref-card">
              <div>
                <small>Your reference number</small>
                <strong>{submitted.ref}</strong>
                <em>Save this — you'll need it to track your complaint.</em>
              </div>
              <PriorityBadge priority={submitted.priority} />
            </div>

            {submitted.priority === 'critical' && (
              <p className="portal-hero-safety urgent">
                <Alert width={15} height={15} />
                You flagged immediate danger. If you or someone is at risk right now, call <b>000</b>.
              </p>
            )}

            <h2>Where your complaint is now</h2>
            <WorkflowTracker stage={submitted.stage} />

            <div className="portal-done-actions">
              <button type="button" className="portal-btn ghost" onClick={() => { setTrackRef(submitted.ref); setTracked(submitted); setView('home'); }}>
                <ArrowUp width={15} height={15} />Track this complaint
              </button>
              <button type="button" className="portal-btn primary" onClick={startWizard}>Lodge another report</button>
            </div>
          </section>
        )}
      </main>

      <footer className="portal-foot">
        <span><MapPin width={13} height={13} />RPNGC Cyber Unit · Konedobu, Port Moresby</span>
        <span>Demonstration portal — data stays in your browser.</span>
      </footer>
    </div>
  )
}
