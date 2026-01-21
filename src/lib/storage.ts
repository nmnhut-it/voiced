import { UserProfile, AudioRecording, StoryRecording } from '../types';

const STORAGE_KEYS = {
  USER_PROFILE: 'growglow_user_profile',
  CURRENT_ATMOSPHERE: 'growglow_current_atmosphere',
};

const DB_NAME = 'GrowGlowDB';
const DB_VERSION = 2;
const AUDIO_STORE = 'audioRecordings';
const STORY_STORE = 'storyRecordings';

class StorageManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(AUDIO_STORE)) {
          const store = db.createObjectStore(AUDIO_STORE, { keyPath: 'id' });
          store.createIndex('recordedAt', 'recordedAt', { unique: false });
          store.createIndex('unlocksAt', 'unlocksAt', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORY_STORE)) {
          const store = db.createObjectStore(STORY_STORE, { keyPath: 'id' });
          store.createIndex('storyId', 'storyId', { unique: false });
          store.createIndex('recordedAt', 'recordedAt', { unique: false });
        }
      };
    });
  }

  getUserProfile(): UserProfile {
    const hardcodedProfile: UserProfile = {
      childName: 'Little One',
      dayZero: '2025-07-30',
      createdAt: '2025-07-30T00:00:00.000Z',
    };
    return hardcodedProfile;
  }

  setUserProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  }

  getCurrentAtmosphereId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_ATMOSPHERE);
  }

  setCurrentAtmosphereId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_ATMOSPHERE, id);
  }

  async saveAudioRecording(recording: Omit<AudioRecording, 'id'>): Promise<string> {
    if (!this.db) await this.init();

    const id = `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullRecording: AudioRecording = { ...recording, id };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([AUDIO_STORE], 'readwrite');
      const store = transaction.objectStore(AUDIO_STORE);
      const request = store.add(fullRecording);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async getAudioRecordings(): Promise<AudioRecording[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([AUDIO_STORE], 'readonly');
      const store = transaction.objectStore(AUDIO_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteAudioRecording(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([AUDIO_STORE], 'readwrite');
      const store = transaction.objectStore(AUDIO_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async saveStoryRecording(recording: Omit<StoryRecording, 'id'>): Promise<string> {
    if (!this.db) await this.init();

    const id = `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullRecording: StoryRecording = { ...recording, id };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORY_STORE], 'readwrite');
      const store = transaction.objectStore(STORY_STORE);
      const key = `${recording.storyId}_${recording.paragraphIndex}`;

      const getRequest = store.index('storyId').getAll(recording.storyId);

      getRequest.onsuccess = () => {
        const existing = getRequest.result.find(
          (r: StoryRecording) => r.paragraphIndex === recording.paragraphIndex
        );

        if (existing) {
          const deleteRequest = store.delete(existing.id);
          deleteRequest.onsuccess = () => {
            const addRequest = store.add(fullRecording);
            addRequest.onsuccess = () => resolve(id);
            addRequest.onerror = () => reject(addRequest.error);
          };
          deleteRequest.onerror = () => reject(deleteRequest.error);
        } else {
          const addRequest = store.add(fullRecording);
          addRequest.onsuccess = () => resolve(id);
          addRequest.onerror = () => reject(addRequest.error);
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async getStoryRecordings(): Promise<StoryRecording[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORY_STORE], 'readonly');
      const store = transaction.objectStore(STORY_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const storage = new StorageManager();
