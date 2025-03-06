// Zapier Firebase Firestore Query
// Use this in Zapier's "Run JavaScript" action to query your Firestore database

const zapierFirestoreQuery = {
  // Required: Specify the collection to query
  collection: "attendees",
  
  // Optional: Limit the number of results (default is 50 in Zapier)
  limit: 100,
  
  // Optional: Order results by a specific field
  orderBy: {
    field: "timestamp",
    direction: "desc" // Use "asc" for ascending, "desc" for descending
  },
  
  // Optional: Filter results (uncomment and modify as needed)
  // where: [
  //   // Example: Only get records where buttonClicked is true
  //   ["buttonClicked", "==", true]
  //   
  //   // Example: Only get records from the last 24 hours
  //   // ["timestamp", ">", new Date(Date.now() - 86400000)]
  // ]
};

// Sample code for Zapier's "Run JavaScript" action
// This will extract just the email addresses from the results
// Uncomment and use this in Zapier if you only want the email addresses

/*
const results = inputData.results; // This will contain your Firestore query results
const emails = results.map(record => record.email);
return { emails };
*/

// Sample code for Zapier's "Run JavaScript" action
// This will format the data for easy use in email marketing tools
// Uncomment and use this in Zapier if you want formatted data for email marketing

/*
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
*/

module.exports = zapierFirestoreQuery; 