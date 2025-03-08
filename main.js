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

    const content = await new Promise((resolve, reject) => {
      https.get(url, options, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          https.get(res.headers.location, options, (redirectRes) => {
            let data = '';
            redirectRes.on('data', chunk => data += chunk);
            redirectRes.on('end', () => {
              try {
                const rawContent = extractPreContent(data);
                if (rawContent) {
                  const tempFile = path.join(app.getPath('temp'), 'faq_content.txt');
                  fs.writeFileSync(tempFile, rawContent, 'utf8');
                  resolve(tempFile);
                } else {
                  reject(new Error('Could not find FAQ content. Make sure this is a valid GameFAQs FAQ page.'));
                }
              } catch (e) {
                reject(e);
              }
            });
          }).on('error', reject);
          return;
        }

        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const rawContent = extractPreContent(data);
            if (rawContent) {
              const tempFile = path.join(app.getPath('temp'), 'faq_content.txt');
              fs.writeFileSync(tempFile, rawContent, 'utf8');
              resolve(tempFile);
            } else {
              reject(new Error('Could not find FAQ content. Make sure this is a valid GameFAQs FAQ page.'));
            }
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });

    // Read the content from the temp file
    return fs.readFileSync(content, 'utf8');
  } catch (error) {
    console.error('Error loading URL:', error);
    return `Error loading FAQ: ${error.message}. Please make sure this is a valid GameFAQs FAQ page.`;
  }
}); 