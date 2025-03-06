'use client';

import React, { useState, useEffect } from 'react';

interface TimeLeft {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

const CountdownTimer = () => {
  // Create a date for March 7, 2025 at 1:30 PM Eastern Time
  // Using UTC and then adjusting for Eastern Time (UTC-5)
  const eventDate = new Date(Date.UTC(2025, 2, 7, 18, 30, 0)); // March 7, 2025, 1:30 PM EST (18:30 UTC)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({});
  const [userTimeZone, setUserTimeZone] = useState("");
  
  function calculateTimeLeft(): TimeLeft {
    const difference = eventDate.getTime() - new Date().getTime();
    let timeLeft: TimeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  }

  useEffect(() => {
    // Get user's timezone
    setUserTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    
    // Initial calculation
    setTimeLeft(calculateTimeLeft());
    
    // Update countdown every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]); // Add calculateTimeLeft as a dependency

  // Format event time in user's local timezone
  const formatLocalTime = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: 'numeric',
      timeZoneName: 'short'
    };
    
    // Using UTC and then adjusting for Eastern Time (UTC-5)
    const day1Start = new Date(Date.UTC(2025, 2, 7, 18, 30, 0)); // March 7, 2025, 1:30 PM EST
    const day1End = new Date(Date.UTC(2025, 2, 7, 19, 30, 0));   // March 7, 2025, 2:30 PM EST
    const day2Start = new Date(Date.UTC(2025, 2, 8, 18, 30, 0)); // March 8, 2025, 1:30 PM EST
    const day2End = new Date(Date.UTC(2025, 2, 8, 19, 30, 0));   // March 8, 2025, 2:30 PM EST
    
    return {
      day1Start: day1Start.toLocaleString('en-US', options),
      day1End: day1End.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', timeZoneName: 'short' }),
      day2Start: day2Start.toLocaleString('en-US', options),
      day2End: day2End.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', timeZoneName: 'short' })
    };
  };

  const localTimes = formatLocalTime();

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <p className="text-lg md:text-xl text-blue-600 dark:text-blue-400 font-medium mb-2">
          Event starts in:
        </p>
        <div className="grid grid-cols-4 gap-2 md:gap-4 max-w-md mx-auto">
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg p-2 md:p-4 text-center">
            <div className="text-2xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
              {timeLeft.days || 0}
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Days</div>
          </div>
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg p-2 md:p-4 text-center">
            <div className="text-2xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
              {timeLeft.hours || 0}
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Hours</div>
          </div>
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg p-2 md:p-4 text-center">
            <div className="text-2xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
              {timeLeft.minutes || 0}
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Minutes</div>
          </div>
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg p-2 md:p-4 text-center">
            <div className="text-2xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
              {timeLeft.seconds || 0}
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Seconds</div>
          </div>
        </div>
      </div>
      
      <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg p-4 md:p-6 text-center mb-6">
        <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-800 dark:text-white">Event Times in Your Local Timezone</h3>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-2">
          <span className="font-semibold">Day 1:</span> {localTimes.day1Start} - {localTimes.day1End}
        </p>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
          <span className="font-semibold">Day 2:</span> {localTimes.day2Start} - {localTimes.day2End}
        </p>
        <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
          Times shown in your local timezone: {userTimeZone}
        </p>
      </div>
    </div>
  );
};

export default CountdownTimer; 