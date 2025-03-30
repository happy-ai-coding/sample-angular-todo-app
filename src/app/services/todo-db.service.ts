import { Injectable } from '@angular/core';
import { Todo } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class TodoDbService {
  private readonly DB_NAME = 'todo-app-db';
  private readonly STORE_NAME = 'todos';
  private readonly DB_VERSION = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDatabase();
  }

  private initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve();
        return;
      }

      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = (event) => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = (event) => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = request.result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
          store.createIndex('completed', 'completed', { unique: false });
        }
      };
    });
  }

  private getObjectStore(mode: IDBTransactionMode): IDBObjectStore {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    const transaction = this.db.transaction(this.STORE_NAME, mode);
    return transaction.objectStore(this.STORE_NAME);
  }

  async addTodo(todo: Todo): Promise<void> {
    await this.initDatabase();
    
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore('readwrite');
      
      const request = store.add(this.toSerializable(todo));
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateTodo(todo: Todo): Promise<void> {
    await this.initDatabase();
    
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore('readwrite');
      
      const request = store.put(this.toSerializable(todo));
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteTodo(id: string): Promise<void> {
    await this.initDatabase();
    
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore('readwrite');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getTodo(id: string): Promise<Todo | null> {
    await this.initDatabase();
    
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore('readonly');
      const request = store.get(id);
      
      request.onsuccess = () => {
        if (!request.result) {
          resolve(null);
          return;
        }
        
        resolve(this.fromSerializable(request.result));
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async getAllTodos(): Promise<Todo[]> {
    await this.initDatabase();
    
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore('readonly');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const todos = request.result.map(todo => this.fromSerializable(todo));
        resolve(todos);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async getTodosByStatus(completed: boolean): Promise<Todo[]> {
    await this.initDatabase();
    
    return new Promise((resolve, reject) => {
      try {
        // Instead of using index.getAll() or index.openCursor(), let's get all todos and filter in JavaScript
        // This avoids any potential issues with boolean keys in IndexedDB
        const store = this.getObjectStore('readonly');
        const request = store.getAll();
        
        console.log(`Querying todos with completed=${completed}`);
        
        request.onsuccess = () => {
          const allTodos = request.result.map(todo => this.fromSerializable(todo));
          // Filter the todos based on the completed status in JavaScript
          const filteredTodos = allTodos.filter(todo => todo.completed === completed);
          
          console.log(`Found ${filteredTodos.length} todos with completed=${completed}`);
          resolve(filteredTodos);
        };
        
        request.onerror = (event) => {
          console.error('Error getting todos by status:', request.error);
          reject(request.error);
        };
      } catch (error) {
        console.error('Exception in getTodosByStatus:', error);
        reject(error);
      }
    });
  }

  // Helper methods for serialization
  private toSerializable(todo: Todo): any {
    return {
      ...todo,
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt.toISOString()
    };
  }

  private fromSerializable(data: any): Todo {
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    };
  }
}