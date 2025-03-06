'use client';

import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface EmailModalProps {
  onClose: () => void;
}

const EmailModal: React.FC<EmailModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Store in localStorage first to ensure we capture the data
      localStorage.setItem('eventUserEmail', email);
      if (name) localStorage.setItem('eventUserName', name);
      
      // Try to add user to Firestore with retry logic
      const maxRetries = 3;
      let firestoreSuccess = false;
      
      for (let attempt = 0; attempt < maxRetries && !firestoreSuccess; attempt++) {
        try {
          // Use a document ID based on email to prevent duplicates
          const docId = email.replace(/[.#$\/[\]]/g, '_');
          
          await setDoc(doc(db, 'attendees', docId), {
            email,
            name: name || null,
            timestamp: serverTimestamp(),
            userAgent: navigator.userAgent,
            referrer: document.referrer || null,
            lastUpdated: new Date().toISOString(),
          }, { merge: true });
          
          console.log('Successfully saved to Firestore');
          firestoreSuccess = true;
        } catch (firestoreError) {
          console.warn(`Firebase write attempt ${attempt + 1} failed:`, firestoreError);
          setRetryCount(attempt + 1);
          
          // Wait before retrying
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          }
        }
      }
      
      if (!firestoreSuccess) {
        console.warn('All Firebase write attempts failed, continuing with localStorage only');
      }
      
      // Show success regardless of Firestore success
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error in form submission:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 md:p-8">
        {success ? (
          <div className="text-center">
            <div className="text-green-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Thank You!</h2>
            <p className="text-gray-600 dark:text-gray-300">You're all set to access the dashboard.</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Welcome</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Enter your email to access the dashboard.
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Your name"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="you@example.com"
                  required
                />
                {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (retryCount > 0 ? `Retrying (${retryCount})...` : 'Submitting...') : 'Continue'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailModal; 