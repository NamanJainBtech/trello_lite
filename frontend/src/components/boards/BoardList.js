// frontend/src/components/boards/BoardList.js

import React, { useState, useEffect } from 'react';
import { boardsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import './Boards.css';

const BoardList = () => {
  const [boards, setBoards] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const response = await boardsAPI.getAll();
      setBoards(response.data);
    } catch (error) {
      console.error('Error fetching boards:', error);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    setLoading(true);
    try {
      const response = await boardsAPI.create({ 
        title: newBoardTitle,
        description: newBoardDescription 
      });
      setBoards([response.data, ...boards]);
      setNewBoardTitle('');
      setNewBoardDescription('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating board:', error);
    }
    setLoading(false);
  };

  const handleDeleteBoard = async (boardId) => {
    if (!window.confirm('Are you sure you want to delete this board?')) return;

    try {
      await boardsAPI.delete(boardId);
      setBoards(boards.filter(board => board._id !== boardId));
    } catch (error) {
      console.error('Error deleting board:', error);
    }
  };

  return (
    <div className="boards-container">
      <header className="boards-header">
        <div>
          <h1>My Boards</h1>
          <p>Welcome back, {user?.name}!</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <ThemeToggle />
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <div className="boards-grid">
        <div className="board-card create-board-card">
          {showCreateForm ? (
            <form onSubmit={handleCreateBoard} className="create-board-form">
              <input
                type="text"
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                placeholder="Enter board title"
                autoFocus
                className="board-input"
              />
              <textarea
                value={newBoardDescription}
                onChange={(e) => setNewBoardDescription(e.target.value)}
                placeholder="Enter board description (optional)"
                className="board-textarea"
                rows="3"
              />
              <div className="form-actions">
                <button 
                  type="submit" 
                  disabled={loading || !newBoardTitle.trim()}
                  className="create-button"
                >
                  Create
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewBoardTitle('');
                    setNewBoardDescription('');
                  }}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button 
              onClick={() => setShowCreateForm(true)}
              className="create-board-button"
            >
              + Create New Board
            </button>
          )}
        </div>

        {boards.map((board) => (
          <div 
            key={board._id} 
            className="board-card"
            onClick={() => navigate(`/boards/${board._id}`)}
          >
            <h3>{board.title}</h3>
            <p className="board-description-preview">
              {board.description || 'No description'}
            </p>
            <div className="board-actions">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteBoard(board._id);
                }}
                className="delete-button"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoardList;