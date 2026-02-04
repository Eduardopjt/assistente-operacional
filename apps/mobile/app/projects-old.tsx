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

const STATUS_OPTIONS: { value: ProjectStatus; label: string; color: string }[] = [
  { value: 'active', label: 'Ativo', color: '#22C55E' },
  { value: 'paused', label: 'Pausado', color: '#FACC15' },
  { value: 'done', label: 'Concluído', color: '#9CA3AF' },
];

export default function ProjectsScreen() {
  const currentUser = useAppStore((state) => state.currentUser);
  const addProject = useAppStore((state) => state.addProject);
  const updateProject = useAppStore((state) => state.updateProject);

  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

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
  const otherProjects = projects.filter((p) => p.status !== 'active');

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{activeProjects.length}</Text>
            <Text style={styles.statLabel}>Ativos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {projects.filter((p) => p.status === 'paused').length}
            </Text>
            <Text style={styles.statLabel}>Pausados</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {projects.filter((p) => p.status === 'done').length}
            </Text>
            <Text style={styles.statLabel}>Concluídos</Text>
          </View>
        </View>

        {/* Add Button */}
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <Text style={styles.addButtonText}>+ Novo Projeto</Text>
        </TouchableOpacity>

        {/* Active Projects */}
        <Text style={styles.sectionTitle}>Projetos Ativos</Text>
        {activeProjects.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nenhum projeto ativo</Text>
          </View>
        ) : (
          activeProjects.map((project) => (
            <TouchableOpacity
              key={project.id}
              style={styles.projectCard}
              onPress={() => openEditModal(project)}
            >
              <View style={styles.projectHeader}>
                <Text style={styles.projectName}>{project.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: '#22C55E20' }]}>
                  <Text style={[styles.statusText, { color: '#22C55E' }]}>ATIVO</Text>
                </View>
              </View>
              <Text style={styles.projectObjective}>{project.objective}</Text>
              {project.next_action && (
                <View style={styles.nextActionBox}>
                  <Text style={styles.nextActionLabel}>Próxima ação:</Text>
                  <Text style={styles.nextActionText}>{project.next_action}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}

        {/* Other Projects */}
        {otherProjects.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Outros Projetos</Text>
            {otherProjects.map((project) => {
              const statusInfo = STATUS_OPTIONS.find((s) => s.value === project.status)!;
              return (
                <TouchableOpacity
                  key={project.id}
                  style={styles.projectCard}
                  onPress={() => openEditModal(project)}
                >
                  <View style={styles.projectHeader}>
                    <Text style={styles.projectName}>{project.name}</Text>
                    <View
                      style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}
                    >
                      <Text style={[styles.statusText, { color: statusInfo.color }]}>
                        {statusInfo.label.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.projectObjective}>{project.objective}</Text>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Nome do projeto"
              placeholderTextColor="#6B7280"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Objetivo"
              placeholderTextColor="#6B7280"
              multiline
              numberOfLines={3}
              value={objective}
              onChangeText={setObjective}
            />

            <TextInput
              style={styles.input}
              placeholder="Próxima ação (opcional)"
              placeholderTextColor="#6B7280"
              value={nextAction}
              onChangeText={setNextAction}
            />

            <Text style={styles.inputLabel}>Status</Text>
            <View style={styles.statusToggle}>
              {STATUS_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.statusButton,
                    status === option.value && styles.statusButtonActive,
                    status === option.value && {
                      backgroundColor: option.color + '20',
                      borderColor: option.color,
                    },
                  ]}
                  onPress={() => setStatus(option.value)}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      status === option.value && { color: option.color },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButtonCancel} onPress={closeModal}>
                <Text style={styles.modalButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonSave} onPress={handleSaveProject}>
                <Text style={styles.modalButtonSaveText}>Salvar</Text>
              </TouchableOpacity>
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
    backgroundColor: '#0F1115',
  },
  content: {
    padding: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1D24',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  addButton: {
    backgroundColor: '#22C55E',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F1115',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    marginTop: 8,
  },
  projectCard: {
    backgroundColor: '#1A1D24',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  projectObjective: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 8,
  },
  nextActionBox: {
    backgroundColor: '#22C55E10',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#22C55E',
  },
  nextActionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#22C55E',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  nextActionText: {
    fontSize: 14,
    color: '#E5E7EB',
    lineHeight: 20,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1D24',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#0F1115',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  statusToggle: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  statusButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#0F1115',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  statusButtonActive: {
    borderWidth: 2,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonCancel: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#374151',
    alignItems: 'center',
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  modalButtonSave: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#22C55E',
    alignItems: 'center',
  },
  modalButtonSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F1115',
  },
});
