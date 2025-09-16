// src/pages/admin/AdminPostManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { useUI } from '../../hooks/useUI';
import Loading from '../../components/common/Loading';
import { formatRelativeTime } from '../../utils/dateFormat';
import { truncateText } from '../../utils/textFormat';
import Button from '../../components/common/Button';

const AdminPostManagement = () => {
  const { getAllPosts, deletePostAsAdmin, loading, error } = useAdmin();
  const { showToast, showConfirmation } = useUI();
  const [posts, setPosts] = useState([]);

  const fetchPosts = useCallback(async () => {
    const result = await getAllPosts();
    if (result.success) {
      setPosts(result.data);
    } else {
      showToast(result.error, 'error');
    }
  }, [getAllPosts, showToast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = (postId) => {
    showConfirmation(
      'Delete Post Permanently?',
      'This action cannot be undone. The post will be removed for all users.',
      async () => {
        const result = await deletePostAsAdmin(postId);
        if (result.success) {
          showToast('Post deleted successfully.', 'success');
          fetchPosts();
        } else {
          showToast(result.error, 'error');
        }
      }
    );
  };

  if (loading && posts.length === 0) {
    return <Loading text="Fetching posts..." />;
  }
  
  if (error) {
    return <div className="text-center text-danger p-4">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">Post Management</h1>
      <div className="bg-white dark:bg-dark-light rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-dark-border dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Author</th>
                <th scope="col" className="px-6 py-3">Content</th>
                <th scope="col" className="px-6 py-3">Posted</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id} className="bg-white dark:bg-dark-light border-b dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-border">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    <p className="font-bold">{post.displayName}</p>
                    <p className="text-secondary text-xs">@{post.username}</p>
                  </td>
                  <td className="px-6 py-4 max-w-sm">
                    <p className="truncate">{truncateText(post.content || '[Media Post]', 100)}</p>
                  </td>
                  <td className="px-6 py-4">{post.createdAt ? formatRelativeTime(post.createdAt.toDate()) : 'N/A'}</td>
                  <td className="px-6 py-4">
                    <Button onClick={() => handleDelete(post.id)} variant="danger" size="sm">Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPostManagement;
