import { GeneratedProject, GeneratedFile } from './types';

export class ProjectExporter {
  /**
   * Export project as structured file manifest
   * Useful for writing to disk or pushing to GitHub
   */
  static getFileManifest(project: GeneratedProject): Map<string, string> {
    const manifest = new Map<string, string>();

    project.files.forEach(file => {
      manifest.set(file.path, file.content);
    });

    return manifest;
  }

  /**
   * Generate a tree-like structure preview
   */
  static generateTreePreview(project: GeneratedProject, maxDepth: number = 3): string {
    const paths = project.files.map(f => f.path).sort();
    const tree: Record<string, any> = {};

    paths.forEach(path => {
      const parts = path.split('/');
      let current = tree;

      parts.forEach((part, i) => {
        if (i === parts.length - 1) {
          current[part] = true; // leaf node
        } else {
          current[part] = current[part] || {};
          current = current[part];
        }
      });
    });

    return this.formatTree(tree, '', maxDepth, 0);
  }

  private static formatTree(
    obj: any,
    prefix: string,
    maxDepth: number,
    depth: number
  ): string {
    if (depth > maxDepth) return '';

    const keys = Object.keys(obj);
    let output = '';

    keys.forEach((key, i) => {
      const isLast = i === keys.length - 1;
      const connector = isLast ? '└── ' : '├── ';

      output += prefix + connector + key;

      if (obj[key] === true) {
        output += '\n';
      } else if (typeof obj[key] === 'object') {
        output += '/\n';
        const extension = isLast ? '    ' : '│   ';
        output += this.formatTree(obj[key], prefix + extension, maxDepth, depth + 1);
      }
    });

    return output;
  }

  /**
   * Generate project summary stats
   */
  static getSummary(project: GeneratedProject): string {
    const filesByType: Record<string, number> = {};

    project.files.forEach(file => {
      const ext = file.path.split('.').pop() || 'no-ext';
      filesByType[ext] = (filesByType[ext] || 0) + 1;
    });

    let summary = `Project: ${project.name}\n`;
    summary += `Total Files: ${project.summary.totalFiles}\n`;
    summary += `API Endpoints: ${project.summary.apiEndpoints}\n`;
    summary += `Components: ${project.summary.components}\n\n`;

    summary += 'Technologies:\n';
    project.summary.technologies.forEach(tech => {
      summary += `  - ${tech}\n`;
    });

    summary += '\nFile Types:\n';
    Object.entries(filesByType)
      .sort((a, b) => b[1] - a[1])
      .forEach(([ext, count]) => {
        summary += `  - .${ext}: ${count} file(s)\n`;
      });

    return summary;
  }

  /**
   * Generate GitHub repository structure for quick visualization
   */
  static generateGithubTreeUrl(project: GeneratedProject): string {
    // This would be used to create a GitHub API tree request
    const paths = project.files.map(f => ({
      path: f.path,
      type: 'blob',
      sha: this.simpleSha(f.content),
    }));

    return JSON.stringify(paths, null, 2);
  }

  private static simpleSha(content: string): string {
    // Simple hash for demonstration
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
    }
    return Math.abs(hash).toString(16).slice(0, 7);
  }
}

/**
 * Convert generated project to JSON format for storage
 */
export function serializeProject(project: GeneratedProject): string {
  const serialized = {
    name: project.name,
    summary: project.summary,
    files: project.files.map(f => ({
      path: f.path,
      content: f.content,
      language: f.language,
      size: f.content.length,
    })),
  };

  return JSON.stringify(serialized, null, 2);
}

/**
 * Convert JSON back to GeneratedProject
 */
export function deserializeProject(json: string): GeneratedProject {
  const data = JSON.parse(json);

  return {
    name: data.name,
    summary: data.summary,
    files: data.files.map((f: any) => ({
      path: f.path,
      content: f.content,
      language: f.language,
    })),
  };
}
