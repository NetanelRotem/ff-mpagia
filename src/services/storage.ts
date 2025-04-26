import { Store } from '@tauri-apps/plugin-store';

const API_KEY_KEY = 'openai_api_key';
// const STORE_PATH = '.settings.dat'; // Remove or comment out this line

class StorageService {
  private store: Store | null = null;
  // private initialized = false; // Remove this flag, we'll check this.store directly

  constructor() {
    console.log('[StorageService] Initializing storage service...');
    this.initStore();
  }

  private async initStore() {
    // if (!this.initialized) { // Check this.store instead
    if (!this.store) { // Only initialize if store is not already created
      try {
        // Use the static load method instead of the private constructor
        const storeInstance = await Store.load('.store.dat');

        // Assign to the class property
        this.store = storeInstance;
        console.log('[StorageService] Store loaded successfully');
      } catch (error) {
        alert(error); // Keep alert for debugging
        console.error('[StorageService] Failed to load store:', error); // Updated log
        this.store = null; // Ensure store is null on error
      }
    }
  }

  async saveApiKey(apiKey: string): Promise<void> {
    console.log('[StorageService] Attempting to save API key...');
    try {
      // Ensure store is initialized before proceeding
      await this.initStore(); 
      
      if (!this.store) {
        throw new Error('Store not initialized or failed to load  vvvv'); // Updated error message
      }
      
      await this.store.set(API_KEY_KEY, apiKey);
      console.log('[StorageService] API key set successfully');
      await this.store.save();
      console.log('[StorageService] Store saved successfully');
    } catch (error) {
      alert(error);
      console.error('[StorageService] Error saving API key:', error);
      throw new Error('Failed to save API key');
    }
  }

  async getApiKey(): Promise<string | null> {
    console.log('[StorageService] Attempting to get API key...');
    try {
      await this.initStore();
      
      if (!this.store) {
        return null;
      }
      
      const apiKey = await this.store.get<string>(API_KEY_KEY);
      console.log('[StorageService] API key retrieved:', apiKey ? 'exists' : 'null');
      return apiKey || null;
    } catch (error) {
      console.error('[StorageService] Error getting API key:', error);
      return null;
    }
  }

  async clearApiKey(): Promise<void> {
    console.log('[StorageService] Attempting to clear API key...');
    try {
      await this.initStore();
      
      if (!this.store) {
        throw new Error('Store not initialized');
      }
      
      await this.store.delete(API_KEY_KEY);
      console.log('[StorageService] API key deleted successfully');
      await this.store.save();
      console.log('[StorageService] Store saved successfully');
    } catch (error) {
      console.error('[StorageService] Error clearing API key:', error);
      throw new Error('Failed to clear API key');
    }
  }
}

console.log('[StorageService] Creating storage service instance...');
const storageService = new StorageService();
console.log('[StorageService] Storage service instance created');

// Export the functions directly
export const saveApiKey = (apiKey: string) => storageService.saveApiKey(apiKey);
export const getApiKey = () => storageService.getApiKey();
export const clearApiKey = () => storageService.clearApiKey(); 