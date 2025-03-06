# Zapier Integration for Event Dashboard

This guide explains how to integrate your Event Dashboard's Firebase Firestore database with Zapier to extract attendee emails and other data.

## Prerequisites

1. A Zapier account
2. Access to your Firebase project
3. Firebase service account credentials

## Setting Up Firebase in Zapier

1. **Create a Firebase Service Account**:
   - Go to your [Firebase Console](https://console.firebase.google.com/)
   - Navigate to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file securely

2. **Add Firebase Integration in Zapier**:
   - In Zapier, create a new Zap
   - Search for and select "Firebase Firestore" as your app
   - Connect your Firebase account using the service account JSON file
   - Select your project ID

## Querying Attendee Data

### Option 1: Using the Firestore Query Action

1. Select "Query Documents" as your action
2. Configure the query using these settings:
   - **Collection**: `attendees`
   - **Limit**: `100` (or your preferred number)
   - **Order By Field**: `timestamp`
   - **Order Direction**: `desc`
   - **Where Field** (optional): `buttonClicked`
   - **Where Operator** (optional): `==`
   - **Where Value** (optional): `true`

### Option 2: Using the Code Action with Our Query

1. Select "Run JavaScript" as your action
2. Copy the contents of `zapier-firebase-query.js` into the Code field
3. Modify the query parameters as needed
4. Add another "Run JavaScript" step to process the results

## Processing the Results

After retrieving the data, you can:

1. **Extract Just Emails**:
   ```javascript
   const results = inputData.results; // This will contain your Firestore query results
   const emails = results.map(record => record.email);
   return { emails };
   ```

2. **Format Data for Email Marketing**:
   ```javascript
   const results = inputData.results; // This will contain your Firestore query results
   const formattedData = results.map(record => {
     return {
       email: record.email,
       name: record.name || '',
       joined_date: record.timestamp ? new Date(record.timestamp).toISOString() : new Date().toISOString(),
       clicked_button: record.buttonClicked || false,
       button_click_time: record.buttonClickTimestamp ? new Date(record.buttonClickTimestamp).toISOString() : null
     };
   });
   return { contacts: formattedData };
   ```

## Example Zap Workflows

### Send Emails to New Attendees

1. Trigger: Schedule (e.g., every day at 9 AM)
2. Action: Query Firestore for attendees from the last 24 hours
3. Action: Format the data for your email marketing tool
4. Action: Add subscribers to your email marketing platform (Mailchimp, ConvertKit, etc.)

### Follow Up with Attendees Who Clicked the Button

1. Trigger: Schedule (e.g., every hour)
2. Action: Query Firestore for attendees where `buttonClicked` is true
3. Action: Filter for records where `buttonClickTimestamp` is within the last hour
4. Action: Send a follow-up email or SMS

## Security Considerations

- Keep your Firebase service account credentials secure
- Consider setting up a dedicated service account with limited permissions
- Implement rate limiting in your Zaps to avoid excessive database reads

## Troubleshooting

- **No Results**: Check your query parameters and ensure data exists in your Firestore database
- **Authentication Errors**: Verify your service account has the correct permissions
- **Formatting Issues**: Check the structure of your Firestore documents against your code

For more help, refer to the [Zapier Firebase Firestore Documentation](https://zapier.com/apps/firebase-firestore/integrations) or the [Firebase Documentation](https://firebase.google.com/docs/firestore). 