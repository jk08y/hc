// src/components/common/Trends.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { formatNumber } from '../../utils/textFormat';

const Trends = ({ limit: trendLimit = 5 }) => {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // First, try to get personalized trends (based on score)
        let trendsQuery = query(
          collection(db, 'trends'),
          orderBy('score', 'desc'),
          limit(trendLimit)
        );
        
        let querySnapshot = await getDocs(trendsQuery);
        let trendsList = [];
        
        querySnapshot.forEach((doc) => {
          trendsList.push({
            id: doc.id,
            ...doc.data()
          });
        });

        // FIX: If no personalized trends are found, fetch global trends as a fallback
        if (trendsList.length === 0) {
            trendsQuery = query(
                collection(db, 'trends'),
                orderBy('count', 'desc'), // Fallback to simple count
                limit(trendLimit)
            );
            querySnapshot = await getDocs(trendsQuery);
            querySnapshot.forEach((doc) => {
                trendsList.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
        }
        
        setTrends(trendsList);
      } catch (err) {
        setError('An unexpected error occurred while fetching trends.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrends();
  }, [trendLimit]);
  
  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-light rounded-lg p-4 mb-4">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
          Trends for you
        </h2>
        <div className="animate-pulse">
          {[...Array(trendLimit)].map((_, index) => (
            <div key={index} className="py-3">
              <div className="h-2 bg-gray-200 dark:bg-dark-border rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-dark-border rounded w-32 mb-1"></div>
              <div className="h-2 bg-gray-200 dark:bg-dark-border rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white dark:bg-dark-light rounded-lg p-4 mb-4">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
          Trends for you
        </h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  
  if (trends.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-light rounded-lg p-4 mb-4">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
          Trends for you
        </h2>
        <p className="text-gray-500">No trends available at the moment</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-dark-light rounded-lg p-4 mb-4">
      <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
        Trends for you
      </h2>
      
      {trends.map((trend) => (
        <Link
          key={trend.id}
          to={`/explore?q=%23${trend.tag}`}
          className="block py-3 hover:bg-gray-50 dark:hover:bg-dark-border rounded-lg transition-colors px-2"
        >
          <p className="text-xs text-gray-500">Trending</p>
          <p className="font-bold text-gray-900 dark:text-white">
            #{trend.tag}
          </p>
          <p className="text-sm text-gray-500">
            {formatNumber(trend.count || 0)} posts
          </p>
        </Link>
      ))}
      
      <Link
        to="/explore"
        className="inline-block mt-2 text-primary hover:underline"
      >
        Show more
      </Link>
    </div>
  );
};

export default Trends;
