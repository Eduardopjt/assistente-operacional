import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { useAppStore } from '../store/app-store';
import { storage } from '../services/storage';
import { Project, ProjectStatus } from '@assistente/core';
import { ExecutiveCard, PrimaryActionButton, SegmentedControl } from '../src/components';
import { colors, spacing, typography, borderRadius } from '../src/theme';
import { useOverloadAssessment } from '../src/hooks';

const STATUS_CONFIG = {
  active: { label: 'Ativo', color: colors.attack, bg: colors.attackLight },
  paused: { label: 'Pausado', color: colors.caution, bg: colors.cautionLight },
  done: { label: 'Concluído', color: colors.textTertiary, bg: colors.borderSubtle },
};

export default function ProjectsScreen() {
  const currentUser = useAppStore((state) => state.currentUser);
  const addProject = useAppStore((state) => state.addProject);
  const updateProject = useAppStore((state) => state.updateProject);

  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Overload Protection
  const { assessment } = useOverloadAssessment(currentUser?.id);

  const [name, setName] = useState('');
  const [objective, setObjective] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('active');

  useEffect(() => {
    if (currentUser) {
      storage.getProjectsByUser(currentUser.id).then(setProjects);
    }
  }, [currentUser]);

  const handleSaveProject = async () => {
    if (!currentUser || !name || !objective) return;

    if (editingProject) {
      const updated = {
        ...editingProject,
        name,
        objective,
        next_action: nextAction || undefined,
        status,
      };
      await storage.updateProject(updated);
      updateProject(updated);
      setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
    } else {
      const project = await storage.createProject({
        user_id: currentUser.id,
        name,
        objective,
        next_action: nextAction || undefined,
        status,
      });
      addProject(project);
      setProjects([project, ...projects]);
    }

    closeModal();
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setName(project.name);
    setObjective(project.objective);
    setNextAction(project.next_action || '');
    setStatus(project.status);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setName('');
    setObjective('');
    setNextAction('');
    setStatus('active');
  };

  const activeProjects = projects.filter((p) => p.status === 'active');
  const pausedProjects = projects.filter((p) => p.status === 'paused');
  const doneProjects = projects.filter((p) => p.status === 'done');

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Projetos</Text>
          <Text style={styles.subtitle}>Portfólio completo</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <ExecutiveCard elevated={false} padding="lg" style={styles.statCard}>
            <Text style={styles.statValue}>{activeProjects.length}</Text>
            <Text style={styles.statLabel}>Ativos</Text>
          </ExecutiveCard>
          <ExecutiveCard elevated={false} padding="lg" style={styles.statCard}>
            <Text style={styles.statValue}>{pausedProjects.length}</Text>
            <Text style={styles.statLabel}>Pausados</Text>
          </ExecutiveCard>
          <ExecutiveCard elevated={false} padding="lg" style={styles.statCard}>
            <Text style={styles.statValue}>{doneProjects.length}</Text>
            <Text style={styles.statLabel}>Finalizados</Text>
          </ExecutiveCard>
        </View>

        {/* Overload Warning */}
        {assessment &&
          (assessment.overloadLevel === 'high' || assessment.overloadLevel === 'critical') && (
            <ExecutiveCard elevated padding="lg" style={styles.overloadCard}>
              <View style={styles.overloadHeader}>
                <Text style={styles.overloadLabel}>
                  {assessment.overloadLevel === 'critical'
                    ? '🔴 SOBRECARGA CRÍTICA'
                    : '🟡 SOBRECARGA ALTA'}
                </Text>
                <Text style={styles.overloadScore}>{Math.round(assessment.score)}%</Text>
              </View>
              <Text style={styles.overloadDescription}>
                Você está em{' '}
                {assessment.overloadLevel === 'critical' ? 'risco severo' : 'risco moderado'} de
                burnout. Considere pausar projetos ou redistribuir prioridades.
              </Text>
              {assessment.recommendations.slice(0, 2).map((rec, idx) => (
                <Text key={idx} style={styles.overloadRecommendation}>
                  • {rec}
                </Text>
              ))}
            </ExecutiveCard>
          )}

        {/* Add Button */}
        <PrimaryActionButton onPress={() => setShowModal(true)} fullWidth size="md">
          Novo Projeto
        </PrimaryActionButton>

        {/* Active Projects */}
        {activeProjects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>PROJETOS ATIVOS</Text>
            {activeProjects.map((project) => (
              <TouchableOpacity
                key={project.id}
                onPress={() => openEditModal(project)}
                activeOpacity={0.7}
              >
                <ExecutiveCard elevated padding="lg">
                  <View style={styles.projectHeader}>
                    <Text style={styles.projectName}>{project.name}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: STATUS_CONFIG[project.status].bg },
                      ]}
                    >
                      <Text
                        style={[styles.statusText, { color: STATUS_CONFIG[project.status].color }]}
                      >
                        {STATUS_CONFIG[project.status].label.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.projectObjective}>{project.objective}</Text>
                  {project.next_action && (
                    <View style={styles.nextActionBox}>
                      <Text style={styles.nextActionLabel}>PRÓXIMA AÇÃO</Text>
                      <Text style={styles.nextActionText}>{project.next_action}</Text>
                    </View>
                  )}
                </ExecutiveCard>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Paused Projects */}
        {pausedProjects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>PROJETOS PAUSADOS</Text>
            {pausedProjects.map((project) => (
              <TouchableOpacity
                key={project.id}
                onPress={() => openEditModal(project)}
                activeOpacity={0.7}
              >
                <ExecutiveCard elevated={false} padding="lg">
                  <View style={styles.projectHeader}>
                    <Text style={styles.projectName}>{project.name}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: STATUS_CONFIG[project.status].bg },
                      ]}
                    >
                      <Text
                        style={[styles.statusText, { color: STATUS_CONFIG[project.status].color }]}
                      >
                        {STATUS_CONFIG[project.status].label.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.projectObjective}>{project.objective}</Text>
                </ExecutiveCard>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Done Projects */}
        {doneProjects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>PROJETOS FINALIZADOS</Text>
            {doneProjects.map((project) => (
              <TouchableOpacity
                key={project.id}
                onPress={() => openEditModal(project)}
                activeOpacity={0.7}
              >
                <ExecutiveCard elevated={false} padding="lg">
                  <View style={styles.projectHeader}>
                    <Text style={styles.projectName}>{project.name}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: STATUS_CONFIG[project.status].bg },
                      ]}
                    >
                      <Text
                        style={[styles.statusText, { color: STATUS_CONFIG[project.status].color }]}
                      >
                        {STATUS_CONFIG[project.status].label.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.projectObjective, { color: colors.textTertiary }]}>
                    {project.objective}
                  </Text>
                </ExecutiveCard>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {projects.length === 0 && (
          <ExecutiveCard elevated padding="xl">
            <Text style={styles.emptyText}>Nenhum projeto criado ainda</Text>
          </ExecutiveCard>
        )}
      </ScrollView>

      {/* Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
            </Text>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>NOME DO PROJETO</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Lançar produto digital"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>OBJETIVO</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Descreva o resultado esperado..."
                placeholderTextColor={colors.textMuted}
                value={objective}
                onChangeText={setObjective}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>PRÓXIMA AÇÃO (OPCIONAL)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Escrever roteiro do vídeo de vendas"
                placeholderTextColor={colors.textMuted}
                value={nextAction}
                onChangeText={setNextAction}
              />
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>STATUS</Text>
              <SegmentedControl
                options={[
                  { value: 'active' as ProjectStatus, label: 'Ativo' },
                  { value: 'paused' as ProjectStatus, label: 'Pausado' },
                  { value: 'done' as ProjectStatus, label: 'Finalizado' },
                ]}
                value={status}
                onChange={setStatus}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeModal}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <PrimaryActionButton
                onPress={handleSaveProject}
                disabled={!name || !objective}
                style={styles.saveButton}
              >
                {editingProject ? 'Atualizar' : 'Criar'}
              </PrimaryActionButton>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.tight,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
  },
  overloadCard: {
    borderLeftWidth: 3,
    borderLeftColor: colors.critical,
  },
  overloadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  overloadLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.critical,
    letterSpacing: typography.letterSpacing.wide,
  },
  overloadScore: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.critical,
  },
  overloadDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * 1.5,
    marginBottom: spacing.md,
  },
  overloadRecommendation: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    lineHeight: typography.fontSize.sm * 1.5,
    marginTop: spacing.xs,
  },
  section: {
    gap: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textTertiary,
    letterSpacing: typography.letterSpacing.wide,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  projectName: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginRight: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.wide,
  },
  projectObjective: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  nextActionBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  nextActionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    letterSpacing: typography.letterSpacing.wide,
    marginBottom: spacing.xs,
  },
  nextActionText: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  modalSection: {
    marginBottom: spacing.lg,
  },
  modalLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textTertiary,
    letterSpacing: typography.letterSpacing.wide,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  saveButton: {
    flex: 1,
  },
});
