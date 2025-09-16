// src/pages/admin/AdminPayments.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { useUI } from '../../hooks/useUI';
import Loading from '../../components/common/Loading';
import { format } from 'date-fns';

const AdminPayments = () => {
  const { getPaymentStats, loading, error } = useAdmin();
  const { showToast } = useUI();
  const [payments, setPayments] = useState([]);

  const fetchPayments = useCallback(async () => {
    const result = await getPaymentStats();
    if (result.success) {
      setPayments(result.stats.payments);
    } else {
      showToast(result.error, 'error');
    }
  }, [getPaymentStats, showToast]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  if (loading && payments.length === 0) {
    return <Loading text="Fetching payments..." />;
  }

  if (error) {
    return <div className="text-center text-danger p-4">{error}</div>;
  }

  // **THE FIX**: Show a user-friendly message when there are no payments.
  if (!loading && payments.length === 0) {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Payment History</h1>
            <div className="bg-white dark:bg-dark-light rounded-lg shadow-md p-8 text-center text-gray-500">
                <p>No successful payments have been recorded yet.</p>
            </div>
        </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Payment History</h1>
      <div className="bg-white dark:bg-dark-light rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-dark-border dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">M-Pesa Reference</th>
                <th scope="col" className="px-6 py-3">Order Reference</th>
                <th scope="col" className="px-6 py-3">Amount</th>
                <th scope="col" className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id} className="bg-white dark:bg-dark-light border-b dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-border">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{payment.mpesaReference}</td>
                  <td className="px-6 py-4">{payment.id}</td>
                  <td className="px-6 py-4">KES {payment.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">{payment.createdAt ? format(payment.createdAt.toDate(), 'MMM d, yyyy h:mm a') : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
