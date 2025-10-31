import { apiRequest } from '@/utils/api';
import {
  SessionScore,
  SessionScoresSummary,
  InitializeScoreRequest,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  CompleteSessionRequest,
} from '../types/session-scores.types';

const API_BASE = '/api/v1/session-scores';

/**
 * Initialize a score record for a student when they join a session
 * NOTE: This endpoint may not be available in the backend yet
 */
export const initializeScore = async (
  request: InitializeScoreRequest
): Promise<SessionScore | null> => {
  try {
    const response = await apiRequest(`${API_BASE}/initialize`, {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      // If endpoint doesn't exist (404), return null instead of throwing
      if (response.status === 404) {
        // Silently skip for 404 (endpoint not available)
        return null;
      }
      const errorText = await response.text();
      throw new Error(
        `Error ${response.status}: ${errorText || 'Error al inicializar puntaje'}`
      );
    }

    return await response.json();
  } catch (error) {
    // Silently skip network errors
    return null;
  }
};

/**
 * Submit an answer for a question in the session
 * NOTE: This endpoint may not be available in the backend yet
 */
export const submitAnswer = async (
  request: SubmitAnswerRequest
): Promise<SubmitAnswerResponse | null> => {
  try {
    const response = await apiRequest(`${API_BASE}/submit-answer`, {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      // If endpoint doesn't exist (404), return null instead of throwing
      if (response.status === 404) {
        // Silently skip for 404 (endpoint not available)
        return null;
      }
      const errorText = await response.text();
      throw new Error(
        `Error ${response.status}: ${errorText || 'Error al enviar respuesta'}`
      );
    }

    return await response.json();
  } catch (error) {
    // Silently skip network errors
    return null;
  }
};

/**
 * Mark a session as completed for a student
 * NOTE: This endpoint may not be available in the backend yet
 */
export const completeSession = async (
  request: CompleteSessionRequest
): Promise<SessionScore | null> => {
  try {
    const response = await apiRequest(`${API_BASE}/complete`, {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      // If endpoint doesn't exist (404), return null instead of throwing
      if (response.status === 404) {
        // Silently skip for 404 (endpoint not available)
        return null;
      }
      const errorText = await response.text();
      throw new Error(
        `Error ${response.status}: ${errorText || 'Error al completar sesión'}`
      );
    }

    return await response.json();
  } catch (error) {
    // Silently skip network errors
    return null;
  }
};

/**
 * Get all scores for a specific session (for teachers)
 * NOTE: This endpoint may not be available in the backend yet
 */
export const getSessionScores = async (
  sessionId: string
): Promise<SessionScoresSummary | null> => {
  try {
    const response = await apiRequest(`${API_BASE}/session/${sessionId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      // If endpoint doesn't exist (404), return null instead of throwing
      if (response.status === 404) {
        // Silently skip for 404 (endpoint not available)
        return null;
      }
      const errorText = await response.text();
      throw new Error(
        `Error ${response.status}: ${errorText || 'Error al obtener puntajes'}`
      );
    }

    return await response.json();
  } catch (error) {
    // Silently skip network errors
    return null;
  }
};

/**
 * Get a student's score for a specific session
 * NOTE: This endpoint may not be available in the backend yet
 */
export const getStudentScore = async (
  sessionId: string
): Promise<SessionScore | null> => {
  try {
    const response = await apiRequest(`${API_BASE}/student/${sessionId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      // If endpoint doesn't exist (404), return null instead of throwing
      if (response.status === 404) {
        // Silently skip for 404 (endpoint not available)
        return null;
      }
      const errorText = await response.text();
      throw new Error(
        `Error ${response.status}: ${errorText || 'Error al obtener puntaje del estudiante'}`
      );
    }

    return await response.json();
  } catch (error) {
    // Silently skip network errors
    return null;
  }
};

/**
 * Get all scores for the authenticated user
 */
export const getMyScores = async (): Promise<SessionScore[]> => {
  const response = await apiRequest(`${API_BASE}/user/my-scores`, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error ${response.status}: ${errorText || 'Error al obtener mis puntajes'}`
    );
  }

  return await response.json();
};

/**
 * Get all scores for a specific user (by userId)
 */
export const getUserScores = async (userId: string): Promise<SessionScore[]> => {
  const response = await apiRequest(`${API_BASE}/user/${userId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error ${response.status}: ${errorText || 'Error al obtener puntajes del usuario'}`
    );
  }

  return await response.json();
};

/**
 * Delete a score record
 */
export const deleteScore = async (scoreId: string): Promise<void> => {
  const response = await apiRequest(`${API_BASE}/${scoreId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error ${response.status}: ${errorText || 'Error al eliminar puntaje'}`
    );
  }
};
