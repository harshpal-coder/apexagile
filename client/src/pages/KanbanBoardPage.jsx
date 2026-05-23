import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Trash2,
  Paperclip,
  MessageSquare,
  Tag,
  AlertCircle,
  Clock,
  User,
  Users,
  CheckCircle,
  HelpCircle,
  Bookmark,
  Calendar,
  Layers,
  ChevronDown,
  Sparkles,
  X,
  PlusCircle,
  ArrowRight
} from 'lucide-react';
import { useWorkspaceStore } from '../context/useWorkspaceStore';
import { useTaskStore } from '../context/useTaskStore';
import { useSprintStore } from '../context/useSprintStore';
import { useAuthStore } from '../context/useAuthStore';
import { navigate } from '../utils/router';

export default function KanbanBoardPage() {
  const { user } = useAuthStore();
  const { activeProject, projectMembers } = useWorkspaceStore();
  const { activeSprint, sprints } = useSprintStore();
  
  const {
    tasks,
    fetchTasks,
    dragTask,
    updateTask,
    deleteTask,
    activeTask,
    fetchTaskDetails,
    activeComments,
    addComment,
    addAttachment
  } = useTaskStore();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  // Local Drag States
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Detail Modal & States
  const [detailOpen, setDetailOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [attachName, setAttachName] = useState('');
  const [attachOpen, setAttachOpen] = useState(false);
  const [newLabelText, setNewLabelText] = useState('');

  // Load project board data
  useEffect(() => {
    if (activeProject) {
      // Fetch only tasks of active sprint, or fetch all tasks of project
      // For Kanban, typically we show tasks belonging to the ACTIVE SPRINT,
      // or if no sprint is active, we show all tasks or backlog tasks.
      // Let's fetch all tasks of the project to let the user see everything on the board!
      fetchTasks(activeProject._id, null, {
        search: searchTerm,
        assignee: filterAssignee,
        priority: filterPriority
      });
    }
  }, [activeProject, searchTerm, filterAssignee, filterPriority]);

  // Kanban Columns configuration
  const columns = [
    { id: 'Backlog', name: 'Backlog', color: 'border-slate-500/30 text-slate-500 bg-slate-500/5' },
    { id: 'Todo', name: 'To Do', color: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/5' },
    { id: 'In Progress', name: 'In Progress', color: 'border-brand-500/30 text-brand-400 bg-brand-500/5' },
    { id: 'Review', name: 'Review', color: 'border-yellow-500/30 text-yellow-400 bg-yellow-500/5' },
    { id: 'Done', name: 'Done', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' }
  ];

  // Drag and Drop Binders
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.currentTarget.classList.add('grabbing-active');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('grabbing-active');
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    setDragOverColumn(colId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e, colId) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    // Call store drag action
    await dragTask(taskId, colId);
  };

  // Open issue details modal
  const handleOpenDetails = (task) => {
    fetchTaskDetails(task._id);
    setDetailOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailOpen(false);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !activeTask) return;

    const res = await addComment(activeTask._id, commentText);
    if (res.success) {
      setCommentText('');
    }
  };

  const handleAttachSubmit = async (e) => {
    e.preventDefault();
    if (!attachName.trim() || !activeTask) return;

    const res = await addAttachment(activeTask._id, attachName, Math.floor(Math.random() * 2000000) + 150000);
    if (res.success) {
      setAttachName('');
      setAttachOpen(false);
    }
  };

  const handleAddLabel = async () => {
    if (!newLabelText.trim() || !activeTask) return;
    const currentLabels = activeTask.labels || [];
    if (currentLabels.includes(newLabelText.trim())) return;

    const updated = [...currentLabels, newLabelText.trim()];
    await updateTask(activeTask._id, { labels: updated });
    setNewLabelText('');
  };

  const handleRemoveLabel = async (label) => {
    if (!activeTask) return;
    const updated = (activeTask.labels || []).filter(l => l !== label);
    await updateTask(activeTask._id, { labels: updated });
  };

  const handleDeleteTask = async () => {
    if (!activeTask) return;
    const res = await deleteTask(activeTask._id);
    if (res.success) {
      setDetailOpen(false);
    }
  };

  const getPriorityBadge = (p) => {
    const styles = {
      Critical: 'bg-red-500/10 text-red-500 font-extrabold',
      High: 'bg-orange-500/10 text-orange-500 font-bold',
      Medium: 'bg-brand-500/10 text-brand-500',
      Low: 'bg-slate-500/10 text-slate-500'
    };
    return styles[p] || styles.Medium;
  };

  const getTaskStatusHeader = (colId) => {
    const list = tasks.filter(t => t.status === colId);
    return list.length;
  };

  // Render text containing mentions with high-end highlighting
  const renderCommentContent = (text) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return <span key={i} className="text-brand-500 font-bold bg-brand-500/5 px-1 py-0.5 rounded">{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-6">
      {/* Filtering Hub */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white dark:bg-darkSurface p-4 rounded-2xl border border-slate-200 dark:border-darkBorder/40">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search boards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-100 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl focus:outline-none focus:border-brand-500 text-xs w-full sm:w-48"
            />
          </div>

          {/* Member filter */}
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="py-2 px-3 bg-slate-100 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl focus:outline-none focus:border-brand-500 text-xs text-slate-500"
          >
            <option value="">Filter: Assignee</option>
            {projectMembers.map(m => (
              <option key={m._id} value={m._id}>{m.username}</option>
            ))}
          </select>

          {/* Priority filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="py-2 px-3 bg-slate-100 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl focus:outline-none focus:border-brand-500 text-xs text-slate-500"
          >
            <option value="">Filter: Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        {activeSprint && (
          <span className="text-xs font-bold text-slate-400 bg-brand-500/10 px-3 py-1.5 rounded-xl border border-brand-500/20 text-brand-400">
            Sprint Board Active: {activeSprint.name}
          </span>
        )}
      </div>

      {/* Grid Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 overflow-x-auto pb-4">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          const isOver = dragOverColumn === col.id;
          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex flex-col flex-shrink-0 min-h-[500px] p-3 rounded-2xl bg-white dark:bg-darkSurface/50 border transition-all duration-200 ${
                isOver
                  ? 'border-brand-500 bg-brand-500/5 shadow-premium scale-[1.01]'
                  : 'border-slate-200 dark:border-darkBorder/40'
              }`}
            >
              {/* Header column title */}
              <div className="flex justify-between items-center px-1 mb-4">
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full border ${col.color.split(' ')[0]}`} />
                  <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                    {col.name}
                  </h4>
                </div>
                <span className="bg-slate-100 dark:bg-darkBorder/80 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500">
                  {colTasks.length}
                </span>
              </div>

              {/* Column Issue Cards */}
              <div className="flex-1 space-y-3">
                {colTasks.map(task => {
                  const assigneeUser = projectMembers.find(m => m._id === task.assignee);
                  return (
                    <motion.div
                      key={task._id}
                      layoutId={task._id}
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, task._id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleOpenDetails(task)}
                      whileHover={{ y: -3, scale: 1.01 }}
                      className="p-4 rounded-xl bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder shadow-sm cursor-grab hover:border-brand-500 dark:hover:border-brand-500/80 transition-all select-none space-y-3"
                    >
                      {/* Priority Tag & Key */}
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${getPriorityBadge(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 leading-none">{task.key}</span>
                      </div>

                      {/* Title description */}
                      <h5 className="text-xs font-bold leading-normal text-slate-800 dark:text-slate-200">
                        {task.title}
                      </h5>

                      {/* Labels */}
                      {task.labels && task.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {task.labels.map(l => (
                            <span key={l} className="px-1.5 py-0.5 bg-slate-100 dark:bg-darkBg text-[8px] font-bold text-slate-400 rounded">
                              {l}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer: User & Details */}
                      <div className="flex justify-between items-center border-t border-slate-100 dark:border-darkBorder/30 pt-3 text-[10px] text-slate-400">
                        <div className="flex items-center gap-2">
                          {task.comments && task.comments.length > 0 && (
                            <span className="flex items-center gap-0.5">
                              <MessageSquare className="w-3 h-3" /> {task.comments.length}
                            </span>
                          )}
                          {task.attachments && task.attachments.length > 0 && (
                            <span className="flex items-center gap-0.5">
                              <Paperclip className="w-3 h-3" /> {task.attachments.length}
                            </span>
                          )}
                        </div>

                        {/* Avatar */}
                        {assigneeUser ? (
                          <img
                            src={assigneeUser.avatar}
                            alt="Assignee"
                            className="w-5 h-5 rounded-full bg-slate-700"
                            title={assigneeUser.username}
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-[8px] text-slate-500 font-bold">
                            U
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAIL MODAL PANEL */}
      <AnimatePresence>
        {detailOpen && activeTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseDetails}
              className="absolute inset-0 bg-black"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: 20 }}
              className="relative w-full max-w-4xl p-8 rounded-2xl bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder shadow-glass text-xs grid grid-cols-1 md:grid-cols-3 gap-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Main Panel - Title, Description, Comments */}
              <div className="md:col-span-2 space-y-6">
                {/* Header breadcrumb & Deletion */}
                <div className="flex justify-between items-center">
                  <span className="font-mono text-slate-400 font-bold text-[10px] tracking-wide bg-slate-100 dark:bg-darkBg px-2 py-1 rounded">
                    {activeTask.key}
                  </span>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteTask}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCloseDetails}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-darkBorder rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Editable Title */}
                <div>
                  <input
                    type="text"
                    value={activeTask.title}
                    onChange={(e) => updateTask(activeTask._id, { title: e.target.value })}
                    className="w-full text-xl font-extrabold bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-darkBorder focus:border-brand-500 focus:outline-none py-1 text-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* Editable Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Description</label>
                  <textarea
                    value={activeTask.description || ''}
                    rows={4}
                    onChange={(e) => updateTask(activeTask._id, { description: e.target.value })}
                    placeholder="Add detailed markdown specifications here..."
                    className="w-full p-3 bg-slate-100/50 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 text-xs"
                  />
                </div>

                {/* Tags / Labels */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Labels / Tags
                  </label>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {(activeTask.labels || []).map(l => (
                      <span
                        key={l}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-darkBg text-slate-500 dark:text-slate-300 rounded-lg font-bold flex items-center gap-1.5 border border-slate-200 dark:border-darkBorder/40"
                      >
                        {l}
                        <button onClick={() => handleRemoveLabel(l)} className="hover:text-red-400">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                    <div className="relative inline-flex items-center">
                      <input
                        type="text"
                        placeholder="Add tag"
                        value={newLabelText}
                        onChange={(e) => setNewLabelText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddLabel()}
                        className="w-16 py-1 px-2 border border-slate-200 dark:border-darkBorder bg-transparent rounded-lg text-[10px] focus:outline-none text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Attachments Section */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-darkBorder/20">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                      <Paperclip className="w-3 h-3" /> Attachments
                    </label>
                    <button
                      type="button"
                      onClick={() => setAttachOpen(!attachOpen)}
                      className="text-[10px] font-bold text-brand-500 hover:underline"
                    >
                      + Attach File
                    </button>
                  </div>

                  {attachOpen && (
                    <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-darkBg rounded-xl border border-slate-200 dark:border-darkBorder">
                      <input
                        type="text"
                        placeholder="e.g. mock_wireframe.png"
                        value={attachName}
                        onChange={(e) => setAttachName(e.target.value)}
                        className="flex-1 bg-transparent py-1 text-[10px] focus:outline-none border-b border-transparent focus:border-brand-500"
                      />
                      <button onClick={handleAttachSubmit} className="py-1 px-3 bg-brand-500 text-white rounded text-[9px] font-bold">
                        Save
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    {(activeTask.attachments || []).map((file, i) => (
                      <div
                        key={i}
                        className="p-2.5 bg-slate-50 dark:bg-darkBg/30 border border-slate-200/50 dark:border-darkBorder/30 rounded-xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="truncate">
                          <span className="font-bold text-slate-700 dark:text-slate-200 truncate block">{file.name}</span>
                          <span className="text-[9px] text-slate-500 block font-mono">
                            {Math.round(file.size / 1024)} KB · {new Date(file.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <a href={file.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-brand-500 flex-shrink-0">
                          <Paperclip className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conversation Comments list */}
                <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-darkBorder/20">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /> Conversation Threads
                  </label>

                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {activeComments.length === 0 ? (
                      <p className="text-slate-500 py-2">No comments posted yet. Start the discussion below!</p>
                    ) : (
                      activeComments.map(c => (
                        <div key={c._id} className="flex items-start gap-3 text-xs">
                          <img src={c.authorDetails.avatar} alt="Author" className="w-7 h-7 rounded-full bg-slate-700 mt-0.5" />
                          <div className="flex-1 bg-slate-50 dark:bg-darkBg/30 border border-slate-200/50 dark:border-darkBorder/30 rounded-xl p-3">
                            <div className="flex justify-between items-center mb-1 text-[10px]">
                              <span className="font-bold text-slate-800 dark:text-slate-200">{c.authorDetails.username}</span>
                              <span className="text-slate-500 font-mono">
                                {new Date(c.createdAt).toLocaleDateString()} at{' '}
                                {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                              {renderCommentContent(c.content)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Comment Input */}
                  <form onSubmit={handleCommentSubmit} className="flex gap-3">
                    <img src={user ? user.avatar : 'https://api.dicebear.com/7.x/adventurer/svg'} alt="Me" className="w-8 h-8 rounded-full bg-slate-700" />
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Write comment... Use @username to notify"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="w-full pl-4 pr-16 py-2.5 bg-slate-100 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl focus:outline-none focus:border-brand-500 placeholder-slate-400 focus:ring-1 focus:ring-brand-500/20 text-xs"
                      />
                      <button
                        type="submit"
                        className="absolute right-2 top-1.5 py-1.5 px-3 bg-brand-500 text-white rounded-lg text-[10px] font-bold"
                      >
                        Send
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Side Panel - Status, Priority, Assignee */}
              <div className="bg-slate-50 dark:bg-darkBg/20 border border-slate-200/50 dark:border-darkBorder/30 rounded-2xl p-6 space-y-5 h-fit text-xs">
                {/* Status selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Workflow Status</label>
                  <select
                    value={activeTask.status}
                    onChange={(e) => updateTask(activeTask._id, { status: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 dark:border-darkBorder/80 bg-white dark:bg-darkSurface rounded-xl font-bold focus:outline-none focus:border-brand-500"
                  >
                    <option value="Backlog">Backlog</option>
                    <option value="Todo">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                {/* Priority selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Severity Priority</label>
                  <select
                    value={activeTask.priority}
                    onChange={(e) => updateTask(activeTask._id, { priority: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 dark:border-darkBorder/80 bg-white dark:bg-darkSurface rounded-xl font-bold focus:outline-none focus:border-brand-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                {/* Assignee switcher */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" /> Assignee
                  </label>
                  <select
                    value={activeTask.assignee || ''}
                    onChange={(e) => updateTask(activeTask._id, { assigneeId: e.target.value || null })}
                    className="w-full p-2.5 border border-slate-200 dark:border-darkBorder/80 bg-white dark:bg-darkSurface rounded-xl font-bold focus:outline-none focus:border-brand-500"
                  >
                    <option value="">Unassigned</option>
                    {projectMembers.map(m => (
                      <option key={m._id} value={m._id}>{m.username}</option>
                    ))}
                  </select>
                </div>

                {/* Sprint Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                    <Layers className="w-3 h-3 text-slate-400" /> Iteration Sprint
                  </label>
                  <select
                    value={activeTask.sprintId || ''}
                    onChange={(e) => updateTask(activeTask._id, { sprintId: e.target.value || null })}
                    className="w-full p-2.5 border border-slate-200 dark:border-darkBorder/80 bg-white dark:bg-darkSurface rounded-xl font-bold focus:outline-none focus:border-brand-500"
                  >
                    <option value="">Product Backlog</option>
                    {sprints.map(s => (
                      <option key={s._id} value={s._id}>[{s.status}] {s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Due Date Calendar */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" /> Due Date
                  </label>
                  <input
                    type="date"
                    value={activeTask.dueDate ? activeTask.dueDate.substring(0, 10) : ''}
                    onChange={(e) => updateTask(activeTask._id, { dueDate: e.target.value || null })}
                    className="w-full p-2.5 border border-slate-200 dark:border-darkBorder/80 bg-white dark:bg-darkSurface rounded-xl font-bold focus:outline-none focus:border-brand-500 text-slate-700 dark:text-slate-200"
                  />
                </div>

                {/* Audit details */}
                <div className="pt-4 border-t border-slate-200 dark:border-darkBorder/30 space-y-1 text-[9px] text-slate-500">
                  <p>CREATED: {new Date(activeTask.createdAt).toLocaleString()}</p>
                  <p>UPDATED: {new Date(activeTask.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
