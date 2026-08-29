import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/api';
import { 
  CheckSquare, 
  Square, 
  Calendar, 
  Plus, 
  FolderPlus,
  Trash2, 
  Search, 
  SlidersHorizontal, 
  LogOut, 
  Sun, 
  Moon,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Clock,
  ChevronDown
} from 'lucide-react';
import '../styles/dashboard.css';

interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'COMPLETED';
  category?: { id: number; name: string; color: string };
  tags: { id: number; name: string }[];
}

interface Category {
  id: number;
  name: string;
  color: string;
}

interface Tag {
  id: number;
  name: string;
}

interface Stats {
  totalTasks: number;
  completedToday: number;
  overdueTasks: number;
  pendingTasks: number;
  categoryDistribution: { id: number; name: string; color: string; count: number }[];
  last7DaysStats: { date: string; count: number }[];
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  
  // Estados locais
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Estados dos filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Estados do formulário de criação de tarefa
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [taskCategoryId, setTaskCategoryId] = useState('');
  const [taskTagsInput, setTaskTagsInput] = useState('');

  // Estados do formulário de criação de categoria
  const [categoryName, setCategoryName] = useState('');
  const [categoryColor, setCategoryColor] = useState('#3b82f6');

  // Alternar Tema Escuro/Claro
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  };

  // Queries (TanStack Query)
  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: () => apiRequest('/api/dashboard/stats')
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => apiRequest('/api/categories')
  });

  const { data: tags } = useQuery<Tag[]>({
    queryKey: ['tags'],
    queryFn: () => apiRequest('/api/tags')
  });

  // Filtros de busca no query param
  const tasksQueryKey = ['tasks', searchQuery, filterCategory, filterPriority, filterStatus, filterTag, sortBy, sortOrder];
  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: tasksQueryKey,
    queryFn: () => {
      let path = `/api/tasks?sortBy=${sortBy}&sortOrder=${sortOrder}`;
      if (searchQuery) path += `&q=${encodeURIComponent(searchQuery)}`;
      if (filterCategory) path += `&categoryId=${filterCategory}`;
      if (filterPriority) path += `&priority=${filterPriority}`;
      if (filterStatus) path += `&status=${filterStatus}`;
      if (filterTag) path += `&tag=${encodeURIComponent(filterTag)}`;
      return apiRequest(path);
    }
  });

  // Mutações
  const createTaskMutation = useMutation({
    mutationFn: (newTask: any) => apiRequest('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(newTask)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      setIsTaskModalOpen(false);
      resetTaskForm();
    }
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: 'PENDING' | 'COMPLETED' }) => 
      apiRequest(`/api/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/tasks/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    }
  });

  const createCategoryMutation = useMutation({
    mutationFn: (newCategory: any) => apiRequest('/api/categories', {
      method: 'POST',
      body: JSON.stringify(newCategory)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsCategoryModalOpen(false);
      setCategoryName('');
      setCategoryColor('#3b82f6');
    }
  });

  // Limpeza de formulários
  const resetTaskForm = () => {
    setTaskTitle('');
    setTaskDesc('');
    setTaskDueDate('');
    setTaskPriority('MEDIUM');
    setTaskCategoryId('');
    setTaskTagsInput('');
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;

    const tagsArray = taskTagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    createTaskMutation.mutate({
      title: taskTitle,
      description: taskDesc || null,
      dueDate: taskDueDate || null,
      priority: taskPriority,
      categoryId: taskCategoryId ? Number(taskCategoryId) : null,
      tags: tagsArray
    });
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName) return;

    createCategoryMutation.mutate({
      name: categoryName,
      color: categoryColor
    });
  };

  const handleToggleTask = (task: Task) => {
    const newStatus = task.status === 'PENDING' ? 'COMPLETED' : 'PENDING';
    updateTaskStatusMutation.mutate({ id: task.id, status: newStatus });
  };

  // Cores de prioridade de forma visual premium
  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'priority-high';
      case 'MEDIUM': return 'priority-medium';
      case 'LOW': return 'priority-low';
      default: return '';
    }
  };

  const formatPriorityText = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'Alta';
      case 'MEDIUM': return 'Média';
      case 'LOW': return 'Baixa';
      default: return '';
    }
  };

  const isOverdue = (dateStr?: string) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date() && new Date(dateStr).toDateString() !== new Date().toDateString();
  };

  return (
    <div className="dashboard-layout animate-fade">
      {/* Header Superior */}
      <header className="dashboard-header glass-panel">
        <div className="header-brand">
          <span className="brand-logo">⚡</span>
          <h1>Organiza</h1>
        </div>
        
        <div className="header-actions">
          <button className="theme-toggle btn btn-secondary" onClick={toggleTheme} title="Alternar tema">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <div className="user-profile">
            <span className="avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
            <div className="user-info">
              <span className="user-name">{user?.name || 'Usuário'}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
          
          <button className="logout-btn btn btn-secondary" onClick={logout} title="Sair da conta">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Painel Principal */}
      <main className="dashboard-main">
        {/* Painel de Controle (Métricas) */}
        <section className="dashboard-stats-grid">
          <div className="stat-card glass-panel border-left-blue">
            <div className="stat-icon bg-blue-trans">
              <TrendingUp size={24} className="text-blue" />
            </div>
            <div className="stat-details">
              <h3>Total de Tarefas</h3>
              <p className="stat-value">{statsLoading ? '...' : stats?.totalTasks}</p>
              <span className="stat-subtitle">No total criadas</span>
            </div>
          </div>

          <div className="stat-card glass-panel border-left-green">
            <div className="stat-icon bg-green-trans">
              <CheckCircle2 size={24} className="text-green" />
            </div>
            <div className="stat-details">
              <h3>Concluídas Hoje</h3>
              <p className="stat-value text-green">{statsLoading ? '...' : stats?.completedToday}</p>
              <span className="stat-subtitle">Taxa de sucesso diária</span>
            </div>
          </div>

          <div className="stat-card glass-panel border-left-red">
            <div className="stat-icon bg-red-trans">
              <Clock size={24} className="text-red" />
            </div>
            <div className="stat-details">
              <h3>Tarefas Atrasadas</h3>
              <p className="stat-value text-red">{statsLoading ? '...' : stats?.overdueTasks}</p>
              <span className="stat-subtitle">Requerem atenção</span>
            </div>
          </div>

          <div className="stat-card glass-panel border-left-orange">
            <div className="stat-icon bg-orange-trans">
              <AlertCircle size={24} className="text-orange" />
            </div>
            <div className="stat-details">
              <h3>Tarefas Pendentes</h3>
              <p className="stat-value text-orange">{statsLoading ? '...' : stats?.pendingTasks}</p>
              <span className="stat-subtitle">A fazer</span>
            </div>
          </div>
        </section>

        {/* Barra de Filtros e Busca */}
        <section className="tasks-control-bar glass-panel">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input 
              id="search-tasks"
              name="search-tasks"
              aria-label="Buscar tarefas pelo título ou descrição"
              type="text" 
              placeholder="Buscar tarefa pelo título ou descrição..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="control-actions">
            <button 
              className={`btn btn-secondary ${isFilterOpen ? 'active' : ''}`}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <SlidersHorizontal size={18} />
              Filtros Avançados
            </button>

            <button className="btn btn-primary" onClick={() => setIsTaskModalOpen(true)}>
              <Plus size={18} />
              Nova Tarefa
            </button>

            <button className="btn btn-secondary" onClick={() => setIsCategoryModalOpen(true)}>
              <FolderPlus size={18} />
              Nova Categoria
            </button>
          </div>
        </section>

        {/* Filtros Avançados Expansíveis */}
        {isFilterOpen && (
          <section className="advanced-filters-panel glass-panel animate-fade">
            <div className="filters-grid">
              <div className="filter-group">
                <label>Categoria</label>
                <div className="select-wrapper">
                  <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                    <option value="">Todas</option>
                    {categories?.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="select-chevron" size={16} />
                </div>
              </div>

              <div className="filter-group">
                <label>Prioridade</label>
                <div className="select-wrapper">
                  <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                    <option value="">Todas</option>
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                  </select>
                  <ChevronDown className="select-chevron" size={16} />
                </div>
              </div>

              <div className="filter-group">
                <label>Status</label>
                <div className="select-wrapper">
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">Todos</option>
                    <option value="PENDING">Pendente</option>
                    <option value="COMPLETED">Concluído</option>
                  </select>
                  <ChevronDown className="select-chevron" size={16} />
                </div>
              </div>

              <div className="filter-group">
                <label>Tag</label>
                <div className="select-wrapper">
                  <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)}>
                    <option value="">Todas</option>
                    {tags?.map(t => (
                      <option key={t.id} value={t.name}>#{t.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="select-chevron" size={16} />
                </div>
              </div>

              <div className="filter-group">
                <label>Ordenar Por</label>
                <div className="select-wrapper">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="createdAt">Data de Criação</option>
                    <option value="dueDate">Data de Prazo</option>
                    <option value="title">Ordem Alfabética</option>
                  </select>
                  <ChevronDown className="select-chevron" size={16} />
                </div>
              </div>

              <div className="filter-group">
                <label>Ordem</label>
                <div className="select-wrapper">
                  <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                    <option value="desc">Decrescente</option>
                    <option value="asc">Crescente</option>
                  </select>
                  <ChevronDown className="select-chevron" size={16} />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Listagem de Tarefas */}
        <section className="tasks-section">
          {tasksLoading ? (
            <div className="tasks-loading">
              <span className="spinner">⚡</span>
              <p>Carregando tarefas...</p>
            </div>
          ) : tasks && tasks.length > 0 ? (
            <div className="tasks-grid">
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  className={`task-card glass-panel ${task.status === 'COMPLETED' ? 'task-completed' : ''}`}
                >
                  <div className="task-card-header">
                    <button className="task-toggle" onClick={() => handleToggleTask(task)}>
                      {task.status === 'COMPLETED' ? (
                        <CheckSquare className="checked-icon text-green" size={22} />
                      ) : (
                        <Square className="unchecked-icon" size={22} />
                      )}
                    </button>
                    
                    <div className="task-title-area">
                      <h4 className="task-title">{task.title}</h4>
                      {task.category && (
                        <span 
                          className="category-badge"
                          style={{ backgroundColor: `${task.category.color}20`, color: task.category.color, border: `1px solid ${task.category.color}40` }}
                        >
                          {task.category.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {task.description && (
                    <p className="task-description">{task.description}</p>
                  )}

                  <div className="task-card-footer">
                    <div className="task-metadata">
                      {task.dueDate && (
                        <span className={`meta-item ${isOverdue(task.dueDate) && task.status === 'PENDING' ? 'text-red bg-red-trans' : ''}`}>
                          <Calendar size={14} />
                          {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                      
                      <span className={`meta-item ${getPriorityBadgeClass(task.priority)}`}>
                        {formatPriorityText(task.priority)}
                      </span>
                    </div>

                    <div className="task-tags">
                      {task.tags?.map(t => (
                        <span key={t.id} className="tag-badge">#{t.name}</span>
                      ))}
                    </div>

                    <button 
                      className="task-delete-btn"
                      onClick={() => deleteTaskMutation.mutate(task.id)}
                      title="Excluir tarefa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state-card glass-panel">
              <div className="empty-state-icon">📝</div>
              <h3>Nenhuma tarefa encontrada</h3>
              <p>Crie novas tarefas para começar a organizar sua vida ou limpe os filtros ativos.</p>
              <button className="btn btn-primary" onClick={() => setIsTaskModalOpen(true)}>
                Criar Primeira Tarefa
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Modal de Criação de Tarefa */}
      {isTaskModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel animate-fade">
            <div className="modal-header">
              <h3>Criar Nova Tarefa</h3>
              <button className="close-btn" onClick={() => setIsTaskModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleCreateTask} className="modal-form">
              <div className="form-group">
                <label htmlFor="task-title">Título*</label>
                <input 
                  id="task-title"
                  name="task-title"
                  aria-label="Título da tarefa"
                  type="text" 
                  className="input-field" 
                  placeholder="O que você precisa fazer?"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="task-desc">Descrição</label>
                <textarea 
                  id="task-desc"
                  name="task-desc"
                  aria-label="Descrição da tarefa"
                  className="input-field textarea-field" 
                  placeholder="Descreva os detalhes da tarefa..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label htmlFor="task-due-date">Data Limite (Prazo)</label>
                  <input 
                    id="task-due-date"
                    name="task-due-date"
                    aria-label="Data limite da tarefa"
                    type="date" 
                    className="input-field"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                  />
                </div>

                <div className="form-group flex-1">
                  <label htmlFor="task-priority">Prioridade</label>
                  <div className="select-wrapper">
                    <select 
                      id="task-priority"
                      name="task-priority"
                      aria-label="Prioridade da tarefa"
                      value={taskPriority} 
                      onChange={(e) => setTaskPriority(e.target.value as any)}
                    >
                      <option value="LOW">Baixa</option>
                      <option value="MEDIUM">Média</option>
                      <option value="HIGH">Alta</option>
                    </select>
                    <ChevronDown className="select-chevron" size={16} />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="task-category">Categoria</label>
                <div className="select-wrapper">
                  <select 
                    id="task-category"
                    name="task-category"
                    aria-label="Categoria da tarefa"
                    value={taskCategoryId} 
                    onChange={(e) => setTaskCategoryId(e.target.value)}
                  >
                    <option value="">Nenhuma</option>
                    {categories?.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="select-chevron" size={16} />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="task-tags">Tags (separadas por vírgula)</label>
                <input 
                  id="task-tags"
                  name="task-tags"
                  aria-label="Tags da tarefa"
                  type="text" 
                  className="input-field" 
                  placeholder="ex: urgente, faculdade, compras"
                  value={taskTagsInput}
                  onChange={(e) => setTaskTagsInput(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsTaskModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={createTaskMutation.isPending}>
                  Criar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Criação de Categoria */}
      {isCategoryModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel animate-fade" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Nova Categoria</h3>
              <button className="close-btn" onClick={() => setIsCategoryModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleCreateCategory} className="modal-form">
              <div className="form-group">
                <label htmlFor="category-name">Nome da Categoria</label>
                <input 
                  id="category-name"
                  name="category-name"
                  aria-label="Nome da categoria"
                  type="text" 
                  className="input-field" 
                  placeholder="ex: Pessoal, Lazer, Finanças"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category-color">Cor da Identificação</label>
                <div className="color-picker-group">
                  <input 
                    id="category-color"
                    name="category-color"
                    aria-label="Cor da categoria"
                    type="color" 
                    className="color-input"
                    value={categoryColor}
                    onChange={(e) => setCategoryColor(e.target.value)}
                  />
                  <span className="color-hex-value">{categoryColor}</span>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCategoryModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={createCategoryMutation.isPending}>
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
