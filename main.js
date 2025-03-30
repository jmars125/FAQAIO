const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { JSDOM } = require('jsdom');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('open-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Text Files', extensions: ['txt'] }]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const content = fs.readFileSync(result.filePaths[0], 'utf8');
    return content;
  }
  return null;
});

function extractPreContent(html) {
  const preRegex = /<pre\b[^>]*>([\s\S]*?)<\/pre>/gi;
  let matches = [];
  let match;
  
  while ((match = preRegex.exec(html)) !== null) {
    let content = match[1]
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
    
    if (content.trim()) {
      matches.push(content);
    }
  }
  
  return matches.length > 0 ? matches.join('\n') : null;
}

function parseFaqContent(content) {
  const sections = [];
  const lines = content.split('\n');
  let currentSection = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const sectionMatch = line.match(/\[([A-Z0-9]{4})\]/);
    if (sectionMatch) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        code: sectionMatch[1],
        title: line.replace(/\[([A-Z0-9]{4})\]/, '').trim(),
        content: []
      };
    } else if (currentSection) {
      currentSection.content.push(line);
    }
  }
  
  if (currentSection) {
    sections.push(currentSection);
  }
  
  return sections;
}

ipcMain.handle('load-url', async (event, url) => {
  try {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
      }
    };

    const fetchedContent = await new Promise((resolve, reject) => {
      const requestUrl = new URL(url); // Use URL object for easier handling
      const getRequest = (currentUrl, currentOptions, callback) => {
        https.get(currentUrl, currentOptions, (res) => {
          // Handle redirects
          if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
            console.log(`Redirecting to: ${res.headers.location}`);
            // Ensure the location is a full URL
            const redirectUrl = new URL(res.headers.location, currentUrl.origin);
            getRequest(redirectUrl, currentOptions, callback); // Follow redirect recursively
            return;
          }

          // Check for non-200 status codes
          if (res.statusCode !== 200) {
            reject(new Error(`HTTP Error: ${res.statusCode} ${res.statusMessage}`));
            return;
          }

          const contentType = res.headers['content-type'] || '';
          let data = '';
          res.setEncoding('utf8'); // Ensure correct encoding
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              let faqContent = null;
              if (contentType.includes('text/plain')) {
                console.log('Detected text/plain content.');
                faqContent = data; // Use raw data for plain text
              } else if (contentType.includes('text/html')) {
                console.log('Detected text/html content. Extracting <pre> tags.');
                faqContent = extractPreContent(data); // Try extracting from <pre> for HTML
              } else {
                 console.log(`Unexpected Content-Type: ${contentType}. Attempting <pre> extraction as fallback.`);
                 faqContent = extractPreContent(data); // Fallback for unknown types
              }

              if (faqContent && faqContent.trim()) {
                resolve(faqContent); // Resolve directly with the content string
              } else {
                reject(new Error('Could not find readable FAQ content in the page.'));
              }
            } catch (e) {
              reject(e);
            }
          });
        }).on('error', reject);
      };

      getRequest(requestUrl, options, resolve); // Initial request
    });

    return fetchedContent; // Return the fetched content string directly
  } catch (error) {
    console.error('Error loading URL:', error);
    // Use a more generic error message
    return `Error loading FAQ: ${error.message}. Please check the URL and ensure it points to a readable FAQ.`;
  }
});
