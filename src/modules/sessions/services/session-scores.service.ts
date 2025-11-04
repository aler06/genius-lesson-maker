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
    console.log('📤 Sending complete session request:', {
      endpoint: `${API_BASE}/complete`,
      sessionId: request.sessionId,
      correo: request.correo,
      puntajeFinal: request.puntajeFinal,
      answersCount: request.respuestas.length
    });
    
    const response = await apiRequest(`${API_BASE}/complete`, {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      // If endpoint doesn't exist (404), return null instead of throwing
      if (response.status === 404) {
        console.warn('⚠️ Complete session endpoint not available (404)');
        return null;
      }
      const errorText = await response.text();
      console.error('❌ Error completing session:', response.status, errorText);
      throw new Error(
        `Error ${response.status}: ${errorText || 'Error al completar sesión'}`
      );
    }

    const result = await response.json();
    console.log('✅ Session completed successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Network error completing session:', error);
    // Silently skip network errors but log them
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
 * Check if a user has already completed a specific session
 * Returns the existing score if completed, null if not completed
 * 
 * Strategy: Use localStorage to track completed sessions per user email
 * This is more reliable than backend endpoints which may have permission issues
 */
export const checkSessionCompletion = async (
  sessionId: string,
  correo: string
): Promise<SessionScore | null> => {
  try {
    console.log('🔍 Checking session completion using localStorage:', { sessionId, correo });
    
    // Get completed sessions from localStorage
    const completedSessionsKey = `completed_sessions_${correo.toLowerCase()}`;
    const completedSessionsStr = localStorage.getItem(completedSessionsKey);
    
    if (!completedSessionsStr) {
      console.log('✅ No completed sessions found in localStorage - allowing access');
      return null;
    }
    
    const completedSessions = JSON.parse(completedSessionsStr);
    console.log('📊 Completed sessions from localStorage:', completedSessions);
    
    // Check if this session is in the completed list
    const completedSession = completedSessions[sessionId];
    
    if (completedSession) {
      console.warn('⚠️ User already completed this session - blocking access:', completedSession);
      return {
        sessionId,
        correo,
        puntajeFinal: completedSession.puntajeFinal || 0,
        tiempoTotal: completedSession.tiempoTotal || 0,
        respuestas: completedSession.respuestas || [],
        createdAt: completedSession.createdAt,
      } as SessionScore;
    }
    
    console.log('✅ User has not completed this session - allowing access');
    return null;
  } catch (error) {
    console.error('❌ Error checking session completion:', error);
    // If there's an error, fail open (allow access)
    return null;
  }
};

/**
 * Mark a session as completed in localStorage
 * Called after successfully completing a session
 */
export const markSessionAsCompleted = (
  sessionId: string,
  correo: string,
  puntajeFinal: number,
  tiempoTotal: number,
  respuestas: any[]
): void => {
  try {
    console.log('💾 Marking session as completed in localStorage:', { sessionId, correo, puntajeFinal });
    
    const completedSessionsKey = `completed_sessions_${correo.toLowerCase()}`;
    const completedSessionsStr = localStorage.getItem(completedSessionsKey);
    
    const completedSessions = completedSessionsStr ? JSON.parse(completedSessionsStr) : {};
    
    // Add this session to the completed list
    completedSessions[sessionId] = {
      puntajeFinal,
      tiempoTotal,
      respuestas,
      createdAt: new Date().toISOString(),
    };
    
    localStorage.setItem(completedSessionsKey, JSON.stringify(completedSessions));
    console.log('✅ Session marked as completed in localStorage');
  } catch (error) {
    console.error('❌ Error marking session as completed:', error);
  }
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
