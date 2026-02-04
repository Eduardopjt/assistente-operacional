import { BetterSqliteAdapter } from '../adapters/better-sqlite-adapter';
import { MigrationManager } from '../migrations';
import { UserRepositoryImpl } from '../repositories/user-repository';
import { CheckinRepositoryImpl } from '../repositories/checkin-repository';
import { FinanceRepositoryImpl } from '../repositories/finance-repository';
import { ProjectRepositoryImpl } from '../repositories/project-repository';
import { TaskRepositoryImpl } from '../repositories/task-repository';
import { AlertRepositoryImpl } from '../repositories/alert-repository';
import { Database } from '../database';

describe('Storage Integration Tests', () => {
  let db: Database;
  const testDbPath = ':memory:'; // In-memory database for tests

  beforeEach(() => {
    // Create fresh database for each test
    const adapter = new BetterSqliteAdapter();
    db = adapter.open(testDbPath);

    // Run migrations
    const migrationManager = new MigrationManager(db);
    migrationManager.migrate();
  });

  afterEach(() => {
    db.close();
  });

  describe('UserRepository', () => {
    it('should create and retrieve a user', () => {
      const repo = new UserRepositoryImpl(db);

      const user = repo.create({
        settings: {
          theme: 'dark',
          biometric_enabled: true,
          notifications_enabled: true,
        },
      });

      expect(user.id).toBeDefined();
      expect(user.created_at).toBeInstanceOf(Date);

      const retrieved = repo.getById(user.id);
      expect(retrieved).toBeTruthy();
      expect(retrieved?.settings.theme).toBe('dark');
      expect(retrieved?.settings.biometric_enabled).toBe(true);
    });

    it('should update user settings', () => {
      const repo = new UserRepositoryImpl(db);
      const user = repo.create({ settings: {} });

      user.settings.theme = 'light';
      user.settings.notifications_enabled = false;

      repo.update(user);

      const updated = repo.getById(user.id);
      expect(updated?.settings.theme).toBe('light');
      expect(updated?.settings.notifications_enabled).toBe(false);
    });
  });

  describe('CheckinRepository', () => {
    let userId: string;

    beforeEach(() => {
      const userRepo = new UserRepositoryImpl(db);
      userId = userRepo.create({ settings: {} }).id;
    });

    it('should create and retrieve a check-in', () => {
      const repo = new CheckinRepositoryImpl(db);

      const checkin = repo.create({
        user_id: userId,
        date: new Date(),
        caixa_status: 'tranquilo',
        energia: 'alta',
        pressao: 'leve',
        estado_calculado: 'ATTACK',
      });

      expect(checkin.id).toBeDefined();

      const retrieved = repo.getById(checkin.id);
      expect(retrieved).toBeTruthy();
      expect(retrieved?.caixa_status).toBe('tranquilo');
      expect(retrieved?.estado_calculado).toBe('ATTACK');
    });

    it('should get latest check-in', () => {
      const repo = new CheckinRepositoryImpl(db);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      repo.create({
        user_id: userId,
        date: yesterday,
        caixa_status: 'atencao',
        energia: 'media',
        pressao: 'normal',
      });

      repo.create({
        user_id: userId,
        date: new Date(),
        caixa_status: 'tranquilo',
        energia: 'alta',
        pressao: 'leve',
      });

      const latest = repo.getLatest(userId);
      expect(latest).toBeTruthy();
      expect(latest?.caixa_status).toBe('tranquilo');
    });
  });

  describe('FinanceRepository', () => {
    let userId: string;

    beforeEach(() => {
      const userRepo = new UserRepositoryImpl(db);
      userId = userRepo.create({ settings: {} }).id;
    });

    it('should create and retrieve financial entries', () => {
      const repo = new FinanceRepositoryImpl(db);

      const entrada = repo.create({
        user_id: userId,
        type: 'entrada',
        value: 500000, // R$ 5000
        category: 'Salário',
        date: new Date(),
        notes: 'Salário de janeiro',
      });

      expect(entrada.id).toBeDefined();
      expect(entrada.value).toBe(500000);

      const retrieved = repo.getById(entrada.id);
      expect(retrieved?.notes).toBe('Salário de janeiro');
    });

    it('should filter by type', () => {
      const repo = new FinanceRepositoryImpl(db);

      repo.create({
        user_id: userId,
        type: 'entrada',
        value: 500000,
        category: 'Salário',
        date: new Date(),
      });

      repo.create({
        user_id: userId,
        type: 'saida',
        value: 15000,
        category: 'Alimentação',
        date: new Date(),
      });

      const entradas = repo.getByType(userId, 'entrada');
      const saidas = repo.getByType(userId, 'saida');

      expect(entradas).toHaveLength(1);
      expect(saidas).toHaveLength(1);
      expect(entradas[0].type).toBe('entrada');
      expect(saidas[0].type).toBe('saida');
    });
  });

  describe('ProjectRepository', () => {
    let userId: string;

    beforeEach(() => {
      const userRepo = new UserRepositoryImpl(db);
      userId = userRepo.create({ settings: {} }).id;
    });

    it('should create and retrieve projects', () => {
      const repo = new ProjectRepositoryImpl(db);

      const project = repo.create({
        user_id: userId,
        name: 'Novo Produto',
        status: 'active',
        objective: 'Lançar MVP em 3 meses',
        next_action: 'Definir features do MVP',
      });

      expect(project.id).toBeDefined();
      expect(project.created_at).toBeInstanceOf(Date);

      const retrieved = repo.getById(project.id);
      expect(retrieved?.name).toBe('Novo Produto');
      expect(retrieved?.next_action).toBe('Definir features do MVP');
    });

    it('should filter by status', () => {
      const repo = new ProjectRepositoryImpl(db);

      repo.create({
        user_id: userId,
        name: 'Projeto Ativo',
        status: 'active',
        objective: 'Teste',
      });

      repo.create({
        user_id: userId,
        name: 'Projeto Pausado',
        status: 'paused',
        objective: 'Teste',
      });

      const active = repo.getByStatus(userId, 'active');
      expect(active).toHaveLength(1);
      expect(active[0].name).toBe('Projeto Ativo');
    });

    it('should detect stalled projects', () => {
      const repo = new ProjectRepositoryImpl(db);

      const oldProject = repo.create({
        user_id: userId,
        name: 'Projeto Parado',
        status: 'active',
        objective: 'Teste',
      });

      // Simulate old updated_at by directly updating DB
      db.prepare('UPDATE projects SET updated_at = ? WHERE id = ?').run(
        Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
        oldProject.id
      );

      const stalled = repo.getStalled(userId, 7); // 7 days inactive
      expect(stalled).toHaveLength(1);
      expect(stalled[0].id).toBe(oldProject.id);
    });
  });

  describe('TaskRepository', () => {
    let userId: string;
    let projectId: string;

    beforeEach(() => {
      const userRepo = new UserRepositoryImpl(db);
      userId = userRepo.create({ settings: {} }).id;

      const projectRepo = new ProjectRepositoryImpl(db);
      projectId = projectRepo.create({
        user_id: userId,
        name: 'Projeto Teste',
        status: 'active',
        objective: 'Teste',
      }).id;
    });

    it('should create and retrieve tasks', () => {
      const repo = new TaskRepositoryImpl(db);

      const task = repo.create({
        user_id: userId,
        description: 'Implementar feature X',
        linked_project_id: projectId,
        status: 'todo',
      });

      expect(task.id).toBeDefined();

      const retrieved = repo.getById(task.id);
      expect(retrieved?.description).toBe('Implementar feature X');
      expect(retrieved?.linked_project_id).toBe(projectId);
    });

    it('should filter by project', () => {
      const repo = new TaskRepositoryImpl(db);

      repo.create({
        user_id: userId,
        description: 'Task 1',
        linked_project_id: projectId,
        status: 'todo',
      });

      repo.create({
        user_id: userId,
        description: 'Task 2',
        linked_project_id: projectId,
        status: 'doing',
      });

      const projectTasks = repo.getByProject(projectId);
      expect(projectTasks).toHaveLength(2);
    });

    it('should mark task as complete', () => {
      const repo = new TaskRepositoryImpl(db);

      const task = repo.create({
        user_id: userId,
        description: 'Task completa',
        status: 'doing',
      });

      repo.markComplete(task.id);

      const completed = repo.getById(task.id);
      expect(completed?.status).toBe('done');
      expect(completed?.completed_at).toBeInstanceOf(Date);
    });
  });

  describe('AlertRepository', () => {
    let userId: string;

    beforeEach(() => {
      const userRepo = new UserRepositoryImpl(db);
      userId = userRepo.create({ settings: {} }).id;
    });

    it('should create and retrieve alerts', () => {
      const repo = new AlertRepositoryImpl(db);

      const alert = repo.create({
        user_id: userId,
        type: 'finance',
        message: 'Gastos acima do esperado',
        date: new Date(),
        resolved: false,
      });

      expect(alert.id).toBeDefined();

      const retrieved = repo.getById(alert.id);
      expect(retrieved?.message).toBe('Gastos acima do esperado');
      expect(retrieved?.resolved).toBe(false);
    });

    it('should filter unresolved alerts', () => {
      const repo = new AlertRepositoryImpl(db);

      repo.create({
        user_id: userId,
        type: 'finance',
        message: 'Alert 1',
        date: new Date(),
        resolved: false,
      });

      repo.create({
        user_id: userId,
        type: 'project',
        message: 'Alert 2',
        date: new Date(),
        resolved: true,
      });

      const unresolved = repo.getUnresolved(userId);
      expect(unresolved).toHaveLength(1);
      expect(unresolved[0].message).toBe('Alert 1');
    });

    it('should resolve alerts', () => {
      const repo = new AlertRepositoryImpl(db);

      const alert = repo.create({
        user_id: userId,
        type: 'overload',
        message: 'Muitos projetos',
        date: new Date(),
        resolved: false,
      });

      repo.resolve(alert.id);

      const resolved = repo.getById(alert.id);
      expect(resolved?.resolved).toBe(true);
    });
  });
});
