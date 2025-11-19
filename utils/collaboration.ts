const API_BASE = '/api/comments';

export async function fetchCollaborationComments(blueprintId: number) {
  const response = await fetch(`${API_BASE}?blueprintId=${blueprintId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to load comments');
  }

  const data = await response.json();
  return data.comments ?? [];
}

export async function postCollaborationComment(blueprintId: number, content: string) {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blueprintId, content }),
  });

  if (!response.ok) {
    throw new Error('Failed to post comment');
  }

  const data = await response.json();
  return data.comment;
}
