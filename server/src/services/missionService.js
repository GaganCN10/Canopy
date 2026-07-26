import Mission from '../models/Mission.js';
import MissionMembership from '../models/MissionMembership.js';
import MissionThreadPost from '../models/MissionThreadPost.js';
import MissionActionItem from '../models/MissionActionItem.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';
import { createNotification } from './notificationService.js';

const MISSION_TOPICS = ['cleanup', 'monitoring', 'awareness_education', 'data_tagging', 'rescue_support', 'advocacy', 'other'];
const LOCATION_TYPES = ['remote', 'onsite', 'hybrid'];
const STATUSES = ['planning', 'active', 'completed', 'archived', 'cancelled'];
const MEMBERSHIP_ROLES = ['lead', 'co-lead', 'member'];
const MEMBERSHIP_STATUSES = ['pending', 'approved', 'removed'];
const TASK_STATUSES = ['open', 'in_progress', 'done'];

const buildMissionFilter = (query = {}) => {
  const filter = {};

  if (query.topic && MISSION_TOPICS.includes(query.topic)) {
    filter.topic = query.topic;
  }
  if (query.locationType && LOCATION_TYPES.includes(query.locationType)) {
    filter.locationType = query.locationType;
  }
  if (query.status && STATUSES.includes(query.status)) {
    filter.status = query.status;
  }
  if (query.remoteOnly === 'true') {
    filter.locationType = 'remote';
  }

  return filter;
};

export const createMission = async (userId, missionData) => {
  const { title, description, topic, locationType, location, address, joinType, memberCap, targetDate } = missionData;

  if (!MISSION_TOPICS.includes(topic)) {
    throw new Error('Invalid topic');
  }
  if (!LOCATION_TYPES.includes(locationType)) {
    throw new Error('Invalid location type');
  }
  if (!['open', 'request'].includes(joinType)) {
    throw new Error('Invalid join type');
  }
  if (locationType === 'onsite' || locationType === 'hybrid') {
    if (!location || !location.coordinates || location.coordinates.length !== 2) {
      throw new Error('Location coordinates are required for onsite/hybrid missions');
    }
    if (!address) {
      throw new Error('Address is required for onsite/hybrid missions');
    }
  }

  const mission = await Mission.create({
    title,
    description,
    topic,
    locationType,
    location: locationType === 'onsite' || locationType === 'hybrid' ? location : undefined,
    address: locationType === 'onsite' || locationType === 'hybrid' ? address : undefined,
    joinType: joinType || 'open',
    memberCap: memberCap || null,
    targetDate: targetDate || null,
    createdBy: userId,
  });

  await MissionMembership.create({
    mission: mission._id,
    user: userId,
    role: 'lead',
    status: 'approved',
  });

  return mission;
};

export const getMissions = async (filters = {}) => {
  const filter = buildMissionFilter(filters);

  let sort = { createdAt: -1 };
  if (filters.near && filters.near.coordinates) {
    filter.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: filters.near.coordinates,
        },
        $maxDistance: filters.near.maxDistance || 50000,
      },
    };
  }

  const missions = await Mission.find(filter)
    .populate('createdBy', 'firstName lastName email')
    .populate('coLeads', 'firstName lastName email')
    .sort(sort)
    .lean();

  const missionsWithCounts = await Promise.all(
    missions.map(async (mission) => {
      const memberCount = await MissionMembership.countDocuments({
        mission: mission._id,
        status: 'approved',
      });
      return { ...mission, memberCount };
    })
  );

  return missionsWithCounts;
};

export const getMissionById = async (missionId) => {
  const mission = await Mission.findById(missionId)
    .populate('createdBy', 'firstName lastName email')
    .populate('coLeads', 'firstName lastName email')
    .lean();

  if (!mission) {
    throw new Error('Mission not found');
  }

  const memberCount = await MissionMembership.countDocuments({
    mission: missionId,
    status: 'approved',
  });

  return { ...mission, memberCount };
};

export const updateMission = async (missionId, userId, updateData) => {
  const mission = await Mission.findById(missionId);
  if (!mission) {
    throw new Error('Mission not found');
  }

  const membership = await MissionMembership.findOne({
    mission: missionId,
    user: userId,
    status: 'approved',
  });

  if (!membership || (membership.role !== 'lead' && membership.role !== 'co-lead')) {
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      throw new Error('Only mission leads or admins can update this mission');
    }
  }

  const allowedFields = ['title', 'description', 'topic', 'locationType', 'location', 'address', 'joinType', 'memberCap', 'targetDate', 'status'];
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      mission[field] = updateData[field];
    }
  });

  if (updateData.locationType && (updateData.locationType === 'onsite' || updateData.locationType === 'hybrid')) {
    if (!updateData.location && !mission.location) {
      throw new Error('Location is required for onsite/hybrid missions');
    }
    if (!updateData.address && !mission.address) {
      throw new Error('Address is required for onsite/hybrid missions');
    }
  }

  await mission.save();
  return mission;
};

export const joinMission = async (missionId, userId, message = '') => {
  const mission = await Mission.findById(missionId);
  if (!mission) {
    throw new Error('Mission not found');
  }

  if (mission.status === 'completed' || mission.status === 'archived' || mission.status === 'cancelled') {
    throw new Error('This mission is no longer accepting new members');
  }

  const existingMembership = await MissionMembership.findOne({
    mission: missionId,
    user: userId,
  });

  if (existingMembership) {
    if (existingMembership.status === 'approved') {
      throw new Error('You are already a member of this mission');
    }
    if (existingMembership.status === 'pending') {
      throw new Error('Your join request is already pending approval');
    }
    if (existingMembership.status === 'removed') {
      throw new Error('You were removed from this mission');
    }
  }

  if (mission.joinType === 'open') {
    const membership = await MissionMembership.create({
      mission: missionId,
      user: userId,
      role: 'member',
      status: 'approved',
    });

    await createNotification({
      recipient: mission.createdBy,
      type: 'mission_join_request',
      title: 'New member joined your Mission',
      message: `A new member has joined your mission "${mission.title}".`,
      data: { missionId: mission._id.toString() },
    });

    return membership;
  }

  const approvedCount = await MissionMembership.countDocuments({
    mission: missionId,
    status: 'approved',
  });

  if (mission.memberCap && approvedCount >= mission.memberCap) {
    throw new Error('This mission has reached its member cap');
  }

  const membership = await MissionMembership.create({
    mission: missionId,
    user: userId,
    role: 'member',
    status: 'pending',
  });

  await createNotification({
    recipient: mission.createdBy,
    type: 'mission_join_request',
    title: 'New join request for your Mission',
    message: `Someone requested to join your mission "${mission.title}".${message ? ' Message: ' + message : ''}`,
    data: { missionId: mission._id.toString(), membershipId: membership._id.toString() },
  });

  return membership;
};

export const approveJoinRequest = async (missionId, userId, requesterId) => {
  const mission = await Mission.findById(missionId);
  if (!mission) {
    throw new Error('Mission not found');
  }

  const membership = await MissionMembership.findOne({
    mission: missionId,
    user: requesterId,
    status: 'pending',
  });

  if (!membership) {
    throw new Error('Join request not found');
  }

  const approvedCount = await MissionMembership.countDocuments({
    mission: missionId,
    status: 'approved',
  });

  if (mission.memberCap && approvedCount >= mission.memberCap) {
    throw new Error('This mission has reached its member cap');
  }

  membership.status = 'approved';
  membership.joinedAt = new Date();
  await membership.save();

  await createNotification({
    recipient: requesterId,
    type: 'mission_join_approved',
    title: 'Join request approved',
    message: `Your request to join "${mission.title}" has been approved.`,
    data: { missionId: mission._id.toString() },
  });

  return membership;
};

export const removeMember = async (missionId, userId, memberId) => {
  const mission = await Mission.findById(missionId);
  if (!mission) {
    throw new Error('Mission not found');
  }

  const membership = await MissionMembership.findOne({
    mission: missionId,
    user: memberId,
  });

  if (!membership) {
    throw new Error('Member not found');
  }

  if (membership.role === 'lead') {
    throw new Error('Cannot remove the mission lead');
  }

  membership.status = 'removed';
  await membership.save();

  return membership;
};

export const promoteToCoLead = async (missionId, userId, memberId) => {
  const mission = await Mission.findById(missionId);
  if (!mission) {
    throw new Error('Mission not found');
  }

  const membership = await MissionMembership.findOne({
    mission: missionId,
    user: memberId,
    status: 'approved',
  });

  if (!membership) {
    throw new Error('Member not found');
  }

  if (membership.role === 'lead') {
    throw new Error('User is already the lead');
  }

  membership.role = 'co-lead';
  await membership.save();

  if (!mission.coLeads.includes(memberId)) {
    mission.coLeads.push(memberId);
    await mission.save();
  }

  return membership;
};

export const getMissionThread = async (missionId, userId) => {
  const membership = await MissionMembership.findOne({
    mission: missionId,
    user: userId,
    status: 'approved',
  });

  if (!membership) {
    const mission = await Mission.findById(missionId);
    if (!mission) {
      throw new Error('Mission not found');
    }
    if (mission.status === 'planning') {
      throw new Error('Thread is not available while mission is in planning status');
    }
  }

  const posts = await MissionThreadPost.find({ mission: missionId })
    .populate('author', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .lean();

  return posts;
};

export const createThreadPost = async (missionId, userId, postData) => {
  const mission = await Mission.findById(missionId);
  if (!mission) {
    throw new Error('Mission not found');
  }

  const membership = await MissionMembership.findOne({
    mission: missionId,
    user: userId,
    status: 'approved',
  });

  if (!membership) {
    throw new Error('You must be a member to post in the thread');
  }

  const post = await MissionThreadPost.create({
    mission: missionId,
    author: userId,
    type: postData.type || 'post',
    content: postData.content,
    attachments: postData.attachments || [],
    parentPost: postData.parentPost || null,
  });

  const populatedPost = await MissionThreadPost.findById(post._id)
    .populate('author', 'firstName lastName email')
    .lean();

  if (post.type === 'update') {
    const members = await MissionMembership.find({
      mission: missionId,
      status: 'approved',
      user: { $ne: userId },
    }).select('user');

    for (const member of members) {
      await createNotification({
        recipient: member.user,
        type: 'mission_update_posted',
        title: 'New Mission Update',
        message: `A new update has been posted on "${mission.title}".`,
        data: { missionId: mission._id.toString(), postId: post._id.toString() },
      });
    }
  }

  return populatedPost;
};

export const getMissionTasks = async (missionId, userId) => {
  const membership = await MissionMembership.findOne({
    mission: missionId,
    user: userId,
    status: 'approved',
  });

  if (!membership) {
    throw new Error('You must be a member to view tasks');
  }

  const tasks = await MissionActionItem.find({ mission: missionId })
    .populate('assignedTo', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .lean();

  return tasks;
};

export const createMissionTask = async (missionId, userId, taskData) => {
  const mission = await Mission.findById(missionId);
  if (!mission) {
    throw new Error('Mission not found');
  }

  const membership = await MissionMembership.findOne({
    mission: missionId,
    user: userId,
    status: 'approved',
  });

  if (!membership) {
    throw new Error('You must be a member to create tasks');
  }

  const task = await MissionActionItem.create({
    mission: missionId,
    title: taskData.title,
    description: taskData.description || '',
    status: 'open',
    assignedTo: taskData.assignedTo || null,
    dueDate: taskData.dueDate || null,
    createdBy: userId,
  });

  const populatedTask = await MissionActionItem.findById(task._id)
    .populate('assignedTo', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName email')
    .lean();

  if (taskData.assignedTo) {
    await createNotification({
      recipient: taskData.assignedTo,
      type: 'mission_task_assigned',
      title: 'New Task Assigned',
      message: `You have been assigned a new task on "${mission.title}".`,
      data: { missionId: mission._id.toString(), taskId: task._id.toString() },
    });
  }

  return populatedTask;
};

export const updateMissionTask = async (missionId, taskId, userId, updateData) => {
  const task = await MissionActionItem.findById(taskId);
  if (!task) {
    throw new Error('Task not found');
  }

  if (task.mission.toString() !== missionId) {
    throw new Error('Task does not belong to this mission');
  }

  const membership = await MissionMembership.findOne({
    mission: missionId,
    user: userId,
    status: 'approved',
  });

  if (!membership) {
    throw new Error('You must be a member to update tasks');
  }

  const isAssignee = task.assignedTo && task.assignedTo.toString() === userId.toString();
  const isLeadOrCoLead = membership.role === 'lead' || membership.role === 'co-lead';
  const user = await User.findById(userId);
  const isAdmin = user && user.role === 'admin';

  if (!isAssignee && !isLeadOrCoLead && !isAdmin) {
    throw new Error('You do not have permission to update this task');
  }

  const allowedFields = ['status', 'assignedTo', 'dueDate', 'title', 'description'];
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      task[field] = updateData[field];
    }
  });

  await task.save();

  const populatedTask = await MissionActionItem.findById(task._id)
    .populate('assignedTo', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName email')
    .lean();

  if (updateData.assignedTo && updateData.assignedTo.toString() !== task.assignedTo?.toString()) {
    const mission = await Mission.findById(missionId);
    await createNotification({
      recipient: updateData.assignedTo,
      type: 'mission_task_assigned',
      title: 'Task Assigned',
      message: `You have been assigned a task on "${mission?.title}".`,
      data: { missionId, taskId: task._id.toString() },
    });
  }

  return populatedTask;
};

export const updateMissionStatus = async (missionId, userId, newStatus) => {
  if (!STATUSES.includes(newStatus)) {
    throw new Error('Invalid status');
  }

  const mission = await Mission.findById(missionId);
  if (!mission) {
    throw new Error('Mission not found');
  }

  const membership = await MissionMembership.findOne({
    mission: missionId,
    user: userId,
    status: 'approved',
  });

  if (!membership || (membership.role !== 'lead' && membership.role !== 'co-lead')) {
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      throw new Error('Only mission leads or admins can update mission status');
    }
  }

  mission.status = newStatus;
  await mission.save();

  const members = await MissionMembership.find({
    mission: missionId,
    status: 'approved',
    user: { $ne: userId },
  }).select('user');

  for (const member of members) {
    await createNotification({
      recipient: member.user,
      type: 'mission_status_changed',
      title: 'Mission Status Updated',
      message: `The mission "${mission.title}" status has been changed to ${newStatus}.`,
      data: { missionId: mission._id.toString() },
    });
  }

  return mission;
};

export const getUserMissions = async (userId) => {
  const memberships = await MissionMembership.find({
    user: userId,
    status: 'approved',
  })
    .populate('mission')
    .lean();

  const led = memberships.filter((m) => m.role === 'lead' || m.role === 'co-lead').map((m) => m.mission);
  const joined = memberships.filter((m) => m.role === 'member').map((m) => m.mission);
  const completed = memberships.filter((m) => m.mission.status === 'completed').map((m) => m.mission);

  const actionItemsDone = await MissionActionItem.countDocuments({
    assignedTo: userId,
    status: 'done',
  });

  const missionsParticipated = new Set(
    (await MissionActionItem.find({ assignedTo: userId }).select('mission').lean())
      .map((item) => item.mission.toString())
  ).size;

  return {
    led,
    joined,
    completed,
    stats: {
      actionItemsDone,
      missionsParticipated,
    },
  };
};
