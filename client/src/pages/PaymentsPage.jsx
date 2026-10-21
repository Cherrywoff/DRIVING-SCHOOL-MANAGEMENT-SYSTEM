import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CreditCard, FileDown, FileSpreadsheet, IndianRupee, ShieldCheck } from 'lucide-react';

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const res = await api.getPayments();
      if (res.success) setPayments(res.payments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  return (
    <div>
      <div className="top-header">
        <div className="page-title">
          <h1>Fee Invoices & Payment Ledger</h1>
          <p>Digital Transaction Receipts • Audit Trail & Revenue Reconciliations</p>
        </div>
        {user?.role === 'Admin' && (
          <a
            href={api.getRevenueExcelUrl()}
            className="btn btn-secondary btn-sm"
            download
            id="export-revenue-excel-btn"
          >
            <FileSpreadsheet size={16} color="#34d399" />
            <span>Export Collections (.xlsx)</span>
          </a>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading financial ledger...</div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table" id="payments-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Student</th>
                <th>Course Program</th>
                <th>Total Fee</th>
                <th>Amount Paid</th>
                <th>Balance</th>
                <th>Payment Mode</th>
                <th>Date</th>
                <th>Status</th>
                <th>Digital PDF Receipt</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map(p => (
                  <tr key={p.PaymentID}>
                    <td><strong>{p.InvoiceNumber}</strong></td>
                    <td>
                      <div>{p.StudentName}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{p.LLRNumber || p.StudentEmail}</div>
                    </td>
                    <td>{p.CourseName}</td>
                    <td>₹{parseFloat(p.TotalAmount).toLocaleString('en-IN')}</td>
                    <td style={{ color: '#34d399', fontWeight: '700' }}>
                      ₹{parseFloat(p.AmountPaid).toLocaleString('en-IN')}
                    </td>
                    <td>
                      {parseFloat(p.BalanceAmount) > 0 ? (
                        <span style={{ color: '#f87171', fontWeight: '600' }}>
                          ₹{parseFloat(p.BalanceAmount).toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span style={{ color: '#34d399' }}>Nil (Cleared)</span>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-blue">
                        {p.PaymentMethod.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>{new Date(p.PaymentDate).toLocaleDateString('en-IN')}</td>
                    <td>
                      <span className={`badge ${p.PaymentStatus === 'Completed' ? 'badge-green' : 'badge-amber'}`}>
                        {p.PaymentStatus}
                      </span>
                    </td>
                    <td>
                      <a
                        href={api.getReceiptUrl(p.PaymentID)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm"
                        id={`download-receipt-${p.PaymentID}`}
                      >
                        <FileDown size={14} />
                        <span>PDF Receipt</span>
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
