import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, MessageSquare, CheckSquare, Info, Send, Plus, UserPlus, UserMinus, Shield } from 'lucide-react';
import { getMission, joinMission as joinMissionApi, approveJoinRequest as approveJoinRequestApi, removeMember as removeMemberApi, addCoLead as addCoLeadApi, getMissionThread, createThreadPost, getMissionTasks, createMissionTask, updateMissionTask, updateMissionStatus } from '../features/missions/missionApi';
import { useSelector } from 'react-redux';
import { useToast } from '../components/Toast';

const TABS = [
  { id: 'thread', label: 'Thread', icon: MessageSquare },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'about', label: 'About', icon: Info },
];

function MissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [mission, setMission] = useState(null);
  const [thread, setThread] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('thread');

  const { showSuccess } = useToast();

  const [postContent, setPostContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '' });
  const [creatingTask, setCreatingTask] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [memberStatus, setMemberStatus] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadMission();
  }, [id, isAuthenticated]);

  const loadMission = async () => {
    try {
      setLoading(true);
      setError('');
      const missionResult = await getMission(id);
      setMission(missionResult.data);
      setMemberStatus(missionResult.data.membership?.status || null);

      const [threadResult, tasksResult] = await Promise.all([
        getMissionThread(id).catch(() => ({ data: [] })),
        getMissionTasks(id).catch(() => ({ data: [] })),
      ]);
      setThread(threadResult.data || []);
      setTasks(tasksResult.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load mission');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    try {
      setJoinLoading(true);
      await joinMissionApi(id);
      setMemberStatus('pending');
      showSuccess('Join request submitted', 'Your request to join this mission has been submitted for approval.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join mission');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleApproveJoin = async (userId) => {
    try {
      await approveJoinRequestApi(id, userId);
      loadMission();
      showSuccess('Join request approved', 'The user has been added to the mission.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve join request');
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await removeMemberApi(id, userId);
      loadMission();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleAddCoLead = async (userId) => {
    try {
      await addCoLeadApi(id, userId);
      loadMission();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add co-lead');
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    try {
      setPosting(true);
      await createThreadPost(id, { content: postContent, type: 'post' });
      setPostContent('');
      loadMission();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post');
    } finally {
      setPosting(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      setCreatingTask(true);
      await createMissionTask(id, newTask);
      setNewTask({ title: '', description: '', dueDate: '' });
      loadMission();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setCreatingTask(false);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      await updateMissionTask(id, taskId, updates);
      loadMission();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateMissionStatus(id, newStatus);
      loadMission();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const isLead = mission?.membership?.role === 'lead' || mission?.membership?.role === 'co-lead';
  const isMember = memberStatus === 'approved';

  if (loading) {
    return <div className="text-center py-20 text-canopy-ink-900/60">Loading mission...</div>;
  }

  if (!mission) {
    return (
      <div className="text-center py-20">
        <p className="text-red-700 mb-4">{error || 'Mission not found'}</p>
        <button onClick={() => navigate('/missions')} className="text-canopy-forest-600 hover:underline">
          Back to Missions
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 lg:py-24">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/missions')}
          className="flex items-center gap-2 text-canopy-forest-600 hover:text-canopy-forest-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Missions
        </button>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        <div className="card p-8 lg:p-10 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  mission.status === 'active' ? 'bg-canopy-moss-300/20 text-canopy-forest-600' :
                  mission.status === 'planning' ? 'bg-amber-50 text-amber-700' :
                  mission.status === 'completed' ? 'bg-blue-50 text-blue-700' :
                  'bg-canopy-mist-200 text-canopy-ink-900/70'
                }`}>
                  {mission.status}
                </span>
                <span className="text-sm text-canopy-ink-900/50 flex items-center gap-1">
                  {mission.locationType === 'remote' ? '🌐 Remote' : mission.locationType === 'hybrid' ? '🏢 Hybrid' : '📍 On-site'}
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-display font-semibold text-canopy-forest-950 mb-3">
                {mission.title}
              </h1>
              <p className="text-canopy-ink-900/70 mb-4">{mission.description}</p>
              <div className="flex items-center gap-4 text-sm text-canopy-ink-900/50">
                <span>Topic: {mission.topic.replace('_', ' ')}</span>
                {mission.targetDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(mission.targetDate).toLocaleDateString()}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {mission.memberCount || 0} members
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 ml-4">
              {!isMember && memberStatus !== 'pending' && (
                <button
                  onClick={handleJoin}
                  disabled={joinLoading}
                  className="btn-primary whitespace-nowrap"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  {mission.joinType === 'open' ? 'Join Mission' : 'Request to Join'}
                </button>
              )}
              {memberStatus === 'pending' && (
                <div className="px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm">
                  Join request pending
                </div>
              )}
              {isLead && mission.status !== 'completed' && mission.status !== 'archived' && mission.status !== 'cancelled' && (
                <select
                  value={mission.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              )}
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="flex border-b border-canopy-mist-200">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-canopy-forest-600 border-b-2 border-canopy-forest-600'
                    : 'text-canopy-ink-900/60 hover:text-canopy-forest-600'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 lg:p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'thread' && (
                <motion.div
                  key="thread"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMember && (
                    <form onSubmit={handlePost} className="mb-6">
                      <textarea
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="Write a post..."
                        rows={3}
                        className="input-field resize-none"
                      />
                      <div className="flex justify-end mt-2">
                        <button type="submit" disabled={posting || !postContent.trim()} className="btn-primary">
                          <Send className="w-4 h-4 mr-2" />
                          {posting ? 'Posting...' : 'Post'}
                        </button>
                      </div>
                    </form>
                  )}

                  {!isMember && (
                    <div className="text-center py-8 text-canopy-ink-900/60">
                      Join this mission to participate in the thread.
                    </div>
                  )}

                  <div className="space-y-4">
                    {thread.length === 0 ? (
                      <p className="text-center text-canopy-ink-900/60 py-8">No posts yet. Start the conversation!</p>
                    ) : (
                      thread.map((post) => (
                        <div key={post._id} className="p-4 bg-canopy-sand-50 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-canopy-forest-950">
                              {post.author?.firstName} {post.author?.lastName}
                            </span>
                            {post.type === 'update' && (
                              <span className="px-2 py-0.5 bg-canopy-moss-300/20 text-canopy-forest-600 text-xs rounded-full">
                                Update
                              </span>
                            )}
                            <span className="text-xs text-canopy-ink-900/50">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-canopy-ink-900/80">{post.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'tasks' && (
                <motion.div
                  key="tasks"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMember && (
                    <form onSubmit={handleCreateTask} className="mb-6 p-4 bg-canopy-sand-50 rounded-xl">
                      <h3 className="font-medium text-canopy-forest-950 mb-3">Create New Task</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          value={newTask.title}
                          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                          placeholder="Task title"
                          className="input-field"
                        />
                        <input
                          type="date"
                          value={newTask.dueDate}
                          onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <textarea
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        placeholder="Task description"
                        rows={2}
                        className="input-field resize-none mb-3"
                      />
                      <div className="flex justify-end">
                        <button type="submit" disabled={creatingTask || !newTask.title.trim()} className="btn-primary">
                          <Plus className="w-4 h-4 mr-2" />
                          {creatingTask ? 'Creating...' : 'Create Task'}
                        </button>
                      </div>
                    </form>
                  )}

                  {!isMember && (
                    <div className="text-center py-8 text-canopy-ink-900/60">
                      Join this mission to view and manage tasks.
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['open', 'in_progress', 'done'].map((status) => (
                      <div key={status} className="space-y-3">
                        <h3 className="font-medium text-canopy-forest-950 capitalize">
                          {status.replace('_', ' ')}
                        </h3>
                        {tasks
                          .filter((task) => task.status === status)
                          .map((task) => (
                            <div key={task._id} className="p-4 bg-canopy-sand-50 rounded-xl">
                              <h4 className="font-medium text-canopy-forest-950 mb-1">{task.title}</h4>
                              <p className="text-sm text-canopy-ink-900/70 mb-2">{task.description}</p>
                              {task.dueDate && (
                                <p className="text-xs text-canopy-ink-900/50 mb-2">
                                  Due: {new Date(task.dueDate).toLocaleDateString()}
                                </p>
                              )}
                              {task.assignedTo && (
                                <p className="text-xs text-canopy-forest-600 mb-2">
                                  Assigned to: {task.assignedTo.firstName} {task.assignedTo.lastName}
                                </p>
                              )}
                              {isMember && (
                                <div className="flex gap-2 mt-2">
                                  {task.status === 'open' && (
                                    <button
                                      onClick={() => handleUpdateTask(task._id, { status: 'in_progress', assignedTo: user._id })}
                                      className="text-xs px-3 py-1 bg-canopy-forest-600 text-white rounded-lg hover:bg-canopy-forest-700"
                                    >
                                      Claim
                                    </button>
                                  )}
                                  {task.status === 'in_progress' && (
                                    <button
                                      onClick={() => handleUpdateTask(task._id, { status: 'done' })}
                                      className="text-xs px-3 py-1 bg-canopy-moss-300 text-canopy-forest-600 rounded-lg hover:bg-canopy-moss-400"
                                    >
                                      Mark Done
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'members' && (
                <motion.div
                  key="members"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="space-y-3">
                    {members.length === 0 ? (
                      <p className="text-center text-canopy-ink-900/60 py-8">No members yet.</p>
                    ) : (
                      members.map((member) => (
                        <div key={member._id} className="flex items-center justify-between p-4 bg-canopy-sand-50 rounded-xl">
                          <div>
                            <span className="font-medium text-canopy-forest-950">
                              {member.user?.firstName} {member.user?.lastName}
                            </span>
                            <span className="ml-2 text-xs text-canopy-ink-900/50">
                              {member.role}
                            </span>
                          </div>
                          {isLead && member.role !== 'lead' && (
                            <div className="flex gap-2">
                              {member.role !== 'co-lead' && (
                                <button
                                  onClick={() => handleAddCoLead(member.user._id)}
                                  className="text-xs px-3 py-1 text-canopy-forest-600 border border-canopy-forest-600 rounded-lg hover:bg-canopy-forest-600 hover:text-white"
                                >
                                  <Shield className="w-3.5 h-3.5 inline mr-1" />
                                  Make Co-Lead
                                </button>
                              )}
                              <button
                                onClick={() => handleRemoveMember(member.user._id)}
                                className="text-xs px-3 py-1 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                              >
                                <UserMinus className="w-3.5 h-3.5 inline mr-1" />
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'about' && (
                <motion.div
                  key="about"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-canopy-forest-950 mb-1">Description</h3>
                      <p className="text-canopy-ink-900/80">{mission.description}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-canopy-forest-950 mb-1">Topic</h3>
                      <p className="text-canopy-ink-900/80">{mission.topic.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-canopy-forest-950 mb-1">Location Type</h3>
                      <p className="text-canopy-ink-900/80">{mission.locationType}</p>
                    </div>
                    {mission.address && (
                      <div>
                        <h3 className="font-medium text-canopy-forest-950 mb-1">Address</h3>
                        <p className="text-canopy-ink-900/80">{mission.address}</p>
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-canopy-forest-950 mb-1">Join Type</h3>
                      <p className="text-canopy-ink-900/80">{mission.joinType === 'open' ? 'Open - anyone can join' : 'Request - lead approval required'}</p>
                    </div>
                    {mission.memberCap && (
                      <div>
                        <h3 className="font-medium text-canopy-forest-950 mb-1">Member Cap</h3>
                        <p className="text-canopy-ink-900/80">{mission.memberCap} members</p>
                      </div>
                    )}
                    {mission.targetDate && (
                      <div>
                        <h3 className="font-medium text-canopy-forest-950 mb-1">Target Date</h3>
                        <p className="text-canopy-ink-900/80">{new Date(mission.targetDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MissionDetail;
