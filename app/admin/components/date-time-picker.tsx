'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format, parse } from 'date-fns';
import { Button, Input, Popover } from '@/shared/components';
import { PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { cn } from '@/shared/lib/utils';

interface DateTimePickerProps {
  value?: string;
  onChange: (value: string) => void;
}

export const DateTimePicker = ({ value, onChange }: DateTimePickerProps) => {
  const [date, setDate] = useState<Date | undefined>(value ? parse(value, 'dd.MM.yyyy, HH:mm:ss', new Date()) : undefined);
  const [time, setTime] = useState<string>(value ? format(parse(value, 'dd.MM.yyyy, HH:mm:ss', new Date()), 'HH:mm') : '12:00');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (date && time) {
      const [hours, minutes] = time.split(':').map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours, minutes, 0, 0);
      
      const formattedDate = format(newDate, 'dd.MM.yyyy, HH:mm:ss');
      onChange(formattedDate);
    }
  }, [date, time, onChange]);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
      setTime(value);
    }
  };

  // Простая реализация календаря
  const renderCalendar = () => {
    if (!date) return null;
    
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    const days = [];
    
    // Пустые клетки в начале месяца
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }
    
    // Дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(currentYear, currentMonth, day);
      const isSelected = date.getDate() === day;
      
      days.push(
        <button
          key={day}
          onClick={() => {
            setDate(dayDate);
            setIsOpen(false);
          }}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
            ${isSelected ? 'bg-primary text-white' : 'hover:bg-gray-100'}
          `}
        >
          {day}
        </button>
      );
    }
    
    return (
      <div className="w-64 p-3">
        <div className="flex justify-between items-center mb-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setDate(new Date(currentYear, currentMonth - 1, 1))}
          >
            &lt;
          </Button>
          <div className="font-medium">
            {format(date, 'MMMM yyyy')}
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setDate(new Date(currentYear, currentMonth + 1, 1))}
          >
            &gt;
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "dd.MM.yyyy") : <span>Выберите дату</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {renderCalendar()}
        </PopoverContent>
      </Popover>

      <div className="relative">
        <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="time"
          value={time}
          onChange={handleTimeChange}
          className="pl-10 w-[120px]"
        />
      </div>
    </div>
  );
};