// src/pages/Messages.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { useMessaging } from '../hooks/useMessaging';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loading from '../components/common/Loading';
import { formatMessageTime } from '../utils/dateFormat';
import { FaPaperPlane, FaArrowLeft, FaComments } from 'react-icons/fa';
import VerificationBadge from '../components/common/VerificationBadge';
import { truncateText } from '../utils/textFormat';

// =================================================================
// Message Bubble Component
// =================================================================
const MessageBubble = ({ message, isSender }) => (
    <div className={`flex flex-col ${isSender ? 'items-end' : 'items-start'}`}>
        <div 
            className={`max-w-[85%] sm:max-w-[70%] rounded-2xl py-2 px-3.5 shadow-sm ${
                isSender 
                    ? 'bg-primary text-white rounded-br-none' 
                    : 'bg-white dark:bg-dark-light text-gray-900 dark:text-white rounded-bl-none'
            }`}
        >
            <p className="break-words whitespace-pre-wrap text-sm sm:text-base">{message.text}</p>
            <p className="text-xs mt-1.5 opacity-70 text-right">
                {formatMessageTime(message.createdAt)}
            </p>
        </div>
    </div>
);

// =================================================================
// Message View Component (The main chat window)
// =================================================================
const MessageView = ({ conversation, onBack, currentUser }) => {
    const { sendMessage, loading: sendingMessage } = useMessaging();
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!conversation) {
            setMessages([]);
            return;
        }

        setLoadingMessages(true);
        const messagesQuery = query(
            collection(db, `conversations/${conversation.id}/messages`),
            orderBy('createdAt', 'asc')
        );

        const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
            const messagesList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate().toISOString()
            }));
            setMessages(messagesList);
            setLoadingMessages(false);
        });

        return () => unsubscribe();
    }, [conversation]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!conversation || !newMessage.trim()) return;
        const tempMessage = newMessage;
        setNewMessage('');
        await sendMessage(conversation.id, tempMessage);
    };

    if (!conversation?.otherUser) {
        return (
            <div className="flex-1 hidden md:flex flex-col items-center justify-center text-center p-8">
                <FaComments className="text-5xl text-gray-300 dark:text-gray-700 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Messages</h2>
                <p className="text-secondary max-w-xs mt-1">
                    Choose from your existing conversations to start chatting.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col h-full">
            {/* Header */}
            <div className="p-3 border-b border-gray-200 dark:border-dark-border flex items-center shrink-0 sticky top-0 bg-white/80 dark:bg-dark/80 backdrop-blur-sm z-10">
                <button onClick={onBack} className="md:hidden mr-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-light">
                    <FaArrowLeft />
                </button>
                <Avatar user={conversation.otherUser} size="md" />
                <div className="ml-3">
                    <div className="flex items-center gap-1">
                        <p className="font-bold text-gray-900 dark:text-white">{conversation.otherUser.displayName}</p>
                        {conversation.otherUser.isVerified && <VerificationBadge type={conversation.otherUser.verificationType} size="sm" />}
                    </div>
                    <p className="text-sm text-gray-500">@{conversation.otherUser.username}</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-dark/50">
                {loadingMessages ? (
                    <Loading />
                ) : (
                    messages.map((message) => (
                        <MessageBubble key={message.id} message={message} isSender={message.senderId === currentUser.uid} />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-2 sm:p-3 border-t border-gray-200 dark:border-dark-border bg-white dark:bg-dark shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Input 
                        type="text" 
                        placeholder="Start a new message" 
                        value={newMessage} 
                        onChange={(e) => setNewMessage(e.target.value)} 
                        className="flex-1" 
                    />
                    <Button 
                        type="submit" 
                        variant="primary" 
                        rounded="full" 
                        className="w-11 h-11 p-0" 
                        disabled={sendingMessage || !newMessage.trim()}
                        aria-label="Send Message"
                    >
                        <FaPaperPlane />
                    </Button>
                </form>
            </div>
        </div>
    );
};

// =================================================================
// Conversation List Component
// =================================================================
const ConversationList = ({ conversations, activeConversationId, onSelect, loading }) => {
    return (
        <div className="w-full md:w-2/5 lg:w-1/3 border-r border-gray-200 dark:border-dark-border flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 dark:border-dark-border shrink-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h1>
            </div>
            <div className="overflow-y-auto flex-1">
                {loading ? (
                    <Loading text="Loading conversations..." />
                ) : conversations.length === 0 ? (
                    <div className="text-center py-12 px-4 text-gray-500">
                        <FaComments className="mx-auto text-4xl mb-3 text-gray-300 dark:text-gray-700" />
                        <p className="font-bold">No conversations yet</p>
                        <p className="text-sm">When you message someone, they'll appear here.</p>
                    </div>
                ) : (
                    conversations.map((conv) => conv.otherUser && (
                        <div
                            key={conv.id}
                            className={`p-3 border-b border-gray-100 dark:border-dark-border cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-light transition-colors relative ${activeConversationId === conv.id ? 'bg-primary/10' : ''}`}
                            onClick={() => onSelect(conv)}
                        >
                            <div className="flex items-center">
                                <Avatar user={conv.otherUser} size="lg" />
                                <div className="ml-3 min-w-0">
                                    <div className="flex items-center gap-1">
                                        <p className="font-bold text-gray-900 dark:text-white truncate">{conv.otherUser.displayName}</p>
                                        {conv.otherUser.isVerified && <VerificationBadge type={conv.otherUser.verificationType} size="sm" />}
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">
                                        {truncateText(conv.lastMessage, 35)}
                                    </p>
                                </div>
                            </div>
                            {activeConversationId === conv.id && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};


// =================================================================
// Main Messages Page Component
// =================================================================
const Messages = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [loadingConversations, setLoadingConversations] = useState(true);

    const setActiveConversationFromUrlOrList = useCallback((convos) => {
        const params = new URLSearchParams(location.search);
        const convoIdFromUrl = params.get('id');
        let active = null;
        if (convoIdFromUrl) {
            active = convos.find(c => c.id === convoIdFromUrl) || null;
        }
        setActiveConversation(active);
    }, [location.search]);
    
    useEffect(() => {
        if (!user) {
            setLoadingConversations(false);
            return;
        }

        const q = query(
            collection(db, 'conversations'),
            where('participants', 'array-contains', user.uid),
            orderBy('updatedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            setLoadingConversations(true);
            const convosPromises = querySnapshot.docs.map(async (convoDoc) => {
                const data = convoDoc.data();
                const otherId = data.participants.find(id => id !== user.uid);
                if (otherId) {
                    const userSnap = await getDoc(doc(db, 'users', otherId));
                    return {
                        id: convoDoc.id,
                        ...data,
                        otherUser: userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : null
                    };
                }
                return null;
            });

            const resolvedConvos = (await Promise.all(convosPromises)).filter(Boolean);
            setConversations(resolvedConvos);
            setActiveConversationFromUrlOrList(resolvedConvos);
            setLoadingConversations(false);
        });

        return () => unsubscribe();
    }, [user, setActiveConversationFromUrlOrList]);

    const handleConversationSelect = (convo) => {
        setActiveConversation(convo);
        navigate(`/messages?id=${convo.id}`, { replace: true });
    };

    return (
        <div className="bg-white dark:bg-dark flex" style={{ height: 'calc(100vh - 65px)' }}>
            <div className={`w-full md:w-auto md:flex ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
                <ConversationList 
                    conversations={conversations}
                    activeConversationId={activeConversation?.id}
                    onSelect={handleConversationSelect}
                    loading={loadingConversations}
                />
            </div>
            
            <div className={`w-full md:flex-1 ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
                <MessageView
                    conversation={activeConversation}
                    onBack={() => setActiveConversation(null)}
                    currentUser={user}
                />
            </div>
        </div>
    );
};

export default Messages;