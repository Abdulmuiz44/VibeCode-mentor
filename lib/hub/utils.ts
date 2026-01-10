/**
 * Hub Utilities - Helper functions for the platform
 */

/**
 * Generate URL-friendly slug from text
 */
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 50);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    const intervals: { [key: string]: number } = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
    };

    for (const [key, value] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / value);
        if (interval >= 1) {
            return `${interval} ${key}${interval !== 1 ? 's' : ''} ago`;
        }
    }

    return 'just now';
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Determine language from file extension
 */
export function detectLanguageFromFile(filename: string): string {
    const ext = getFileExtension(filename);

    const languageMap: { [key: string]: string } = {
        js: 'javascript',
        ts: 'typescript',
        jsx: 'javascript',
        tsx: 'typescript',
        py: 'python',
        java: 'java',
        go: 'go',
        rs: 'rust',
        cs: 'csharp',
        php: 'php',
        rb: 'ruby',
        sql: 'sql',
        json: 'json',
        yaml: 'yaml',
        yml: 'yaml',
        html: 'html',
        css: 'css',
        scss: 'scss',
        sass: 'scss',
        md: 'markdown',
        dockerfile: 'dockerfile',
        sh: 'shell',
        bash: 'shell',
        zsh: 'shell',
    };

    return languageMap[ext] || 'other';
}

/**
 * Get icon for file type
 */
export function getFileIcon(filename: string): string {
    const ext = getFileExtension(filename);

    const iconMap: { [key: string]: string } = {
        js: '📄',
        ts: '📘',
        jsx: '⚛️',
        tsx: '⚛️',
        py: '🐍',
        java: '☕',
        go: '🐹',
        rs: '🦀',
        cs: '🔷',
        php: '🐘',
        rb: '💎',
        sql: '🗄️',
        json: '📋',
        yaml: '📝',
        yml: '📝',
        html: '🌐',
        css: '🎨',
        scss: '🎨',
        sass: '🎨',
        md: '📖',
        dockerfile: '🐳',
        sh: '⚙️',
        bash: '⚙️',
        env: '🔐',
    };

    return iconMap[ext] || '📁';
}

/**
 * Get color for language
 */
export function getLanguageColor(language: string): string {
    const colorMap: { [key: string]: string } = {
        javascript: '#f1e05a',
        typescript: '#3178c6',
        python: '#3572A5',
        java: '#b07219',
        go: '#00ADD8',
        rust: '#ce422b',
        csharp: '#239120',
        php: '#777bb4',
        ruby: '#cc342d',
        sql: '#336791',
        json: '#c6c6c6',
        yaml: '#cb171e',
        html: '#e34c26',
        css: '#563d7c',
        scss: '#c6538c',
        markdown: '#083fa1',
        dockerfile: '#384d54',
        shell: '#89e051',
    };

    return colorMap[language] || '#6b7280';
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Generate random ID
 */
export function generateId(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Truncate text
 */
export function truncateText(text: string, length: number = 100): string {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

/**
 * Highlight code (simple implementation - can be enhanced with highlight.js)
 */
export function highlightCode(code: string, language: string): string {
    // Basic syntax highlighting - can be replaced with highlight.js for production
    return code;
}

/**
 * Parse markdown to extract metadata
 */
export function parseMarkdownFrontmatter(
    content: string
): { metadata: Record<string, any>; content: string } {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (!match) {
        return { metadata: {}, content };
    }

    const metadata: Record<string, any> = {};
    const lines = match[1].split('\n');

    for (const line of lines) {
        const [key, value] = line.split(':');
        if (key && value) {
            metadata[key.trim()] = value.trim();
        }
    }

    return { metadata, content: match[2] };
}

/**
 * Count lines of code
 */
export function countLines(content: string): number {
    return content.split('\n').length;
}

/**
 * Extract imports from code
 */
export function extractImports(code: string, language: string): string[] {
    const imports: Set<string> = new Set();

    if (language === 'javascript' || language === 'typescript') {
        const importRegex = /import\s+(?:{[^}]*}|[^from]*?)\s+from\s+['"]([^'"]+)['"]/g;
        let match;
        while ((match = importRegex.exec(code)) !== null) {
            imports.add(match[1]);
        }

        const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
        while ((match = requireRegex.exec(code)) !== null) {
            imports.add(match[1]);
        }
    } else if (language === 'python') {
        const importRegex = /(?:from|import)\s+([a-zA-Z0-9._]+)/g;
        let match;
        while ((match = importRegex.exec(code)) !== null) {
            imports.add(match[1]);
        }
    }

    return Array.from(imports);
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Merge objects
 */
export function mergeObjects<T>(obj1: T, obj2: Partial<T>): T {
    return { ...obj1, ...obj2 };
}

/**
 * Check if object is empty
 */
export function isEmpty(obj: any): boolean {
    if (typeof obj !== 'object' || obj === null) {
        return true;
    }
    return Object.keys(obj).length === 0;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return function (...args: Parameters<T>) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return function (...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}
