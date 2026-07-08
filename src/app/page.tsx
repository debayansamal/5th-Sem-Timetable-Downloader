'use client';

import React, { useState, useEffect, useMemo } from 'react';
import timetableData from '../data/timetable_data.json';
import TimetableGrid from '../components/TimetableGrid';
import ExportActions from '../components/ExportActions';

export default function Home() {
  const [selectedCore, setSelectedCore] = useState<string>('');
  const [selectedPe1Subject, setSelectedPe1Subject] = useState<string>('');
  const [selectedPe1, setSelectedPe1] = useState<string>('');
  const [selectedPe2Subject, setSelectedPe2Subject] = useState<string>('');
  const [selectedPe2, setSelectedPe2] = useState<string>('');
  const [viewMode, setViewMode] = useState<'weekly' | 'daily'>('daily');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isMounted, setIsMounted] = useState(false);

  // Helper to find elective subject category based on section code
  const findElectiveSubject = (section: string, type: 'pe1' | 'pe2'): string => {
    if (!section) return '';
    const categoryData = timetableData[type];
    for (const category of Object.keys(categoryData)) {
      if ((categoryData as any)[category][section]) {
        return category;
      }
    }
    return '';
  };

  // Load options once and sort them naturally (e.g. CS2 before CS10)
  const coreOptions = useMemo(() => {
    return Object.keys(timetableData.core).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, []);

  const pe1Subjects = useMemo(() => Object.keys(timetableData.pe1).sort(), []);
  const pe2Subjects = useMemo(() => Object.keys(timetableData.pe2).sort(), []);

  const pe1Sections = useMemo(() => {
    if (!selectedPe1Subject) return [];
    return Object.keys((timetableData.pe1 as any)[selectedPe1Subject]).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [selectedPe1Subject]);

  const pe2Sections = useMemo(() => {
    if (!selectedPe2Subject) return [];
    return Object.keys((timetableData.pe2 as any)[selectedPe2Subject]).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [selectedPe2Subject]);

  // Handle mounting and state restoration from localStorage
  useEffect(() => {
    setIsMounted(true);
    
    const savedCore = localStorage.getItem('tt_selected_core') || '';
    const savedPe1 = localStorage.getItem('tt_selected_pe1') || '';
    const savedPe2 = localStorage.getItem('tt_selected_pe2') || '';
    const savedView = localStorage.getItem('tt_view_mode');
    const savedTheme = localStorage.getItem('tt_theme');
    
    if (savedCore) setSelectedCore(savedCore);
    if (savedPe1) {
      setSelectedPe1(savedPe1);
      setSelectedPe1Subject(findElectiveSubject(savedPe1, 'pe1'));
    }
    if (savedPe2) {
      setSelectedPe2(savedPe2);
      setSelectedPe2Subject(findElectiveSubject(savedPe2, 'pe2'));
    }
    if (savedView === 'weekly' || savedView === 'daily') setViewMode(savedView);
    if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);
  }, []);

  // Sync theme state to document body class list
  useEffect(() => {
    if (!isMounted) return;
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme, isMounted]);

  // Sync state changes with localStorage
  const handleCoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedCore(val);
    localStorage.setItem('tt_selected_core', val);
  };

  const handlePe1SelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'BACK') {
      setSelectedPe1Subject('');
      setSelectedPe1('');
      localStorage.removeItem('tt_selected_pe1');
    } else if (!selectedPe1Subject) {
      setSelectedPe1Subject(val);
      setSelectedPe1('');
    } else {
      setSelectedPe1(val);
      localStorage.setItem('tt_selected_pe1', val);
    }
  };

  const handlePe2SelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'BACK') {
      setSelectedPe2Subject('');
      setSelectedPe2('');
      localStorage.removeItem('tt_selected_pe2');
    } else if (!selectedPe2Subject) {
      setSelectedPe2Subject(val);
      setSelectedPe2('');
    } else {
      setSelectedPe2(val);
      localStorage.setItem('tt_selected_pe2', val);
    }
  };

  const toggleViewMode = (mode: 'weekly' | 'daily') => {
    setViewMode(mode);
    localStorage.setItem('tt_view_mode', mode);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('tt_theme', nextTheme);
  };

  // Helper to format option labels nicely, e.g. "CS1" -> "CSE 1" or "HPC15" -> "HPC 15"
  const formatLabel = (val: string) => {
    if (!val) return '';
    const match = val.match(/^([a-zA-Z]+)(\d+)$/);
    if (match) {
      const label = match[1] === 'CS' ? 'CSE' : match[1];
      return `${label} ${match[2]}`;
    }
    return val;
  };

  const exportFileName = useMemo(() => {
    const parts = ['Timetable'];
    if (selectedCore) parts.push(selectedCore);
    if (selectedPe1) parts.push(selectedPe1);
    if (selectedPe2) parts.push(selectedPe2);
    return parts.join('_');
  }, [selectedCore, selectedPe1, selectedPe2]);

  if (!isMounted) {
    return (
      <div className="app-container">
        <header className="glass-card app-header">
          <div className="logo-section">
            <h1>5th Sem Timetable</h1>
            <p>Loading your preferences...</p>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Top Banner with Dark/Light Toggle */}
      <header className="glass-card app-header">
        <div className="logo-section">
          <h1>5th Sem Timetable</h1>
          <p>Instantly search, view, and download your weekly timetable</p>
        </div>
        
        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          className="btn btn-secondary"
          style={{ padding: '0.6rem 1.2rem', borderRadius: 'var(--border-radius-sm)', gap: '0.5rem' }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              Light Mode
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              Dark Mode
            </>
          )}
        </button>
      </header>

      {/* Selectors and Preferences panel */}
      <section className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="selectors-grid" style={{ marginBottom: 0 }}>
          {/* Core CSE Section selector */}
          <div className="select-group">
            <label htmlFor="core-select">CSE Core Section</label>
            <select
              id="core-select"
              value={selectedCore}
              onChange={handleCoreChange}
              className="custom-select"
            >
              <option value="">-- Choose CSE Section --</option>
              {coreOptions.map(opt => (
                <option key={opt} value={opt}>
                  {formatLabel(opt)}
                </option>
              ))}
            </select>
          </div>

          {/* PE1 elective selector */}
          <div className="select-group">
            <label htmlFor="pe1-select">Professional Elective 1 (PE-1)</label>
            <select
              id="pe1-select"
              value={selectedPe1Subject ? selectedPe1 : ""}
              onChange={handlePe1SelectChange}
              className="custom-select"
            >
              {!selectedPe1Subject ? (
                <>
                  <option value="">-- Choose PE-1 Subject --</option>
                  {pe1Subjects.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </>
              ) : (
                <>
                  <option value="BACK">← Back to Subjects</option>
                  <option value="">-- Choose {selectedPe1Subject} Section --</option>
                  {pe1Sections.map(opt => (
                    <option key={opt} value={opt}>
                      {formatLabel(opt)}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          {/* PE2 elective selector */}
          <div className="select-group">
            <label htmlFor="pe2-select">Professional Elective 2 (PE-2)</label>
            <select
              id="pe2-select"
              value={selectedPe2Subject ? selectedPe2 : ""}
              onChange={handlePe2SelectChange}
              className="custom-select"
            >
              {!selectedPe2Subject ? (
                <>
                  <option value="">-- Choose PE-2 Subject --</option>
                  {pe2Subjects.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </>
              ) : (
                <>
                  <option value="BACK">← Back to Subjects</option>
                  <option value="">-- Choose {selectedPe2Subject} Section --</option>
                  {pe2Sections.map(opt => (
                    <option key={opt} value={opt}>
                      {formatLabel(opt)}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
        </div>

        {/* Download section: ONLY displayed if all 3 data are selected! */}
        {selectedCore && selectedPe1 && selectedPe2 && (
          <div style={{ display: 'flex', justifyContent: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem', animation: 'fadeIn 0.3s ease-out' }}>
            <ExportActions
              targetId="timetable-capture"
              fileName={exportFileName}
              selectedCore={selectedCore}
              selectedPe1={selectedPe1}
              selectedPe2={selectedPe2}
            />
          </div>
        )}

        {/* View mode toggle */}
        {selectedCore && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem', marginTop: 0 }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {selectedCore && selectedPe1 && selectedPe2 ? (
                <span>Showing schedule for <strong>{formatLabel(selectedCore)}</strong> + <strong>{formatLabel(selectedPe1)}</strong> + <strong>{formatLabel(selectedPe2)}</strong></span>
              ) : (
                <span>Please select your Core Section and both Electives to enable downloads</span>
              )}
            </div>
            
            <div className="view-modes">
              <button
                className={`view-btn ${viewMode === 'daily' ? 'active' : ''}`}
                onClick={() => toggleViewMode('daily')}
              >
                Daily Feed
              </button>
              <button
                className={`view-btn ${viewMode === 'weekly' ? 'active' : ''}`}
                onClick={() => toggleViewMode('weekly')}
              >
                Weekly Table
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Main schedule visualization section */}
      {selectedCore && (
        <section className="glass-card" style={{ padding: '1.5rem' }}>
          <TimetableGrid
            selectedCore={selectedCore}
            selectedPe1={selectedPe1}
            selectedPe2={selectedPe2}
            viewMode={viewMode}
          />
        </section>
      )}

      {/* Footer Section with Creator Name & LinkedIn Link */}
      <footer style={{ 
        textAlign: 'center', 
        color: 'var(--text-muted)', 
        fontSize: '0.9rem', 
        marginTop: 'auto', 
        padding: '1.5rem 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        borderTop: '1px solid var(--panel-border)',
        width: '100%'
      }}>
        <p>© 2026 5th Semester Timetable Planner. All rights reserved.</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>Made by <strong>Debayan Samal</strong></span>
          <a 
            href="https://www.linkedin.com/in/debayan-samal-4a8484215/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: '#0a66c2', 
              display: 'inline-flex', 
              alignItems: 'center', 
              textDecoration: 'none',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.25)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            title="Connect with Debayan Samal on LinkedIn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}
