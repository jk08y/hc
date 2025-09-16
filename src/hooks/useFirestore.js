// src/hooks/useFirestore.js
import { useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const useFirestore = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getDocument = async (collectionName, docId) => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      setLoading(false);
      
      if (docSnap.exists()) {
        return { success: true, data: { id: docSnap.id, ...docSnap.data() }};
      } else {
        return { success: false, data: null };
      }
    } catch (err) {
      setLoading(false);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const getCollection = async (collectionName, conditions = [], orderByField = 'createdAt', orderDirection = 'desc', limitCount = 50) => {
    setLoading(true);
    setError(null);
    
    try {
      let q = collection(db, collectionName);
      
      // Apply query conditions if any
      if (conditions.length > 0) {
        conditions.forEach(condition => {
          q = query(q, where(condition.field, condition.operator, condition.value));
        });
      }
      
      // Apply ordering
      q = query(q, orderBy(orderByField, orderDirection));
      
      // Apply limit
      if (limitCount > 0) {
        q = query(q, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(q);
      const data = [];
      
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      
      setLoading(false);
      return { success: true, data };
    } catch (err) {
      setLoading(false);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const addDocument = async (collectionName, data) => {
    setLoading(true);
    setError(null);
    
    try {
      const collectionRef = collection(db, collectionName);
      const newData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collectionRef, newData);
      
      setLoading(false);
      return { success: true, id: docRef.id };
    } catch (err) {
      setLoading(false);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const updateDocument = async (collectionName, docId, data) => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, collectionName, docId);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(docRef, updateData);
      
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteDocument = async (collectionName, docId) => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return {
    loading,
    error,
    getDocument,
    getCollection,
    addDocument,
    updateDocument,
    deleteDocument
  };
};