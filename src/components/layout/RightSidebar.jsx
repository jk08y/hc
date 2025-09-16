// src/components/layout/RightSidebar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import Avatar from '../common/Avatar';
import { formatNumber } from '../../utils/textFormat';
import VerificationBadge from '../common/VerificationBadge'; // Import the badge

const RightSidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch trending topics
            const trendsQuery = query(
              collection(db, 'trends'),
              orderBy('score', 'desc'),
              limit(5)
            );
            const trendsSnapshot = await getDocs(trendsQuery);
            const trendsData = trendsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTrends(trendsData);

            // Fetch suggested users to follow if the current user is logged in
            if (user) {
                const usersQuery = query(
                    collection(db, 'users'),
                    orderBy('followersCount', 'desc'),
                    limit(3)
                );
                const usersSnapshot = await getDocs(usersQuery);
                // Filter out the current user from suggestions
                const suggestedData = usersSnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(u => u.id !== user.uid);
                setSuggestedUsers(suggestedData);
            }
        } catch (error) {
            // Silently handle errors, e.g., Firestore permissions issues
        } finally {
            setLoading(false);
        }
    };

    fetchData();
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <aside className="hidden lg:block w-72 xl:w-80 h-screen shrink-0">
      <div className="sticky top-0 p-4 space-y-6">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                <FaSearch />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search HeyChat"
              className="w-full bg-gray-100 dark:bg-dark-light border-none rounded-full py-2.5 pl-11 pr-4 focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
            />
          </div>
        </form>

        <div className="bg-gray-50 dark:bg-dark-light rounded-2xl">
          <h2 className="text-xl font-bold p-4 text-gray-900 dark:text-white">
            Trends for you
          </h2>
          {loading ? (
            <div className="p-4 text-secondary">Loading trends...</div>
          ) : trends.length > 0 ? (
            trends.map((trend) => (
              <Link
                key={trend.id}
                to={`/explore?q=${encodeURIComponent('#' + trend.tag)}`}
                className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-dark-border transition"
              >
                <p className="text-xs text-secondary">Trending</p>
                <p className="font-bold text-gray-900 dark:text-white">
                  #{trend.tag}
                </p>
                <p className="text-sm text-secondary">
                  {formatNumber(trend.count || 0)} posts
                </p>
              </Link>
            ))
          ) : (
            <div className="px-4 py-3 text-secondary">No trends available</div>
          )}
          <Link
            to="/explore"
            className="block p-4 text-primary hover:bg-gray-100 dark:hover:bg-dark-border rounded-b-2xl text-sm transition"
          >
            Show more
          </Link>
        </div>

        {user && (
          <div className="bg-gray-50 dark:bg-dark-light rounded-2xl">
            <h2 className="text-xl font-bold p-4 text-gray-900 dark:text-white">
              Who to follow
            </h2>
            {loading ? (
                <div className="p-4 text-secondary">Loading suggestions...</div>
            ) : suggestedUsers.length > 0 ? (
                suggestedUsers.map((suggestedUser) => (
                    <Link
                    key={suggestedUser.id}
                    to={`/${suggestedUser.username}`}
                    className="flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-dark-border transition"
                    >
                    <Avatar user={suggestedUser} size="md" />
                    <div className="ml-3 min-w-0">
                        {/* **THE FIX**: Added a flex container to place the badge next to the name. */}
                        <div className="flex items-center gap-1">
                            <p className="font-bold text-gray-900 dark:text-white truncate">
                                {suggestedUser.displayName}
                            </p>
                            {suggestedUser.isVerified && <VerificationBadge type={suggestedUser.verificationType} size="sm" />}
                        </div>
                        <p className="text-sm text-secondary truncate">
                            @{suggestedUser.username}
                        </p>
                    </div>
                    </Link>
                ))
            ) : (
                <div className="px-4 py-3 text-secondary">No suggestions available</div>
            )}
            <Link
              to="/explore"
              className="block p-4 text-primary hover:bg-gray-100 dark:hover:bg-dark-border rounded-b-2xl text-sm transition"
            >
              Show more
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};

export default RightSidebar;
