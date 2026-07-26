import { validationResult } from 'express-validator';
import {
  createArticle,
  getArticles,
  getArticleBySlug,
  updateArticle,
  deleteArticle,
  createQuiz,
  getQuizForArticle,
  updateQuiz,
  submitQuizAttempt,
  getUserQuizAttempts,
} from '../services/articleService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import logger from '../utils/logger.js';

export const listArticles = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const filters = {
      topic: req.query.topic,
      search: req.query.search,
      sort: req.query.sort,
    };

    const articles = await getArticles(filters, req.user);
    sendSuccess(res, 200, 'Articles fetched successfully', articles);
  } catch (error) {
    logger.error('List articles error:', error);
    next(error);
  }
};

export const getArticle = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const article = await getArticleBySlug(req.params.slug, req.user);
    sendSuccess(res, 200, 'Article fetched successfully', article);
  } catch (error) {
    logger.error('Get article error:', error);
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const article = await createArticle(req.user._id, req.body);
    sendSuccess(res, 201, 'Article created successfully', article);
  } catch (error) {
    logger.error('Create article error:', error);
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const article = await updateArticle(req.params.id, req.user._id, req.body);
    sendSuccess(res, 200, 'Article updated successfully', article);
  } catch (error) {
    logger.error('Update article error:', error);
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const result = await deleteArticle(req.params.id, req.user._id);
    sendSuccess(res, 200, 'Article deleted successfully', result);
  } catch (error) {
    logger.error('Delete article error:', error);
    next(error);
  }
};

export const attachQuiz = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const quiz = await createQuiz(req.params.id, req.user._id, req.body);
    sendSuccess(res, 201, 'Quiz created successfully', quiz);
  } catch (error) {
    logger.error('Create quiz error:', error);
    next(error);
  }
};

export const getQuiz = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const article = await Article.findById(req.params.id);
    if (!article) {
      return sendError(res, 404, 'Article not found');
    }

    const quiz = await getQuizForArticle(req.params.id, req.user);
    if (!quiz) {
      return sendError(res, 404, 'Quiz not found');
    }

    sendSuccess(res, 200, 'Quiz fetched successfully', quiz);
  } catch (error) {
    logger.error('Get quiz error:', error);
    next(error);
  }
};

export const patchQuiz = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const quiz = await updateQuiz(req.params.id, req.user._id, req.body);
    sendSuccess(res, 200, 'Quiz updated successfully', quiz);
  } catch (error) {
    logger.error('Update quiz error:', error);
    next(error);
  }
};

export const attemptQuiz = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const result = await submitQuizAttempt(req.params.id, req.user._id, req.body.answers);
    sendSuccess(res, 201, 'Quiz attempt submitted successfully', result);
  } catch (error) {
    logger.error('Quiz attempt error:', error);
    next(error);
  }
};

export const listQuizAttempts = async (req, res, next) => {
  try {
    const attempts = await getUserQuizAttempts(req.user._id);
    sendSuccess(res, 200, 'Quiz attempts fetched successfully', attempts);
  } catch (error) {
    logger.error('List quiz attempts error:', error);
    next(error);
  }
};
