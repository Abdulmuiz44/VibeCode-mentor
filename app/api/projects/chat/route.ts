import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/kv';
import { getProStatusFromCloud } from '@/lib/supabase.server';
import { AIResponse } from '@/types/project';

// AI API Keys
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// API Endpoints
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export async function POST(request: NextRequest) {
  try {
    const { message, projectId, files, techStack, userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user's IP address for rate limiting
    const ip = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Check if user is Pro
    const isPro = await getProStatusFromCloud(userId);

    // Rate limiting for free tier users only
    if (!isPro) {
      const rateLimit = await checkRateLimit(userId, ip);

      if (!rateLimit.allowed) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please upgrade to Pro for unlimited access.' },
          { status: 429 }
        );
      }
    }

    // Determine which AI to use based on the request type
    const aiProvider = selectAIProvider(message, techStack);
    
    let aiResponse: AIResponse;

    if (aiProvider === 'mistral') {
      aiResponse = await callMistralAPI(message, files, techStack, projectId);
    } else {
      aiResponse = await callGeminiAPI(message, files, techStack, projectId);
    }

    return NextResponse.json(aiResponse);

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

function selectAIProvider(message: string, techStack: string[]): 'mistral' | 'gemini' {
  // Use Mistral for code-related tasks
  const codeKeywords = ['code', 'function', 'component', 'class', 'api', 'database', 'react', 'javascript', 'typescript'];
  const hasCodeKeywords = codeKeywords.some(keyword => 
    message.toLowerCase().includes(keyword) || 
    techStack.some(tech => tech.toLowerCase().includes(keyword))
  );

  // Use Gemini for creative/planning tasks
  const creativeKeywords = ['design', 'ui', 'ux', 'layout', 'style', 'theme', 'color', 'plan', 'idea'];
  const hasCreativeKeywords = creativeKeywords.some(keyword => 
    message.toLowerCase().includes(keyword)
  );

  if (hasCreativeKeywords && !hasCodeKeywords) {
    return 'gemini';
  }

  // Default to Mistral for most coding tasks
  return 'mistral';
}

async function callMistralAPI(message: string, files: any[], techStack: string[], projectId: string): Promise<AIResponse> {
  if (!MISTRAL_API_KEY) {
    throw new Error('MISTRAL_API_KEY is not configured');
  }

  // Prepare file context for Mistral
  const fileContext = files.map(file => {
    if (file.type === 'file' && file.content) {
      return `File: ${file.path}\n\`\`\`${getLanguageFromFileName(file.name)}\n${file.content}\n\`\`\`\n`;
    }
    return '';
  }).join('\n');

  const systemPrompt = `You are an expert software developer and AI coding assistant. You are helping a user build a project with the following tech stack: ${techStack.join(', ')}.

Current project files:
${fileContext}

Your task is to help the user by:
1. Writing high-quality, production-ready code
2. Explaining concepts clearly
3. Following best practices and modern standards
4. Being specific about file names and paths
5. Providing complete, working solutions

When generating code:
- Always specify the file name and path
- Provide complete, working code
- Follow the project's existing patterns
- Use modern ES6+ syntax
- Include necessary imports

Respond in JSON format with one of these types:
- For code changes: {"type": "code", "content": "explanation", "metadata": {"fileId": "file-id", "fileName": "filename", "code": "code", "language": "language"}}
- For new files: {"type": "file", "content": "explanation", "metadata": {"fileName": "filename", "filePath": "path", "code": "code", "language": "language"}}
- For build actions: {"type": "build", "content": "explanation"}
- For general chat: {"type": "message", "content": "response"}`;

  const response = await fetch(MISTRAL_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'mistral-large-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Mistral API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '';

  try {
    return JSON.parse(content);
  } catch {
    // Fallback if AI doesn't return valid JSON
    return {
      type: 'message',
      content: content
    };
  }
}

async function callGeminiAPI(message: string, files: any[], techStack: string[], projectId: string): Promise<AIResponse> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  // Prepare file context for Gemini
  const fileContext = files.map(file => {
    if (file.type === 'file' && file.content) {
      return `File: ${file.path}\n\`\`\`${getLanguageFromFileName(file.name)}\n${file.content}\n\`\`\`\n`;
    }
    return '';
  }).join('\n');

  const systemPrompt = `You are an expert software developer and AI coding assistant specializing in UI/UX design and creative solutions. You are helping a user build a project with the following tech stack: ${techStack.join(', ')}.

Current project files:
${fileContext}

Your task is to help the user by:
1. Creating beautiful, modern UI components
2. Suggesting design improvements
3. Helping with layouts, styling, and user experience
4. Providing creative solutions
5. Writing clean, maintainable code

When generating code:
- Always specify the file name and path
- Focus on modern, responsive design
- Use Tailwind CSS for styling when appropriate
- Include accessibility features
- Provide complete, working solutions

Respond in JSON format with one of these types:
- For code changes: {"type": "code", "content": "explanation", "metadata": {"fileId": "file-id", "fileName": "filename", "code": "code", "language": "language"}}
- For new files: {"type": "file", "content": "explanation", "metadata": {"fileName": "filename", "filePath": "path", "code": "code", "language": "language"}}
- For build actions: {"type": "build", "content": "explanation"}
- For general chat: {"type": "message", "content": "response"}`;

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'user', parts: [{ text: message }] }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  try {
    return JSON.parse(content);
  } catch {
    // Fallback if AI doesn't return valid JSON
    return {
      type: 'message',
      content: content
    };
  }
}

function getLanguageFromFileName(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  const languageMap: { [key: string]: string } = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'sql': 'sql',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'json': 'json',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'md': 'markdown',
    'sh': 'bash',
    'bash': 'bash',
    'zsh': 'bash',
    'fish': 'bash',
    'dockerfile': 'dockerfile'
  };
  return languageMap[extension || ''] || 'text';
}
