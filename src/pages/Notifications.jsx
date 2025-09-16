// src/pages/Notifications.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaRetweet, FaUserPlus, FaBell, FaAt } from 'react-icons/fa';
import { collection, query, where, orderBy, limit, onSnapshot, doc, getDoc, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import Avatar from '../components/common/Avatar';
import Loading from '../components/common/Loading';
import { formatRelativeTime } from '../utils/dateFormat';
import VerificationBadge from '../components/common/VerificationBadge';

// =================================================================
// Notification Icon Component
// =================================================================
const NotificationIcon = ({ type }) => {
    const iconMap = {
      like: { icon: <FaHeart />, color: 'text-red-500', bg: 'bg-red-500/10' },
      repost: { icon: <FaRetweet />, color: 'text-green-500', bg: 'bg-green-500/10' },
      follow: { icon: <FaUserPlus />, color: 'text-primary', bg: 'bg-primary/10' },
      mention: { icon: <FaAt />, color: 'text-purple-500', bg: 'bg-purple-500/10' },
      comment: { icon: <FaAt />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    };
  
    const { icon, color, bg } = iconMap[type] || { icon: <FaBell />, color: 'text-secondary', bg: 'bg-gray-500/10' };
  
    return (
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bg} ${color}`}>
        {icon}
      </div>
    );
};

// =================================================================
// Notification Item Component
// =================================================================
const NotificationItem = ({ notification }) => {
    const navigate = useNavigate();
    const { type, sender, content, postId, createdAt, read } = notification;

    if (!sender) return null; // Don't render if sender data is missing

    const actionTextMap = {
        like: 'liked your post',
        repost: 'reposted your post',
        comment: 'replied to your post:',
        follow: 'followed you',
        mention: 'mentioned you in a post:',
    };

    const handleNotificationClick = () => {
        if (type === 'follow' || type === 'mention') {
            navigate(`/${sender.username}`);
        } else if (postId) {
            // This is a simplified navigation. A robust solution might need more context.
            // Assuming a structure like /username/status/postId
            navigate(`/${sender.username}/status/${postId}`);
        }
    };

    return (
        <div
            onClick={handleNotificationClick}
            className={`p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-dark-light transition-colors cursor-pointer relative ${!read ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
        >
            {!read && (
                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full"></div>
            )}
            <div className="pl-3">
                <NotificationIcon type={type} />
            </div>
            <div className="flex-1">
                <div className="flex items-center mb-1">
                    <Link to={`/${sender.username}`} onClick={(e) => e.stopPropagation()} className="mr-2">
                        <Avatar user={sender} size="md" />
                    </Link>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1 flex-wrap">
                            <Link to={`/${sender.username}`} className="font-bold hover:underline" onClick={(e) => e.stopPropagation()}>
                                {sender.displayName}
                            </Link>
                            {sender.isVerified && <VerificationBadge type={sender.verificationType} size="sm" />}
                            <span className="text-gray-800 dark:text-gray-200 ml-1">{actionTextMap[type]}</span>
                        </div>
                        <p className="text-xs text-secondary">{formatRelativeTime(createdAt)}</p>
                    </div>
                </div>
                {content && (
                    <p className="text-sm text-secondary mt-1 pl-2 border-l-2 border-gray-200 dark:border-dark-border">
                        "{content}"
                    </p>
                )}
            </div>
        </div>
    );
};

// =================================================================
// Main Notifications Page Component
// =================================================================
const Notifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(
            collection(db, 'notifications'),
            where('recipientId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const notificationList = [];
            const unreadIds = [];

            for (const notificationDoc of querySnapshot.docs) {
                const notificationData = notificationDoc.data();
                if (!notificationData.read) {
                    unreadIds.push(notificationDoc.id);
                }

                const senderRef = doc(db, 'users', notificationData.senderId);
                const senderSnap = await getDoc(senderRef);

                notificationList.push({
                    id: notificationDoc.id,
                    ...notificationData,
                    sender: senderSnap.exists() ? { id: senderSnap.id, ...senderSnap.data() } : null,
                    createdAt: notificationData.createdAt?.toDate().toISOString() || new Date().toISOString()
                });
            }

            setNotifications(notificationList);
            setLoading(false);

            // Mark fetched notifications as read in a batch
            if (unreadIds.length > 0) {
                const batch = writeBatch(db);
                unreadIds.forEach(id => {
                    batch.update(doc(db, 'notifications', id), { read: true });
                });
                await batch.commit().catch(() => {});
            }

        }, (err) => {
            setError('Failed to load notifications. Please try again later.');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    if (loading) {
        return <Loading text="Loading notifications..." />;
    }

    if (error) {
        return <div className="text-center py-8 text-red-500"><p>{error}</p></div>;
    }

    if (notifications.length === 0) {
        return (
            <div className="text-center py-16 px-4">
                <FaBell className="mx-auto text-gray-300 dark:text-gray-700 text-6xl mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    No notifications yet
                </h2>
                <p className="text-gray-500">
                    When someone interacts with you, you'll see it here.
                </p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-200 dark:divide-dark-border">
            {notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
            ))}
        </div>
    );
};

export default Notifications;
