import { useState, useEffect } from 'react';
import { useAppStore } from '../store/app-store';
import { projectRepo } from '../services/storage';
import type { Project, ProjectStatus } from '@assistente/core';
import './Projects.css';

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
      const userProjects = projectRepo.getByUser(currentUser.id);
      setProjects(userProjects);
    }
  }, [currentUser]);

  const handleSaveProject = () => {
    if (!currentUser || !name || !objective) return;

    if (editingProject) {
      const updated: Project = {
        ...editingProject,
        name,
        objective,
        next_action: nextAction || undefined,
        status,
      };
      projectRepo.update(updated);
      updateProject(updated);
      setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
    } else {
      const project = projectRepo.create({
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
    <div className="projects-screen">
      <div className="projects-content">
        <div className="projects-header">
          <h1>📁 Projetos</h1>
          <button className="add-button" onClick={() => setShowModal(true)}>
            + Novo Projeto
          </button>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-value">{activeProjects.length}</span>
            <span className="stat-label">Ativos</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">
              {projects.filter((p) => p.status === 'paused').length}
            </span>
            <span className="stat-label">Pausados</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{projects.filter((p) => p.status === 'done').length}</span>
            <span className="stat-label">Concluídos</span>
          </div>
        </div>

        <div className="projects-section">
          <h2 className="section-title">Projetos Ativos</h2>
          {activeProjects.length === 0 ? (
            <div className="empty-state">
              <p>Nenhum projeto ativo</p>
            </div>
          ) : (
            <div className="projects-grid">
              {activeProjects.map((project) => (
                <div
                  key={project.id}
                  className="project-card"
                  onClick={() => openEditModal(project)}
                >
                  <div className="project-header">
                    <span className="project-name">{project.name}</span>
                    <div className="status-badge active">ATIVO</div>
                  </div>
                  <p className="project-objective">{project.objective}</p>
                  {project.next_action && (
                    <div className="next-action-box">
                      <span className="next-action-label">Próxima ação:</span>
                      <span className="next-action-text">{project.next_action}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {otherProjects.length > 0 && (
          <div className="projects-section">
            <h2 className="section-title">Outros Projetos</h2>
            <div className="projects-grid">
              {otherProjects.map((project) => {
                const statusInfo = STATUS_OPTIONS.find((s) => s.value === project.status)!;
                return (
                  <div
                    key={project.id}
                    className="project-card"
                    onClick={() => openEditModal(project)}
                  >
                    <div className="project-header">
                      <span className="project-name">{project.name}</span>
                      <div className="status-badge" style={{ color: statusInfo.color }}>
                        {statusInfo.label.toUpperCase()}
                      </div>
                    </div>
                    <p className="project-objective">{project.objective}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingProject ? 'Editar Projeto' : 'Novo Projeto'}</h2>

            <input
              className="input"
              placeholder="Nome do projeto"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <textarea
              className="input textarea"
              placeholder="Objetivo"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
            />

            <input
              className="input"
              placeholder="Próxima ação (opcional)"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
            />

            <div className="status-label">Status</div>
            <div className="status-toggle">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`status-button ${status === option.value ? 'active' : ''}`}
                  style={
                    status === option.value
                      ? {
                          backgroundColor: option.color + '20',
                          borderColor: option.color,
                          color: option.color,
                        }
                      : {}
                  }
                  onClick={() => setStatus(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="modal-buttons">
              <button className="modal-button cancel" onClick={closeModal}>
                Cancelar
              </button>
              <button className="modal-button save" onClick={handleSaveProject}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
