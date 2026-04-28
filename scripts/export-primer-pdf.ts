import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

const md = readFileSync('docs/technical-primer.md', 'utf-8');

function mdToHtml(src: string): string {
  return (
    src
      .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/^---$/gm, '<hr>')
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      .replace(/^\|(.+)\|$/gm, (_, cells) => {
        const tds = cells
          .split('|')
          .map((c: string) => `<td>${c.trim()}</td>`)
          .join('');
        return `<tr>${tds}</tr>`;
      })
      .replace(/(<tr>[\s\S]*?<\/tr>\n?)+/g, (m) => `<table>${m}</table>`)
      .replace(/<tr>(<td>[-: ]+<\/td>)+<\/tr>/g, '')
      // biome-ignore lint/correctness/noEmptyCharacterClassInRegex: [^] intentionally matches any char including newlines
      .replace(/(?:^|\n\n)((?!<[a-z])[^]+?)(?=\n\n|$)/g, (_, p) => `<p>${p.trim()}</p>`)
  );
}

const body = mdToHtml(md);

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px; line-height: 1.65; color: #1a1a1a;
    padding: 48px 56px; max-width: 780px; margin: 0 auto;
  }
  h1 { font-size: 22px; font-weight: 700; margin: 0 0 6px; color: #111; }
  h2 { font-size: 16px; font-weight: 700; margin: 32px 0 10px; color: #111;
       border-bottom: 1.5px solid #e0d8cc; padding-bottom: 4px; }
  h3 { font-size: 14px; font-weight: 600; margin: 20px 0 6px; color: #333; }
  p  { margin: 8px 0; }
  ul { margin: 6px 0 6px 20px; }
  li { margin: 3px 0; }
  strong { font-weight: 600; }
  code { font-family: 'Menlo','Consolas',monospace; font-size: 11.5px;
         background: #f5f2ee; padding: 1px 4px; border-radius: 3px; }
  pre { background: #f5f2ee; border-radius: 5px; padding: 12px 14px;
        margin: 10px 0; font-size: 11px; line-height: 1.5; }
  pre code { background: none; padding: 0; }
  hr { border: none; border-top: 1px solid #e0d8cc; margin: 28px 0; }
  blockquote { border-left: 3px solid #c4a060; margin: 10px 0;
               padding: 4px 12px; color: #555; font-style: italic; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 12px; }
  td { border: 1px solid #ddd; padding: 5px 10px; }
  tr:first-child td { background: #f5f2ee; font-weight: 600; }
</style>
</head>
<body>${body}</body>
</html>`;

const htmlPath = 'C:\\Users\\victor\\AppData\\Local\\Temp\\colourmap-primer.html';
const pdfPath = 'C:\\Users\\victor\\Downloads\\colourmap-technical-primer.pdf';

writeFileSync(htmlPath, html);

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
execSync(
  `"${chrome}" --headless=new --disable-gpu --no-sandbox --print-to-pdf="${pdfPath}" --no-margins "file:///${htmlPath.replace(/\\/g, '/')}"`,
  { stdio: 'inherit', timeout: 30000 },
);

console.log(`Saved → ${pdfPath}`);
