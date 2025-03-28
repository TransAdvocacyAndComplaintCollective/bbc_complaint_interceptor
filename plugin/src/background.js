// background.js

// 1) Mapping the table row labels to your chosen internal field names
const mapping_to_formData = {  
  // Existing mappings (examples—rename the right side fields as you see fit)
  // Complaint
  "What is your complaint about?": "generalissue1",
  "Are you contacting us about a previous complaint?": "previous_complaint",

  // Your Complaint
  "Select the best category to describe your complaint": "complaint_category",
  "What is the subject of your complaint?": "subject",
  "Do you require a response to your complaint?": "responserequired",
  "Please enter your complaint, and please don’t add personal details such as your name, email or phone number in this field – we’ll ask you for those at the next stage": "description",

  // Your Details
  "Location": "location",
  "Title (i.e. Mr, Ms etc.)": "salutation",
  "First Name": "firstname",
  "Last Name": "lastname",
  "Email address": "emailaddress",
  "Are you under 18?": "under18",

  // TV-specific fields (if needed)
  "Which TV channel or service is your complaint about?": "tvchannel",

  // Radio / BBC Sounds-specific fields
  "What is the nature of your complaint?": "complaint_nature_sounds",
  "Which radio station is your complaint about?": "radio_station",
  "Please enter your local radio station": "localradio",

  // Website/App-specific fields
  "Which website or app is your complaint about?": "bbcwebsite_app",
  "Please give the URL, or name of the app": "sourceurl",

  // Programme details
  "What is the programme title?": "programmetitle",
  "When was it broadcast? (dd/mm/yyyy)": "transmissiondate",
  "How did you watch or listen to the programme?": "liveorondemand",
  "Roughly how far into the programme did the issue happen?": "timestamp",

  // Optionally keep placeholders for unused or future fields
  "Location": "region",
  "When did you first notice the problem?": "dateproblemstarted",
  "Please enter your local radio station": "network",
  "Which website or app is your complaint about?": "network",


  // ---- Newly added mappings ----
  "Please enter your local radio station": "network",
  "What's the issue?": "redbuttonfault",
  "This helps us trace the problem": "platform",
  "Which radio station is your complaint about?": "network",
  "Which TV channel or service is your complaint about?": "network",
  "Which website or app is your complaint about?": "network",
  "If you know, what make or model is your set top box/smart TV?": "make",
  "Please enter your complaint": "description",
  "How did you watch or listen to the programme?": "liveorondemand",
  "Case number of your previous complaint": "casenumber",
  "Email Address": "emailaddress",
  "Are you contacting us about a previous complaint?": "are_you_contacting_us_about_a_previous_complaint_",
  "When did you first notice the problem?": "dateproblemstarted",
  "What is your complaint about?": "platform",
  "Which radio station is your complaint about?": "serviceradio",
  "Which TV channel or service is your complaint about?": "servicetv",
  "Please give the URL, or name of the app": "sourceurl",
  "What is the nature of your complaint?": "what_is_the_nature_of_your_complaint_",
  // If separate mapping needed for sounds context, uncomment the next line:
  // "What is the nature of your complaint?": "what_is_the_nature_of_your_complaint_sounds",
  "Select the best category to describe your complaint": "generalissue1",
  "What is the programme title?": "programme",
  "What is the programme title?_id": "programmeid",
  "What is the subject of your complaint?": "title",
  "When was it broadcast? (dd/mm/yyyy)": "transmissiondate",
  "Roughly how far into the programme did the issue happen?": "transmissiontime",
  "Are you under 18?": "under18"
};

// 2) For cross-browser compatibility (optional)
if (typeof browser === "undefined") {
  var browser = chrome;
}

// 3) Open init/init.html on install
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    const initUrl = browser.runtime.getURL("init/init.html");
    browser.tabs.create({ url: initUrl }, (tab) => {
      if (browser.runtime.lastError) {
        console.error("Error creating init tab:", browser.runtime.lastError);
      } else {
        console.log("Init tab created successfully:", tab);
      }
    });
  }
});

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// 4) Listen for messages from the content script
browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  let privacyPolicyAccepted = false;
  try {
    const result = await browser.storage.local.get("privacyPolicyAccepted");
    privacyPolicyAccepted = result.privacyPolicyAccepted || false;
  } catch (error) {
    console.error("Error checking privacy policy status:", error);
  }
  if (privacyPolicyAccepted === false) {
    return;
  }


  if (message.action === "sendText") {
    const allReviewTableData = message.allReviewTableData;

    // Create a container object for the parsed data
    const parsedData = {
      // Optionally store the raw table data for reference
      formData: {},
    };

    // 5) Map the table data keys to your form fields
    for (const key in allReviewTableData) {
      const mappedField = mapping_to_formData[key];
      if (mappedField) {
        // If we have a known mapping, place it under that field name
        parsedData.formData[mappedField] = allReviewTableData[key];
      } else {
        // If no mapping is found, store under the original key
        parsedData.formData[key] = allReviewTableData[key];
      }
    }
    parsedData.formData["captcha"] =  "Chrome" + generateRandomString(64);

    // 6) Grab the page URL from the sender.tab object (optional)
    const originUrl = sender?.tab?.url ? sender.tab.url : "";

    // Log for debugging (optional)
    console.log("Captured Review Table Data:", allReviewTableData);
    console.log("parsedData object:", parsedData);
    console.log("URL of the page:", originUrl);

    // 7) Convert your parsedData to a JSON string
    const dataToCopy = JSON.stringify(parsedData);

    // 8) Construct the confirmation page URL
    const confirmationUrl = `${browser.runtime.getURL(
      "confirmation/confirmation.html"
    )}?originUrl=${encodeURIComponent(originUrl)}&data=${encodeURIComponent(dataToCopy)}`;

    // 9) Open the confirmation page in a new tab
    browser.tabs.create({ url: confirmationUrl }, (tab) => {
      if (browser.runtime.lastError) {
        console.error("Error creating tab:", browser.runtime.lastError);
      } else {
        console.log("Tab created successfully:", tab);
      }
    });

    // 10) Finally, send a success response back to the content script
    sendResponse({ status: "success" });
  }

  // Since we're using an async listener, no need to return true here.
});