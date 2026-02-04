/**
 * Seed Data for Testing Automations
 * DELETE THIS FILE AFTER TESTING
 */

import { storage } from './storage';
import type { CaixaStatus, Energia, Pressao, EntryType, ProjectStatus } from '@assistente/core';

export async function seedTestData(userId: string) {
  const now = new Date();

  // Seed Check-ins (last 10 days with varied patterns)
  const checkins = [
    { days: 0, caixa: 'tranquilo' as CaixaStatus, energia: 'alta' as Energia, pressao: 'normal' as Pressao },
    { days: 1, caixa: 'tranquilo' as CaixaStatus, energia: 'media' as Energia, pressao: 'leve' as Pressao },
    { days: 2, caixa: 'atencao' as CaixaStatus, energia: 'media' as Energia, pressao: 'normal' as Pressao },
    { days: 3, caixa: 'tranquilo' as CaixaStatus, energia: 'alta' as Energia, pressao: 'leve' as Pressao },
    { days: 4, caixa: 'tranquilo' as CaixaStatus, energia: 'baixa' as Energia, pressao: 'alta' as Pressao },
    { days: 5, caixa: 'atencao' as CaixaStatus, energia: 'baixa' as Energia, pressao: 'alta' as Pressao },
    { days: 6, caixa: 'critico' as CaixaStatus, energia: 'baixa' as Energia, pressao: 'alta' as Pressao },
    { days: 7, caixa: 'atencao' as CaixaStatus, energia: 'media' as Energia, pressao: 'normal' as Pressao },
    { days: 8, caixa: 'tranquilo' as CaixaStatus, energia: 'alta' as Energia, pressao: 'leve' as Pressao },
    { days: 9, caixa: 'tranquilo' as CaixaStatus, energia: 'alta' as Energia, pressao: 'normal' as Pressao },
  ];

  for (const { days, caixa, energia, pressao } of checkins) {
    const date = new Date(now);
    date.setDate(date.getDate() - days);
    await storage.createCheckin({
      user_id: userId,
      date,
      caixa_status: caixa,
      energia,
      pressao,
    });
  }

  // Seed Financial Entries (last 30 days)
  const finances: Array<{ days: number; type: EntryType; value: number; category: string }> = [
    // Entradas
    { days: 1, type: 'entrada', value: 500000, category: 'Salário' },
    { days: 8, type: 'entrada', value: 150000, category: 'Freelance' },
    { days: 15, type: 'entrada', value: 80000, category: 'Freelance' },
    { days: 22, type: 'entrada', value: 30000, category: 'Investimentos' },
    
    // Saídas normais
    { days: 2, type: 'saida', value: 120000, category: 'Moradia' },
    { days: 3, type: 'saida', value: 35000, category: 'Alimentação' },
    { days: 4, type: 'saida', value: 8000, category: 'Transporte' },
    { days: 5, type: 'saida', value: 45000, category: 'Alimentação' },
    { days: 6, type: 'saida', value: 12000, category: 'Lazer' },
    { days: 7, type: 'saida', value: 25000, category: 'Saúde' },
    { days: 9, type: 'saida', value: 15000, category: 'Transporte' },
    { days: 10, type: 'saida', value: 38000, category: 'Alimentação' },
    { days: 11, type: 'saida', value: 95000, category: 'Educação' },
    { days: 12, type: 'saida', value: 22000, category: 'Lazer' },
    { days: 14, type: 'saida', value: 42000, category: 'Alimentação' },
    { days: 16, type: 'saida', value: 18000, category: 'Transporte' },
    { days: 18, type: 'saida', value: 55000, category: 'Saúde' },
    
    // ANOMALIAS - valores muito acima da média para detectar
    { days: 19, type: 'saida', value: 180000, category: 'Alimentação' }, // 4x média
    { days: 20, type: 'saida', value: 85000, category: 'Lazer' }, // 3x média
    { days: 24, type: 'saida', value: 250000, category: 'Saúde' }, // 5x média
  ];

  for (const { days, type, value, category } of finances) {
    const date = new Date(now);
    date.setDate(date.getDate() - days);
    await storage.createFinanceEntry({
      user_id: userId,
      type,
      value,
      category,
      date,
    });
  }

  // Seed Projects
  const projects = [
    {
      name: 'App Mobile - Assistente',
      objective: 'Lançar MVP do app de gestão executiva',
      next_action: 'Implementar tela de onboarding',
      status: 'active' as ProjectStatus,
    },
    {
      name: 'Curso Online - Produtividade',
      objective: 'Criar curso completo sobre produtividade para executivos',
      next_action: 'Gravar módulo 3',
      status: 'active' as ProjectStatus,
    },
    {
      name: 'E-commerce - Loja Virtual',
      objective: 'Migrar loja para plataforma própria',
      next_action: 'Integrar gateway de pagamento',
      status: 'active' as ProjectStatus,
    },
    {
      name: 'Blog Corporativo',
      objective: 'Aumentar tráfego orgânico em 300%',
      next_action: 'Publicar 2 artigos por semana',
      status: 'active' as ProjectStatus,
    },
    {
      name: 'Consultoria Tech',
      objective: 'Fechar 5 contratos de consultoria',
      next_action: undefined,
      status: 'active' as ProjectStatus,
    },
    {
      name: 'Reestruturação Financeira',
      objective: 'Reduzir custos operacionais em 20%',
      next_action: 'Renegociar contratos',
      status: 'paused' as ProjectStatus,
    },
    {
      name: 'MVP SaaS Analytics',
      objective: 'Validar ideia com 100 beta testers',
      next_action: undefined,
      status: 'done' as ProjectStatus,
    },
  ];

  for (const project of projects) {
    await storage.createProject({
      user_id: userId,
      ...project,
    });
  }

  // Seed some decisions
  await storage.createDecision({
    user_id: userId,
    date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    context: 'Cliente pediu desconto de 30% no projeto',
    decision: 'Negociar 15% - mantém margem saudável e demonstra flexibilidade',
  });

  await storage.createDecision({
    user_id: userId,
    date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    context: 'Proposta de sociedade em startup',
    decision: 'Consultoria paga - menor risco e retorno imediato',
  });

  console.log('✅ Seed data loaded successfully!');
}
