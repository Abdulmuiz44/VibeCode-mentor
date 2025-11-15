import { SavedBlueprint } from '@/types/blueprint';

const STORAGE_KEY = 'vibecode-saves';

export const saveBlueprint = (vibe: string, blueprint: string): SavedBlueprint => {
  const saves = getSavedBlueprints();
  const newSave: SavedBlueprint = {
    id: Date.now(),
    vibe,
    blueprint,
    timestamp: Date.now(),
  };
  saves.push(newSave);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
  return newSave;
};

export const getSavedBlueprints = (): SavedBlueprint[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const deleteSavedBlueprint = (id: number): void => {
  const saves = getSavedBlueprints();
  const filtered = saves.filter((save) => save.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const exportBlueprintJSON = (blueprint: SavedBlueprint): void => {
  const dataStr = JSON.stringify(blueprint, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `blueprint-${blueprint.id}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
