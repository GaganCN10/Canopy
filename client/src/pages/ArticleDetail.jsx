import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, User, Send, CheckCircle, XCircle } from 'lucide-react';
import { getArticle, getQuiz, submitQuizAttempt as submitQuizAttemptApi, getQuizAttempts } from '../features/articles/articleApi';
import { useToast } from '../components/Toast';

const TOPIC_LABELS = {
  'species-id': 'Species ID',
  'habitats': 'Habitats',
  'coexistence': 'Human-Wildlife Coexistence',
  'anti-poaching': 'Anti-Poaching',
  'citizen-science': 'Citizen Science',
  'ecosystems': 'Ecosystems',
  'other': 'Other',
};

function ArticleDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [article, setArticle] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadArticle();
  }, [slug]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      setError('');
      const articleResult = await getArticle(slug);
      setArticle(articleResult.data);

      try {
        const quizResult = await getQuiz(articleResult.data._id);
        setQuiz(quizResult.data);
      } catch (quizErr) {
        setQuiz(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, optionId) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      if (current.includes(optionId)) {
        return {
          ...prev,
          [questionId]: current.filter((id) => id !== optionId),
        };
      }
      return {
        ...prev,
        [questionId]: [...current, optionId],
      };
    });
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;

    const answersArray = quiz.questions.map((q) => ({
      questionId: q._id,
      selectedOptionIds: answers[q._id] || [],
    }));

    try {
      setSubmitting(true);
      const result = await submitQuizAttemptApi(quiz._id, answersArray);
      setQuizResult(result.data);
      setQuizSubmitted(true);
      showSuccess('Quiz submitted', `You scored ${result.data.score}/${result.data.totalQuestions}`);
    } catch (err) {
      showError('Failed to submit quiz', err.response?.data?.message || 'Please try again');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setQuizStarted(false);
    setQuizSubmitted(false);
    setQuizResult(null);
    setAnswers({});
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className="text-center py-20 text-canopy-ink-900/60">Loading article...</div>;
  }

  if (!article) {
    return (
      <div className="text-center py-20">
        <p className="text-red-700 mb-4">{error || 'Article not found'}</p>
        <button onClick={() => navigate('/articles')} className="text-canopy-forest-600 hover:underline">
          Back to Articles
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 lg:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/articles')}
          className="flex items-center gap-2 text-canopy-forest-600 hover:text-canopy-forest-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Articles
        </button>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        <article className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-canopy-moss-300/20 text-canopy-forest-600 mb-3">
                {TOPIC_LABELS[article.topic] || article.topic}
              </span>
              <h1 className="text-3xl lg:text-4xl font-display font-semibold text-canopy-forest-950 mb-3">
                {article.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-canopy-ink-900/50">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {article.author?.firstName} {article.author?.lastName}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {article.readTimeMinutes} min read
                </span>
                <span>{formatDate(article.publishedAt || article.createdAt)}</span>
              </div>
            </div>
          </div>

          <div
            className="prose prose-lg max-w-none text-canopy-ink-900/90 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: article.body }}
          />
        </article>

        {quiz && !quizStarted && !quizSubmitted && (
          <div className="card p-8 text-center">
            <BookOpen className="w-12 h-12 text-canopy-forest-600 mx-auto mb-4" />
            <h2 className="text-2xl font-display font-semibold text-canopy-forest-950 mb-2">
              Test Your Knowledge
            </h2>
            <p className="text-canopy-ink-900/70 mb-6">
              This article has a quiz with {quiz.questions.length} questions. Take it to test your understanding!
            </p>
            <button
              onClick={() => setQuizStarted(true)}
              className="btn-primary"
            >
              Start Quiz
            </button>
          </div>
        )}

        {quiz && quizStarted && !quizSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8"
          >
            <h2 className="text-2xl font-display font-semibold text-canopy-forest-950 mb-6">Quiz</h2>
            <div className="space-y-8">
              {quiz.questions.map((question, qIndex) => (
                <div key={question._id} className="space-y-4">
                  <h3 className="text-lg font-medium text-canopy-forest-950">
                    {qIndex + 1}. {question.questionText}
                  </h3>
                  <div className="space-y-2">
                    {question.options.map((option) => (
                      <label
                        key={option.id}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          answers[question._id]?.includes(option.id)
                            ? 'border-canopy-forest-600 bg-canopy-forest-600/5'
                            : 'border-canopy-mist-200 hover:border-canopy-forest-600/50'
                        }`}
                      >
                        <input
                          type={question.type === 'multi-choice' ? 'checkbox' : 'radio'}
                          name={question._id}
                          checked={answers[question._id]?.includes(option.id) || false}
                          onChange={() => handleAnswerSelect(question._id, option.id)}
                          className="w-4 h-4 text-canopy-forest-600"
                        />
                        <span className="text-canopy-ink-900/80">{option.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-8">
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="btn-primary"
              >
                <Send className="w-5 h-5 mr-2" />
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </div>
          </motion.div>
        )}

        {quizSubmitted && quizResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-display font-semibold text-canopy-forest-950 mb-2">
                Quiz Results
              </h2>
              <p className="text-5xl font-display font-bold text-canopy-forest-600 mb-2">
                {quizResult.score}/{quizResult.totalQuestions}
              </p>
              <p className="text-lg text-canopy-ink-900/70">
                {quizResult.scorePercent}% correct
              </p>
              {quizResult.passed !== null && (
                <p className={`text-lg font-medium mt-2 ${quizResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {quizResult.passed ? 'Passed!' : 'Not passed'}
                </p>
              )}
              {quiz.retakePolicy === 'unlimited' && (
                <button
                  onClick={handleRetake}
                  className="mt-4 text-canopy-forest-600 hover:text-canopy-forest-800 underline"
                >
                  Retake Quiz
                </button>
              )}
            </div>

            <div className="space-y-6">
              {quizResult.answers.map((answer, index) => (
                <div key={answer.questionId} className="p-6 bg-canopy-sand-50 rounded-xl">
                  <div className="flex items-start gap-3 mb-3">
                    {answer.isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    )}
                    <div>
                      <p className="font-medium text-canopy-forest-950 mb-2">
                        {index + 1}. {answer.questionText}
                      </p>
                      <div className="space-y-1">
                        {answer.options.map((option) => {
                          const isSelected = answer.selectedOptionIds.includes(option.id);
                          const isCorrect = answer.correctOptionIds.includes(option.id);
                          return (
                            <div
                              key={option.id}
                              className={`text-sm p-2 rounded ${
                                isCorrect
                                  ? 'bg-green-50 text-green-700'
                                  : isSelected
                                  ? 'bg-red-50 text-red-700'
                                  : 'text-canopy-ink-900/60'
                              }`}
                            >
                              {option.text}
                              {isCorrect && ' ✓'}
                              {isSelected && !isCorrect && ' ✗'}
                            </div>
                          );
                        })}
                      </div>
                      {answer.explanation && (
                        <p className="text-sm text-canopy-ink-900/70 mt-3 italic">
                          {answer.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default ArticleDetail;
