# Your Limitless Life with God - Dashboard

Event dashboard for the "Your Limitless Life with God" virtual event on March 7-8, 2025 from 10:00 AM - 11:30 AM PST each day.

## Features

- Countdown timer to event start
- Local timezone conversion
- Email collection modal for attendee tracking
- Firebase integration for data storage
- Responsive design for all devices
- Direct access to Zoom meeting rooms

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

The following environment variables need to be set in your Vercel project:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
```

## Deployment

This project is configured for deployment on Vercel. The `vercel.json` and `next.config.js` files contain the necessary configuration for a successful build.
