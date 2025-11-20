import { CustomPrompt } from '@/types/blueprint';

const STORAGE_KEY = 'vibecode-custom-prompts';

const isBrowser = typeof window !== 'undefined';

const readStorage = (): CustomPrompt[] => {
  if (!isBrowser) return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to parse saved prompts from localStorage:', error);
    return [];
  }
};

const writeStorage = (prompts: CustomPrompt[]) => {
  if (!isBrowser) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
};

const sortPrompts = (prompts: CustomPrompt[]): CustomPrompt[] =>
  [...prompts].sort((a, b) => b.timestamp - a.timestamp);

export const getSavedPrompts = (): CustomPrompt[] => sortPrompts(readStorage());

export const persistPromptsLocally = (prompts: CustomPrompt[]): void => {
  writeStorage(sortPrompts(prompts));
};

export const savePromptLocally = (prompt: CustomPrompt): CustomPrompt[] => {
  const existing = readStorage();
  const filtered = existing.filter((entry) => entry.id !== prompt.id);
  const updated = sortPrompts([prompt, ...filtered]);
  writeStorage(updated);
  return updated;
};

export const deletePromptLocally = (id: string): CustomPrompt[] => {
  const existing = readStorage();
  const updated = sortPrompts(existing.filter((entry) => entry.id !== id));
  writeStorage(updated);
  return updated;
};

export const mergePrompts = (local: CustomPrompt[], remote: CustomPrompt[]): CustomPrompt[] => {
  const map = new Map<string, CustomPrompt>();
  for (const prompt of [...local, ...remote]) {
    const existing = map.get(prompt.id);
    if (!existing || prompt.timestamp > existing.timestamp) {
      map.set(prompt.id, prompt);
    }
  }
  return sortPrompts(Array.from(map.values()));
};
