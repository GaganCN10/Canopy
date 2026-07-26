import { validationResult } from 'express-validator';
import {
  createMission,
  getMissions,
  getMissionById,
  updateMission,
  joinMission,
  approveJoinRequest,
  removeMember,
  promoteToCoLead,
  getMissionThread,
  createThreadPost,
  getMissionTasks,
  createMissionTask,
  updateMissionTask,
  updateMissionStatus,
  getUserMissions,
} from '../services/missionService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import logger from '../utils/logger.js';

export const listMissions = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const filters = {
      topic: req.query.topic,
      locationType: req.query.locationType,
      status: req.query.status,
      remoteOnly: req.query.remoteOnly,
      near: req.query.near ? {
        coordinates: [parseFloat(req.query.nearLng), parseFloat(req.query.nearLat)],
        maxDistance: req.query.nearRadius ? parseInt(req.query.nearRadius, 10) : 50000,
      } : null,
    };

    const missions = await getMissions(filters);
    sendSuccess(res, 200, 'Missions fetched successfully', missions);
  } catch (error) {
    logger.error('List missions error:', error);
    next(error);
  }
};

export const getMission = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const mission = await getMissionById(req.params.id);
    sendSuccess(res, 200, 'Mission fetched successfully', mission);
  } catch (error) {
    logger.error('Get mission error:', error);
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const mission = await createMission(req.user._id, req.body);
    sendSuccess(res, 201, 'Mission created successfully', mission);
  } catch (error) {
    logger.error('Create mission error:', error);
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const mission = await updateMission(req.params.id, req.user._id, req.body);
    sendSuccess(res, 200, 'Mission updated successfully', mission);
  } catch (error) {
    logger.error('Update mission error:', error);
    next(error);
  }
};

export const join = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const membership = await joinMission(req.params.id, req.user._id, req.body.message);
    sendSuccess(res, 200, 'Join request submitted', membership);
  } catch (error) {
    logger.error('Join mission error:', error);
    next(error);
  }
};

export const approveJoin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const membership = await approveJoinRequest(req.params.id, req.user._id, req.params.userId);
    sendSuccess(res, 200, 'Join request approved', membership);
  } catch (error) {
    logger.error('Approve join request error:', error);
    next(error);
  }
};

export const deleteMember = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const membership = await removeMember(req.params.id, req.user._id, req.params.userId);
    sendSuccess(res, 200, 'Member removed', membership);
  } catch (error) {
    logger.error('Remove member error:', error);
    next(error);
  }
};

export const addCoLead = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const membership = await promoteToCoLead(req.params.id, req.user._id, req.params.userId);
    sendSuccess(res, 200, 'Co-Lead added', membership);
  } catch (error) {
    logger.error('Add co-lead error:', error);
    next(error);
  }
};

export const listThread = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const posts = await getMissionThread(req.params.id, req.user._id);
    sendSuccess(res, 200, 'Thread fetched successfully', posts);
  } catch (error) {
    logger.error('List thread error:', error);
    next(error);
  }
};

export const createPost = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const post = await createThreadPost(req.params.id, req.user._id, req.body);
    sendSuccess(res, 201, 'Post created successfully', post);
  } catch (error) {
    logger.error('Create post error:', error);
    next(error);
  }
};

export const listTasks = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const tasks = await getMissionTasks(req.params.id, req.user._id);
    sendSuccess(res, 200, 'Tasks fetched successfully', tasks);
  } catch (error) {
    logger.error('List tasks error:', error);
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const task = await createMissionTask(req.params.id, req.user._id, req.body);
    sendSuccess(res, 201, 'Task created successfully', task);
  } catch (error) {
    logger.error('Create task error:', error);
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const task = await updateMissionTask(req.params.id, req.params.taskId, req.user._id, req.body);
    sendSuccess(res, 200, 'Task updated successfully', task);
  } catch (error) {
    logger.error('Update task error:', error);
    next(error);
  }
};

export const changeStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const mission = await updateMissionStatus(req.params.id, req.user._id, req.body.status);
    sendSuccess(res, 200, 'Mission status updated', mission);
  } catch (error) {
    logger.error('Update mission status error:', error);
    next(error);
  }
};

export const myMissions = async (req, res, next) => {
  try {
    const data = await getUserMissions(req.user._id);
    sendSuccess(res, 200, 'User missions fetched successfully', data);
  } catch (error) {
    logger.error('Get user missions error:', error);
    next(error);
  }
};
