import { SavedBlueprint } from '@/types/blueprint';

export const exportToGitHubGist = async (
  blueprint: SavedBlueprint,
  githubToken: string
): Promise<string> => {
  const response = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${githubToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      description: `VibeCode Blueprint: ${blueprint.vibe}`,
      public: false,
      files: {
        'blueprint.md': {
          content: blueprint.blueprint,
        },
        'metadata.json': {
          content: JSON.stringify({
            vibe: blueprint.vibe,
            timestamp: blueprint.timestamp,
            generatedBy: 'VibeCode Mentor',
          }, null, 2),
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create gist');
  }

  const data = await response.json();
  return data.html_url;
};
