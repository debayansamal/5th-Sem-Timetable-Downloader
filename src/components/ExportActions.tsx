'use client';

import React, { useState, useRef, useEffect } from 'react';
import timetableData from '../data/timetable_data.json';

interface ExportActionsProps {
  targetId: string;
  fileName: string;
  selectedCore: string;
  selectedPe1: string;
  selectedPe2: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];
const PERIOD_TIMES: Record<string, string> = {
  P1: '08:00 - 09:00', P2: '09:00 - 10:00', P3: '10:00 - 11:00',
  P4: '11:00 - 12:00', P5: '12:00 - 13:00', P6: '13:00 - 14:00',
};

// Unique, accessible, light-background subject colors (like a calendar)
// Lab subjects (suffix L) use the same hue as their theory counterpart but lighter/more washed out
const SUBJECT_COLORS: Record<string, { bg: string; border: string; text: string; label: string }> = {
  'DAA':   { bg: '#e8f4fd', border: '#3b82f6', text: '#1e3a5f', label: '#3b82f6' },
  'DAAL':  { bg: '#eff6ff', border: '#93c5fd', text: '#1e3a5f', label: '#60a5fa' }, // lighter blue — same family as DAA
  'SE':    { bg: '#e8fdf0', border: '#10b981', text: '#065f46', label: '#10b981' },
  'CN':    { bg: '#fdf8e8', border: '#f59e0b', text: '#5c3f00', label: '#f59e0b' },
  'CNL':   { bg: '#fffbeb', border: '#fcd34d', text: '#5c3f00', label: '#fbbf24' }, // lighter amber — same family as CN
  'EE':    { bg: '#f3e8fd', border: '#8b5cf6', text: '#4c1d95', label: '#8b5cf6' },
  'HPC':   { bg: '#e8fdfc', border: '#06b6d4', text: '#164e63', label: '#06b6d4' },
  'DMDW':  { bg: '#fde8ea', border: '#ef4444', text: '#7f1d1d', label: '#ef4444' },
  'AI':    { bg: '#edf8e8', border: '#22c55e', text: '#14532d', label: '#22c55e' },
  'DOS':   { bg: '#fdf3e8', border: '#fb923c', text: '#7c2d12', label: '#fb923c' },
  'IPA':   { bg: '#fef9e8', border: '#eab308', text: '#713f12', label: '#eab308' },
  'BD':    { bg: '#f0e8fd', border: '#a855f7', text: '#581c87', label: '#a855f7' },
  'BDS':   { bg: '#e8f0fd', border: '#6366f1', text: '#312e81', label: '#6366f1' },
  'CD':    { bg: '#e8fdf4', border: '#14b8a6', text: '#134e4a', label: '#14b8a6' },
  'CI':    { bg: '#fde8f4', border: '#f43f5e', text: '#881337', label: '#f43f5e' },
  'SVP':   { bg: '#fdf4e8', border: '#d97706', text: '#92400e', label: '#d97706' },
  'PSIOT': { bg: '#e8fafe', border: '#22d3ee', text: '#164e63', label: '#22d3ee' },
  'IT':    { bg: '#f0fde8', border: '#84cc16', text: '#365314', label: '#84cc16' },
};

const DEFAULT_COLOR = { bg: '#f0f4f8', border: '#94a3b8', text: '#1e293b', label: '#64748b' };

function getSubjectColor(subject: string) {
  for (const key of Object.keys(SUBJECT_COLORS)) {
    if (subject.toUpperCase().startsWith(key)) return SUBJECT_COLORS[key];
  }
  return DEFAULT_COLOR;
}

interface ClassSlot {
  period: string; time: string; subject: string;
  teacher: string; room: string; type: 'core' | 'pe1' | 'pe2';
}

function buildMergedTimetable(selectedCore: string, selectedPe1: string, selectedPe2: string) {
  const timetable: Record<string, Record<string, ClassSlot[]>> = {};
  DAYS.forEach(day => { timetable[day] = {}; PERIODS.forEach(p => { timetable[day][p] = []; }); });

  const addSlots = (scheduleMap: any, type: 'core' | 'pe1' | 'pe2') => {
    if (!scheduleMap) return;
    DAYS.forEach(day => {
      (scheduleMap[day] || []).forEach((slot: any) => {
        if (timetable[day] && timetable[day][slot.period]) {
          timetable[day][slot.period].push({ ...slot, type });
        }
      });
    });
  };

  if (selectedCore) addSlots((timetableData.core as any)[selectedCore], 'core');
  if (selectedPe1) {
    for (const cat in timetableData.pe1) {
      if ((timetableData.pe1 as any)[cat][selectedPe1]) {
        addSlots((timetableData.pe1 as any)[cat][selectedPe1], 'pe1'); break;
      }
    }
  }
  if (selectedPe2) {
    for (const cat in timetableData.pe2) {
      if ((timetableData.pe2 as any)[cat][selectedPe2]) {
        addSlots((timetableData.pe2 as any)[cat][selectedPe2], 'pe2'); break;
      }
    }
  }
  return timetable;
}

function buildExportHTML(
  timetable: Record<string, Record<string, ClassSlot[]>>,
  selectedCore: string, selectedPe1: string, selectedPe2: string
): string {
  const typeLabel: Record<string, string> = { core: 'Core', pe1: 'PE-1', pe2: 'PE-2' };

  const rows = DAYS.map(day => {
    const cells = PERIODS.map(period => {
      const classes = timetable[day]?.[period] || [];
      if (classes.length === 0) return `<td style="padding:0;border:1px solid #e2e8f0;background:#f8fafc;width:0;"></td>`;
      const cards = classes.map(cls => {
        const col = getSubjectColor(cls.subject);
        return `
          <div style="
            background:${col.bg};
            border:1.5px solid ${col.border};
            border-radius:8px;
            padding:6px 8px;
            margin-bottom:4px;
            position:relative;
            overflow:hidden;
          ">
            <div style="position:absolute;left:0;top:0;bottom:0;width:4px;background:${col.border};border-radius:4px 0 0 4px;"></div>
            <div style="padding-left:8px;">
              <div style="font-weight:700;font-size:11px;color:${col.text};line-height:1.3;">${cls.subject}</div>
              <div style="font-size:9px;color:#475569;margin-top:2px;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100px;">${cls.teacher.split('\n')[0]}</div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;">
                <span style="font-size:9px;font-weight:700;background:${col.border};color:#fff;padding:1px 5px;border-radius:4px;">${cls.room}</span>
                <span style="font-size:8px;color:${col.label};font-weight:600;">${typeLabel[cls.type]}</span>
              </div>
            </div>
          </div>`;
      }).join('');
      return `<td style="padding:6px; border:1px solid #e2e8f0; vertical-align:top; min-width:120px;">${cards}</td>`;
    }).join('');
    return `
      <tr>
        <td style="padding:10px 14px;border:1px solid #e2e8f0;background:#f1f5f9;font-weight:700;font-size:12px;color:#1e293b;white-space:normal;text-align:center;width:100px;min-width:100px;vertical-align:middle;">${day}</td>
        ${cells}
      </tr>`;
  }).join('');

  const headerCells = PERIODS.map(p => `
    <th style="padding:10px 6px;background:#163E32;color:#DAF1DE;font-size:10px;font-weight:700;text-align:center;border:1px solid #235E47;white-space:nowrap;">
      ${p}<br><span style="font-weight:400;font-size:8px;color:#8EB399;">${PERIOD_TIMES[p]}</span>
    </th>`).join('');


  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;background:#ffffff;padding:20px;width:960px;">
      <div style="margin-bottom:14px;">
        <h1 style="font-size:16px;font-weight:800;color:#051F20;margin:0 0 4px 0;letter-spacing:-0.03em;">5TH SEM TIMETABLE</h1>
        <p style="font-size:10px;color:#235E47;margin:0;">
          Core: <strong>${selectedCore}</strong> &nbsp;•&nbsp;
          PE-1: <strong>${selectedPe1 || 'None'}</strong> &nbsp;•&nbsp;
          PE-2: <strong>${selectedPe2 || 'None'}</strong>
        </p>
      </div>
      <div style="overflow:visible;">
        <table style="border-collapse:collapse;width:100%;table-layout:auto;">
          <thead>
            <tr>
              <th style="padding:8px 10px;background:#051F20;color:#DAF1DE;font-size:10px;font-weight:700;border:1px solid #163E32;width:80px;min-width:80px;">DAY</th>
              ${headerCells}
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

export default function ExportActions({ targetId, fileName, selectedCore, selectedPe1, selectedPe2 }: ExportActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const generateCanvas = async () => {
    const html2canvas = (await import('html2canvas')).default;
    const timetable = buildMergedTimetable(selectedCore, selectedPe1, selectedPe2);
    const html = buildExportHTML(timetable, selectedCore, selectedPe1, selectedPe2);

    // Create a hidden off-screen container
    const container = document.createElement('div');
    container.innerHTML = html;
    container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;z-index:-1;';
    document.body.appendChild(container);

    const innerEl = container.firstElementChild as HTMLElement;
    const canvas = await html2canvas(innerEl, {
      backgroundColor: '#ffffff',
      scale: 3,
      useCORS: true,
      logging: false,
      width: 960,
      height: innerEl.scrollHeight,
    });

    document.body.removeChild(container);
    return canvas;
  };

  const downloadImage = async () => {
    setIsOpen(false);
    setIsExporting(true);
    try {
      const canvas = await generateCanvas();
      const link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error(e);
      alert('Failed to export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const downloadPDF = async () => {
    setIsOpen(false);
    setIsExporting(true);
    try {
      const canvas = await generateCanvas();
      const { jsPDF } = await import('jspdf');
      const imgData = canvas.toDataURL('image/png');
      const aspect = canvas.width / canvas.height;

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pW = pdf.internal.pageSize.getWidth();
      const pH = pdf.internal.pageSize.getHeight();

      let iW = pW, iH = pW / aspect;
      if (iH > pH) { iH = pH; iW = pH * aspect; }
      const xOff = (pW - iW) / 2, yOff = 0;

      pdf.addImage(imgData, 'PNG', xOff, yOff, iW, iH, undefined, 'FAST');
      pdf.save(`${fileName}.pdf`);
    } catch (e) {
      console.error(e);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(o => !o)}
        disabled={isExporting}
        className="btn btn-primary"
        style={{ gap: '0.6rem', minWidth: '260px', padding: '0.85rem 1.75rem' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        {isExporting ? 'Exporting...' : 'Download Weekly Timetable'}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginLeft: 'auto' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, width: '100%',
          padding: '0.5rem', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '0.4rem',
          background: 'rgba(11, 43, 38, 0.97)', border: '1px solid rgba(142,179,153,0.3)',
          borderRadius: 'var(--border-radius-md)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        }}>
          <button onClick={downloadImage} className="btn btn-secondary"
            style={{ padding: '0.65rem 1rem', width: '100%', justifyContent: 'flex-start', fontSize: '0.9rem', background: 'transparent', border: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ marginRight: '0.6rem', color: '#8EB399' }}>
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            PNG Image
          </button>
          <button onClick={downloadPDF} className="btn btn-secondary"
            style={{ padding: '0.65rem 1rem', width: '100%', justifyContent: 'flex-start', fontSize: '0.9rem', background: 'transparent', border: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ marginRight: '0.6rem', color: '#DAF1DE' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            PDF Document
          </button>
        </div>
      )}
    </div>
  );
}
