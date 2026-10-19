import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  FolderKanban,
  Wrench,
  Settings,
  LogOut,
  Trash2,
  Check,
  Eye,
  Plus,
  Edit,
  Loader2,
  Search,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  Upload,
  Camera,
  Star,
  MessageSquare,
} from 'lucide-react';
import { api } from '../services/api';
import { Project, Skill, ContactMessage, ProfileInfo, AdminStats, AuthUser, Review } from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => void;
  currentProfile: ProfileInfo;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  onRefreshData,
  currentProfile,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'projects' | 'skills' | 'reviews' | 'settings'>('overview');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Admin Data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Selected message detail modal
  const [viewingMessage, setViewingMessage] = useState<ContactMessage | null>(null);

  // Project editing state
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [isNewProject, setIsNewProject] = useState(false);

  // Skill editing & upload state
  const [editingSkill, setEditingSkill] = useState<Partial<Skill> | null>(null);
  const [isNewSkill, setIsNewSkill] = useState(false);
  const [skillCategoryFilter, setSkillCategoryFilter] = useState<'all' | 'frontend' | 'backend' | 'design' | 'tools'>('all');
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [skillIconUploadingId, setSkillIconUploadingId] = useState<string | null>(null);
  const [skillSuccessMsg, setSkillSuccessMsg] = useState<string | null>(null);

  // Review editing state
  const [editingReview, setEditingReview] = useState<Partial<Review> | null>(null);
  const [isNewReview, setIsNewReview] = useState(false);
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [reviewRatingFilter, setReviewRatingFilter] = useState<number>(0);
  const [reviewStatusFilter, setReviewStatusFilter] = useState<'all' | 'published' | 'unpublished'>('all');

  // Deletion confirmation state (replaces blocked window.confirm)
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'skill' | 'project' | 'message' | 'review'; id: string; name: string } | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  // Password change state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

  // Profile edit state
  const [profileForm, setProfileForm] = useState<ProfileInfo>(currentProfile);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Double-submit & race condition protection states
  const [savingProject, setSavingProject] = useState(false);
  const [savingSkill, setSavingSkill] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Sync profileForm whenever currentProfile updates
  useEffect(() => {
    setProfileForm(currentProfile);
  }, [currentProfile]);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    setProfileSuccess(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        try {
          const newUrl = await api.uploadPhoto(base64);
          setProfileForm((prev) => ({ ...prev, portraitUrl: newUrl }));
          setProfileSuccess('Profile picture uploaded & updated across portfolio!');
          onRefreshData();
        } catch (err: any) {
          alert('Failed to upload photo: ' + err.message);
        } finally {
          setPhotoUploading(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Check auth on open
  useEffect(() => {
    if (isOpen) {
      checkAuth();
    }
  }, [isOpen]);

  const checkAuth = async () => {
    const token = api.getToken();
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const u = await api.getMe();
      setUser(u);
      loadAdminData();
    } catch {
      setUser(null);
    }
  };

  const loadAdminData = async () => {
    setLoadingData(true);
    try {
      const [s, m, p, sk, rev] = await Promise.all([
        api.getAdminStats(),
        api.getAdminMessages(statusFilter, searchQuery),
        api.getAdminProjects(),
        api.getSkills(),
        api.getAdminReviews().catch(() => []),
      ]);
      setStats(s);
      setMessages(m);
      setProjects(p);
      setSkills(sk);
      setReviews(rev);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      api.getAdminMessages(statusFilter, searchQuery).then(setMessages).catch(console.error);
    }
  }, [statusFilter, searchQuery]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await api.login(loginEmail, loginPassword);
      setUser(res.user);
      loadAdminData();
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Check your email and password.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    onRefreshData();
  };

  const handleStatusUpdate = async (id: string, status: 'new' | 'read' | 'replied') => {
    try {
      const updated = await api.updateMessageStatus(id, status);
      setMessages((prev) => prev.map((m) => (m.id === id ? updated : m)));
      if (viewingMessage && viewingMessage.id === id) {
        setViewingMessage(updated);
      }
      const newStats = await api.getAdminStats();
      setStats(newStats);
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleExecuteDelete = async () => {
    if (!confirmDelete || deletingLoading) return;
    setDeletingLoading(true);
    const { id, type } = confirmDelete;
    try {
      if (type === 'skill') {
        await api.deleteSkill(id);
        setSkills((prev) => prev.filter((s) => s.id !== id));
      } else if (type === 'project') {
        await api.deleteProject(id);
        setProjects((prev) => prev.filter((p) => p.id !== id));
      } else if (type === 'message') {
        await api.deleteMessage(id);
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (viewingMessage?.id === id) setViewingMessage(null);
      } else if (type === 'review') {
        await api.deleteAdminReview(id);
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
      setConfirmDelete(null);
      await loadAdminData();
      onRefreshData();
    } catch (err: any) {
      console.error('Delete error:', err);
      alert('Delete failed: ' + (err.message || 'Server error occurred'));
      await loadAdminData();
      setConfirmDelete(null);
    } finally {
      setDeletingLoading(false);
    }
  };

  const handleDeleteMessage = (id: string) => {
    setConfirmDelete({ type: 'message', id, name: 'inquiry message' });
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || savingProject) return;

    if (!editingProject.title?.trim() || !editingProject.description?.trim()) {
      alert('Please fill in required project title and description.');
      return;
    }

    setSavingProject(true);
    try {
      if (isNewProject) {
        const created = await api.createProject(editingProject);
        setProjects((prev) => [...prev, created]);
      } else if (editingProject.id) {
        const updated = await api.updateProject(editingProject.id, editingProject);
        setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      }
      setEditingProject(null);
      await loadAdminData();
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to save project');
    } finally {
      setSavingProject(false);
    }
  };

  const handleDeleteProject = (id: string, name?: string) => {
    setConfirmDelete({ type: 'project', id, name: name || 'project' });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingProfile) return;
    setSavingProfile(true);
    setProfileSuccess(null);
    try {
      const updated = await api.updateProfile(profileForm);
      setProfileForm(updated);
      setProfileSuccess('Profile details saved successfully!');
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwSuccess(null);
    setPwError(null);
    try {
      const msg = await api.changePassword(currentPw, newPw);
      setPwSuccess(msg);
      setCurrentPw('');
      setNewPw('');
    } catch (err: any) {
      setPwError(err.message || 'Password update failed');
    }
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill || !editingSkill.name?.trim() || savingSkill) return;

    setSavingSkill(true);
    try {
      const payload: Partial<Skill> = {
        name: editingSkill.name.trim(),
        category: (editingSkill.category as any) || 'frontend',
        proficiency: Number(editingSkill.proficiency) || 85,
        icon: editingSkill.icon?.trim() || 'code',
        featured: editingSkill.featured ?? true,
        sortOrder: Number(editingSkill.sortOrder) || 0,
      };

      if (isNewSkill) {
        const created = await api.createSkill(payload);
        setSkills((prev) => [...prev, created]);
      } else if (editingSkill.id) {
        const updated = await api.updateSkill(editingSkill.id, payload);
        setSkills((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      }
      setEditingSkill(null);
      await loadAdminData();
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to save skill');
    } finally {
      setSavingSkill(false);
    }
  };

  const handleDeleteSkill = (id: string, name: string) => {
    setConfirmDelete({ type: 'skill', id, name });
  };

  const handleUploadSkillIcon = async (skillId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Icon image must be smaller than 2MB');
      return;
    }

    setSkillIconUploadingId(skillId);
    setSkillSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        try {
          const updated = await api.updateSkill(skillId, { icon: base64 });
          setSkills((prev) => prev.map((s) => (s.id === skillId ? updated : s)));
          setSkillSuccessMsg(`Icon for "${updated.name}" updated successfully!`);
          setTimeout(() => setSkillSuccessMsg(null), 3500);
          onRefreshData();
        } catch (err: any) {
          alert('Failed to upload skill icon: ' + (err.message || 'Unknown error'));
        } finally {
          setSkillIconUploadingId(null);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleModalIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Icon image must be smaller than 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64 && editingSkill) {
        setEditingSkill({ ...editingSkill, icon: base64 });
      }
    };
    reader.readAsDataURL(file);
  };

  // Review management handlers
  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview || !editingReview.name?.trim() || !editingReview.quote?.trim() || savingReview) return;

    setSavingReview(true);
    try {
      if (isNewReview) {
        const created = await api.createAdminReview(editingReview);
        setReviews((prev) => [created, ...prev]);
      } else if (editingReview.id) {
        const updated = await api.updateAdminReview(editingReview.id, editingReview);
        setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      }
      setEditingReview(null);
      await loadAdminData();
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to save review');
    } finally {
      setSavingReview(false);
    }
  };

  const handleTogglePublishReview = async (id: string) => {
    try {
      const updated = await api.togglePublishReview(id);
      setReviews((prev) => prev.map((r) => (r.id === id ? updated : r)));
      await loadAdminData();
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle review visibility');
    }
  };

  const handleDeleteReview = (id: string, name: string) => {
    setConfirmDelete({ type: 'review', id, name: `review by "${name}"` });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-5xl bg-[#06162D] border border-[#008CFF]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#008CFF]/20 bg-[#020B1B]/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#00A3FF] bg-[#020B1B] shadow-[0_0_12px_rgba(0,163,255,0.4)] shrink-0 flex items-center justify-center">
              <img
                src={profileForm.portraitUrl || currentProfile.portraitUrl || '/images/sohail_portrait.png'}
                alt="Muhammad Sohail"
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  e.currentTarget.src = '/images/sohail_formal.svg';
                }}
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-base md:text-lg font-bold text-[#F8FAFC] truncate max-w-[170px] xs:max-w-xs sm:max-w-none">
                Muhammad Sohail Portfolio Management
              </h2>
              <p className="text-[10px] sm:text-[11px] text-[#00CFFF] truncate">
                {user ? `Logged in as ${user.email}` : 'Restricted Admin Access'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg bg-[#0B1F3F] border border-[#008CFF]/30 text-xs text-[#A9B9D0] hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#A9B9D0] hover:text-white hover:bg-[#0B1F3F] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {!user ? (
          /* LOGIN SCREEN */
          <div className="flex-1 overflow-y-auto flex items-center justify-center p-6 bg-[#020B1B]">
            <div className="w-full max-w-md p-8 rounded-2xl bg-[#06162D] border border-[#008CFF]/30 shadow-xl space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#0B1F3F] border border-[#008CFF]/40 text-[#00CFFF] flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-[#F8FAFC]">Admin Authentication</h3>
                <p className="text-xs text-[#A9B9D0]">
                  Enter your credentials to manage inquiries, projects, and portfolio settings.
                </p>
              </div>

              {loginError && (
                <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#A9B9D0]">Admin Email</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    autoComplete="username"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#020B1B] text-[#F8FAFC] border border-[#008CFF]/30 text-sm focus:border-[#00CFFF] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#A9B9D0]">Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#020B1B] text-[#F8FAFC] border border-[#008CFF]/30 text-sm focus:border-[#00CFFF] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#008CFF] to-[#00CFFF] hover:from-[#00A3FF] hover:to-[#00D9FF] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg shadow-[#008CFF]/25 hover:shadow-[#008CFF]/40"
                >
                  {loginLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <span>Sign In to Dashboard</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED DASHBOARD */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-w-0">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-56 bg-[#020B1B] border-b md:border-b-0 md:border-r border-[#008CFF]/20 p-2 sm:p-3 gap-1.5 md:gap-0 md:space-y-1.5 shrink-0 flex md:flex-col overflow-x-auto md:overflow-visible">
              <button
                onClick={() => setActiveTab('overview')}
                className={`shrink-0 md:shrink md:w-full flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'bg-[#06162D] text-[#00CFFF] border border-[#008CFF]/40'
                    : 'text-[#A9B9D0] hover:text-white hover:bg-[#06162D]/50'
                }`}
              >
                <FolderKanban className="w-4 h-4" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('messages')}
                className={`shrink-0 md:shrink md:w-full flex items-center justify-between gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'messages'
                    ? 'bg-[#06162D] text-[#00CFFF] border border-[#008CFF]/40'
                    : 'text-[#A9B9D0] hover:text-white hover:bg-[#06162D]/50'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <Mail className="w-4 h-4" />
                  <span>Messages</span>
                </div>
                {stats && stats.newMessages > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#008CFF] text-white text-[10px]">
                    {stats.newMessages}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('projects')}
                className={`shrink-0 md:shrink md:w-full flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'projects'
                    ? 'bg-[#06162D] text-[#00CFFF] border border-[#008CFF]/40'
                    : 'text-[#A9B9D0] hover:text-white hover:bg-[#06162D]/50'
                }`}
              >
                <FolderKanban className="w-4 h-4" />
                <span>Projects</span>
              </button>

              <button
                onClick={() => setActiveTab('skills')}
                className={`shrink-0 md:shrink md:w-full flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'skills'
                    ? 'bg-[#06162D] text-[#00CFFF] border border-[#008CFF]/40'
                    : 'text-[#A9B9D0] hover:text-white hover:bg-[#06162D]/50'
                }`}
              >
                <Wrench className="w-4 h-4" />
                <span>Skills</span>
              </button>

              <button
                onClick={() => setActiveTab('reviews')}
                className={`shrink-0 md:shrink md:w-full flex items-center justify-between gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'reviews'
                    ? 'bg-[#06162D] text-[#00CFFF] border border-[#008CFF]/40'
                    : 'text-[#A9B9D0] hover:text-white hover:bg-[#06162D]/50'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <Star className="w-4 h-4" />
                  <span>Reviews</span>
                </div>
                {reviews.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#0B1F3F] text-[#00CFFF] border border-[#008CFF]/30 text-[10px]">
                    {reviews.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`shrink-0 md:shrink md:w-full flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'bg-[#06162D] text-[#00CFFF] border border-[#008CFF]/40'
                    : 'text-[#A9B9D0] hover:text-white hover:bg-[#06162D]/50'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>

            {/* Main Panel */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#041024]">
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#F8FAFC]">Dashboard Overview</h3>

                  {/* 4 Stats Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-[#06162D] border border-[#008CFF]/25">
                      <p className="text-xs text-[#A9B9D0]">Total Messages</p>
                      <p className="text-2xl font-extrabold text-[#F8FAFC] mt-1">
                        {stats?.totalMessages ?? 0}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#06162D] border border-[#00CFFF]/40">
                      <p className="text-xs text-[#A9B9D0]">New Inquiries</p>
                      <p className="text-2xl font-extrabold text-[#00CFFF] mt-1">
                        {stats?.newMessages ?? 0}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#06162D] border border-[#008CFF]/25">
                      <p className="text-xs text-[#A9B9D0]">Total Projects</p>
                      <p className="text-2xl font-extrabold text-[#F8FAFC] mt-1">
                        {stats?.totalProjects ?? 0}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#06162D] border border-[#008CFF]/25">
                      <p className="text-xs text-[#A9B9D0]">Total Skills</p>
                      <p className="text-2xl font-extrabold text-[#F8FAFC] mt-1">
                        {stats?.totalSkills ?? 0}
                      </p>
                    </div>
                  </div>

                  {/* Recent Messages Preview */}
                  <div className="p-5 rounded-2xl bg-[#06162D] border border-[#008CFF]/20 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[#F8FAFC]">Latest Inquiries</h4>
                      <button
                        onClick={() => setActiveTab('messages')}
                        className="text-xs text-[#00CFFF] hover:underline"
                      >
                        View all →
                      </button>
                    </div>

                    <div className="space-y-2">
                      {messages.slice(0, 3).map((m) => (
                        <div
                          key={m.id}
                          onClick={() => {
                            setViewingMessage(m);
                            setActiveTab('messages');
                          }}
                          className="p-3 rounded-xl bg-[#020B1B] hover:bg-[#0B1F3F] border border-[#008CFF]/15 cursor-pointer flex items-center justify-between"
                        >
                          <div>
                            <p className="font-semibold text-xs text-[#F8FAFC]">
                              {m.name} - <span className="text-[#A9B9D0]">{m.subject}</span>
                            </p>
                            <p className="text-[11px] text-[#A9B9D0]/70 mt-0.5 line-clamp-1">{m.message}</p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                              m.status === 'new'
                                ? 'bg-amber-500/20 text-amber-300'
                                : m.status === 'read'
                                ? 'bg-sky-500/20 text-sky-300'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {m.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MESSAGES */}
              {activeTab === 'messages' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h3 className="text-xl font-bold text-[#F8FAFC]">Contact Inquiries</h3>

                    {/* Filters & Search */}
                    <div className="flex items-center gap-2">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-[#06162D] border border-[#008CFF]/30 text-xs text-[#F8FAFC] focus:outline-none"
                      >
                        <option value="">All Statuses</option>
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                      </select>

                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8 pr-3 py-1.5 rounded-xl bg-[#06162D] border border-[#008CFF]/30 text-xs text-[#F8FAFC] placeholder-[#A9B9D0]/50 focus:outline-none"
                        />
                        <Search className="w-3.5 h-3.5 text-[#A9B9D0] absolute left-2.5 top-2" />
                      </div>
                    </div>
                  </div>

                  {/* Messages Table/List */}
                  <div className="space-y-2">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className="p-4 rounded-xl bg-[#06162D] border border-[#008CFF]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#00CFFF]/40 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#F8FAFC]">{m.name}</span>
                            <span className="text-xs text-[#00CFFF]">{m.email}</span>
                            {m.phone && (
                              <span className="text-xs text-[#A9B9D0]">({m.phone})</span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-[#A9B9D0]">{m.subject}</p>
                          <p className="text-xs text-[#A9B9D0]/80 line-clamp-1">{m.message}</p>
                          <p className="text-[10px] text-[#A9B9D0]/50">
                            Received: {new Date(m.createdAt).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            value={m.status}
                            onChange={(e) =>
                              handleStatusUpdate(m.id, e.target.value as 'new' | 'read' | 'replied')
                            }
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold focus:outline-none ${
                              m.status === 'new'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : m.status === 'read'
                                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            <option value="new">New</option>
                            <option value="read">Read</option>
                            <option value="replied">Replied</option>
                          </select>

                          <button
                            onClick={() => setViewingMessage(m)}
                            title="View Full Message"
                            className="p-1.5 rounded-lg bg-[#0B1F3F] text-[#00CFFF] hover:bg-[#008CFF] hover:text-white transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteMessage(m.id)}
                            title="Delete"
                            className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-900 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {messages.length === 0 && (
                      <div className="text-center py-12 text-sm text-[#A9B9D0]">
                        No messages found matching your criteria.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: PROJECTS */}
              {activeTab === 'projects' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[#F8FAFC]">Projects Portfolio</h3>
                    <button
                      onClick={() => {
                        setEditingProject({
                          title: '',
                          slug: `project-${Date.now().toString().slice(-4)}`,
                          description: '',
                          imageUrl: '/images/project_portfolio.svg',
                          technologies: ['React', 'Tailwind CSS'],
                          category: 'web',
                          liveDemoUrl: '',
                          githubUrl: '',
                          published: true,
                          featured: false,
                          sortOrder: projects.length + 1,
                        });
                        setIsNewProject(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#008CFF] to-[#00CFFF] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Project</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map((proj) => (
                      <div
                        key={proj.id}
                        className="p-4 rounded-xl bg-[#06162D] border border-[#008CFF]/20 flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className="font-bold text-sm text-[#F8FAFC]">{proj.title}</h4>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                proj.published
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-zinc-700 text-zinc-300'
                              }`}
                            >
                              {proj.published ? 'Published' : 'Draft'}
                            </span>
                          </div>
                          <p className="text-xs text-[#A9B9D0] line-clamp-2">{proj.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {proj.technologies.map((t, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded bg-[#0B1F3F] text-[10px] text-[#00CFFF]"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#008CFF]/15 flex items-center justify-between text-xs">
                          <span className="text-[#A9B9D0]/70 capitalize">{proj.category}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingProject({
                                  ...proj,
                                  technologies: [...(proj.technologies || [])],
                                });
                                setIsNewProject(false);
                              }}
                              className="p-1 text-[#00CFFF] hover:text-white"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProject(proj.id, proj.title)}
                              className="p-1 text-rose-400 hover:text-rose-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: SKILLS */}
              {activeTab === 'skills' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-[#F8FAFC]">Technical Skills</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0B1F3F] border border-[#008CFF]/30 text-[#00CFFF]">
                          {skills.length} Total
                        </span>
                      </div>
                      <p className="text-xs text-[#A9B9D0]">
                        Manage technical proficiencies and upload custom logos/icons displayed on the portfolio
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingSkill({
                          name: '',
                          category: 'frontend',
                          proficiency: 85,
                          icon: 'code',
                          featured: true,
                          sortOrder: skills.length + 1,
                        });
                        setIsNewSkill(true);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#008CFF] to-[#00CFFF] hover:from-[#00A3FF] hover:to-[#00D9FF] flex items-center justify-center gap-2 shadow-md shadow-[#008CFF]/25 hover:shadow-[#008CFF]/45 transition-all cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Skill</span>
                    </button>
                  </div>

                  {/* Success notification banner */}
                  {skillSuccessMsg && (
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
                      <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>{skillSuccessMsg}</span>
                    </div>
                  )}

                  {/* Search and Category Filter Tabs */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-b border-[#008CFF]/15 pb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {(['all', 'frontend', 'backend', 'design', 'tools'] as const).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSkillCategoryFilter(cat)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize cursor-pointer ${
                            skillCategoryFilter === cat
                              ? 'bg-[#008CFF] text-white shadow-sm'
                              : 'bg-[#06162D] text-[#A9B9D0] hover:text-white hover:bg-[#0B1F3F] border border-[#008CFF]/20'
                          }`}
                        >
                          {cat === 'all' ? 'All Skills' : cat}
                          {cat !== 'all' && (
                            <span className="ml-1.5 opacity-70 text-[10px]">
                              ({skills.filter((s) => s.category.toLowerCase() === cat).length})
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="relative w-full sm:w-56 shrink-0">
                      <Search className="w-3.5 h-3.5 text-[#A9B9D0] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search skills..."
                        value={skillSearchQuery}
                        onChange={(e) => setSkillSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#020B1B] text-xs text-white border border-[#008CFF]/25 focus:border-[#00CFFF] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Skills Grid with Working Upload and Remove Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {skills
                      .filter(
                        (s) =>
                          (skillCategoryFilter === 'all' || s.category.toLowerCase() === skillCategoryFilter) &&
                          (!skillSearchQuery.trim() ||
                            s.name.toLowerCase().includes(skillSearchQuery.trim().toLowerCase()) ||
                            s.category.toLowerCase().includes(skillSearchQuery.trim().toLowerCase()))
                      )
                      .map((s) => {
                        const categoryColor =
                          s.category === 'frontend'
                            ? 'text-sky-300 border-sky-500/30 bg-sky-500/10'
                            : s.category === 'backend'
                            ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10'
                            : s.category === 'design'
                            ? 'text-purple-300 border-purple-500/30 bg-purple-500/10'
                            : 'text-amber-300 border-amber-500/30 bg-amber-500/10';

                        const isCustomImg =
                          s.icon &&
                          (s.icon.startsWith('data:image') ||
                            s.icon.startsWith('http://') ||
                            s.icon.startsWith('https://') ||
                            s.icon.startsWith('/'));

                        return (
                          <div
                            key={s.id}
                            className="p-3.5 rounded-xl bg-[#06162D] border border-[#008CFF]/25 hover:border-[#008CFF]/50 transition-all flex flex-col justify-between gap-3 group shadow-sm hover:shadow-md"
                          >
                            {/* Skill Info Row */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                {/* Icon Preview */}
                                <div className="w-11 h-11 rounded-xl bg-[#020B1B] border border-[#008CFF]/30 flex items-center justify-center p-1.5 overflow-hidden shrink-0 shadow-inner group-hover:border-[#00CFFF]/50 transition-colors">
                                  {isCustomImg ? (
                                    <img
                                      src={s.icon}
                                      alt={s.name}
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <div className="w-full h-full rounded-lg bg-[#008CFF]/15 flex items-center justify-center text-[#00CFFF] font-bold text-xs uppercase">
                                      {(s.icon && s.icon.length <= 4 ? s.icon : s.name).slice(0, 2)}
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-sm text-[#F8FAFC] group-hover:text-[#00CFFF] transition-colors truncate">
                                    {s.name}
                                  </p>
                                  <span
                                    className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold border capitalize ${categoryColor}`}
                                  >
                                    {s.category}
                                  </span>
                                </div>
                              </div>

                              {/* Proficiency Value Tag (Replaces duplicate delete button in header) */}
                              <span className="px-2 py-0.5 rounded-md bg-[#020B1B] border border-[#008CFF]/25 text-[11px] font-mono font-bold text-[#00CFFF] shrink-0">
                                {s.proficiency ?? 85}%
                              </span>
                            </div>

                            {/* Proficiency Progress Bar */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-[#A9B9D0]">Proficiency Level</span>
                                <span className="text-[10px] text-[#A9B9D0]/70">Mastery</span>
                              </div>
                              <div className="w-full bg-[#020B1B] rounded-full h-1.5 overflow-hidden border border-[#008CFF]/20">
                                <div
                                  className="bg-gradient-to-r from-[#008CFF] to-[#00CFFF] h-full rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min(100, Math.max(0, s.proficiency ?? 85))}%` }}
                                />
                              </div>
                            </div>

                            {/* Action Row: Sleek, Perfectly Responsive 3-Column Grid */}
                            <div className="grid grid-cols-3 gap-1.5 pt-2.5 border-t border-[#008CFF]/15">
                              {/* Upload Button */}
                              <label
                                title="Upload custom icon / logo image for this skill"
                                className={`py-1.5 sm:py-2 px-1 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all border shadow-sm ${
                                  skillIconUploadingId === s.id
                                    ? 'bg-[#008CFF]/30 text-white border-[#008CFF] opacity-75'
                                    : 'bg-[#0B1F3F] text-[#00CFFF] hover:bg-[#008CFF] hover:text-white border-[#008CFF]/30 hover:border-[#00CFFF]'
                                }`}
                              >
                                {skillIconUploadingId === s.id ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                                    <span className="truncate">Uploading</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate">Upload</span>
                                  </>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  disabled={skillIconUploadingId === s.id}
                                  onChange={(e) => handleUploadSkillIcon(s.id, e)}
                                />
                              </label>

                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSkill({ ...s });
                                  setIsNewSkill(false);
                                }}
                                title="Edit skill properties"
                                className="py-1.5 sm:py-2 px-1 rounded-lg bg-[#06162D] text-[#A9B9D0] hover:text-white hover:bg-[#0B1F3F] border border-[#008CFF]/25 hover:border-[#008CFF]/45 text-[11px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 shadow-sm"
                              >
                                <Edit className="w-3.5 h-3.5 shrink-0 text-[#00CFFF]" />
                                <span className="truncate">Edit</span>
                              </button>

                              {/* Remove Button: Elegant, Highly Visible, 100% Responsive */}
                              <button
                                type="button"
                                onClick={() => handleDeleteSkill(s.id, s.name)}
                                title={`Remove ${s.name}`}
                                className="py-1.5 sm:py-2 px-1 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/25 hover:border-rose-600 text-[11px] font-semibold flex items-center justify-center gap-1 transition-all duration-200 cursor-pointer active:scale-95 group/rem shadow-sm hover:shadow-rose-600/25"
                              >
                                <Trash2 className="w-3.5 h-3.5 shrink-0 group-hover/rem:scale-110 transition-transform text-rose-400 group-hover/rem:text-white" />
                                <span className="truncate">Remove</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {skills.filter(
                    (s) =>
                      (skillCategoryFilter === 'all' || s.category.toLowerCase() === skillCategoryFilter) &&
                      (!skillSearchQuery.trim() ||
                        s.name.toLowerCase().includes(skillSearchQuery.trim().toLowerCase()) ||
                        s.category.toLowerCase().includes(skillSearchQuery.trim().toLowerCase()))
                  ).length === 0 && (
                    <div className="text-center py-12 rounded-xl bg-[#06162D] border border-dashed border-[#008CFF]/30 text-xs text-[#A9B9D0]">
                      No skills found matching your filter. Click &quot;Add New Skill&quot; to create one.
                    </div>
                  )}

                  {/* Add / Edit Skill Modal Dialog */}
                  {editingSkill && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                      <div
                        className="w-full max-w-md bg-[#06162D] border border-[#008CFF]/40 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between border-b border-[#008CFF]/20 pb-3">
                          <div className="flex items-center gap-2">
                            <Wrench className="w-4 h-4 text-[#00CFFF]" />
                            <h4 className="font-bold text-sm text-[#F8FAFC]">
                              {isNewSkill ? 'Add Technical Skill' : 'Edit Technical Skill'}
                            </h4>
                          </div>
                          <button
                            onClick={() => setEditingSkill(null)}
                            className="p-1 rounded-lg text-[#A9B9D0] hover:text-white hover:bg-[#0B1F3F] transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <form onSubmit={handleSaveSkill} className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-[#A9B9D0] mb-1">Skill Name *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Next.js, Python, Flutter, Docker"
                              value={editingSkill.name || ''}
                              onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-[#020B1B] text-xs text-white border border-[#008CFF]/30 focus:border-[#00CFFF] focus:outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-[#A9B9D0] mb-1">Category *</label>
                              <select
                                value={editingSkill.category || 'frontend'}
                                onChange={(e) =>
                                  setEditingSkill({
                                    ...editingSkill,
                                    category: e.target.value as any,
                                  })
                                }
                                className="w-full px-3 py-2.5 rounded-xl bg-[#020B1B] text-xs text-white border border-[#008CFF]/30 focus:border-[#00CFFF] focus:outline-none"
                              >
                                <option value="frontend">Frontend</option>
                                <option value="backend">Backend</option>
                                <option value="design">Design</option>
                                <option value="tools">Tools</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-[#A9B9D0] mb-1">
                                Proficiency ({editingSkill.proficiency ?? 85}%)
                              </label>
                              <input
                                type="number"
                                min={1}
                                max={100}
                                required
                                value={editingSkill.proficiency ?? 85}
                                onChange={(e) =>
                                  setEditingSkill({ ...editingSkill, proficiency: Number(e.target.value) })
                                }
                                className="w-full px-3 py-2.5 rounded-xl bg-[#020B1B] text-xs text-white border border-[#008CFF]/30 focus:border-[#00CFFF] focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Proficiency slider for quick adjustment */}
                          <div>
                            <input
                              type="range"
                              min={1}
                              max={100}
                              value={editingSkill.proficiency ?? 85}
                              onChange={(e) =>
                                setEditingSkill({ ...editingSkill, proficiency: Number(e.target.value) })
                              }
                              className="w-full accent-[#008CFF] cursor-pointer"
                            />
                          </div>

                          {/* Upload and Remove Icon Section */}
                          <div className="space-y-2.5 p-3.5 rounded-xl bg-[#020B1B] border border-[#008CFF]/25">
                            <label className="block text-xs font-semibold text-[#A9B9D0]">
                              Skill Icon / Logo Image
                            </label>

                            <div className="flex items-center gap-3">
                              {/* Current preview */}
                              <div className="w-12 h-12 rounded-xl bg-[#06162D] border border-[#008CFF]/40 flex items-center justify-center p-1.5 overflow-hidden shrink-0 shadow-inner">
                                {editingSkill.icon &&
                                (editingSkill.icon.startsWith('data:image') ||
                                  editingSkill.icon.startsWith('http://') ||
                                  editingSkill.icon.startsWith('https://') ||
                                  editingSkill.icon.startsWith('/')) ? (
                                  <img
                                    src={editingSkill.icon}
                                    alt="Skill Logo Preview"
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <div className="w-full h-full rounded-lg bg-[#008CFF]/20 flex items-center justify-center text-[#00CFFF] font-bold text-xs uppercase">
                                    {(editingSkill.icon && editingSkill.icon.length <= 4
                                      ? editingSkill.icon
                                      : editingSkill.name || 'SK'
                                    ).slice(0, 2)}
                                  </div>
                                )}
                              </div>

                              {/* Upload & Remove buttons */}
                              <div className="flex-1 flex flex-wrap items-center gap-2">
                                <label className="flex-1 sm:flex-initial px-3 py-2 sm:py-1.5 rounded-lg bg-[#0B1F3F] text-[#00CFFF] hover:bg-[#008CFF] hover:text-white border border-[#008CFF]/30 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all">
                                  <Upload className="w-3.5 h-3.5 shrink-0" />
                                  <span>Upload Logo</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleModalIconUpload}
                                  />
                                </label>

                                {editingSkill.icon &&
                                  (editingSkill.icon.startsWith('data:image') ||
                                    editingSkill.icon.length > 25) && (
                                    <button
                                      type="button"
                                      onClick={() => setEditingSkill({ ...editingSkill, icon: 'code' })}
                                      className="flex-1 sm:flex-initial px-3 py-2 sm:py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/25 hover:border-rose-600 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm hover:shadow-rose-600/25"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                      <span>Remove Logo</span>
                                    </button>
                                  )}
                              </div>
                            </div>

                            {/* Popular Presets */}
                            <div className="pt-1">
                              <p className="text-[11px] text-[#A9B9D0]/75 mb-1.5">Or choose a preset:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {[
                                  'react',
                                  'tailwind',
                                  'javascript',
                                  'typescript',
                                  'html',
                                  'css',
                                  'nodejs',
                                  'postgresql',
                                  'figma',
                                  'git',
                                  'python',
                                ].map((preset) => (
                                  <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setEditingSkill({ ...editingSkill, icon: preset })}
                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase transition-all cursor-pointer ${
                                      editingSkill.icon?.toLowerCase() === preset
                                        ? 'bg-[#008CFF] text-white shadow-sm'
                                        : 'bg-[#06162D] text-[#A9B9D0] hover:text-white border border-[#008CFF]/20'
                                    }`}
                                  >
                                    {preset}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#008CFF]/20">
                            <button
                              type="button"
                              onClick={() => setEditingSkill(null)}
                              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#A9B9D0] hover:text-white bg-[#020B1B] hover:bg-[#0B1F3F] border border-[#008CFF]/20 transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={savingSkill}
                              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#008CFF] to-[#00CFFF] hover:from-[#00A3FF] hover:to-[#00D9FF] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-[#008CFF]/25 cursor-pointer flex items-center gap-1.5"
                            >
                              {savingSkill && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                              <span>{savingSkill ? 'Saving...' : (isNewSkill ? 'Add Skill' : 'Save Changes')}</span>
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: REVIEWS MANAGEMENT */}
              {activeTab === 'reviews' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-[#F8FAFC]">Manage Reviews</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0B1F3F] border border-[#008CFF]/30 text-[#00CFFF]">
                          {reviews.length} Total
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
                          {reviews.filter((r) => r.published).length} Published
                        </span>
                      </div>
                      <p className="text-xs text-[#A9B9D0]">
                        Manage customer reviews, moderate publication, edit feedback, and add new reviews
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingReview({
                          name: '',
                          role: '',
                          quote: '',
                          rating: 5,
                          published: true,
                        });
                        setIsNewReview(true);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#008CFF] to-[#00CFFF] hover:from-[#00A3FF] hover:to-[#00D9FF] flex items-center justify-center gap-2 shadow-md shadow-[#008CFF]/25 hover:shadow-[#008CFF]/45 transition-all cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Review</span>
                    </button>
                  </div>

                  {/* Filters Bar: Status, Rating, Search */}
                  <div className="flex flex-col md:flex-row gap-3 pt-1 border-b border-[#008CFF]/15 pb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {(['all', 'published', 'unpublished'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setReviewStatusFilter(st)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize cursor-pointer ${
                            reviewStatusFilter === st
                              ? 'bg-[#008CFF] text-white shadow-sm'
                              : 'bg-[#06162D] text-[#A9B9D0] hover:text-white hover:bg-[#0B1F3F] border border-[#008CFF]/20'
                          }`}
                        >
                          {st === 'all' ? 'All Reviews' : st}
                        </button>
                      ))}

                      {/* Rating Filter Dropdown */}
                      <select
                        value={reviewRatingFilter}
                        onChange={(e) => setReviewRatingFilter(Number(e.target.value))}
                        className="px-3 py-1.5 rounded-lg text-xs bg-[#06162D] text-[#A9B9D0] border border-[#008CFF]/20 focus:outline-none"
                      >
                        <option value={0}>All Ratings</option>
                        <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                        <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                        <option value={3}>⭐⭐⭐ (3 Stars)</option>
                        <option value={2}>⭐⭐ (2 Stars)</option>
                        <option value={1}>⭐ (1 Star)</option>
                      </select>
                    </div>

                    <div className="relative flex-1 md:max-w-xs">
                      <Search className="w-3.5 h-3.5 text-[#A9B9D0] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search by name, role, or text..."
                        value={reviewSearchQuery}
                        onChange={(e) => setReviewSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#020B1B] text-xs text-white border border-[#008CFF]/25 focus:border-[#00CFFF] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-3">
                    {reviews
                      .filter((r) => {
                        if (reviewStatusFilter === 'published' && !r.published) return false;
                        if (reviewStatusFilter === 'unpublished' && r.published) return false;
                        if (reviewRatingFilter > 0 && r.rating !== reviewRatingFilter) return false;
                        if (reviewSearchQuery.trim()) {
                          const q = reviewSearchQuery.trim().toLowerCase();
                          return (
                            r.name.toLowerCase().includes(q) ||
                            r.role.toLowerCase().includes(q) ||
                            r.quote.toLowerCase().includes(q)
                          );
                        }
                        return true;
                      })
                      .map((r) => (
                        <div
                          key={r.id}
                          className={`p-4 rounded-xl border transition-all ${
                            r.published
                              ? 'bg-[#06162D] border-[#008CFF]/30'
                              : 'bg-[#06162D]/60 border-[#008CFF]/15 opacity-80'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-sm text-[#F8FAFC]">{r.name}</h4>
                                <span className="text-xs text-[#00CFFF]">({r.role})</span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                    r.published
                                      ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30'
                                      : 'text-amber-400 bg-amber-950/40 border-amber-500/30'
                                  }`}
                                >
                                  {r.published ? 'Published' : 'Hidden / Unpublished'}
                                </span>
                              </div>

                              {/* Star Rating */}
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-3.5 h-3.5 ${
                                      star <= r.rating
                                        ? 'text-[#00CFFF] fill-[#00CFFF]'
                                        : 'text-[#0B1F3F]'
                                    }`}
                                  />
                                ))}
                                <span className="text-[11px] font-mono text-[#A9B9D0] ml-1">
                                  {r.rating}.0
                                </span>
                              </div>

                              <p className="text-xs text-[#A9B9D0] leading-relaxed line-clamp-3 italic">
                                &ldquo;{r.quote}&rdquo;
                              </p>

                              <p className="text-[10px] text-[#A9B9D0]/60">
                                {new Date(r.createdAt).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>

                            {/* Action Buttons: Publish/Unpublish, Edit, Delete */}
                            <div className="flex items-center gap-2 shrink-0 sm:self-center">
                              <button
                                onClick={() => handleTogglePublishReview(r.id)}
                                title={r.published ? 'Hide from public portfolio' : 'Publish on public portfolio'}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                  r.published
                                    ? 'bg-amber-950/30 text-amber-300 border-amber-500/30 hover:bg-amber-900/50'
                                    : 'bg-emerald-950/30 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/50'
                                }`}
                              >
                                {r.published ? 'Unpublish' : 'Publish'}
                              </button>

                              <button
                                onClick={() => {
                                  setEditingReview({ ...r });
                                  setIsNewReview(false);
                                }}
                                title="Edit review"
                                className="p-1.5 rounded-lg bg-[#0B1F3F] text-[#00CFFF] hover:bg-[#008CFF] hover:text-white border border-[#008CFF]/20 transition-all cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteReview(r.id, r.name)}
                                title="Delete review"
                                className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-900 hover:text-white border border-rose-500/30 transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                    {reviews.length === 0 && (
                      <div className="text-center py-12 rounded-xl bg-[#06162D] border border-dashed border-[#008CFF]/30 text-xs text-[#A9B9D0]">
                        No reviews submitted yet. Click &quot;Add Review&quot; to create one manually.
                      </div>
                    )}
                  </div>

                  {/* Add / Edit Review Modal Dialog */}
                  {editingReview && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                      <div
                        className="w-full max-w-lg bg-[#06162D] border border-[#008CFF]/40 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between border-b border-[#008CFF]/20 pb-3">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-[#00CFFF]" />
                            <h4 className="font-bold text-sm text-[#F8FAFC]">
                              {isNewReview ? 'Add Review' : 'Edit Review'}
                            </h4>
                          </div>
                          <button
                            onClick={() => setEditingReview(null)}
                            className="p-1 rounded-lg text-[#A9B9D0] hover:text-white hover:bg-[#0B1F3F] transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <form onSubmit={handleSaveReview} className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-[#A9B9D0] mb-1">Customer Name *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. John Doe"
                              value={editingReview.name || ''}
                              onChange={(e) => setEditingReview({ ...editingReview, name: e.target.value })}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-[#020B1B] text-xs text-white border border-[#008CFF]/30 focus:border-[#00CFFF] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#A9B9D0] mb-1">Role / Title *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Client, Senior Developer, Founder"
                              value={editingReview.role || ''}
                              onChange={(e) => setEditingReview({ ...editingReview, role: e.target.value })}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-[#020B1B] text-xs text-white border border-[#008CFF]/30 focus:border-[#00CFFF] focus:outline-none"
                            />
                          </div>

                          {/* Star Rating Picker */}
                          <div>
                            <label className="block text-xs font-semibold text-[#A9B9D0] mb-1.5">
                              Star Rating ({editingReview.rating || 5} Stars)
                            </label>
                            <div className="flex items-center gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setEditingReview({ ...editingReview, rating: star })}
                                  className="p-1 rounded hover:scale-110 transition-transform cursor-pointer"
                                >
                                  <Star
                                    className={`w-6 h-6 ${
                                      star <= (editingReview.rating || 5)
                                        ? 'text-[#00CFFF] fill-[#00CFFF]'
                                        : 'text-[#0B1F3F]'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#A9B9D0] mb-1">Review Message *</label>
                            <textarea
                              rows={4}
                              required
                              placeholder="Write the customer's testimonial or feedback..."
                              value={editingReview.quote || ''}
                              onChange={(e) => setEditingReview({ ...editingReview, quote: e.target.value })}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-[#020B1B] text-xs text-white border border-[#008CFF]/30 focus:border-[#00CFFF] focus:outline-none resize-none"
                            />
                          </div>

                          <label className="flex items-center gap-2.5 text-xs text-[#F8FAFC] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingReview.published ?? true}
                              onChange={(e) => setEditingReview({ ...editingReview, published: e.target.checked })}
                              className="rounded border-[#008CFF]/40 text-[#008CFF] focus:ring-0"
                            />
                            <span>Publish this review (visible on the public portfolio)</span>
                          </label>

                          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#008CFF]/20">
                            <button
                              type="button"
                              onClick={() => setEditingReview(null)}
                              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#A9B9D0] hover:text-white bg-[#020B1B] hover:bg-[#0B1F3F] border border-[#008CFF]/20 transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={savingReview}
                              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#008CFF] to-[#00CFFF] hover:from-[#00A3FF] hover:to-[#00D9FF] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-[#008CFF]/25 cursor-pointer flex items-center gap-1.5"
                            >
                              {savingReview && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                              <span>{savingReview ? 'Saving...' : (isNewReview ? 'Save Review' : 'Update Review')}</span>
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-6 max-w-2xl">
                  <h3 className="text-xl font-bold text-[#F8FAFC]">Portfolio & Security Settings</h3>

                  {/* Profile Edit Form */}
                  <form onSubmit={handleSaveProfile} className="p-5 rounded-2xl bg-[#06162D] border border-[#008CFF]/25 space-y-4">
                    <h4 className="text-sm font-bold text-[#00CFFF]">Profile Information</h4>

                    {profileSuccess && (
                      <p className="text-xs text-emerald-400">{profileSuccess}</p>
                    )}

                    {/* Profile Picture Uploader */}
                    <div className="p-4 rounded-xl bg-[#020B1B] border border-[#008CFF]/20 flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#008CFF]/50 bg-[#06162D] shrink-0 flex items-center justify-center">
                        {profileForm.portraitUrl ? (
                          <img
                            src={profileForm.portraitUrl}
                            alt={profileForm.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-[#00CFFF] bg-[#0B1F3F]">
                            <span className="font-bold text-lg font-mono">&lt;MS/&gt;</span>
                            <span className="text-[10px] text-[#A9B9D0]">No Pic</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5 text-center sm:text-left flex-1">
                        <p className="text-xs font-bold text-[#F8FAFC]">Profile Picture</p>
                        <p className="text-[11px] text-[#A9B9D0]">
                          Optionally upload your real photo (JPG/PNG). Or leave blank to keep a clean, modern developer code aesthetic.
                        </p>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                          <label className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#0B1F3F] hover:bg-[#008CFF] text-white text-xs font-semibold cursor-pointer transition-colors border border-[#008CFF]/40">
                            {photoUploading ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Uploading photo...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5" />
                                <span>Choose Photo from Device</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              disabled={photoUploading}
                              onChange={handlePhotoSelect}
                              className="hidden"
                            />
                          </label>

                          {profileForm.portraitUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setProfileForm({ ...profileForm, portraitUrl: '' });
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 text-rose-300 hover:bg-rose-900 hover:text-white border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove Photo</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[#A9B9D0] mb-1">Full Name</label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-[#020B1B] text-xs text-white border border-[#008CFF]/30"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#A9B9D0] mb-1">Professional Title</label>
                        <input
                          type="text"
                          value={profileForm.title}
                          onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-[#020B1B] text-xs text-white border border-[#008CFF]/30"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[#A9B9D0] mb-1">Email</label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-[#020B1B] text-xs text-white border border-[#008CFF]/30"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#A9B9D0] mb-1">WhatsApp Phone Number</label>
                        <input
                          type="text"
                          value={profileForm.whatsappNumber || ''}
                          placeholder="+923001234567"
                          onChange={(e) => setProfileForm({ ...profileForm, whatsappNumber: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-[#020B1B] text-xs text-white border border-[#008CFF]/30"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[#A9B9D0] mb-1">GitHub Profile URL</label>
                        <input
                          type="url"
                          value={profileForm.githubUrl || ''}
                          placeholder="https://github.com/Sohail-star"
                          onChange={(e) => setProfileForm({ ...profileForm, githubUrl: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-[#020B1B] text-xs text-white border border-[#008CFF]/30"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#A9B9D0] mb-1">LinkedIn Profile URL</label>
                        <input
                          type="url"
                          value={profileForm.linkedinUrl || ''}
                          placeholder="https://www.linkedin.com/in/muhammad-sohail-8a32102ab/"
                          onChange={(e) => setProfileForm({ ...profileForm, linkedinUrl: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-[#020B1B] text-xs text-white border border-[#008CFF]/30"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-[#A9B9D0] mb-1">Location</label>
                      <input
                        type="text"
                        value={profileForm.location}
                        onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#020B1B] text-xs text-white border border-[#008CFF]/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[#A9B9D0] mb-1">About Bio</label>
                      <textarea
                        rows={3}
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#020B1B] text-xs text-white border border-[#008CFF]/30 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-4 py-2 rounded-xl bg-[#008CFF] text-white text-xs font-semibold hover:bg-[#00A3FF] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      {savingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>{savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                    </button>
                  </form>

                  {/* Password Change Form */}
                  <form onSubmit={handleChangePassword} className="p-5 rounded-2xl bg-[#06162D] border border-[#008CFF]/25 space-y-4">
                    <h4 className="text-sm font-bold text-[#00CFFF]">Change Admin Password</h4>

                    {pwSuccess && <p className="text-xs text-emerald-400">{pwSuccess}</p>}
                    {pwError && <p className="text-xs text-rose-400">{pwError}</p>}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[#A9B9D0] mb-1">Current Password</label>
                        <input
                          type="password"
                          value={currentPw}
                          onChange={(e) => setCurrentPw(e.target.value)}
                          required
                          className="w-full px-3 py-2 rounded-xl bg-[#020B1B] text-xs text-white border border-[#008CFF]/30"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#A9B9D0] mb-1">New Password</label>
                        <input
                          type="password"
                          value={newPw}
                          onChange={(e) => setNewPw(e.target.value)}
                          required
                          minLength={6}
                          className="w-full px-3 py-2 rounded-xl bg-[#020B1B] text-xs text-white border border-[#008CFF]/30"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#008CFF] text-white text-xs font-semibold hover:bg-[#00A3FF]"
                    >
                      Update Password
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* View Message Detail Sub-Modal */}
        {viewingMessage && (
          <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#06162D] border border-[#008CFF]/40 rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-base text-[#F8FAFC]">{viewingMessage.subject}</h4>
                  <p className="text-xs text-[#00CFFF]">
                    From: {viewingMessage.name} ({viewingMessage.email})
                  </p>
                  {viewingMessage.phone && (
                    <p className="text-xs text-[#A9B9D0]">Phone: {viewingMessage.phone}</p>
                  )}
                </div>
                <button
                  onClick={() => setViewingMessage(null)}
                  className="text-[#A9B9D0] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#020B1B] border border-[#008CFF]/20 text-xs text-[#F8FAFC] leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
                {viewingMessage.message}
              </div>

              <div className="flex items-center justify-between pt-2">
                <a
                  href={`mailto:${viewingMessage.email}?subject=Re: ${encodeURIComponent(viewingMessage.subject)}`}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#008CFF] to-[#00CFFF] text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Reply via Email</span>
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStatusUpdate(viewingMessage.id, 'replied')}
                    className="px-3 py-2 rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-xs font-semibold"
                  >
                    Mark as Replied
                  </button>
                  <button
                    onClick={() => setViewingMessage(null)}
                    className="px-3 py-2 rounded-xl bg-[#0B1F3F] text-xs text-[#A9B9D0] hover:text-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Project Edit Sub-Modal */}
        {editingProject && (
          <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <form
              onSubmit={handleSaveProject}
              className="w-full max-w-xl bg-[#06162D] border border-[#008CFF]/40 rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-base text-[#F8FAFC]">
                  {isNewProject ? 'Add Project' : 'Edit Project'}
                </h4>
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="text-[#A9B9D0] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-[#A9B9D0] mb-1">Project Title</label>
                  <input
                    type="text"
                    required
                    value={editingProject.title || ''}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, title: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#020B1B] text-xs text-white border border-[#008CFF]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#A9B9D0] mb-1">Short Description</label>
                  <textarea
                    rows={2}
                    required
                    value={editingProject.description || ''}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, description: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#020B1B] text-xs text-white border border-[#008CFF]/30 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#A9B9D0] mb-1">Category</label>
                    <select
                      value={editingProject.category || 'web'}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          category: e.target.value as 'web' | 'design' | 'app',
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#020B1B] text-xs text-white border border-[#008CFF]/30"
                    >
                      <option value="web">Web</option>
                      <option value="design">Design</option>
                      <option value="app">App</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#A9B9D0] mb-1">Image URL</label>
                    <input
                      type="text"
                      value={editingProject.imageUrl || ''}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, imageUrl: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#020B1B] text-xs text-white border border-[#008CFF]/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#A9B9D0] mb-1">Live Demo URL</label>
                    <input
                      type="text"
                      value={editingProject.liveDemoUrl || ''}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, liveDemoUrl: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#020B1B] text-xs text-white border border-[#008CFF]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#A9B9D0] mb-1">GitHub URL</label>
                    <input
                      type="text"
                      value={editingProject.githubUrl || ''}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, githubUrl: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#020B1B] text-xs text-white border border-[#008CFF]/30"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs text-[#F8FAFC] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProject.published ?? true}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, published: e.target.checked })
                      }
                    />
                    <span>Published</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-[#F8FAFC] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProject.featured ?? false}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, featured: e.target.checked })
                      }
                    />
                    <span>Featured</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#008CFF]/20">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 rounded-xl bg-[#0B1F3F] text-xs text-[#A9B9D0] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProject}
                  className="px-5 py-2 rounded-xl bg-[#008CFF] text-xs font-semibold text-white hover:bg-[#00A3FF] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {savingProject && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{savingProject ? 'Saving...' : (isNewProject ? 'Add Project' : 'Save Changes')}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Confirmation Dialog Modal (Replaces blocked window.confirm) */}
        {confirmDelete && (
          <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
            <div
              className="w-full max-w-sm bg-[#06162D] border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-4 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
                <Trash2 className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-base font-bold text-[#F8FAFC]">Confirm Deletion</h4>
                <p className="text-xs text-[#A9B9D0] mt-1.5 leading-relaxed">
                  Are you sure you want to remove <span className="text-white font-semibold">&quot;{confirmDelete.name}&quot;</span>? This will be removed from your portfolio immediately.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-2 w-full">
                <button
                  type="button"
                  disabled={deletingLoading}
                  onClick={() => setConfirmDelete(null)}
                  className="w-full sm:w-auto flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#A9B9D0] hover:text-white bg-[#020B1B] hover:bg-[#0B1F3F] border border-[#008CFF]/20 transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deletingLoading}
                  onClick={handleExecuteDelete}
                  className="w-full sm:w-auto flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-lg shadow-rose-900/30 cursor-pointer flex items-center justify-center gap-2 text-center"
                >
                  {deletingLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                      <span>Removing...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Yes, Remove</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
