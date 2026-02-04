/**
 * Automation Hooks
 * React hooks for integrating automation modules into mobile app
 */

import { useEffect, useState } from 'react';
import { storage } from '../../services/storage';
import {
  suggestCheckinValues,
  CheckinSuggestion,
  assessOverload,
  OverloadAssessment,
  detectSpendingAnomalies,
  SpendingAnomaly,
  projectFinances,
  FinancialProjection,
  generateWeeklySummary,
  WeeklySummary,
} from '@assistente/core';

/**
 * Hook: Smart check-in suggestions based on historical patterns
 */
export function useCheckinSuggestions(userId: string | undefined) {
  const [suggestion, setSuggestion] = useState<CheckinSuggestion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadSuggestions = async () => {
      try {
        setLoading(true);
        const history = await storage.getRecentCheckins(userId, 30);
        const result = suggestCheckinValues(history, new Date());
        setSuggestion(result);
      } catch (error) {
        console.error('Error loading check-in suggestions:', error);
        setSuggestion(null);
      } finally {
        setLoading(false);
      }
    };

    loadSuggestions();
  }, [userId]);

  return { suggestion, loading };
}

/**
 * Hook: Overload assessment to prevent burnout
 */
export function useOverloadAssessment(userId: string | undefined) {
  const [assessment, setAssessment] = useState<OverloadAssessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadAssessment = async () => {
      try {
        setLoading(true);
        const checkins = await storage.getRecentCheckins(userId, 7);
        const projects = await storage.getProjects(userId);
        const activeProjects = projects.filter((p) => p.status === 'active');

        const result = assessOverload(checkins, activeProjects);
        setAssessment(result);
      } catch (error) {
        console.error('Error loading overload assessment:', error);
        setAssessment(null);
      } finally {
        setLoading(false);
      }
    };

    loadAssessment();
  }, [userId]);

  return { assessment, loading };
}

/**
 * Hook: Spending anomaly detection
 */
export function useAnomalyDetection(userId: string | undefined, lookbackDays: number = 30) {
  const [anomalies, setAnomalies] = useState<SpendingAnomaly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadAnomalies = async () => {
      try {
        setLoading(true);
        const entries = await storage.getRecentFinance(userId, lookbackDays);
        const result = detectSpendingAnomalies(entries, lookbackDays);
        setAnomalies(result);
      } catch (error) {
        console.error('Error detecting anomalies:', error);
        setAnomalies([]);
      } finally {
        setLoading(false);
      }
    };

    loadAnomalies();
  }, [userId, lookbackDays]);

  return { anomalies, loading };
}

/**
 * Hook: Financial projections (30/60/90 days)
 */
export function useFinancialProjections(
  userId: string | undefined,
  currentBalance: number,
  days: 30 | 60 | 90 = 30
) {
  const [projection, setProjection] = useState<FinancialProjection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadProjections = async () => {
      try {
        setLoading(true);
        const entries = await storage.getRecentFinance(userId, 90);
        const result = projectFinances(currentBalance, entries, days);
        setProjection(result);
      } catch (error) {
        console.error('Error loading projections:', error);
        setProjection(null);
      } finally {
        setLoading(false);
      }
    };

    loadProjections();
  }, [userId, currentBalance, days]);

  return { projection, loading };
}

/**
 * Hook: Weekly summary report
 */
export function useWeeklySummary(userId: string | undefined) {
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadSummary = async () => {
      try {
        setLoading(true);

        // Get week boundaries (Monday to Sunday)
        const today = new Date();
        const dayOfWeek = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        monday.setHours(0, 0, 0, 0);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        // Fetch all data for the week
        const checkins = await storage.getRecentCheckins(userId, 14); // 2 weeks for trend
        const finances = await storage.getRecentFinance(userId, 14);
        const projects = await storage.getProjects(userId);
        const decisions = await storage.getDecisions(userId);

        const result = generateWeeklySummary(
          monday,
          sunday,
          checkins,
          finances,
          projects,
          decisions
        );

        setSummary(result);
      } catch (error) {
        console.error('Error loading weekly summary:', error);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, [userId]);

  return { summary, loading };
}
