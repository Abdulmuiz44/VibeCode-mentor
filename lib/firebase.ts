import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, orderBy, deleteDoc, updateDoc } from 'firebase/firestore';
import { SavedBlueprint } from '@/types/blueprint';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if Firebase is properly configured
const isConfigured = firebaseConfig.apiKey && firebaseConfig.projectId;

// Initialize Firebase only if configured
let app: FirebaseApp | null = null;
let db: any = null;

if (isConfigured && typeof window !== 'undefined') {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  db = getFirestore(app);
}

export { db };

// Firestore functions for blueprints
export const saveBlueprintToCloud = async (userId: string, blueprint: SavedBlueprint) => {
  if (!db) return false;
  try {
    const docRef = doc(db, 'users', userId, 'blueprints', blueprint.id.toString());
    await setDoc(docRef, {
      id: blueprint.id,
      vibe: blueprint.vibe,
      blueprint: blueprint.blueprint,
      timestamp: blueprint.timestamp,
    });
    return true;
  } catch (error) {
    console.error('Error saving blueprint to cloud:', error);
    return false;
  }
};

export const getBlueprintsFromCloud = async (userId: string): Promise<SavedBlueprint[]> => {
  if (!db) return [];
  try {
    const blueprintsRef = collection(db, 'users', userId, 'blueprints');
    const q = query(blueprintsRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const blueprints: SavedBlueprint[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      blueprints.push({
        id: data.id,
        vibe: data.vibe,
        blueprint: data.blueprint,
        timestamp: data.timestamp,
      });
    });
    
    return blueprints;
  } catch (error) {
    console.error('Error getting blueprints from cloud:', error);
    return [];
  }
};

export const deleteBlueprintFromCloud = async (userId: string, blueprintId: number) => {
  if (!db) return false;
  try {
    const docRef = doc(db, 'users', userId, 'blueprints', blueprintId.toString());
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting blueprint from cloud:', error);
    return false;
  }
};

// Pro status functions
export const getProStatusFromCloud = async (userId: string): Promise<boolean> => {
  if (!db) return false;
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data()?.isPro || false;
    }
    return false;
  } catch (error) {
    console.error('Error getting Pro status from cloud:', error);
    return false;
  }
};

export const setProStatusInCloud = async (userId: string, email: string, isPro: boolean) => {
  if (!db) return false;
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      email,
      isPro,
      updatedAt: Date.now(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error setting Pro status in cloud:', error);
    return false;
  }
};

// Sync local blueprints to cloud
export const syncLocalToCloud = async (userId: string, localBlueprints: SavedBlueprint[]) => {
  if (!db) return false;
  try {
    const cloudBlueprints = await getBlueprintsFromCloud(userId);
    const cloudIds = new Set(cloudBlueprints.map(b => b.id));
    
    // Upload local blueprints that don't exist in cloud
    const promises = localBlueprints
      .filter(blueprint => !cloudIds.has(blueprint.id))
      .map(blueprint => saveBlueprintToCloud(userId, blueprint));
    
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error('Error syncing local to cloud:', error);
    return false;
  }
};

// Custom Prompts for Pro Users
export interface CustomPrompt {
  id: string;
  title: string;
  prompt: string;
  timestamp: number;
}

export const saveCustomPrompt = async (userId: string, prompt: CustomPrompt): Promise<boolean> => {
  if (!db) return false;
  try {
    const docRef = doc(db, 'users', userId, 'prompts', prompt.id);
    await setDoc(docRef, prompt);
    return true;
  } catch (error) {
    console.error('Error saving custom prompt:', error);
    return false;
  }
};

export const getCustomPrompts = async (userId: string): Promise<CustomPrompt[]> => {
  if (!db) return [];
  try {
    const promptsRef = collection(db, 'users', userId, 'prompts');
    const q = query(promptsRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const prompts: CustomPrompt[] = [];
    querySnapshot.forEach((doc) => {
      prompts.push(doc.data() as CustomPrompt);
    });
    
    return prompts;
  } catch (error) {
    console.error('Error getting custom prompts:', error);
    return [];
  }
};

export const deleteCustomPrompt = async (userId: string, promptId: string): Promise<boolean> => {
  if (!db) return false;
  try {
    const docRef = doc(db, 'users', userId, 'prompts', promptId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting custom prompt:', error);
    return false;
  }
};
