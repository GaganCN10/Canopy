import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, BookOpen, Clock } from 'lucide-react';
import { getArticles } from '../features/articles/articleApi';
import { useToast } from '../components/Toast';
import { useSelector } from 'react-redux';

const TOPICS = [
  { value: '', label: 'All Topics' },
  { value: 'species-id', label: 'Species ID' },
  { value: 'habitats', label: 'Habitats' },
  { value: 'coexistence', label: 'Human-Wildlife Coexistence' },
  { value: 'anti-poaching', label: 'Anti-Poaching' },
  { value: 'citizen-science', label: 'Citizen Science' },
  { value: 'ecosystems', label: 'Ecosystems' },
  { value: 'other', label: 'Other' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'most-read', label: 'Longest Read' },
];

function Articles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    topic: '',
    search: '',
    sort: 'newest',
  });
  const navigate = useNavigate();
  const { showSuccess } = useToast();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const canCreateArticle = isAuthenticated && ['researcher', 'ranger', 'admin'].includes(user?.role);

  useEffect(() => {
    loadArticles();
  }, [filters]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await getArticles(filters);
      setArticles(result.data || []);
    } catch (err) {
      setError('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const getTopicLabel = (topic) => {
    const topicMap = {
      'species-id': 'Species ID',
      'habitats': 'Habitats',
      'coexistence': 'Human-Wildlife Coexistence',
      'anti-poaching': 'Anti-Poaching',
      'citizen-science': 'Citizen Science',
      'ecosystems': 'Ecosystems',
      'other': 'Other',
    };
    return topicMap[topic] || topic;
  };

  return (
    <div className="min-h-screen py-16 lg:py-24">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl lg:text-4xl font-display font-semibold text-canopy-forest-950 mb-3">
              Conservation Articles
            </h1>
            <p className="text-lg text-canopy-ink-900/70 max-w-2xl">
              Learn about wildlife conservation through articles and quizzes written by experts and practitioners.
            </p>
          </div>
          {canCreateArticle && (
            <button
              onClick={() => navigate('/articles/create')}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              Create Article
            </button>
          )}
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/40" />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search articles..."
                className="input-field pl-12"
              />
            </div>
            <select
              name="topic"
              value={filters.topic}
              onChange={handleFilterChange}
              className="input-field sm:w-48"
            >
              {TOPICS.map((topic) => (
                <option key={topic.value} value={topic.value}>
                  {topic.label}
                </option>
              ))}
            </select>
            <select
              name="sort"
              value={filters.sort}
              onChange={handleFilterChange}
              className="input-field sm:w-48"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-canopy-ink-900/60">Loading articles...</div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-canopy-ink-900/60 mb-4">No articles found matching your criteria.</p>
            <button
              onClick={() => setFilters({ topic: '', search: '', sort: 'newest' })}
              className="text-canopy-forest-600 hover:text-canopy-forest-800 underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <motion.div
                key={article._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/articles/${article.slug}`)}
                className="card p-6 cursor-pointer hover:shadow-ambient-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-canopy-moss-300/20 text-canopy-forest-600">
                    {getTopicLabel(article.topic)}
                  </span>
                  <span className="text-xs text-canopy-ink-900/50 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {article.readTimeMinutes} min
                  </span>
                </div>

                <h3 className="font-display text-xl font-semibold text-canopy-forest-950 mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-canopy-ink-900/70 mb-4 line-clamp-3">
                  {article.body.replace(/<[^>]*>/g, '').substring(0, 150)}...
                </p>

                <div className="flex items-center justify-between text-xs text-canopy-ink-900/50">
                  <span>
                    By {article.author?.firstName} {article.author?.lastName}
                  </span>
                  <span>
                    {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Articles;
