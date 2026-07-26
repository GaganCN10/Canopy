import Article from '../models/Article.js';
import Quiz from '../models/Quiz.js';
import QuizQuestion from '../models/QuizQuestion.js';
import QuizAttempt from '../models/QuizAttempt.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

const ARTICLE_TOPICS = ['species-id', 'habitats', 'coexistence', 'anti-poaching', 'citizen-science', 'ecosystems', 'other'];
const ARTICLE_STATUSES = ['draft', 'published'];
const RETAKE_POLICIES = ['unlimited', 'single-attempt'];
const QUESTION_TYPES = ['single-choice', 'multi-choice', 'true-false'];

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100);
};

const estimateReadTime = (body) => {
  const text = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text.split(' ').filter((w) => w.length > 0).length;
  return Math.max(1, Math.round(words / 200));
};

export const createArticle = async (userId, articleData) => {
  let slug = generateSlug(articleData.title);
  const existing = await Article.findOne({ slug });
  let counter = 1;
  while (existing) {
    slug = `${generateSlug(articleData.title)}-${counter}`;
    counter++;
  }

  const article = await Article.create({
    ...articleData,
    slug,
    author: userId,
    readTimeMinutes: estimateReadTime(articleData.body),
  });

  return article;
};

export const getArticles = async (filters = {}, requestingUser = null) => {
  const query = {};

  if (filters.topic && ARTICLE_TOPICS.includes(filters.topic)) {
    query.topic = filters.topic;
  }

  if (filters.search) {
    query.title = { $regex: filters.search, $options: 'i' };
  }

  if (requestingUser) {
    const isAuthor = requestingUser.role === 'admin' || requestingUser.role === 'researcher' || requestingUser.role === 'ranger';
    if (!isAuthor) {
      query.status = 'published';
    }
  } else {
    query.status = 'published';
  }

  let sort = { createdAt: -1 };
  if (filters.sort === 'most-read') {
    sort = { readTimeMinutes: -1 };
  }

  const articles = await Article.find(query)
    .populate('author', 'firstName lastName email')
    .sort(sort)
    .lean();

  return articles;
};

export const getArticleBySlug = async (slug, requestingUser = null) => {
  const query = { slug };

  if (requestingUser) {
    const isAuthor = requestingUser.role === 'admin' || requestingUser.role === 'researcher' || requestingUser.role === 'ranger';
    if (!isAuthor) {
      query.status = 'published';
    }
  } else {
    query.status = 'published';
  }

  const article = await Article.findOne(query)
    .populate('author', 'firstName lastName email')
    .lean();

  if (!article) {
    throw new Error('Article not found');
  }

  return article;
};

export const updateArticle = async (articleId, userId, updateData) => {
  const article = await Article.findById(articleId);
  if (!article) {
    throw new Error('Article not found');
  }

  const user = await User.findById(userId);
  const isAdmin = user && user.role === 'admin';
  const isAuthor = article.author.toString() === userId.toString();

  if (!isAuthor && !isAdmin) {
    throw new Error('Only the author or an admin can update this article');
  }

  const allowedFields = ['title', 'body', 'topic', 'status'];
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      article[field] = updateData[field];
    }
  });

  if (updateData.title && !updateData.slug) {
    article.slug = generateSlug(updateData.title);
  }

  if (updateData.slug) {
    article.slug = updateData.slug;
  }

  if (updateData.status === 'published' && !article.publishedAt) {
    article.publishedAt = new Date();
  }

  article.readTimeMinutes = estimateReadTime(article.body);
  await article.save();

  return article;
};

export const deleteArticle = async (articleId, userId) => {
  const article = await Article.findById(articleId);
  if (!article) {
    throw new Error('Article not found');
  }

  const user = await User.findById(userId);
  if (!user || user.role !== 'admin') {
    throw new Error('Only admins can delete articles');
  }

  await Article.findByIdAndDelete(articleId);
  await Quiz.deleteOne({ article: articleId });

  return { success: true };
};

export const createQuiz = async (articleId, userId, quizData) => {
  const article = await Article.findById(articleId);
  if (!article) {
    throw new Error('Article not found');
  }

  const user = await User.findById(userId);
  const isAdmin = user && user.role === 'admin';
  const isAuthor = article.author.toString() === userId.toString();

  if (!isAuthor && !isAdmin) {
    throw new Error('Only the author or an admin can create a quiz for this article');
  }

  const existingQuiz = await Quiz.findOne({ article: articleId });
  if (existingQuiz) {
    throw new Error('A quiz already exists for this article');
  }

  const quiz = await Quiz.create({
    article: articleId,
    passThresholdPercent: quizData.passThresholdPercent || null,
    retakePolicy: quizData.retakePolicy || 'unlimited',
  });

  if (quizData.questions && quizData.questions.length > 0) {
    const questionDocs = quizData.questions.map((q, index) => ({
      quiz: quiz._id,
      questionText: q.questionText,
      type: q.type || 'single-choice',
      options: q.options,
      correctOptionIds: q.correctOptionIds,
      explanation: q.explanation || null,
      order: q.order ?? index,
    }));
    await QuizQuestion.insertMany(questionDocs);
  }

  return quiz;
};

export const getQuizForArticle = async (articleId, requestingUser = null) => {
  const quiz = await Quiz.findOne({ article: articleId });
  if (!quiz) {
    return null;
  }

  const questions = await QuizQuestion.find({ quiz: quiz._id })
    .sort({ order: 1 })
    .lean();

  const sanitizedQuestions = questions.map((q) => ({
    _id: q._id,
    questionText: q.questionText,
    type: q.type,
    options: q.options,
    order: q.order,
  }));

  return {
    _id: quiz._id,
    article: quiz.article,
    passThresholdPercent: quiz.passThresholdPercent,
    retakePolicy: quiz.retakePolicy,
    questions: sanitizedQuestions,
  };
};

export const updateQuiz = async (quizId, userId, updateData) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new Error('Quiz not found');
  }

  const article = await Article.findById(quiz.article);
  if (!article) {
    throw new Error('Article not found');
  }

  const user = await User.findById(userId);
  const isAdmin = user && user.role === 'admin';
  const isAuthor = article.author.toString() === userId.toString();

  if (!isAuthor && !isAdmin) {
    throw new Error('Only the author or an admin can update this quiz');
  }

  const allowedFields = ['passThresholdPercent', 'retakePolicy'];
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      quiz[field] = updateData[field];
    }
  });

  await quiz.save();
  return quiz;
};

export const submitQuizAttempt = async (quizId, userId, answers) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new Error('Quiz not found');
  }

  if (quiz.retakePolicy === 'single-attempt') {
    const existingAttempt = await QuizAttempt.findOne({ quiz: quizId, user: userId });
    if (existingAttempt) {
      throw new Error('You have already taken this quiz');
    }
  }

  const questions = await QuizQuestion.find({ quiz: quizId }).lean();
  if (questions.length === 0) {
    throw new Error('Quiz has no questions');
  }

  let correctCount = 0;
  const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

  const processedAnswers = answers.map((answer) => {
    const question = questionMap.get(answer.questionId);
    if (!question) {
      return null;
    }

    const selectedIds = answer.selectedOptionIds || [];
    const correctIds = question.correctOptionIds || [];

    const isCorrect = question.type === 'multi-choice'
      ? selectedIds.length === correctIds.length && selectedIds.every((id) => correctIds.includes(id))
      : selectedIds.length === 1 && correctIds.includes(selectedIds[0]);

    if (isCorrect) {
      correctCount++;
    }

    return {
      questionId: answer.questionId,
      selectedOptionIds: selectedIds,
      isCorrect,
    };
  }).filter((a) => a !== null);

  const scorePercent = Math.round((correctCount / questions.length) * 100);
  let passed = null;
  if (quiz.passThresholdPercent !== null && quiz.passThresholdPercent !== undefined) {
    passed = scorePercent >= quiz.passThresholdPercent;
  }

  const attempt = await QuizAttempt.create({
    quiz: quizId,
    user: userId,
    answers: processedAnswers,
    score: correctCount,
    scorePercent,
    passed,
  });

  const populatedAttempt = await QuizAttempt.findById(attempt._id)
    .populate('quiz')
    .populate('user', 'firstName lastName email')
    .lean();

  const enrichedAnswers = processedAnswers.map((answer) => {
    const question = questionMap.get(answer.questionId);
    return {
      ...answer,
      questionText: question?.questionText,
      options: question?.options,
      correctOptionIds: question?.correctOptionIds,
      explanation: question?.explanation,
    };
  });

  return {
    ...populatedAttempt,
    answers: enrichedAnswers,
    totalQuestions: questions.length,
  };
};

export const getUserQuizAttempts = async (userId) => {
  const attempts = await QuizAttempt.find({ user: userId })
    .populate('quiz')
    .populate({
      path: 'quiz',
      populate: {
        path: 'article',
        select: 'title slug',
      },
    })
    .sort({ submittedAt: -1 })
    .lean();

  return attempts;
};
