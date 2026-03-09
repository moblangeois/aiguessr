import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'aiguessr_history';
const MAX_HISTORY_ITEMS = 20;

export function useLocalHistory() {
  const [history, setHistory] = useState([]);

  // Charger l'historique au montage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Erreur chargement historique:', error);
      setHistory([]);
    }
  }, []);

  // Sauvegarder une partie
  const saveGame = useCallback((gameData) => {
    const {
      groups,
      scores,
      questions,
      answers,
      timerDuration
    } = gameData;

    const newEntry = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      date: new Date().toISOString(),
      groups,
      scores,
      questionsCount: questions.length,
      answers,
      timerDuration,
      winner: Object.entries(scores)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || null
    };

    setHistory(prev => {
      const updated = [newEntry, ...prev].slice(0, MAX_HISTORY_ITEMS);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Erreur sauvegarde historique:', error);
      }
      return updated;
    });

    return newEntry.id;
  }, []);

  // Supprimer une entree
  const deleteEntry = useCallback((id) => {
    setHistory(prev => {
      const updated = prev.filter(entry => entry.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Erreur suppression historique:', error);
      }
      return updated;
    });
  }, []);

  // Vider l'historique
  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Erreur vidage historique:', error);
    }
  }, []);

  // Obtenir une entree par ID
  const getEntry = useCallback((id) => {
    return history.find(entry => entry.id === id) || null;
  }, [history]);

  return {
    history,
    saveGame,
    deleteEntry,
    clearHistory,
    getEntry,
    hasHistory: history.length > 0
  };
}

export default useLocalHistory;
