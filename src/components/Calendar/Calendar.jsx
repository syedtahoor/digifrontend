import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Calendar, Menu, Settings } from 'lucide-react';

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('week');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const timeSlots = [
    '12am', '1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am', '9am', '10am', '11am',
    '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm'
  ];

  // Sample events
  const events = [
    { id: 1, title: 'Early Morning Workout', start: 6, duration: 1, day: 1, color: 'bg-green-500' },
    { id: 2, title: 'Team Standup', start: 9, duration: 0.5, day: 1, color: 'bg-blue-500' },
    { id: 3, title: 'Client Meeting', start: 11, duration: 1, day: 1, color: 'bg-orange-400' },
    { id: 4, title: 'Lunch Break', start: 12, duration: 1, day: 1, color: 'bg-gray-400' },
    { id: 5, title: 'Project Review', start: 14, duration: 2, day: 3, color: 'bg-purple-500' },
    { id: 6, title: 'Code Review', start: 10, duration: 1, day: 4, color: 'bg-indigo-500' },
    { id: 7, title: 'Dinner Meeting', start: 19, duration: 2, day: 5, color: 'bg-red-500' },
  ];

  const getWeekDates = () => {
    const curr = new Date(currentDate);
    const first = curr.getDate() - curr.getDay();
    const weekDates = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(curr);
      date.setDate(first + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const weekDates = getWeekDates();
  const startDate = weekDates[0];
  const endDate = weekDates[6];

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    return { firstDay, daysInMonth, prevMonthDays };
  };

  const { firstDay, daysInMonth, prevMonthDays } = getDaysInMonth(selectedDate);
  const calendarDays = [];
  
  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({ day: prevMonthDays - i, isCurrentMonth: false });
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, isCurrentMonth: true });
  }
  
  // Next month days to fill grid
  const remainingDays = 42 - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({ day: i, isCurrentMonth: false });
  }

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-0 bg-gray-50 overflow-hidden">
      {/* Main Calendar Area */}
      <div className="flex-1 w-full flex flex-col order-1 min-h-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-[250px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <Calendar className="text-white" size={24} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-600">Calendar</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {fullMonthNames[startDate.getMonth()]} {startDate.getDate()}, {startDate.getFullYear()}—{fullMonthNames[endDate.getMonth()]} {endDate.getDate()}, {endDate.getFullYear()}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap justify-end">
              <button 
                onClick={() => navigateWeek(-1)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <button 
                onClick={() => navigateWeek(1)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
              <button 
                onClick={goToToday}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
              >
                Today
              </button>
              <button className="p-2 hover:bg-gray-100 rounded">
                <RotateCw size={18} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded">
                <Calendar size={18} className="text-gray-600" />
              </button>
              <div className="border-l border-gray-300 h-6 mx-2"></div>
              <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700">
                New Event
              </button>
              <button className="p-2 hover:bg-gray-100 rounded">
                <Menu size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Week View */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          <div className="flex flex-1 overflow-auto hide-scrollbar min-h-0">
            {/* Time Column */}
            <div className="w-20 bg-gray-50 border-r border-gray-200 flex-shrink-0">
              <div className="h-10 border-b border-gray-200 text-xs text-gray-500 px-2 py-2 flex items-start">
                GMT -8
              </div>
              {timeSlots.map((time, idx) => (
                <div key={time} className="h-14 border-b border-gray-200 text-xs text-gray-500 px-2 flex items-start pt-0.5">
                  {time}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-7 w-full min-w-[720px] lg:min-w-full">
                {/* Day Headers */}
                {weekDates.map((date, idx) => {
                  const today = isToday(date);
                  return (
                    <div key={idx} className="border-r border-b border-gray-200 bg-white">
                      <div className="text-center py-3">
                        <div className={`text-xs font-semibold ${today ? 'text-blue-600' : 'text-gray-500'}`}>
                          {daysOfWeek[idx]} {date.getDate()}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Time Slots */}
                {timeSlots.map((time, timeIdx) => (
                  weekDates.map((date, dayIdx) => {
                    const today = isToday(date);
                    const event = events.find(e => e.day === dayIdx && e.start === timeIdx);
                    
                    return (
                      <div 
                        key={`${timeIdx}-${dayIdx}`} 
                        className={`h-14 border-r border-b border-gray-200 relative ${today ? 'bg-blue-50' : 'bg-white'} hover:bg-gray-50 transition-colors cursor-pointer`}
                      >
                        {event && (
                          <div className={`absolute inset-x-1 top-1 ${event.color} rounded text-white text-xs p-2 font-medium shadow-sm z-10`}
                            style={{ height: `${event.duration * 3.5}rem` }}
                          >
                            <div className="font-semibold">{event.title}</div>
                            <div className="text-xs opacity-90 mt-0.5">{time}</div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col order-2">
        {/* Mini Calendar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigateMonth(-1)} className="p-1 hover:bg-gray-100 rounded">
              <ChevronLeft size={16} />
            </button>
            <div className="text-sm font-semibold">
              {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </div>
            <button onClick={() => navigateMonth(1)} className="p-1 hover:bg-gray-100 rounded">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Mini Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-xs text-center text-gray-500 font-medium py-1">
                {day}
              </div>
            ))}
            {calendarDays.map((dayObj, idx) => {
              const dateToCheck = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), dayObj.day);
              const today = dayObj.isCurrentMonth && isToday(dateToCheck);
              
              return (
                <button
                  key={idx}
                  className={`text-xs py-1 rounded ${
                    !dayObj.isCurrentMonth 
                      ? 'text-gray-300' 
                      : today 
                      ? 'bg-blue-600 text-white font-semibold' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {dayObj.day}
                </button>
              );
            })}
          </div>
        </div>

        {/* My Calendars */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-gray-900">My Calendars</div>
            <button className="p-1 hover:bg-gray-100 rounded">
              <Settings size={16} className="text-gray-500" />
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <div className="w-3 h-3 bg-blue-400 rounded"></div>
              <span className="text-sm text-gray-700">My Events</span>
              <button className="ml-auto text-gray-400 hover:text-gray-600">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
