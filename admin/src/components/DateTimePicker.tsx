'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    isSameMonth,
    isSameDay,
    isToday,
    isBefore,
    startOfDay,
} from 'date-fns';
import { IoCalendarOutline, IoChevronBack, IoChevronForward, IoTimeOutline } from 'react-icons/io5';

interface DateTimePickerProps {
    value: string; // ISO datetime-local string e.g. "2026-02-11T12:00"
    onChange: (value: string) => void;
    min?: string;
    className?: string;
}

type View = 'calendar' | 'months' | 'years';

const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const FULL_MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

export default function DateTimePicker({ value, onChange, min, className = '' }: DateTimePickerProps) {
    const [open, setOpen] = useState(false);
    const [view, setView] = useState<View>('calendar');
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse value or default to now
    const selectedDate = useMemo(() => {
        if (value) {
            const d = new Date(value);
            if (!isNaN(d.getTime())) return d;
        }
        return new Date();
    }, [value]);

    const minDate = useMemo(() => {
        if (min) {
            const d = new Date(min);
            if (!isNaN(d.getTime())) return d;
        }
        return undefined;
    }, [min]);

    const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());
    const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
    const [hours, setHours] = useState(selectedDate.getHours());
    const [minutes, setMinutes] = useState(selectedDate.getMinutes());

    // Year range for year picker
    const [yearRangeStart, setYearRangeStart] = useState(Math.floor(selectedDate.getFullYear() / 12) * 12);

    // Sync when value changes externally
    useEffect(() => {
        if (value) {
            const d = new Date(value);
            if (!isNaN(d.getTime())) {
                setViewMonth(d.getMonth());
                setViewYear(d.getFullYear());
                setHours(d.getHours());
                setMinutes(d.getMinutes());
            }
        }
    }, [value]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setView('calendar');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const emitChange = (year: number, month: number, day: number, h: number, m: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        onChange(dateStr);
    };

    const handleDayClick = (day: Date) => {
        if (minDate && isBefore(startOfDay(day), startOfDay(minDate))) return;
        emitChange(day.getFullYear(), day.getMonth(), day.getDate(), hours, minutes);
    };

    const handleTimeChange = (newHours: number, newMinutes: number) => {
        setHours(newHours);
        setMinutes(newMinutes);
        emitChange(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), newHours, newMinutes);
    };

    const prevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(viewYear - 1);
        } else {
            setViewMonth(viewMonth - 1);
        }
    };

    const nextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(viewYear + 1);
        } else {
            setViewMonth(viewMonth + 1);
        }
    };

    // Build calendar grid
    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(new Date(viewYear, viewMonth));
        const monthEnd = endOfMonth(monthStart);
        const weekStart = startOfWeek(monthStart);
        const weekEnd = endOfWeek(monthEnd);
        const days: Date[] = [];
        let day = weekStart;
        while (day <= weekEnd) {
            days.push(day);
            day = addDays(day, 1);
        }
        return days;
    }, [viewMonth, viewYear]);

    const yearRange = useMemo(() => {
        const years: number[] = [];
        for (let i = yearRangeStart; i < yearRangeStart + 12; i++) {
            years.push(i);
        }
        return years;
    }, [yearRangeStart]);

    const displayValue = value
        ? format(selectedDate, 'MM/dd/yyyy, hh:mm a')
        : '';

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Input Display */}
            <div
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 cursor-pointer flex items-center gap-3 hover:border-teal-400 focus-within:ring-2 focus-within:ring-teal-500 transition-colors"
                onClick={() => { setOpen(!open); setView('calendar'); }}
            >
                <IoCalendarOutline className="text-gray-400 text-lg shrink-0" />
                <span className={displayValue ? 'text-gray-900' : 'text-gray-400'}>
                    {displayValue || 'Select date & time'}
                </span>
            </div>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 mt-2 left-0 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 w-[320px] animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Calendar View */}
                    {view === 'calendar' && (
                        <>
                            {/* Header with clickable month/year */}
                            <div className="flex items-center justify-between mb-3">
                                <button
                                    type="button"
                                    onClick={prevMonth}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                                >
                                    <IoChevronBack className="text-lg" />
                                </button>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setView('months')}
                                        className="px-2 py-1 rounded-lg hover:bg-teal-50 text-gray-900 font-semibold transition-colors"
                                    >
                                        {FULL_MONTHS[viewMonth]}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setYearRangeStart(Math.floor(viewYear / 12) * 12); setView('years'); }}
                                        className="px-2 py-1 rounded-lg hover:bg-teal-50 text-gray-900 font-semibold transition-colors"
                                    >
                                        {viewYear}
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={nextMonth}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                                >
                                    <IoChevronForward className="text-lg" />
                                </button>
                            </div>

                            {/* Day names */}
                            <div className="grid grid-cols-7 mb-1">
                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                    <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
                                ))}
                            </div>

                            {/* Days grid */}
                            <div className="grid grid-cols-7">
                                {calendarDays.map((day, i) => {
                                    const isCurrentMonth = isSameMonth(day, new Date(viewYear, viewMonth));
                                    const isSelected = isSameDay(day, selectedDate);
                                    const isTodayDate = isToday(day);
                                    const isDisabled = minDate && isBefore(startOfDay(day), startOfDay(minDate));

                                    return (
                                        <button
                                            key={i}
                                            type="button"
                                            disabled={!!isDisabled}
                                            onClick={() => handleDayClick(day)}
                                            className={`
                                                w-9 h-9 mx-auto rounded-lg text-sm flex items-center justify-center transition-all
                                                ${!isCurrentMonth ? 'text-gray-300' : ''}
                                                ${isCurrentMonth && !isSelected && !isDisabled ? 'text-gray-700 hover:bg-teal-50 hover:text-teal-700' : ''}
                                                ${isSelected ? 'bg-teal-600 text-white font-semibold shadow-sm' : ''}
                                                ${isTodayDate && !isSelected ? 'ring-1 ring-teal-400 font-semibold text-teal-600' : ''}
                                                ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}
                                            `}
                                        >
                                            {format(day, 'd')}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Time Section */}
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    <IoTimeOutline className="text-gray-400" />
                                    <span className="text-sm text-gray-500 font-medium">Time</span>
                                    <div className="flex-1 flex items-center justify-end gap-1">
                                        <select
                                            value={hours}
                                            onChange={(e) => handleTimeChange(parseInt(e.target.value), minutes)}
                                            className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-teal-500 appearance-none text-center w-16"
                                        >
                                            {Array.from({ length: 24 }, (_, i) => (
                                                <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
                                            ))}
                                        </select>
                                        <span className="text-gray-400 font-bold">:</span>
                                        <select
                                            value={minutes}
                                            onChange={(e) => handleTimeChange(hours, parseInt(e.target.value))}
                                            className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-teal-500 appearance-none text-center w-16"
                                        >
                                            {Array.from({ length: 60 }, (_, i) => (
                                                <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Month Picker View */}
                    {view === 'months' && (
                        <>
                            <div className="flex items-center justify-between mb-3">
                                <button
                                    type="button"
                                    onClick={() => setViewYear(viewYear - 1)}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                                >
                                    <IoChevronBack className="text-lg" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setYearRangeStart(Math.floor(viewYear / 12) * 12); setView('years'); }}
                                    className="px-3 py-1 rounded-lg hover:bg-teal-50 text-gray-900 font-semibold transition-colors"
                                >
                                    {viewYear}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewYear(viewYear + 1)}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                                >
                                    <IoChevronForward className="text-lg" />
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {MONTHS.map((m, i) => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => { setViewMonth(i); setView('calendar'); }}
                                        className={`
                                            py-2.5 rounded-xl text-sm font-medium transition-all
                                            ${i === viewMonth && viewYear === selectedDate.getFullYear()
                                                ? 'bg-teal-600 text-white shadow-sm'
                                                : 'text-gray-700 hover:bg-teal-50 hover:text-teal-700'
                                            }
                                        `}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Year Picker View */}
                    {view === 'years' && (
                        <>
                            <div className="flex items-center justify-between mb-3">
                                <button
                                    type="button"
                                    onClick={() => setYearRangeStart(yearRangeStart - 12)}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                                >
                                    <IoChevronBack className="text-lg" />
                                </button>
                                <span className="text-gray-900 font-semibold text-sm">
                                    {yearRangeStart} – {yearRangeStart + 11}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setYearRangeStart(yearRangeStart + 12)}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                                >
                                    <IoChevronForward className="text-lg" />
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {yearRange.map((y) => (
                                    <button
                                        key={y}
                                        type="button"
                                        onClick={() => { setViewYear(y); setView('months'); }}
                                        className={`
                                            py-2.5 rounded-xl text-sm font-medium transition-all
                                            ${y === viewYear
                                                ? 'bg-teal-600 text-white shadow-sm'
                                                : 'text-gray-700 hover:bg-teal-50 hover:text-teal-700'
                                            }
                                        `}
                                    >
                                        {y}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
