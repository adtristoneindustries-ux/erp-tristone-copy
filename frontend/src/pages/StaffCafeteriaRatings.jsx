import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Star, Filter, TrendingUp, MessageSquare } from 'lucide-react';

const StaffCafeteriaRatings = () => {
  const [ratings, setRatings] = useState([]);
  const [filteredRatings, setFilteredRatings] = useState([]);
  const [filterRating, setFilterRating] = useState('all');
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    fiveStars: 0,
    fourStars: 0,
    threeStars: 0,
    twoStars: 0,
    oneStar: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRatings();
  }, []);

  useEffect(() => {
    filterRatings();
  }, [filterRating, ratings]);

  const fetchRatings = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/cafeteria/ratings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ratingsData = res.data.data || [];
      setRatings(ratingsData);
      calculateStats(ratingsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ratings:', error);
      setRatings([]);
      setLoading(false);
    }
  };

  const calculateStats = (ratingsData) => {
    if (ratingsData.length === 0) {
      setStats({
        averageRating: 0,
        totalReviews: 0,
        fiveStars: 0,
        fourStars: 0,
        threeStars: 0,
        twoStars: 0,
        oneStar: 0
      });
      return;
    }

    const total = ratingsData.length;
    const sum = ratingsData.reduce((acc, r) => acc + r.rating, 0);
    const avg = (sum / total).toFixed(1);

    const fiveStars = ratingsData.filter(r => r.rating === 5).length;
    const fourStars = ratingsData.filter(r => r.rating === 4).length;
    const threeStars = ratingsData.filter(r => r.rating === 3).length;
    const twoStars = ratingsData.filter(r => r.rating === 2).length;
    const oneStar = ratingsData.filter(r => r.rating === 1).length;

    setStats({
      averageRating: avg,
      totalReviews: total,
      fiveStars,
      fourStars,
      threeStars,
      twoStars,
      oneStar
    });
  };

  const filterRatings = () => {
    if (filterRating === 'all') {
      setFilteredRatings(ratings);
    } else {
      setFilteredRatings(ratings.filter(r => r.rating === parseInt(filterRating)));
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  const getPercentage = (count) => {
    return stats.totalReviews > 0 ? ((count / stats.totalReviews) * 100).toFixed(0) : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ratings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 sm:p-6">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Ratings & Reviews</h1>
            <p className="text-sm text-gray-600 mt-1">Customer feedback and ratings</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Average Rating Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="text-blue-500" size={24} />
                  <h3 className="text-lg font-semibold text-gray-900">Average Rating</h3>
                </div>
                <div className="text-5xl font-bold text-gray-900 mb-2">{stats.averageRating}</div>
                <div className="flex justify-center gap-1 mb-2">
                  {renderStars(Math.round(stats.averageRating))}
                </div>
                <p className="text-sm text-gray-600">{stats.totalReviews} reviews</p>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats[`${['oneStar', 'twoStars', 'threeStars', 'fourStars', 'fiveStars'][star - 1]}`];
                  const percentage = getPercentage(count);
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-20">
                        <span className="text-sm font-medium text-gray-700">{star}</span>
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-yellow-400 h-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-16 text-right">{count} ({percentage}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center gap-3">
              <Filter className="text-gray-400" size={20} />
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {filteredRatings.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <MessageSquare className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-500">No reviews found</p>
              </div>
            ) : (
              filteredRatings.map((review) => (
                <div key={review._id} className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {review.customer?.name?.charAt(0) || 'U'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{review.customer?.name || 'Anonymous'}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex gap-1">
                              {renderStars(review.rating)}
                            </div>
                            <span className="text-sm text-gray-600">({review.rating}/5)</span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      {review.foodItem && (
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Item:</span> {review.foodItem.name}
                        </p>
                      )}
                      {review.comment && (
                        <p className="text-gray-700 text-sm sm:text-base">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffCafeteriaRatings;
