import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { Brief } from '@/lib/types'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
    backgroundColor: '#ffffff',
    color: '#1a1a1a',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    color: '#e84b1a',
  },
  headerMeta: {
    fontSize: 8,
    color: '#666666',
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  metaItem: {
    marginRight: 12,
  },
  section: {
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#999999',
    marginBottom: 4,
  },
  sectionContent: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#1a1a1a',
  },
  hookBox: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 4,
    padding: 10,
    marginBottom: 14,
  },
  hookType: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#e84b1a',
    marginBottom: 6,
  },
  hookField: {
    marginBottom: 4,
  },
  hookFieldLabel: {
    fontSize: 7,
    color: '#999999',
    marginBottom: 1,
  },
  hookFieldValue: {
    fontSize: 9,
    lineHeight: 1.5,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    marginVertical: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 7,
    color: '#bbbbbb',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})

const FIELD_SECTIONS: Array<{ key: keyof Brief; label: string }> = [
  { key: 'creative_idea', label: 'Creative idea' },
  { key: 'primary_text', label: 'Primary text' },
  { key: 'headline', label: 'Headline' },
  { key: 'cta_text', label: 'CTA' },
  { key: 'talent_notes', label: 'Talent notes' },
  { key: 'audio_direction', label: 'Audio direction' },
  { key: 'placement_specs', label: 'Placement specs' },
]

export function BriefPDF({ brief }: { brief: Brief }) {
  const hook = brief.hook_data

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Quake — Creative Brief</Text>
          <View style={styles.headerMeta}>
            {brief.format && <Text style={styles.metaItem}>Format: {brief.format}</Text>}
            {brief.platform && <Text style={styles.metaItem}>Platform: {brief.platform}</Text>}
            {brief.funnel_stage && (
              <Text style={styles.metaItem}>
                Funnel: {brief.funnel_stage.toUpperCase()}
              </Text>
            )}
          </View>
        </View>

        {/* Hook */}
        {hook && (
          <View style={styles.hookBox}>
            <Text style={styles.hookType}>{hook.hook_type ?? 'Hook'}</Text>
            {hook.written_hook && (
              <View style={styles.hookField}>
                <Text style={styles.hookFieldLabel}>Written</Text>
                <Text style={styles.hookFieldValue}>{hook.written_hook}</Text>
              </View>
            )}
            {hook.visual_hook && (
              <View style={styles.hookField}>
                <Text style={styles.hookFieldLabel}>Visual</Text>
                <Text style={styles.hookFieldValue}>{hook.visual_hook}</Text>
              </View>
            )}
            {hook.audio_hook && (
              <View style={styles.hookField}>
                <Text style={styles.hookFieldLabel}>Audio</Text>
                <Text style={styles.hookFieldValue}>{hook.audio_hook}</Text>
              </View>
            )}
          </View>
        )}

        {/* Brief fields */}
        {FIELD_SECTIONS.map(({ key, label }) => {
          const value = brief[key]
          if (!value || typeof value !== 'string') return null
          return (
            <View key={key} style={styles.section}>
              <Text style={styles.sectionLabel}>{label}</Text>
              <Text style={styles.sectionContent}>{value}</Text>
            </View>
          )
        })}

        <View style={styles.footer}>
          <Text>Quake Creative · Accelerate</Text>
          <Text>Generated {new Date().toLocaleDateString('en-GB')}</Text>
        </View>
      </Page>
    </Document>
  )
}
