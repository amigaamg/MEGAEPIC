'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer, Legend,
} from 'recharts'
import { listenVitals, computeVitalTrends, computeNEWS2, getNEWS2Risk } from '@/lib/clinical/vitals/vitalSignsEngine'
import type { VitalReading, VitalTrend } from '@/lib/clinical/vitals/vitalSignsEngine'
import { getActiveOrganizationId } from '@/lib/firebase/orgContext'

interface Props {
  deptId: string
  unitId: string
  encounterId: string
  patientId: string
  orgId?: string
  maxReadings?: number
}

export function VitalTrendsDashboard({ deptId, unitId, encounterId, patientId, orgId = getActiveOrganizationId() || '', maxReadings = 48 }: Props) {
  const [vitals, setVitals] = useState<VitalReading[]>([])
  const [selectedParam, setSelectedParam] = useState<string | null>(null)

  useEffect(() => {
    const unsub = listenVitals(deptId, unitId, encounterId, maxReadings, setVitals, undefined, orgId)
    return () => unsub()
  }, [deptId, unitId, encounterId, maxReadings, orgId])

  const trends = useMemo(() => computeVitalTrends(vitals), [vitals])

  const news2History = useMemo(() => {
    return vitals.map(v => ({
      time: v.recordedAt,
      news2: v.news2 ?? computeNEWS2(v),
    }))
  }, [vitals])

  const latestVitals = vitals.length > 0 ? vitals[vitals.length - 1] : null
  const latestNEWS2 = latestVitals ? computeNEWS2(latestVitals) : 0
  const news2Risk = getNEWS2Risk(latestNEWS2)

  const chartData = useMemo(() => {
    return vitals.map(v => ({
      time: new Date(v.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date(v.recordedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      timestamp: v.recordedAt,
      temperature: v.temperature,
      heartRate: v.heartRate,
      respiratoryRate: v.respiratoryRate,
      bpSystolic: v.bpSystolic,
      bpDiastolic: v.bpDiastolic,
      oxygenSaturation: v.oxygenSaturation,
      painScore: v.painScore,
      bloodGlucose: v.bloodGlucose,
      recordedBy: v.recordedByName,
      news2: v.news2 ?? computeNEWS2(v),
    }))
  }, [vitals])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    const data = payload[0]?.payload
    return (
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 12px', fontSize: 11, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ fontWeight: 600, color: '#1E293B', marginBottom: 4 }}>{data?.date} {label}</div>
        {payload.map((p: any, i: number) => (
          <div key={i} style={{ color: p.color, marginBottom: 1 }}>
            {p.name}: <strong>{p.value}</strong>
          </div>
        ))}
        <div style={{ color: '#94A3B8', marginTop: 2 }}>by {data?.recordedBy}</div>
      </div>
    )
  }

  if (vitals.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8', fontSize: 13 }}>
        No vitals recorded yet. Vitals captured by nurses will appear here in real time.
      </div>
    )
  }

  const selectedTrend = selectedParam ? trends.find(t => t.parameter === selectedParam) : null

  const colorPalette: Record<string, string> = {
    temperature: '#EF4444',
    heartRate: '#8B5CF6',
    respiratoryRate: '#F59E0B',
    bpSystolic: '#2F80ED',
    oxygenSaturation: '#10B981',
    painScore: '#EC4899',
    bloodGlucose: '#F97316',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
        {trends.filter(t => t.currentValue !== null).map(trend => {
          const isAbnormal = trend.currentValue! < trend.refLow || trend.currentValue! > trend.refHigh
          const isCritical = trend.currentValue! < trend.criticalLow || trend.currentValue! > trend.criticalHigh
          const borderColor = isCritical ? '#DC2626' : isAbnormal ? '#F59E0B' : '#E2E8F0'
          return (
            <div
              key={trend.parameter}
              onClick={() => setSelectedParam(selectedParam === trend.parameter ? null : trend.parameter)}
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                border: `1px solid ${borderColor}`,
                background: isCritical ? '#FFF5F5' : '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {trend.label}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: isCritical ? '#DC2626' : '#0F172A', lineHeight: 1.2, margin: '2px 0' }}>
                {trend.currentValue}
                <span style={{ fontSize: 11, fontWeight: 400, color: '#94A3B8', marginLeft: 4 }}>{trend.unit}</span>
              </div>
              <div style={{ fontSize: 10, color: trend.direction === 'worsening' ? '#DC2626' : '#10B981' }}>
                {trend.readings.length} readings
              </div>
            </div>
          )
        })}

        <div style={{
          padding: '10px 12px',
          borderRadius: 8,
          border: `1px solid ${news2Risk.color}40`,
          background: `${news2Risk.color}08`,
        }}>
          <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>NEWS2</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: news2Risk.color, lineHeight: 1.2, margin: '2px 0' }}>
            {latestNEWS2}
          </div>
          <div style={{ fontSize: 10, color: news2Risk.color, fontWeight: 600 }}>
            {news2Risk.level.toUpperCase()} risk
          </div>
        </div>
      </div>

      {selectedParam && selectedTrend && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{selectedTrend.label} Trend</span>
              <span style={{ fontSize: 11, color: '#94A3B8', marginLeft: 8 }}>
                {selectedTrend.unit} · {selectedTrend.readings.length} readings
              </span>
            </div>
            <button
              onClick={() => setSelectedParam(null)}
              style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #E2E8F0', background: '#fff', fontSize: 11, cursor: 'pointer', color: '#64748B' }}
            >
              Close
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={selectedTrend.refHigh} stroke="#F59E0B" strokeDasharray="4 2" label={{ value: 'High', position: 'right', fontSize: 9, fill: '#F59E0B' }} />
              <ReferenceLine y={selectedTrend.refLow} stroke="#F59E0B" strokeDasharray="4 2" label={{ value: 'Low', position: 'right', fontSize: 9, fill: '#F59E0B' }} />
              <ReferenceLine y={selectedTrend.criticalHigh} stroke="#DC2626" strokeDasharray="4 2" />
              <ReferenceLine y={selectedTrend.criticalLow} stroke="#DC2626" strokeDasharray="4 2" />
              <Area
                type="monotone"
                dataKey={selectedTrend.parameter}
                stroke={colorPalette[selectedTrend.parameter] || '#2F80ED'}
                strokeWidth={2}
                fill={`${colorPalette[selectedTrend.parameter] || '#2F80ED'}15`}
                dot={{ r: 3, fill: colorPalette[selectedTrend.parameter] || '#2F80ED' }}
                activeDot={{ r: 5 }}
                name={selectedTrend.label}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>NEWS2 Trend</div>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#94A3B8' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 9, fill: '#94A3B8' }} tickLine={false} axisLine={false} domain={[0, 20]} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={7} stroke="#DC2626" strokeDasharray="4 2" label={{ value: 'High risk ≥7', fontSize: 9, fill: '#DC2626', position: 'right' }} />
            <ReferenceLine y={5} stroke="#F59E0B" strokeDasharray="4 2" label={{ value: 'Medium ≥5', fontSize: 9, fill: '#F59E0B', position: 'right' }} />
            <ReferenceLine y={3} stroke="#10B981" strokeDasharray="4 2" label={{ value: 'Low ≥3', fontSize: 9, fill: '#10B981', position: 'right' }} />
            <Line
              type="monotone"
              dataKey="news2"
              stroke="#EF4444"
              strokeWidth={2}
              dot={{ r: 3, fill: '#EF4444' }}
              activeDot={{ r: 5 }}
              name="NEWS2"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
