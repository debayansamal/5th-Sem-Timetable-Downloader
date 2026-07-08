'use client';

import React, { useMemo, useEffect, useState } from 'react';
import timetableData from '../data/timetable_data.json';

interface ClassSlot {
  period: string;
  time: string;
  subject: string;
  teacher: string;
  room: string;
  type: 'core' | 'pe1' | 'pe2' | 'overlap';
}

interface TimetableGridProps {
  selectedCore: string;
  selectedPe1: string;
  selectedPe2: string;
  viewMode: 'weekly' | 'daily';
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];
const PERIOD_TIMES: Record<string, string> = {
  P1: '08:00 - 09:00',
  P2: '09:00 - 10:00',
  P3: '10:00 - 11:00',
  P4: '11:00 - 12:00',
  P5: '12:00 - 13:00',
  P6: '13:00 - 14:00',
};

export default function TimetableGrid({
  selectedCore,
  selectedPe1,
  selectedPe2,
  viewMode,
}: TimetableGridProps) {
  const [currentDayName, setCurrentDayName] = useState<string>('Monday');
  const [activeDailyDay, setActiveDailyDay] = useState<string>('Monday');

  // Detect current day on client side
  useEffect(() => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayIndex = new Date().getDay();
    const todayName = daysOfWeek[todayIndex];
    
    setCurrentDayName(todayName);
    
    // Set daily feed view to current day (if weekday), otherwise default to Monday
    if (todayName !== 'Saturday' && todayName !== 'Sunday') {
      setActiveDailyDay(todayName);
    } else {
      setActiveDailyDay('Monday');
    }
  }, []);

  // Merge core and elective schedules
  const mergedTimetable = useMemo(() => {
    const timetable: Record<string, Record<string, ClassSlot[]>> = {};

    // Initialize the grid structure
    DAYS.forEach(day => {
      timetable[day] = {};
      PERIODS.forEach(period => {
        timetable[day][period] = [];
      });
    });

    // Helper to add classes
    const addClassSlots = (
      scheduleMap: any,
      type: 'core' | 'pe1' | 'pe2'
    ) => {
      if (!scheduleMap) return;
      
      DAYS.forEach(day => {
        const dayClasses = scheduleMap[day] || [];
        dayClasses.forEach((slot: any) => {
          const p = slot.period;
          if (timetable[day] && timetable[day][p]) {
            timetable[day][p].push({
              period: p,
              time: slot.time || PERIOD_TIMES[p],
              subject: slot.subject,
              teacher: slot.teacher,
              room: slot.room,
              type
            });
          }
        });
      });
    };

    // 1. Add Core Section
    if (selectedCore && (timetableData.core as any)[selectedCore]) {
      addClassSlots((timetableData.core as any)[selectedCore], 'core');
    }

    // 2. Add PE1 Section
    if (selectedPe1) {
      let pe1Schedule = null;
      for (const cat in timetableData.pe1) {
        if ((timetableData.pe1 as any)[cat][selectedPe1]) {
          pe1Schedule = (timetableData.pe1 as any)[cat][selectedPe1];
          break;
        }
      }
      if (pe1Schedule) {
        addClassSlots(pe1Schedule, 'pe1');
      }
    }

    // 3. Add PE2 Section
    if (selectedPe2) {
      let pe2Schedule = null;
      for (const cat in timetableData.pe2) {
        if ((timetableData.pe2 as any)[cat][selectedPe2]) {
          pe2Schedule = (timetableData.pe2 as any)[cat][selectedPe2];
          break;
        }
      }
      if (pe2Schedule) {
        addClassSlots(pe2Schedule, 'pe2');
      }
    }

    return timetable;
  }, [selectedCore, selectedPe1, selectedPe2]);

  // Identify overlaps
  const overlapsList = useMemo(() => {
    const list: Array<{ day: string; period: string; classes: ClassSlot[] }> = [];
    DAYS.forEach(day => {
      PERIODS.forEach(period => {
        const classes = mergedTimetable[day]?.[period] || [];
        if (classes.length > 1) {
          list.push({ day, period, classes });
        }
      });
    });
    return list;
  }, [mergedTimetable]);

  if (!selectedCore) {
    return (
      <div className="no-classes-placeholder">
        Please select your Core CSE Section to visualize your timetable.
      </div>
    );
  }

  return (
    <div className="timetable-section">
      {/* Overlap Warning Banner */}
      {overlapsList.length > 0 && (
        <div className="overlap-alert">
          <h4>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Schedule Overlaps Detected ({overlapsList.length})
          </h4>
          <ul>
            {overlapsList.map((overlap, idx) => (
              <li key={idx}>
                <strong>{overlap.day} @ {PERIOD_TIMES[overlap.period]} ({overlap.period})</strong>:{' '}
                {overlap.classes.map(c => `${c.subject} (${c.type.toUpperCase()})`).join(' vs ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {viewMode === 'weekly' ? (
        /* Weekly Grid Table View */
        <div className="timetable-wrapper" id="timetable-capture">
          <table className="timetable-table">
            <thead>
              <tr>
                <th>Day</th>
                {PERIODS.map(period => (
                  <th key={period} title={PERIOD_TIMES[period]}>
                    <div>{period}</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 'normal', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {PERIOD_TIMES[period]}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map(day => {
                const isToday = currentDayName === day;
                return (
                  <tr key={day} className={isToday ? 'active-day-row' : ''}>
                    <td className="day-cell">
                      {day.substring(0, 3)}
                      {isToday && (
                        <div style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 'bold', marginTop: '0.2rem' }}>
                          TODAY
                        </div>
                      )}
                    </td>
                    {PERIODS.map(period => {
                      const classes = mergedTimetable[day]?.[period] || [];
                      const hasClasses = classes.length > 0;
                      const hasOverlap = classes.length > 1;

                      return (
                        <td key={period}>
                          {hasClasses && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', height: '100%' }}>
                              {classes.map((cls, idx) => (
                                <div
                                  key={idx}
                                  className={`class-card ${hasOverlap ? 'overlap-class' : `${cls.type}-class`}`}
                                  title={`${cls.subject}\n${cls.teacher}\nRoom: ${cls.room}\nType: ${cls.type.toUpperCase()}`}
                                >
                                  <div className="class-subject">{cls.subject}</div>
                                  <div className="class-teacher" title={cls.teacher}>{cls.teacher.split('\n')[0]}</div>
                                  <div className="class-room">{cls.room}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Daily Chronological Card View (Only showing selected current day) */
        <div className="daily-view-container">
          {/* Day selection tabs at the top of the daily view */}
          <div className="day-tabs" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
            {DAYS.map(day => {
              const isSelected = activeDailyDay === day;
              const isRealToday = currentDayName === day;
              
              return (
                <button
                  key={day}
                  onClick={() => setActiveDailyDay(day)}
                  className={`view-btn ${isSelected ? 'active' : ''}`}
                  style={{
                    background: isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.04)',
                    color: isSelected ? '#fff' : 'var(--text-muted)',
                    border: '1px solid ' + (isSelected ? 'var(--primary)' : 'var(--panel-border)'),
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    transition: 'var(--transition-smooth)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {day}
                  {isRealToday && (
                    <span style={{
                      fontSize: '0.65rem',
                      background: isSelected ? 'rgba(255, 255, 255, 0.2)' : 'var(--primary-glow)',
                      color: isSelected ? '#fff' : 'var(--primary)',
                      padding: '0.1rem 0.3rem',
                      borderRadius: '4px',
                      marginLeft: '0.4rem',
                      fontWeight: 'bold'
                    }}>
                      Today
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Render classes for the single activeDailyDay */}
          <div className="day-section" id="timetable-capture">
            <h3 className="day-heading" style={{ marginBottom: '1.25rem' }}>
              Schedule for {activeDailyDay}
              {currentDayName === activeDailyDay && <span style={{ marginLeft: '0.5rem' }}>(Today)</span>}
            </h3>

            {(() => {
              const dayClasses: ClassSlot[] = [];
              PERIODS.forEach(period => {
                const classes = mergedTimetable[activeDailyDay]?.[period] || [];
                classes.forEach(cls => {
                  dayClasses.push(cls);
                });
              });

              if (dayClasses.length === 0) {
                return (
                  <div className="no-classes-placeholder" style={{ padding: '3rem', fontSize: '0.9rem' }}>
                    No classes scheduled for {activeDailyDay}. Enjoy your day off!
                  </div>
                );
              }

              return (
                <div className="day-classes-grid">
                  {dayClasses.map((cls, idx) => {
                    const isOverlapping = (mergedTimetable[activeDailyDay]?.[cls.period]?.length || 0) > 1;

                    return (
                      <div
                        key={idx}
                        className={`daily-class-card ${isOverlapping ? 'overlap-class' : `${cls.type}-class`}`}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="daily-time-tag">
                            {cls.period} ({cls.time})
                          </span>
                          {isOverlapping && (
                            <span style={{ color: 'var(--danger)', fontSize: '0.7rem', fontWeight: 'bold' }}>
                              OVERLAP
                            </span>
                          )}
                        </div>
                        <h4 className="daily-subject">{cls.subject}</h4>
                        <p className="daily-teacher">{cls.teacher}</p>
                        <div className="daily-footer">
                          <span className="daily-room">Room: {cls.room}</span>
                          <span className="daily-type">
                            {cls.type === 'core' ? 'Core' : cls.type === 'pe1' ? 'PE 1' : 'PE 2'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
