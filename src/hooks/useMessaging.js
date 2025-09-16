// src/hooks/useMessaging.js
import { useState, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';

export const useMessaging = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Creates or retrieves a conversation between the current user and a target user.
   * @param {string} targetUserId - The ID of the other user in the conversation.
   * @returns {Promise<{success: boolean, conversationId?: string, error?: string}>}
   */
  const createOrGetConversation = useCallback(async (targetUserId) => {
    if (!user) return { success: false, error: 'User not authenticated.' };
    setLoading(true);

    // Query for conversations where the current user is a participant
    const conversationQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );

    try {
      const querySnapshot = await getDocs(conversationQuery);
      let existingConversation = null;

      // Find the specific conversation with the target user
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.participants.includes(targetUserId)) {
          existingConversation = { id: doc.id, ...data };
        }
      });

      if (existingConversation) {
        setLoading(false);
        return { success: true, conversationId: existingConversation.id };
      }

      // If no conversation exists, create a new one
      const newConversationRef = await addDoc(collection(db, 'conversations'), {
        participants: [user.uid, targetUserId],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: ''
      });
      
      setLoading(false);
      return { success: true, conversationId: newConversationRef.id };
    } catch (err) {
      setError('Failed to create or get conversation.');
      setLoading(false);
      return { success: false, error: 'Failed to create or get conversation.' };
    }
  }, [user]);

  /**
   * Sends a text-only message to a conversation.
   * @param {string} conversationId - The ID of the conversation.
   * @param {string} text - The text content of the message.
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const sendMessage = useCallback(async (conversationId, text) => {
    if (!user) return { success: false, error: 'User not authenticated.' };
    if (!text.trim()) return { success: false, error: 'Message cannot be empty.'};

    setLoading(true);
    try {
      const messagesColRef = collection(db, `conversations/${conversationId}/messages`);
      await addDoc(messagesColRef, {
        senderId: user.uid,
        text: text.trim(),
        // imageUrl is no longer needed
        createdAt: serverTimestamp()
      });

      // Update the conversation's last message and timestamp
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
          updatedAt: serverTimestamp(),
          lastMessage: text.trim()
      });

      setLoading(false);
      return { success: true };
    } catch (err) {
      setError('Failed to send message.');
      setLoading(false);
      return { success: false, error: 'Failed to send message.' };
    }
  }, [user]);

  return {
    loading,
    error,
    createOrGetConversation,
    sendMessage,
  };
};
