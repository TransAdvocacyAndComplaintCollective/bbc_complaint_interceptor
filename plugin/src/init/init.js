// Function to handle the button click event
function handlePrivacyPolicyClick(event) {
    // Once clicked, store acceptance in chrome.storage
    chrome.storage.local.set({ privacyPolicyAccepted: true }, () => {
        if (chrome.runtime.lastError) {
            console.error('Error setting privacy policy in storage:', chrome.runtime.lastError);
        } else {
            console.log('Privacy policy accepted');
            
            // Optionally disable the button and change its text
            // (If you do an immediate redirect, the user won't see this.)
            event.target.disabled = true;
            event.target.textContent = 'Privacy Policy Accepted';
            
            // Navigate to /help/help.html
            window.location.href = '/help/help.html';
        }
    });
}

// Add event listener after DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const privacyButton = document.getElementById('privacyButton');

    // Check previous state from storage
    chrome.storage.local.get('privacyPolicyAccepted', (result) => {
        if (chrome.runtime.lastError) {
            console.error('Error retrieving privacy policy state:', chrome.runtime.lastError);
        } else {
            // If already accepted, disable the button and update text
            if (result.privacyPolicyAccepted) {
                privacyButton.disabled = true;
                privacyButton.textContent = 'Privacy Policy Accepted';
            }
        }
    });

    // Attach the event listener to the button
    privacyButton.addEventListener('click', handlePrivacyPolicyClick);
});
