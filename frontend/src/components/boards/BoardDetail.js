// frontend/src/components/boards/BoardDetail.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { boardsAPI, columnsAPI, tasksAPI } from '../../services/api';
import Column from '../columns/Column';
import './Boards.css';

const BoardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');

  useEffect(() => {
    fetchBoardData();
  }, [id]);

  const fetchBoardData = async () => {
    try {
      const response = await boardsAPI.getById(id);
      setBoard(response.data.board);
      setColumns(response.data.columns);
      setEditedDescription(response.data.board.description || '');
    } catch (error) {
      console.error('Error fetching board:', error);
      navigate('/boards');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateColumn = async (e) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;

    try {
      const response = await columnsAPI.create({
        title: newColumnTitle,
        boardId: id
      });
      setColumns([...columns, response.data]);
      setNewColumnTitle('');
    } catch (error) {
      console.error('Error creating column:', error);
    }
  };

  const handleDeleteColumn = async (columnId) => {
    try {
      await columnsAPI.delete(columnId);
      setColumns(columns.filter(col => col._id !== columnId));
    } catch (error) {
      console.error('Error deleting column:', error);
    }
  };

  const handleCreateTask = async (columnId, title) => {
    try {
      const response = await tasksAPI.create({
        title,
        columnId
      });
      
      setColumns(columns.map(col => 
        col._id === columnId 
          ? { 
              ...col, 
              tasks: [...(col.tasks || []), response.data] 
            }
          : col
      ));
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleMoveTask = async (taskId, newColumnId) => {
    try {
      const response = await tasksAPI.move(taskId, { newColumnId });
      await fetchBoardData();
    } catch (error) {
      console.error('Error moving task:', error);
      throw error;
    }
  };

  const handleDeleteTask = async (taskId, columnId) => {
    try {
      await tasksAPI.delete(taskId);
      setColumns(columns.map(col => 
        col._id === columnId 
          ? { 
              ...col, 
              tasks: col.tasks.filter(task => task._id !== taskId) 
            }
          : col
      ));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleUpdateDescription = async () => {
    try {
      const response = await boardsAPI.update(id, { 
        description: editedDescription.trim() 
      });
      setBoard(response.data);
      setIsEditingDescription(false);
    } catch (error) {
      console.error('Error updating description:', error);
      alert('Failed to update description');
    }
  };

  const handleCancelEdit = () => {
    setEditedDescription(board.description || '');
    setIsEditingDescription(false);
  };

  if (loading) return <div className="loading">Loading board...</div>;
  if (!board) return <div>Board not found</div>;

  return (
    <div className="board-detail">
      <header className="board-header">
        <button onClick={() => navigate('/boards')} className="back-button">
          ← Back to Boards
        </button>
        <h1>{board.title}</h1>
        
        {/* Description Section */}
        {isEditingDescription ? (
          <div className="description-editor">
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              placeholder="Add a description for this board..."
              className="description-textarea"
              autoFocus
              rows="3"
            />
            <div className="description-actions">
              <button 
                onClick={handleUpdateDescription}
                className="save-description-button"
              >
                Save
              </button>
              <button 
                onClick={handleCancelEdit}
                className="cancel-description-button"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="description-display">
            <p onClick={() => setIsEditingDescription(true)}>
              {board.description || 'Add a description...'}
            </p>
            <button 
              onClick={() => setIsEditingDescription(true)}
              className="edit-description-button"
            >
              ✏️ Edit
            </button>
          </div>
        )}
      </header>

      {/* Add Column Form */}
      <div className="add-column-section">
        <form onSubmit={handleCreateColumn} className="add-column-form">
          <input
            type="text"
            value={newColumnTitle}
            onChange={(e) => setNewColumnTitle(e.target.value)}
            placeholder="Enter column title"
            className="column-input"
          />
          <button 
            type="submit" 
            disabled={!newColumnTitle.trim()}
            className="add-column-button"
          >
            Add Column
          </button>
        </form>
      </div>

      {/* Columns */}
      <div className="columns-container">
        {columns.map((column) => (
          <Column
            key={column._id}
            column={column}
            columns={columns}
            onDelete={() => handleDeleteColumn(column._id)}
            onCreateTask={handleCreateTask}
            onMoveTask={handleMoveTask}
            onDeleteTask={(taskId) => handleDeleteTask(taskId, column._id)}
          />
        ))}
        
        {columns.length === 0 && (
          <div className="no-columns">
            <p>No columns yet. Create your first column to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardDetail;