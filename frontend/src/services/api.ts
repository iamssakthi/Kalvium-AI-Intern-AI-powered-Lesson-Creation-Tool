import axios from 'axios';
import {
  LessonDetail,
  LessonListItem,
  DashboardStats,
  CreateLessonPayload,
  QCRecommendation,
  ResearchSource
} from '../types';

const API_BASE_URL = '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Dashboard & Statistics
  getStats: async (): Promise<DashboardStats> => {
    const res = await apiClient.get<DashboardStats>('/api/stats');
    return res.data;
  },

  // Lessons
  getLessons: async (search?: string, status?: string): Promise<LessonListItem[]> => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (status && status !== 'ALL') params.status = status;
    const res = await apiClient.get<LessonListItem[]>('/api/lessons', { params });
    return res.data;
  },

  getLesson: async (id: string): Promise<LessonDetail> => {
    const res = await apiClient.get<LessonDetail>(`/api/lessons/${id}`);
    return res.data;
  },

  generateLesson: async (payload: CreateLessonPayload) => {
    const res = await apiClient.post('/api/lessons/generate', payload);
    return res.data;
  },

  updateLesson: async (id: string, payload: Partial<LessonDetail> & { change_description?: string }): Promise<LessonDetail> => {
    const res = await apiClient.put<LessonDetail>(`/api/lessons/${id}`, payload);
    return res.data;
  },

  deleteLesson: async (id: string) => {
    const res = await apiClient.delete(`/api/lessons/${id}`);
    return res.data;
  },

  // Research Sources
  getLessonSources: async (lessonId: string): Promise<ResearchSource[]> => {
    const res = await apiClient.get<ResearchSource[]>(`/api/research/lessons/${lessonId}/sources`);
    return res.data;
  },

  // Quality Control
  getQCReports: async (lessonId: string) => {
    const res = await apiClient.get(`/api/lessons/${lessonId}/qc`);
    return res.data;
  },

  rerunFactualQC: async (lessonId: string) => {
    const res = await apiClient.post(`/api/lessons/${lessonId}/qc/factual`);
    return res.data;
  },

  rerunInstructionalQC: async (lessonId: string) => {
    const res = await apiClient.post(`/api/lessons/${lessonId}/qc/instructional`);
    return res.data;
  },

  // QC Recommendations
  getRecommendations: async (lessonId: string): Promise<QCRecommendation[]> => {
    const res = await apiClient.get<QCRecommendation[]>(`/api/lessons/${lessonId}/recommendations`);
    return res.data;
  },

  applyRecommendation: async (recommendationId: string, editedFix?: string) => {
    const res = await apiClient.post(`/api/recommendations/${recommendationId}/apply`, {
      edited_fix: editedFix || null,
    });
    return res.data;
  },

  rejectRecommendation: async (recommendationId: string) => {
    const res = await apiClient.post(`/api/recommendations/${recommendationId}/reject`);
    return res.data;
  },

  // Preview & Exports
  getLessonPreview: async (lessonId: string) => {
    const res = await apiClient.get(`/api/lessons/${lessonId}/preview`);
    return res.data;
  },

  // Export URLs for direct browser downloads
  getLessonPdfUrl: (lessonId: string) => `${API_BASE_URL}/api/lessons/${lessonId}/export/pdf`,
  getFactualQcPdfUrl: (lessonId: string) => `${API_BASE_URL}/api/lessons/${lessonId}/export/qc/factual`,
  getInstructionalQcPdfUrl: (lessonId: string) => `${API_BASE_URL}/api/lessons/${lessonId}/export/qc/instructional`,
  getJsonExportUrl: (lessonId: string) => `${API_BASE_URL}/api/lessons/${lessonId}/export/json`,
};

