import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

interface AccessibilityResult {
  url: string;
  violations: number;
  passes: number;
  incomplete: number;
  timestamp: string;
}

export async function generateAccessibilityReport(
  results: AccessibilityResult[],
): Promise<void> {
  const reportDir = path.join(process.cwd(), 'accessibility-report');

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Accessibility Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #4CAF50; color: white; }
          .pass { color: green; }
          .fail { color: red; }
        </style>
      </head>
      <body>
        <h1>Accessibility Report</h1>
        <p>Generated: ${new Date().toISOString()}</p>
        <table>
          <tr>
            <th>URL</th>
            <th>Violations</th>
            <th>Passes</th>
            <th>Incomplete</th>
          </tr>
          ${results
            .map(
              (r) => `
            <tr>
              <td>${r.url}</td>
              <td class="${r.violations > 0 ? 'fail' : 'pass'}">${r.violations}</td>
              <td class="pass">${r.passes}</td>
              <td>${r.incomplete}</td>
            </tr>
          `,
            )
            .join('')}
        </table>
      </body>
    </html>
  `;

  fs.writeFileSync(path.join(reportDir, 'index.html'), html);
}
