'use client';

import Image from "next/image";
import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import CountdownWrapper from "@/components/CountdownWrapper";
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, setDoc, doc, getDoc, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Main stage Zoom URL
const MAIN_STAGE_URL = "https://us02web.zoom.us/j/83407380871";
// Overflow room URL (to be defined)
const OVERFLOW_ROOM_URL = "https://us02web.zoom.us/j/83407380871"; // Using same URL for now

export default function Home() {
  const [isJoining, setIsJoining] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [eventDay, setEventDay] = useState<number | null>(null);
  const [showOverflowButton, setShowOverflowButton] = useState(false);
  const [isJoiningOverflow, setIsJoiningOverflow] = useState(false);

  useEffect(() => {
    // Determine which day of the event it is
    const today = new Date();
    const day1 = new Date("March 7, 2025");
    const day2 = new Date("March 8, 2025");
    
    // Reset hours, minutes, seconds for date comparison
    day1.setHours(0, 0, 0, 0);
    day2.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    if (today.getTime() === day1.getTime()) {
      setEventDay(1);
      checkDailyClickCount(1);
    } else if (today.getTime() === day2.getTime()) {
      setEventDay(2);
      checkDailyClickCount(2);
    } else {
      // If not on event day, show countdown
      setEventDay(null);
    }
  }, []);

  // Check if we've reached 5000 clicks for the current day
  const checkDailyClickCount = async (day: number) => {
    try {
      // Get today's date at midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get tomorrow's date at midnight
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Create a query to count clicks for the current day
      const attendeesRef = collection(db, 'attendees');
      const q = query(
        attendeesRef,
        where("buttonClicked", "==", true),
        where("buttonClickTimestamp", ">=", today),
        where("buttonClickTimestamp", "<", tomorrow),
        where("eventDay", "==", day)
      );
      
      try {
        // Get the count of documents that match the query
        const snapshot = await getCountFromServer(q);
        const clickCount = snapshot.data().count;
        
        // Show overflow button if we've reached 5000 clicks
        if (clickCount >= 5000) {
          setShowOverflowButton(true);
        }
        
        // Set up a timer to check again every 5 minutes
        const checkInterval = setInterval(async () => {
          try {
            const updatedSnapshot = await getCountFromServer(q);
            const updatedClickCount = updatedSnapshot.data().count;
            
            if (updatedClickCount >= 5000) {
              setShowOverflowButton(true);
              clearInterval(checkInterval); // Stop checking once we've reached the threshold
            }
          } catch (error) {
            console.warn("Error checking click count:", error);
          }
        }, 5 * 60 * 1000); // Check every 5 minutes
        
        // Clean up interval on unmount
        return () => clearInterval(checkInterval);
      } catch (countError) {
        console.warn("Error getting count from server:", countError);
        // Fallback to client-side tracking if Firestore fails
        const clickCountKey = `eventClickCount_day${day}`;
        const storedCount = localStorage.getItem(clickCountKey);
        if (storedCount && parseInt(storedCount) >= 5000) {
          setShowOverflowButton(true);
        }
      }
    } catch (error) {
      console.warn("Error in checkDailyClickCount:", error);
    }
  };

  const handleJoinEvent = async () => {
    setIsJoining(true);
    setRetryCount(0);
    
    try {
      // Get user email from localStorage
      const userEmail = localStorage.getItem('eventUserEmail');
      
      // Track click in localStorage regardless of Firestore success
      localStorage.setItem('eventButtonClicked', 'true');
      localStorage.setItem('eventButtonClickTimestamp', new Date().toISOString());
      
      // Increment local click counter for the current day
      if (eventDay) {
        const clickCountKey = `eventClickCount_day${eventDay}`;
        const currentCount = localStorage.getItem(clickCountKey) || '0';
        const newCount = parseInt(currentCount) + 1;
        localStorage.setItem(clickCountKey, newCount.toString());
        
        // Show overflow button if we've reached 5000 clicks locally
        if (newCount >= 5000) {
          setShowOverflowButton(true);
        }
      }
      
      if (userEmail) {
        // Try to update Firestore with retry logic
        const maxRetries = 3;
        let firestoreSuccess = false;
        
        for (let attempt = 0; attempt < maxRetries && !firestoreSuccess; attempt++) {
          try {
            // Use a document ID based on email to prevent duplicates
            const docId = userEmail.replace(/[.#$\/[\]]/g, '_');
            
            await setDoc(doc(db, 'attendees', docId), {
              email: userEmail,
              buttonClicked: true,
              buttonClickTimestamp: serverTimestamp(),
              lastUpdated: new Date().toISOString(),
              userAgent: navigator.userAgent,
              referrer: document.referrer || null,
              eventDay: eventDay,
            }, { merge: true });
            
            console.log('Successfully updated Firestore with button click');
            firestoreSuccess = true;
          } catch (firestoreError) {
            console.warn(`Firebase update attempt ${attempt + 1} failed:`, firestoreError);
            setRetryCount(attempt + 1);
            
            // Wait before retrying
            if (attempt < maxRetries - 1) {
              await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            }
          }
        }
        
        if (!firestoreSuccess) {
          console.warn('All Firebase update attempts failed, continuing with localStorage only');
        }
      }
      
      // Short delay before redirecting to give Firebase a chance to update
      setTimeout(() => {
        // Open the Zoom meeting in a new tab
        window.open(MAIN_STAGE_URL, '_blank');
        setIsJoining(false);
      }, 500);
    } catch (error) {
      console.error('Error handling button click:', error);
      setIsJoining(false);
      
      // If there's an error, still try to redirect the user
      window.open(MAIN_STAGE_URL, '_blank');
    }
  };

  const handleJoinOverflow = async () => {
    setIsJoiningOverflow(true);
    
    try {
      // Get user email from localStorage
      const userEmail = localStorage.getItem('eventUserEmail');
      
      // Track overflow click in localStorage
      localStorage.setItem('eventOverflowButtonClicked', 'true');
      localStorage.setItem('eventOverflowButtonClickTimestamp', new Date().toISOString());
      
      if (userEmail) {
        // Try to update Firestore with overflow click info
        try {
          // Use a document ID based on email to prevent duplicates
          const docId = userEmail.replace(/[.#$\/[\]]/g, '_');
          
          await setDoc(doc(db, 'attendees', docId), {
            email: userEmail,
            overflowButtonClicked: true,
            overflowButtonClickTimestamp: serverTimestamp(),
            lastUpdated: new Date().toISOString(),
            eventDay: eventDay,
          }, { merge: true });
          
          console.log('Successfully updated Firestore with overflow button click');
        } catch (firestoreError) {
          console.warn('Failed to update Firestore with overflow click:', firestoreError);
        }
      }
      
      // Short delay before redirecting to give Firebase a chance to update
      setTimeout(() => {
        // Open the overflow room in a new tab
        window.open(OVERFLOW_ROOM_URL, '_blank');
        setIsJoiningOverflow(false);
      }, 500);
    } catch (error) {
      console.error('Error handling overflow button click:', error);
      setIsJoiningOverflow(false);
      
      // If there's an error, still try to redirect the user
      window.open(OVERFLOW_ROOM_URL, '_blank');
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/header-bg.jpg" 
          alt="Event background" 
          fill 
          priority
          className="object-cover"
          quality={100}
        />
        <div className="absolute inset-0 bg-black/40 dark:bg-black/60"></div>
      </div>
      
      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center">
        <div className="max-w-3xl mx-auto">
          {eventDay && (
            <p className="text-lg md:text-xl text-blue-300 mb-2 font-medium">
              You're in the right place for day {eventDay} of
            </p>
          )}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Your Limitless Life with God
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-8">
            Join us on Friday, March 7th & Saturday, March 8th, 2025 for an inspiring event that will transform your relationship with God.
          </p>
          
          {/* Countdown Timer */}
          <Suspense fallback={<div className="w-full h-32 bg-white/20 rounded-lg animate-pulse"></div>}>
            <CountdownWrapper />
          </Suspense>
          
          {/* Main Stage Button - MUCH BIGGER */}
          <button 
            onClick={handleJoinEvent}
            disabled={isJoining}
            className="mt-8 w-full md:w-4/5 lg:w-3/4 mx-auto px-8 py-6 md:py-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 text-xl md:text-2xl lg:text-3xl flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isJoining ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {retryCount > 0 ? `Retrying (${retryCount})...` : 'Joining...'}
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10 mr-3 md:mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Join the Event Main Stage
              </>
            )}
          </button>
          
          {/* Overflow Button - Only shows after 5000 clicks per day */}
          {showOverflowButton && (
            <button 
              onClick={handleJoinOverflow}
              disabled={isJoiningOverflow}
              className="mt-4 w-full md:w-3/5 lg:w-2/3 mx-auto px-6 py-4 md:py-5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all text-lg md:text-xl flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isJoiningOverflow ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Joining Overflow...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-7 md:w-7 mr-2 md:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                  Event Room Full? Join the Overflow
                </>
              )}
            </button>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-6 px-6 md:px-12 bg-black/50 backdrop-blur-sm border-t border-white/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/80 mb-4 md:mb-0">© 2025 Your Limitless Life with God. All rights reserved.</p>
          <div className="flex space-x-4">
            <Link href="#" className="text-white/80 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-white/80 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-white/80 hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
