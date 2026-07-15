import type { ComponentType, CSSProperties, SVGProps } from 'react'
import type { CaseRecord } from '../../lib/types'
import { STAGES } from '../../lib/pipeline'
import { caseProgress, stageDate, stageState } from '../../lib/caseDetail'
import { fmtDate } from '../../lib/format'
import { Check, Court, Doc, Flag, Folder, Scales, Search } from '../icons'

type StageIcon = ComponentType<SVGProps<SVGSVGElement>>
const ICONS: StageIcon[] = [Doc, Folder, Search, Scales, Court, Flag]

export function CaseWorkflow({ caseRecord }: { caseRecord: CaseRecord }) {
  const progress = caseProgress(caseRecord.stage)

  return (
    <section className="case-panel case-workflow-panel" aria-labelledby="case-workflow-title">
      <h2 id="case-workflow-title" className="case-panel__title">Case workflow &amp; progress</h2>
      <ol className="case-workflow" style={{ '--workflow-progress': `${progress}%` } as CSSProperties}>
        {STAGES.map((stage, index) => {
          const state = stageState(caseRecord.stage, index)
          const date = stageDate(caseRecord, stage.id)
          const Icon = ICONS[index]
          return (
            <li
              key={stage.id}
              className={`case-workflow__step is-${state}`}
              aria-current={state === 'current' ? 'step' : undefined}
              aria-label={`${stage.short}, ${state}${date ? `, ${fmtDate(date)}` : ', pending'}`}
              tabIndex={state === 'current' ? 0 : undefined}
            >
              {state === 'current' && <span className="case-workflow__current-label">Current Stage</span>}
              <span className="case-workflow__node" aria-hidden="true">
                {state !== 'pending' && <Check width={17} height={17} />}
              </span>
              <strong className="case-workflow__label">{stage.short}</strong>
              <Icon className="case-workflow__icon" width={48} height={48} aria-hidden="true" />
              <time className="case-workflow__date" dateTime={date}>{date ? fmtDate(date) : 'Pending'}</time>
              <span className="case-workflow__milestone">{state === 'pending' ? (stage.id === 'resolved' ? 'Outcome pending' : 'Awaiting progression') : stage.milestone}</span>
            </li>
          )
        })}
      </ol>
      <div className="case-progress-row">
        <span>Case Progress</span>
        <div
          className="case-progress-track"
          role="progressbar"
          aria-label="Case progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
        <strong>{progress}%</strong>
      </div>
    </section>
  )
}
