import type { ComponentType, SVGProps } from 'react'
import type { CaseRecord } from '../../lib/types'
import { SECTION_23 } from '../../lib/pipeline'
import { Doc, MapPin, Monitor, People, User } from '../icons'

type Meta = { label: string; value: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }

export function IncidentDetails({ caseRecord }: { caseRecord: CaseRecord }) {
  const items: Meta[] = [
    { label: 'Nature', value: caseRecord.natureSummary, Icon: Doc },
    { label: 'Impact on victim', value: caseRecord.impactSummary, Icon: People },
    { label: 'Platform', value: caseRecord.platform, Icon: Monitor },
    { label: 'Province', value: caseRecord.province, Icon: MapPin },
    { label: 'Offender (alias)', value: caseRecord.offenderAlias ?? 'Unknown', Icon: User },
  ]
  return (
    <section className="case-panel incident-details-panel" aria-labelledby="incident-details-title">
      <h2 id="incident-details-title" className="case-panel__title">Incident details</h2>
      <blockquote className="incident-statute"><span aria-hidden="true">“</span>{SECTION_23}</blockquote>
      <dl className="incident-meta-grid">
        {items.map(({ label, value, Icon }) => <div className="case-meta-cell" key={label}><Icon width={30} height={30} aria-hidden="true" /><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl>
    </section>
  )
}
