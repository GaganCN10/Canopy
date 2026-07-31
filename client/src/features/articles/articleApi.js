import api from '../../api/axiosInstance';

export const getArticles = async (params = {}) => {
  const { data } = await api.get('/articles', { params });
  return data;
};

export const getArticle = async (slug) => {
  const { data } = await api.get(`/articles/${slug}`);
  return data;
};

export const createArticle = async (articleData) => {
  const { data } = await api.post('/articles', articleData);
  return data;
};

export const updateArticle = async (articleId, articleData) => {
  const { data } = await api.patch(`/articles/${articleId}`, articleData);
  return data;
};

export const deleteArticle = async (articleId, reason = '') => {
  const { data } = await api.delete(`/articles/${articleId}`, { data: { reason } });
  return data;
};

export const createQuiz = async (articleId, quizData) => {
  const { data } = await api.post(`/articles/${articleId}/quiz`, quizData);
  return data;
};

export const getQuiz = async (articleId) => {
  const { data } = await api.get(`/articles/${articleId}/quiz`);
  return data;
};

export const updateQuiz = async (quizId, quizData) => {
  const { data } = await api.patch(`/articles/quizzes/${quizId}`, quizData);
  return data;
};

export const submitQuizAttempt = async (quizId, answers) => {
  const { data } = await api.post(`/articles/quizzes/${quizId}/attempts`, { answers });
  return data;
};

export const getQuizAttempts = async () => {
  const { data } = await api.get('/articles/users/me/quiz-attempts');
  return data;
};
