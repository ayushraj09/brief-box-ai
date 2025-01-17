document.addEventListener('DOMContentLoaded', function() {
  const summarizeButton = document.getElementById('summarizeButton');
  const output = document.getElementById('output');
  const slider = document.getElementById('summaryLevel');

  if (!summarizeButton || !output || !slider) {
    console.error('Required elements not found in the DOM');
    return;
  }

  summarizeButton.addEventListener('click', async () => {
    console.log('Summarize button clicked');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      output.textContent = 'No active tab found. Please try again.';
      console.error('No active tab found');
      return;
    }

    const button = document.getElementById('summarizeButton');
    summarizeButton.classList.add('loading');
    summarizeButton.textContent = 'Summarizing...';
    output.textContent = '';

    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Your existing email extraction code
          return document.body.innerText; // Example extraction
        }
      });

      if (results && results[0] && results[0].result) {
        const text = results[0].result;
        const apiUrl = 'https://summarizer-with-levels-354958375757.us-central1.run.app/summarize/';
        const summaryLevel = getSummaryLevel();
        
        try {
          let response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text, level: summaryLevel })
          });

          while (response.status === 301 || response.status === 302) {
            const location = response.headers.get('Location');
            if (!location) throw new Error('Redirect location not found');
            response = await fetch(location, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ text, level: summaryLevel })
            });
          }

          if (response.ok) {
            const data = await response.json();
            output.textContent = data.summary;
            output.classList.add('typing-effect');
          } else {
            output.textContent = 'Error: ' + response.statusText;
            console.error('API response error:', response.statusText);
          }
        } catch (error) {
          output.textContent = 'Error: ' + error.message;
          console.error('Fetch error:', error);
        }
      } else {
        console.error('No results from email extraction script');
      }
    } catch (error) {
      output.textContent = 'Error: ' + error.message;
      console.error('Script execution error:', error);
    } finally {
      button.classList.remove('loading');
      summarizeButton.textContent = 'Summarize';
      setTimeout(() => output.classList.remove('typing-effect'), 1000);
    }
  });

  function getSummaryLevel() {
    const slider = document.getElementById('summaryLevel');
    const levels = ['shortest', 'normal', 'elaborative'];
    return levels[Math.round(slider.value)];
  }

function animateText(text) {
  let index = 0;
  output.textContent = '';  // Clear output before starting the animation

  function type() {
    if (index < text.length) {
      output.textContent += text[index];
      index++;
      setTimeout(type, 2000);  // Adjust typing speed (50ms delay)
    }
  }

  type();  // Start the animation
}
});