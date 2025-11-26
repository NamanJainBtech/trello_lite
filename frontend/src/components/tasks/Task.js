// frontend/src/components/tasks/Task.js

import React, { useState } from 'react';
import './Tasks.css';

const Task = ({ task, onMoveTask, onDeleteTask, columns }) => {
  const [showActions, setShowActions] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = async (newColumnId) => {
    if (newColumnId && newColumnId !== task.columnId._id) {
      try {
        await onMoveTask(task._id, newColumnId);
      } catch (error) {
        console.error('Error moving task:', error);
        alert('Failed to move task. Please try again.');
      }
    }
  };

  // Drag handlers
  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('taskId', task._id);
    e.dataTransfer.setData('sourceColumnId', task.columnId._id);
    
    // Add a subtle opacity to the dragged element
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    setIsDragging(false);
    e.target.style.opacity = '1';
  };

  return (
    <div 
      className={`task-card ${isDragging ? 'dragging' : ''}`}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="task-content">
        <h4>{task.title}</h4>
        {task.description && (
          <p className="task-description">{task.description}</p>
        )}
        <div className="task-meta">
          <span className="task-date">
            {new Date(task.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {showActions && (
        <div className="task-actions">
          <button 
            onClick={onDeleteTask}
            className="task-delete-button"
            title="Delete task"
          >
            ×
          </button>
          
          <select 
            onChange={(e) => handleMove(e.target.value)}
            className="move-select"
            value=""
          >
            <option value="">Move to...</option>
            {columns && columns.map(column => (
              column._id !== task.columnId._id && (
                <option key={column._id} value={column._id}>
                  {column.title}
                </option>
              )
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default Task;