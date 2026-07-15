import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCases } from '../lib/store'
import { DECISIONS, EVIDENCE_TYPES, OFFICERS, nextStage, stageOf } from '../lib/pipeline'
import type { DecisionOutcome, EvidenceFileMeta } from '../lib/types'
import { fmtDate, fmtDateTime } from '../lib/format'
import { PriorityBadge, StageBadge } from '../components/badges'
import { Check, Chevron, Doc, Gavel, Scales } from '../components/icons'
import { CaseWorkflow } from '../components/case/CaseWorkflow'
import { CourtProgress } from '../components/case/CourtProgress'
import { EvidenceSummary } from '../components/case/EvidenceSummary'
import { IncidentDetails } from '../components/case/IncidentDetails'
import { OfficerSelect } from '../components/case/OfficerSelect'
import { useAuth } from '../lib/authStore'

function SecondaryPanel({ title, id, children, className = '' }: { title: string; id?: string; children: ReactNode; className?: string }) {
  return <section id={id} className={`case-panel case-secondary-panel ${className}`} tabIndex={id ? -1 : undefined}><h2 className="case-panel__title">{title}</h2>{children}</section>
}

function DetailRow({ label, value }: { label: string; value?: ReactNode }) {
  return <div className="case-detail-row"><span>{label}</span><strong>{value ?? '—'}</strong></div>
}

export default function CaseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { cases, advance, assign, addNote, setDecision } = useCases()
  const { activeOfficer } = useAuth()
  const [noteText, setNoteText] = useState('')
  const [noteFiles, setNoteFiles] = useState<EvidenceFileMeta[]>([])
  const [noteStatus, setNoteStatus] = useState('')
  const [approvalComment, setApprovalComment] = useState('')

  const c = cases.find((item) => item.id === id)
  if (!c) {
    return <div className="case-detail-page"><div className="case-panel case-not-found"><p>Case not found.</p><Link to="/cases" className="case-primary-action">Back to cases</Link></div></div>
  }

  const next = nextStage(c.stage)
  const needsDecision = c.stage === 'in_court' && !c.decision
  const canAssign = activeOfficer.role === 'Administrator' || activeOfficer.role === 'Supervisor'
  const canApprove = canAssign || activeOfficer.role === 'Investigator'

  return (
    <article className="case-detail-page">
      <header className="case-detail-header">
        <div className="case-detail-identity">
          <button type="button" onClick={() => navigate(-1)} className="case-back-button">
            <Chevron width={20} height={20} aria-hidden="true" /> Back
          </button>
          <h1>{c.ref}</h1>
          <div className="case-header-meta">
            <StageBadge stage={c.stage} />
            <PriorityBadge priority={c.priority} />
            <span>Filed {fmtDate(c.filedAt)}</span>
          </div>
        </div>

        <div className="case-detail-actions">
          {canAssign && <OfficerSelect value={c.assignedTo} options={OFFICERS} onChange={(officer) => assign(c.id, officer)} />}
          {next && canApprove && <textarea className="case-approval-comment" rows={2} value={approvalComment} onChange={(event) => setApprovalComment(event.target.value)} placeholder={`Add ${stageOf(next).short.toLowerCase()} approval comment...`} aria-label="Approval comment" />}
          {next && canApprove && <button type="button" className="case-primary-action" disabled={needsDecision || !approvalComment.trim()} aria-describedby={needsDecision ? 'advance-prerequisite' : undefined} onClick={() => { addNote(c.id, `Approved for ${stageOf(next).label}: ${approvalComment.trim()}`); advance(c.id, approvalComment.trim()); setApprovalComment('') }}>
            <span>Approve & advance to {stageOf(next).short}</span><Chevron width={20} height={20} aria-hidden="true" />
          </button>}
          {needsDecision && <p id="advance-prerequisite" className="case-action-requirement">Record the court decision before resolving this case.</p>}
          {next && !canApprove && <p className="case-action-requirement">Your {activeOfficer.role.toLowerCase()} account has view-only access to case progression.</p>}
        </div>
      </header>

      <div className="case-workspace-grid">
        <CaseWorkflow caseRecord={c} />
        <CourtProgress caseRecord={c} decisionRequired={needsDecision} />
        <IncidentDetails caseRecord={c} />
        <EvidenceSummary caseRecord={c} />
      </div>

      <section className="case-secondary-details" aria-labelledby="additional-case-information">
        <div className="case-secondary-heading">
          <div><span>Case record</span><h2 id="additional-case-information">Additional case information</h2></div>
          <p>Parties, evidence, legal outcomes and officer activity</p>
        </div>
        <div className="case-secondary-grid">
          <SecondaryPanel title="Parties">
            <DetailRow label="Complainant" value={c.complainant.name} />
            <DetailRow label="Address" value={c.complainant.address} />
            <DetailRow label="Contact" value={<span className="tabular">{c.complainant.contact}</span>} />
            <DetailRow label="Email" value={c.complainant.email} />
            <DetailRow label="Victim" value={c.victimSameAsComplainant ? `${c.complainant.name} (same as complainant)` : c.victimName} />
            {!c.victimSameAsComplainant && <DetailRow label="Relationship" value={c.victimRelationship} />}
            <DetailRow label="Incident date" value={c.incidentDate ? fmtDate(c.incidentDate) : undefined} />
            <DetailRow label="Offender contact" value={c.offenderContact} />
            <DetailRow label="Relief sought" value={c.reliefSought?.length ? c.reliefSought.map((id) => ({ investigation: 'Investigation', contentRemoval: 'Content removal', prosecution: 'Prosecution', protectionOrder: 'Protection order' }[id] ?? id)).join(', ') : undefined} />
          </SecondaryPanel>

          <SecondaryPanel id="case-evidence-detail" title="Evidence detail">
            <ul className="case-check-list">
              {EVIDENCE_TYPES.map((evidence) => {
                const available = c.evidence.includes(evidence.id)
                return <li key={evidence.id} className={available ? 'is-available' : ''}><i aria-hidden="true">{available && <Check width={12} height={12} />}</i>{evidence.label}</li>
              })}
            </ul>
            <p className="case-panel-note">{c.attachedFileCount} file{c.attachedFileCount === 1 ? '' : 's'} attached to the complaint.</p>
            {!!c.evidenceFiles?.length && <ul className="case-evidence-files">{c.evidenceFiles.map((file) => <li key={`${file.name}-${file.size}`}><span>{file.name}</span><small>{Math.max(1, Math.round(file.size / 1024))} KB</small></li>)}</ul>}
          </SecondaryPanel>

          <SecondaryPanel id="case-decision" title="Decision & penalty">
            {c.decision ? <div className="case-decision-result"><Gavel width={22} height={22} aria-hidden="true" /><div><strong>{DECISIONS[c.decision].label}</strong><p>{DECISIONS[c.decision].penalty}</p></div></div>
              : c.stage === 'in_court' ? <div><label className="case-field-label" htmlFor="case-decision-select">Record the National Court decision</label><select id="case-decision-select" className="case-control case-secondary-select" defaultValue="" onChange={(event) => event.target.value && setDecision(c.id, event.target.value as DecisionOutcome)}><option value="" disabled>Select decision…</option>{(Object.keys(DECISIONS) as DecisionOutcome[]).map((decision) => <option key={decision} value={decision}>{DECISIONS[decision].label} — {DECISIONS[decision].penalty}</option>)}</select></div>
              : <ul className="case-penalty-list">{(Object.keys(DECISIONS) as DecisionOutcome[]).map((decision) => <li key={decision}><Scales width={15} height={15} aria-hidden="true" /><span><strong>{DECISIONS[decision].label}</strong> — {DECISIONS[decision].penalty}</span></li>)}</ul>}
          </SecondaryPanel>

          <SecondaryPanel title="Victim remedies">
            <ul className="case-check-list remedies">
              {[
                { on: c.remedies.contentRemoval, label: 'Order for removal of harmful content' },
                { on: c.remedies.protectionOrder, label: 'Protection order against further harassment' },
              ].map((remedy) => <li key={remedy.label} className={remedy.on ? 'is-available' : ''}><i aria-hidden="true">{remedy.on && <Check width={12} height={12} />}</i>{remedy.label}</li>)}
            </ul>
            {c.stage !== 'resolved' && <p className="case-panel-note">Remedies are recorded when the case resolves.</p>}
          </SecondaryPanel>

          <SecondaryPanel title="Timeline" className="case-secondary-wide">
            <ol className="case-timeline">
              {[...c.timeline].reverse().map((event, index) => <li key={`${event.stage}-${event.date}-${index}`}><i style={{ background: stageOf(event.stage).color }} aria-hidden="true" /><div><strong>{stageOf(event.stage).label}</strong><time dateTime={event.date}>{fmtDateTime(event.date)}{event.officer ? ` · ${event.officer}` : ''}</time>{event.note && <p>{event.note}</p>}</div></li>)}
            </ol>
          </SecondaryPanel>

          <SecondaryPanel title="Case notes" className="case-secondary-wide">
            {c.notes.length ? <ul className="case-notes-list">{c.notes.map((note, index) => <li key={`${note.date}-${index}`}><time dateTime={note.date}>{fmtDateTime(note.date)} · {note.officer}</time><p>{note.text}</p>{!!note.attachments?.length && <ul className="case-note-attachments">{note.attachments.map((file) => <li key={`${file.name}-${file.size}`}><Doc width={14} height={14} aria-hidden="true" /><span>{file.name}</span><small>{Math.max(1, Math.round(file.size / 1024))} KB</small></li>)}</ul>}</li>)}</ul> : <p className="case-panel-note">No notes yet.</p>}
            {canApprove && <form className="case-note-form" onSubmit={(event) => { event.preventDefault(); if (!noteText.trim() && !noteFiles.length) return; addNote(c.id, noteText.trim() || 'Attachment added.', noteFiles); setNoteText(''); setNoteFiles([]); setNoteStatus(`Note added${noteFiles.length ? ` with ${noteFiles.length} attachment${noteFiles.length === 1 ? '' : 's'}` : ''}`) }}>
              <label htmlFor="case-note">Add an investigation note</label>
              <div className="case-note-compose"><input id="case-note" className="case-control" placeholder="Write a concise case update…" value={noteText} onChange={(event) => { setNoteText(event.target.value); setNoteStatus('') }} /><label className="case-note-attach"><Doc width={16} height={16} aria-hidden="true" /><span>Attach</span><input type="file" multiple accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt" aria-label="Attach files to investigation note" onChange={(event) => { const selected = Array.from(event.target.files ?? []).map(({ name, size, type }) => ({ name, size, type })); setNoteFiles((current) => [...current, ...selected.filter((file) => !current.some((saved) => saved.name === file.name && saved.size === file.size))].slice(0, 8)); setNoteStatus(''); event.currentTarget.value = '' }} /></label><button type="submit" className="case-control" disabled={!noteText.trim() && !noteFiles.length}>Add note</button></div>
              {!!noteFiles.length && <ul className="case-note-pending-files">{noteFiles.map((file) => <li key={`${file.name}-${file.size}`}><Doc width={14} height={14} aria-hidden="true" /><span>{file.name}</span><small>{Math.max(1, Math.round(file.size / 1024))} KB</small><button type="button" aria-label={`Remove ${file.name}`} onClick={() => setNoteFiles((current) => current.filter((item) => !(item.name === file.name && item.size === file.size)))}>×</button></li>)}</ul>}
              <small className="case-note-file-help">Up to 8 images, recordings, PDFs or documents. Attachments remain in this browser-only demonstration.</small>
              <span className="sr-only" role="status" aria-live="polite">{noteStatus}</span>
            </form>}
          </SecondaryPanel>
        </div>
      </section>
    </article>
  )
}
