import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SavedBlueprint } from '@/types/blueprint';

// Export blueprint as PDF
export const exportToPDF = async (blueprint: SavedBlueprint): Promise<void> => {
  const element = document.getElementById('blueprint-content');
  if (!element) {
    throw new Error('Blueprint content not found');
  }

  // Create canvas from HTML
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#111827',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const imgWidth = 210; // A4 width in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  // Add first page
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= 297; // A4 height in mm

  // Add more pages if needed
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= 297;
  }

  // Add metadata
  pdf.setProperties({
    title: blueprint.vibe,
    author: 'VibeCode Mentor',
    subject: 'Project Blueprint',
    creator: 'VibeCode Mentor',
  });

  pdf.save(`${blueprint.vibe.toLowerCase().replace(/\s+/g, '-')}-blueprint.pdf`);
};

// Export blueprint to Notion (via API)
export const exportToNotion = async (blueprint: SavedBlueprint, notionToken: string, pageId: string): Promise<string> => {
  // This would require Notion integration token and page ID
  // For now, return the Notion URL format
  const response = await fetch('/api/export/notion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      blueprint,
      token: notionToken,
      pageId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to export to Notion');
  }

  const data = await response.json();
  return data.url;
};

// Create GitHub repository from blueprint
export const createGitHubRepo = async (
  blueprint: SavedBlueprint,
  githubToken: string,
  repoName: string,
  isPrivate: boolean = false
): Promise<string> => {
  const response = await fetch('/api/export/github-repo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      blueprint,
      token: githubToken,
      repoName,
      isPrivate,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create GitHub repository');
  }

  const data = await response.json();
  return data.repoUrl;
};

// Copy blueprint as markdown
export const copyAsMarkdown = (blueprint: string): Promise<void> => {
  return navigator.clipboard.writeText(blueprint);
};

// Download blueprint as markdown file
export const downloadAsMarkdown = (blueprint: SavedBlueprint): void => {
  const blob = new Blob([blueprint.blueprint], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${blueprint.vibe.toLowerCase().replace(/\s+/g, '-')}-blueprint.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
