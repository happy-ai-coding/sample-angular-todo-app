import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TodoFormComponent } from '../todo-form/todo-form.component';
import { TodoService, TodoFilter } from '../../services/todo.service';
import { Todo } from '../../models/todo.model';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatTooltipModule,
    MatDialogModule,
    MatBadgeModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="todo-container">
      <mat-toolbar color="primary" class="toolbar">
        <span>Todo App</span>
        <span class="toolbar-spacer"></span>
        <button
          mat-fab
          color="accent"
          matTooltip="Add new task"
          (click)="openTodoForm()"
        >
          <mat-icon>add</mat-icon>
        </button>
      </mat-toolbar>

      <div class="content">
        <div class="filter-container">
          <mat-chip-listbox [value]="currentFilter" (change)="changeFilter($event.value)">
            <mat-chip-option value="all">All</mat-chip-option>
            <mat-chip-option value="active">Active</mat-chip-option>
            <mat-chip-option value="completed">Completed</mat-chip-option>
          </mat-chip-listbox>
        </div>

        @if (isLoading) {
          <div class="loading-container">
            <mat-spinner></mat-spinner>
          </div>
        } @else if (todos.length === 0) {
          <mat-card appearance="outlined" class="empty-card">
            <mat-card-content>
              <div class="empty-state">
                <mat-icon class="empty-icon">{{ getEmptyStateIcon() }}</mat-icon>
                <h2>{{ getEmptyStateTitle() }}</h2>
                <p>{{ getEmptyStateMessage() }}</p>
              </div>
            </mat-card-content>
          </mat-card>
        } @else {
          <div class="tasks-container">
            @for (todo of todos; track todo.id) {
              <mat-card appearance="outlined" class="todo-card" [ngClass]="{'completed': todo.completed}">
                <mat-card-content>
                  <div class="todo-header">
                    <div class="todo-title">
                      <button 
                        mat-icon-button
                        [color]="todo.completed ? 'primary' : 'default'"
                        (click)="toggleTodoCompleted(todo.id)"
                        [matTooltip]="todo.completed ? 'Mark as incomplete' : 'Mark as complete'"
                      >
                        <mat-icon>{{ todo.completed ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
                      </button>
                      <h3 [ngClass]="{'completed-text': todo.completed}">{{ todo.title }}</h3>
                    </div>
                    <div class="todo-actions">
                      <button 
                        mat-icon-button 
                        color="primary" 
                        (click)="editTodo(todo)"
                        matTooltip="Edit task"
                      >
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button 
                        mat-icon-button 
                        color="warn"
                        (click)="deleteTodo(todo.id)"
                        matTooltip="Delete task"
                      >
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </div>
                  
                  <div class="todo-description">
                    <p>{{ todo.description }}</p>
                  </div>
                  
                  <div class="todo-meta">
                    <small>
                      {{ todo.updatedAt !== todo.createdAt ? 'Updated' : 'Created' }}:
                      {{ todo.updatedAt !== todo.createdAt ? (todo.updatedAt | date:'short') : (todo.createdAt | date:'short') }}
                    </small>
                  </div>
                </mat-card-content>
              </mat-card>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .todo-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .toolbar-spacer {
      flex: 1 1 auto;
    }

    .content {
      padding: 20px;
      max-width: 800px;
      width: 100%;
      margin: 0 auto;
    }

    .filter-container {
      margin-bottom: 20px;
      display: flex;
      justify-content: center;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 300px;
    }

    .empty-card {
      text-align: center;
      padding: 40px 0;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #888;
    }

    .empty-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
      color: #ccc;
    }

    .tasks-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .todo-card {
      transition: all 0.3s ease;
    }

    .todo-card.completed {
      opacity: 0.8;
      background-color: #f9f9f9;
    }

    .todo-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .todo-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .todo-title h3 {
      margin: 0;
      font-weight: 500;
    }

    .completed-text {
      text-decoration: line-through;
      color: #888;
    }

    .todo-actions {
      display: flex;
      gap: 4px;
    }

    .todo-description {
      margin-left: 40px;
      margin-top: 8px;
      margin-bottom: 8px;
    }

    .todo-meta {
      display: flex;
      justify-content: flex-end;
      color: #888;
      font-size: 12px;
    }
  `
})
export class TodoListComponent implements OnInit {
  todos: Todo[] = [];
  isLoading = true;
  currentFilter: TodoFilter = 'all';

  constructor(
    private todoService: TodoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.todoService.todos$.subscribe(todos => {
      this.todos = todos;
      this.isLoading = false;
    });

    this.todoService.currentFilter$.subscribe(filter => {
      this.currentFilter = filter;
    });
  }

  openTodoForm(): void {
    const dialogRef = this.dialog.open(TodoFormComponent, {
      width: '500px',
      data: { todo: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.todoService.addTodo(result.title, result.description);
        this.showSnackBar('Task added successfully');
      }
    });
  }

  editTodo(todo: Todo): void {
    const dialogRef = this.dialog.open(TodoFormComponent, {
      width: '500px',
      data: { todo }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.todoService.updateTodo(todo.id, {
          title: result.title,
          description: result.description
        });
        this.showSnackBar('Task updated successfully');
      }
    });
  }

  toggleTodoCompleted(id: string): void {
    this.todoService.toggleTodoCompleted(id);
    
    // Find the todo to see if it's completed or not after toggling
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      // This will show the reversed state since we're checking after the toggle has been initiated
      const message = todo.completed 
        ? 'Task marked as incomplete' 
        : 'Task marked as complete';
      this.showSnackBar(message);
    }
  }

  deleteTodo(id: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.todoService.deleteTodo(id);
      this.showSnackBar('Task deleted successfully');
    }
  }

  changeFilter(filter: TodoFilter): void {
    this.todoService.setFilter(filter);
  }

  getEmptyStateIcon(): string {
    switch (this.currentFilter) {
      case 'completed': return 'task_alt';
      case 'active': return 'pending_actions';
      default: return 'assignment';
    }
  }
  
  getEmptyStateTitle(): string {
    switch (this.currentFilter) {
      case 'completed': return 'No completed tasks';
      case 'active': return 'No active tasks';
      default: return 'No tasks found';
    }
  }
  
  getEmptyStateMessage(): string {
    switch (this.currentFilter) {
      case 'completed': return 'Mark some tasks as completed to see them here';
      case 'active': return 'All tasks are completed or you need to add new tasks';
      default: return 'Add a new task to get started';
    }
  }
  
  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom'
    });
  }
}