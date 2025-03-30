import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Todo } from '../models/todo.model';
import { TodoDbService } from './todo-db.service';

export type TodoFilter = 'all' | 'active' | 'completed';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private todosSubject = new BehaviorSubject<Todo[]>([]);
  private currentFilter = new BehaviorSubject<TodoFilter>('all');
  
  todos$: Observable<Todo[]> = this.todosSubject.asObservable();
  currentFilter$: Observable<TodoFilter> = this.currentFilter.asObservable();

  constructor(private dbService: TodoDbService) {
    this.loadTodos();
  }

  async loadTodos(filter: TodoFilter = 'all'): Promise<void> {
    try {
      let todos: Todo[];
      
      console.log(`Loading todos with filter: ${filter}`);
      
      if (filter === 'all') {
        todos = await this.dbService.getAllTodos();
      } else if (filter === 'completed') {
        todos = await this.dbService.getTodosByStatus(true);
        console.log('Completed todos:', todos);
      } else {
        todos = await this.dbService.getTodosByStatus(false);
      }
      
      // Sort by creation date (newest first)
      todos.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      this.todosSubject.next(todos);
      this.currentFilter.next(filter);
    } catch (error) {
      console.error('Error loading todos:', error);
      this.todosSubject.next([]);
    }
  }

  async addTodo(title: string, description: string): Promise<void> {
    try {
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        title,
        description,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await this.dbService.addTodo(newTodo);
      await this.loadTodos(this.currentFilter.value);
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  }

  async updateTodo(id: string, updates: Partial<Todo>): Promise<void> {
    try {
      const todo = await this.dbService.getTodo(id);
      
      if (todo) {
        const updatedTodo: Todo = {
          ...todo,
          ...updates,
          updatedAt: new Date()
        };
        
        await this.dbService.updateTodo(updatedTodo);
        await this.loadTodos(this.currentFilter.value);
      }
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  }

  async toggleTodoCompleted(id: string): Promise<void> {
    try {
      const todo = await this.dbService.getTodo(id);
      
      if (todo) {
        console.log(`Toggling completion for todo ${id} from ${todo.completed} to ${!todo.completed}`);
        
        const updatedTodo: Todo = {
          ...todo,
          completed: !todo.completed,
          updatedAt: new Date()
        };
        
        await this.dbService.updateTodo(updatedTodo);
        
        // If we're on a filtered view and the todo status has changed in a way
        // that would make it disappear from the current filter, reload from 'all'
        const currentFilter = this.currentFilter.value;
        if ((currentFilter === 'completed' && !updatedTodo.completed) || 
            (currentFilter === 'active' && updatedTodo.completed)) {
          console.log('Todo changed status and would disappear from current filter, reloading');
          await this.loadTodos(currentFilter);
        } else {
          await this.loadTodos(currentFilter);
        }
      }
    } catch (error) {
      console.error('Error toggling todo completion:', error);
    }
  }

  async deleteTodo(id: string): Promise<void> {
    try {
      await this.dbService.deleteTodo(id);
      await this.loadTodos(this.currentFilter.value);
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  }

  setFilter(filter: TodoFilter): void {
    this.loadTodos(filter);
  }
}