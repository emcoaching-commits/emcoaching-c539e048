import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Emma Fit'
const BRAND = '#1d4ed8'

interface Item {
  label: string
  detail?: string
}

interface DailySummaryProps {
  dateLabel?: string
  isTest?: boolean
  newBookings?: Item[]
  cancellations?: Item[]
  paymentsTomorrow?: Item[]
  profileUpdates?: Item[]
  newProfiles?: Item[]
  deletions?: Item[]
  newReviews?: Item[]
  questionnaires?: Item[]
  activeUsers?: Item[]
  stats?: { label: string; value: string | number }[]
}

const empty = (arr?: Item[]) => !arr || arr.length === 0

const Block = ({ title, items }: { title: string; items?: Item[] }) => (
  <Section style={section}>
    <Heading as="h2" style={h2}>{title}</Heading>
    {empty(items) ? (
      <Text style={muted}>— Rien à signaler</Text>
    ) : (
      items!.map((it, i) => (
        <Text key={i} style={item}>
          • <strong>{it.label}</strong>
          {it.detail ? <span style={detail}> — {it.detail}</span> : null}
        </Text>
      ))
    )}
  </Section>
)

const DailySummaryEmail = ({
  dateLabel = '',
  isTest = false,
  newBookings,
  cancellations,
  paymentsTomorrow,
  profileUpdates,
  newProfiles,
  deletions,
  newReviews,
  questionnaires,
  activeUsers,
  stats,
}: DailySummaryProps) => (
  <Html lang="fr">
    <Head />
    <Preview>Récap quotidien {SITE_NAME} — {dateLabel}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          {isTest ? <Text style={testBadge}>✦ Email de test ✦</Text> : null}
          <Heading style={h1}>Récap du jour</Heading>
          <Text style={subtitle}>{SITE_NAME} · {dateLabel}</Text>
        </Section>

        {stats && stats.length > 0 ? (
          <Section style={statsBox}>
            {stats.map((s, i) => (
              <Text key={i} style={statLine}>
                <strong>{s.value}</strong> &nbsp;{s.label}
              </Text>
            ))}
          </Section>
        ) : null}

        <Block title="📅 Nouveaux rendez-vous" items={newBookings} />
        <Hr style={hr} />
        <Block title="❌ Annulations" items={cancellations} />
        <Hr style={hr} />
        <Block title="💳 Paiements à demander demain" items={paymentsTomorrow} />
        <Hr style={hr} />
        <Block title="👤 Nouveaux comptes" items={newProfiles} />
        <Hr style={hr} />
        <Block title="✏️ Profils modifiés" items={profileUpdates} />
        <Hr style={hr} />
        <Block title="🗑️ Suppressions de compte" items={deletions} />
        <Hr style={hr} />
        <Block title="📝 Questionnaires reçus" items={questionnaires} />
        <Hr style={hr} />
        <Block title="⭐ Nouveaux avis" items={newReviews} />
        <Hr style={hr} />
        <Block title="👀 Clients actifs sur le site" items={activeUsers} />

        <Text style={footer}>
          Récap envoyé automatiquement chaque soir à 20h.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: DailySummaryEmail,
  subject: (data: Record<string, any>) =>
    `${data?.isTest ? '[TEST] ' : ''}Récap ${SITE_NAME} — ${data?.dateLabel ?? ''}`.trim(),
  displayName: 'Récap quotidien',
  to: "em'coaching@emcoachingfr.com",
  previewData: {
    dateLabel: 'jeudi 21 mai 2026',
    isTest: true,
    stats: [
      { label: 'rendez-vous pris', value: 2 },
      { label: 'nouveaux comptes', value: 1 },
    ],
    newBookings: [{ label: 'Marie Dupont', detail: '22/05 à 10:00 — Coaching' }],
    cancellations: [],
    paymentsTomorrow: [{ label: 'Julie Martin', detail: 'Mensuel — 80€' }],
    profileUpdates: [{ label: 'Sophie L.', detail: 'téléphone mis à jour' }],
    newProfiles: [{ label: 'Camille R.', detail: 'camille@example.com' }],
    deletions: [],
    newReviews: [{ label: 'Marie D.', detail: '5★ — "Super coach !"' }],
    questionnaires: [{ label: 'Camille R.' }],
    activeUsers: [{ label: '3 clients connectés aujourd\'hui' }],
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Outfit, Arial, sans-serif', margin: 0, padding: 0 }
const container = { maxWidth: '600px', margin: '0 auto', padding: '32px 24px' }
const header = { textAlign: 'center' as const, padding: '8px 0 24px', borderBottom: `3px solid ${BRAND}` }
const testBadge = { display: 'inline-block', background: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, margin: '0 0 12px' }
const h1 = { fontSize: '32px', fontWeight: 700, color: BRAND, margin: '0 0 4px', letterSpacing: '0.5px' }
const subtitle = { fontSize: '14px', color: '#64748b', margin: '0' }
const statsBox = { background: '#eff6ff', borderRadius: '12px', padding: '16px 20px', margin: '20px 0' }
const statLine = { margin: '4px 0', fontSize: '14px', color: '#1e293b' }
const section = { margin: '20px 0' }
const h2 = { fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 10px' }
const item = { fontSize: '14px', color: '#1e293b', margin: '6px 0', lineHeight: '1.5' }
const detail = { color: '#64748b' }
const muted = { fontSize: '14px', color: '#94a3b8', fontStyle: 'italic' as const, margin: '4px 0' }
const hr = { borderColor: '#e2e8f0', margin: '4px 0' }
const footer = { fontSize: '12px', color: '#94a3b8', textAlign: 'center' as const, margin: '32px 0 0' }