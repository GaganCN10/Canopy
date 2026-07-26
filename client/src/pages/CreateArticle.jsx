import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bold, Italic, List, Link, Quote, Plus, Trash2 } from 'lucide-react';
import { createArticle, createQuiz } from '../features/articles/articleApi';
import { useToast } from '../components/Toast';

const TOPICS = [
  { value: 'species-id', label: 'Species ID' },
  { value: 'habitats', label: 'Habitats' },
  { value: 'coexistence', label: 'Human-Wildlife Coexistence' },
  { value: 'anti-poaching', label: 'Anti-Poaching' },
  { value: 'citizen-science', label: 'Citizen Science' },
  { value: 'ecosystems', label: 'Ecosystems' },
  { value: 'other', label: 'Other' },
];

function CreateArticle() {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    topic: 'species-id',
    status: 'draft',
  });
  const [quizData, setQuizData] = useState({
    passThresholdPercent: '',
    retakePolicy: 'unlimited',
    questions: [],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showSuccess } = useToast();

  const insertTag = (tag) => {
    const textarea = document.getElementById('article-body');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.body.substring(start, end);
    let newText = '';

    switch (tag) {
      case 'h2':
        newText = `<h2>${selectedText || 'Heading'}</h2>`;
        break;
      case 'h3':
        newText = `<h3>${selectedText || 'Heading'}</h3>`;
        break;
      case 'b':
        newText = `<strong>${selectedText || 'Bold text'}</strong>`;
        break;
      case 'i':
        newText = `<em>${selectedText || 'Italic text'}</em>`;
        break;
      case 'ul':
        newText = `<ul>\n  <li>${selectedText || 'List item'}</li>\n</ul>`;
        break;
      case 'ol':
        newText = `<ol>\n  <li>${selectedText || 'List item'}</li>\n</ol>`;
        break;
      case 'a':
        newText = `<a href="${selectedText || 'https://example.com'}">${selectedText || 'Link text'}</a>`;
        break;
      case 'blockquote':
        newText = `<blockquote>${selectedText || 'Quote'}</blockquote>`;
        break;
      default:
        newText = selectedText;
    }

    const newBody = formData.body.substring(0, start) + newText + formData.body.substring(end);
    setFormData({ ...formData, body: newBody });
  };

  const addQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [
        ...quizData.questions,
        {
          questionText: '',
          type: 'single-choice',
          options: [
            { id: `opt-${Date.now()}-1`, text: '' },
            { id: `opt-${Date.now()}-2`, text: '' },
          ],
          correctOptionIds: [],
          explanation: '',
        },
      ],
    });
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...quizData.questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuizData({ ...quizData, questions: updated });
  };

  const addOption = (questionIndex) => {
    const updated = [...quizData.questions];
    updated[questionIndex].options.push({
      id: `opt-${Date.now()}`,
      text: '',
    });
    setQuizData({ ...quizData, questions: updated });
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const updated = [...quizData.questions];
    updated[questionIndex].options[optionIndex].text = value;
    setQuizData({ ...quizData, questions: updated });
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updated = [...quizData.questions];
    updated[questionIndex].options.splice(optionIndex, 1);
    setQuizData({ ...quizData, questions: updated });
  };

  const toggleCorrectOption = (questionIndex, optionId) => {
    const updated = [...quizData.questions];
    const question = updated[questionIndex];
    const current = question.correctOptionIds || [];

    if (current.includes(optionId)) {
      question.correctOptionIds = current.filter((id) => id !== optionId);
    } else {
      question.correctOptionIds = [...current, optionId];
    }

    setQuizData({ ...quizData, questions: updated });
  };

  const removeQuestion = (index) => {
    const updated = quizData.questions.filter((_, i) => i !== index);
    setQuizData({ ...quizData, questions: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const articlePayload = {
        ...formData,
        status: formData.status,
      };

      const articleResult = await createArticle(articlePayload);
      const articleId = articleResult.data._id;

      if (quizData.questions.length > 0) {
        const validQuestions = quizData.questions.filter((q) => q.questionText.trim() && q.options.some((o) => o.text.trim()));
        if (validQuestions.length > 0) {
          await createQuiz(articleId, {
            passThresholdPercent: quizData.passThresholdPercent ? parseInt(quizData.passThresholdPercent, 10) : null,
            retakePolicy: quizData.retakePolicy,
            questions: validQuestions.map((q) => ({
              questionText: q.questionText,
              type: q.type,
              options: q.options.filter((o) => o.text.trim()),
              correctOptionIds: q.correctOptionIds,
              explanation: q.explanation || null,
            })),
          });
        }
      }

      showSuccess('Article created', 'Your article has been created successfully.');
      navigate('/articles');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 lg:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-8 lg:p-10">
          <button
            onClick={() => navigate('/articles')}
            className="flex items-center gap-2 text-canopy-forest-600 hover:text-canopy-forest-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Articles
          </button>

          <h1 className="text-3xl font-display font-semibold text-canopy-forest-950 mb-2">Create Article</h1>
          <p className="text-canopy-ink-900/70 mb-8">Write an educational article about wildlife conservation.</p>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                placeholder="Enter article title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Topic</label>
              <select
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="input-field"
              >
                {TOPICS.map((topic) => (
                  <option key={topic.value} value={topic.value}>
                    {topic.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Body</label>
              <div className="flex flex-wrap gap-2 mb-2">
                <button type="button" onClick={() => insertTag('h2')} className="p-2 text-canopy-forest-600 hover:bg-canopy-sand-100 rounded" title="Heading">
                  <Bold className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => insertTag('b')} className="p-2 text-canopy-forest-600 hover:bg-canopy-sand-100 rounded" title="Bold">
                  <Bold className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => insertTag('i')} className="p-2 text-canopy-forest-600 hover:bg-canopy-sand-100 rounded" title="Italic">
                  <Italic className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => insertTag('ul')} className="p-2 text-canopy-forest-600 hover:bg-canopy-sand-100 rounded" title="Bullet List">
                  <List className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => insertTag('ol')} className="p-2 text-canopy-forest-600 hover:bg-canopy-sand-100 rounded" title="Numbered List">
                  <List className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => insertTag('a')} className="p-2 text-canopy-forest-600 hover:bg-canopy-sand-100 rounded" title="Link">
                  <Link className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => insertTag('blockquote')} className="p-2 text-canopy-forest-600 hover:bg-canopy-sand-100 rounded" title="Quote">
                  <Quote className="w-4 h-4" />
                </button>
              </div>
              <textarea
                id="article-body"
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                rows={12}
                className="input-field resize-none font-mono text-sm"
                placeholder="Write your article content here... Use the toolbar above for basic formatting (HTML tags will be inserted)."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input-field"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="border-t border-canopy-mist-200 pt-6">
              <h2 className="text-xl font-display font-semibold text-canopy-forest-950 mb-4">Quiz (Optional)</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Pass Threshold % (optional)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={quizData.passThresholdPercent}
                    onChange={(e) => setQuizData({ ...quizData, passThresholdPercent: e.target.value })}
                    className="input-field"
                    placeholder="e.g., 70"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Retake Policy</label>
                  <select
                    value={quizData.retakePolicy}
                    onChange={(e) => setQuizData({ ...quizData, retakePolicy: e.target.value })}
                    className="input-field"
                  >
                    <option value="unlimited">Unlimited retakes</option>
                    <option value="single-attempt">Single attempt only</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {quizData.questions.map((question, qIndex) => (
                  <div key={qIndex} className="p-4 bg-canopy-sand-50 rounded-xl space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-canopy-ink-900 mb-1">
                          Question {qIndex + 1}
                        </label>
                        <input
                          type="text"
                          value={question.questionText}
                          onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                          className="input-field"
                          placeholder="Enter question text"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-canopy-ink-900 mb-1">Type</label>
                      <select
                        value={question.type}
                        onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                        className="input-field"
                      >
                        <option value="single-choice">Single Choice</option>
                        <option value="multi-choice">Multiple Choice</option>
                        <option value="true-false">True/False</option>
                      </select>
                    </div>

                    {question.type !== 'true-false' && (
                      <div>
                        <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Options</label>
                        <div className="space-y-2">
                          {question.options.map((option, oIndex) => (
                            <div key={option.id} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={question.correctOptionIds.includes(option.id)}
                                onChange={() => toggleCorrectOption(qIndex, option.id)}
                                className="w-4 h-4 text-canopy-forest-600"
                                title="Mark as correct"
                              />
                              <input
                                type="text"
                                value={option.text}
                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                className="input-field flex-1"
                                placeholder={`Option ${oIndex + 1}`}
                              />
                              {question.options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeOption(qIndex, oIndex)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => addOption(qIndex)}
                          className="mt-2 text-sm text-canopy-forest-600 hover:text-canopy-forest-800"
                        >
                          + Add Option
                        </button>
                      </div>
                    )}

                    {question.type === 'true-false' && (
                      <div>
                        <label className="block text-sm font-medium text-canopy-ink-900 mb-1">Correct Answer</label>
                        <select
                          value={question.correctOptionIds[0] || ''}
                          onChange={(e) => updateQuestion(qIndex, 'correctOptionIds', [e.target.value])}
                          className="input-field"
                        >
                          <option value="">Select correct answer</option>
                          <option value="true">True</option>
                          <option value="false">False</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-canopy-ink-900 mb-1">Explanation (optional)</label>
                      <textarea
                        value={question.explanation}
                        onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                        rows={2}
                        className="input-field resize-none"
                        placeholder="Explanation shown after submission"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addQuestion}
                className="mt-4 flex items-center gap-2 text-canopy-forest-600 hover:text-canopy-forest-800"
              >
                <Plus className="w-5 h-5" />
                Add Question
              </button>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Creating...' : 'Create Article'}
              </button>
              <button type="button" onClick={() => navigate('/articles')} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateArticle;
