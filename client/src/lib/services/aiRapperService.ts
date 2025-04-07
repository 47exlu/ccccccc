/**
 * API Service for AI Rappers
 * Handles communication with the server for AI rappers, songs, albums, and chart history.
 */

import axios from 'axios';
import type { AiRapper, AiSong, AiAlbum, ChartHistory } from '@shared/schema';

// Base URL for API requests
const API_BASE_URL = '/api';

// AI Rapper endpoints
export const aiRapperService = {
  // Create a new AI rapper
  createAiRapper: async (rapper: Omit<AiRapper, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await axios.post(`${API_BASE_URL}/ai-rappers`, rapper);
    return response.data;
  },

  // Get all AI rappers
  getAllAiRappers: async () => {
    const response = await axios.get(`${API_BASE_URL}/ai-rappers`);
    return response.data;
  },

  // Get active AI rappers
  getActiveAiRappers: async () => {
    const response = await axios.get(`${API_BASE_URL}/ai-rappers/active`);
    return response.data;
  },

  // Update an AI rapper
  updateAiRapper: async (id: number, updates: Partial<AiRapper>) => {
    const response = await axios.patch(`${API_BASE_URL}/ai-rappers/${id}`, updates);
    return response.data;
  },

  // Create a new AI song
  createAiSong: async (song: Omit<AiSong, 'id'>) => {
    const response = await axios.post(`${API_BASE_URL}/ai-songs`, song);
    return response.data;
  },

  // Get songs by rapper ID
  getAiSongsByRapperId: async (rapperId: number) => {
    const response = await axios.get(`${API_BASE_URL}/ai-songs/rapper/${rapperId}`);
    return response.data;
  },

  // Create a new AI album
  createAiAlbum: async (album: Omit<AiAlbum, 'id'>) => {
    const response = await axios.post(`${API_BASE_URL}/ai-albums`, album);
    return response.data;
  },

  // Get albums by rapper ID
  getAiAlbumsByRapperId: async (rapperId: number) => {
    const response = await axios.get(`${API_BASE_URL}/ai-albums/rapper/${rapperId}`);
    return response.data;
  },

  // Create a new chart entry
  createChartEntry: async (entry: Omit<ChartHistory, 'id'>) => {
    const response = await axios.post(`${API_BASE_URL}/chart-history`, entry);
    return response.data;
  },

  // Get chart history by type
  getChartHistoryByType: async (chartType: string, limit?: number) => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await axios.get(`${API_BASE_URL}/chart-history/${chartType}${params}`);
    return response.data;
  },

  // Get latest chart data
  getLatestCharts: async () => {
    const response = await axios.get(`${API_BASE_URL}/chart-history/latest`);
    return response.data;
  }
};