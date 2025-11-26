// frontend/src/components/columns/Column.js

import React, { useState } from 'react';
import Task from '../tasks/Task';
import './Columns.css';

const Column = ({ column, columns, onDelete, onCreateTask, onMoveTask, onDeleteTask }) => {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    onCreateTask(column._id, newTaskTitle);
    setNewTaskTitle('');
    setShowTaskForm(false);
  };

  // Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const taskId = e.dataTransfer.getData('taskId');
    const sourceColumnId = e.dataTransfer.getData('sourceColumnId');

    // Only move if dropping in a different column
    if (taskId && sourceColumnId !== column._id) {
      try {
        await onMoveTask(taskId, column._id);
      } catch (error) {
        console.error('Error dropping task:', error);
        alert('Failed to move task. Please try again.');
      }
    }
  };

  return (
    <div 
      className={`column ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="column-header">
        <h3>{column.title}</h3>
        <span className="task-count">{column.tasks?.length || 0}</span>
        <button 
          onClick={onDelete}
          className="delete-column-button"
          title="Delete column"
        >
          ×
        </button>
      </div>

      <div className="tasks-list">
        {column.tasks?.map((task) => (
          <Task
            key={task._id}
            task={task}
            columns={columns}
            onMoveTask={onMoveTask}
            onDeleteTask={() => onDeleteTask(task._id, column._id)}
          />
        ))}
      </div>

      {showTaskForm ? (
        <form onSubmit={handleCreateTask} className="add-task-form">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Enter task title"
            autoFocus
            className="task-input"
          />
          <div className="task-form-actions">
            <button 
              type="submit" 
              disabled={!newTaskTitle.trim()}
              className="add-task-button"
            >
              Add Task
            </button>
            <button 
              type="button" 
              onClick={() => setShowTaskForm(false)}
              className="cancel-task-button"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button 
          onClick={() => setShowTaskForm(true)}
          className="add-task-card"
        >
          + Add Task
        </button>
      )}
    </div>
  );
};

export default Column;