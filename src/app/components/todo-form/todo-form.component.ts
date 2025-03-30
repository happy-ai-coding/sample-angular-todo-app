import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Todo } from '../../models/todo.model';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header" [ngClass]="isEditing ? 'edit-header' : 'add-header'">
        <mat-icon class="header-icon">{{ isEditing ? 'edit' : 'add_task' }}</mat-icon>
        <h2 mat-dialog-title>{{ isEditing ? 'Edit Task' : 'Create New Task' }}</h2>
      </div>
      
      <mat-divider></mat-divider>
      
      <mat-dialog-content>
        <form [formGroup]="todoForm" class="form-container">
          <div class="form-field-container">
            <mat-form-field appearance="outline" class="full-width" color="primary">
              <mat-label>Task Title</mat-label>
              <input 
                matInput 
                formControlName="title" 
                placeholder="Enter task title"
                #titleInput
                maxlength="100"
              >
              <mat-icon matPrefix class="form-icon">title</mat-icon>
              <mat-hint align="end">{{titleInput.value.length || 0}}/100</mat-hint>
              @if (todoForm.get('title')?.invalid && todoForm.get('title')?.touched) {
                <mat-error class="custom-error">Title is required for your task</mat-error>
              }
            </mat-form-field>
          </div>
          
          <div class="form-field-container">
            <mat-form-field appearance="outline" class="full-width" color="primary">
              <mat-label>Task Description</mat-label>
              <textarea 
                matInput 
                formControlName="description" 
                placeholder="Enter task details"
                rows="4"
                #descInput
                maxlength="500"
              ></textarea>
              <mat-icon matPrefix class="form-icon">description</mat-icon>
              <mat-hint align="end">{{descInput.value.length || 0}}/500</mat-hint>
              @if (todoForm.get('description')?.invalid && todoForm.get('description')?.touched) {
                <mat-error class="custom-error">Description is required for your task</mat-error>
              }
            </mat-form-field>
          </div>
        </form>
      </mat-dialog-content>
      
      <mat-divider></mat-divider>
      
      <mat-dialog-actions align="end">
        <button 
          mat-button 
          mat-dialog-close
          matTooltip="Discard changes and close">
          <mat-icon>close</mat-icon>
          Cancel
        </button>
        <button 
          mat-raised-button 
          color="primary" 
          [disabled]="todoForm.invalid"
          (click)="saveTodo()"
          matTooltip="{{ isEditing ? 'Save changes to task' : 'Add new task' }}">
          <mat-icon>{{ isEditing ? 'save' : 'add_circle' }}</mat-icon>
          {{ isEditing ? 'Update' : 'Add Task' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: `
    .dialog-container {
      padding: 0;
      min-width: 420px;
      border-radius: 8px;
      overflow: hidden;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      padding: 20px 24px;
      gap: 12px;
    }

    .add-header {
      background: linear-gradient(135deg, #3f51b5, #5c6bc0);
      color: white;
    }

    .edit-header {
      background: linear-gradient(135deg, #7b1fa2, #9c27b0);
      color: white;
    }

    .header-icon {
      font-size: 28px;
      height: 28px;
      width: 28px;
    }

    mat-dialog-title {
      margin: 0;
      font-size: 22px;
      font-weight: 500;
    }

    mat-dialog-content {
      padding: 24px;
      max-height: 65vh;
    }

    .form-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-field-container {
      margin-bottom: 8px;
    }

    .full-width {
      width: 100%;
    }

    .form-icon {
      margin-right: 8px;
      color: #666;
    }

    mat-divider {
      margin: 0;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      margin: 0;
    }

    button {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    button mat-icon {
      font-size: 18px;
      margin-right: 4px;
    }
    
    .custom-error {
      color: #f44336 !important;
      font-weight: 500;
    }
    
    ::ng-deep .mat-mdc-form-field-error {
      color: #f44336 !important;
    }
  `
})
export class TodoFormComponent implements OnInit {
  todoForm!: FormGroup;
  isEditing = false;
  
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TodoFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { todo: Todo | null }
  ) {}
  
  ngOnInit(): void {
    this.isEditing = !!this.data.todo;
    
    this.todoForm = this.fb.group({
      title: [this.data.todo?.title || '', Validators.required],
      description: [this.data.todo?.description || '', Validators.required]
    });
  }
  
  saveTodo(): void {
    if (this.todoForm.valid) {
      this.dialogRef.close({
        id: this.data.todo?.id,
        ...this.todoForm.value
      });
    }
  }
}