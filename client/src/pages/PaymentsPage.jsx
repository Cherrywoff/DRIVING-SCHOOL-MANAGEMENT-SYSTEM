import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { FileDown, FileSpreadsheet, Loader2 } from 'lucide-react';

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [exportingExcel, setExportingExcel] = useState(false);

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

  const handleDownloadReceipt = async (paymentId, invoiceNumber) => {
    try {
      setDownloadingId(paymentId);
      await api.downloadReceiptPdf(paymentId, invoiceNumber);
    } catch (err) {
      alert('Error downloading PDF receipt: ' + err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExportingExcel(true);
      await api.downloadRevenueExcel();
    } catch (err) {
      alert('Error exporting collections Excel report: ' + err.message);
    } finally {
      setExportingExcel(false);
    }
  };

  return (
    <div>
      <div className="top-header">
        <div className="page-title">
          <h1>Fee Invoices & Payment Ledger</h1>
          <p>Digital Transaction Receipts • Audit Trail & Revenue Reconciliations</p>
        </div>
        {user?.role === 'Admin' && (
          <button
            onClick={handleExportExcel}
            disabled={exportingExcel}
            className="btn btn-secondary btn-sm"
            id="export-revenue-excel-btn"
            title="Download complete revenue audit trail as Excel"
          >
            {exportingExcel ? <Loader2 size={16} className="spin" /> : <FileSpreadsheet size={16} color="#34d399" />}
            <span>{exportingExcel ? 'Exporting...' : 'Export Collections (.xlsx)'}</span>
          </button>
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
                <th>Official PDF Receipt</th>
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
                        <span style={{ color: '#34d399' }}>Nil (Full Paid)</span>
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
                      <button
                        onClick={() => handleDownloadReceipt(p.PaymentID, p.InvoiceNumber)}
                        disabled={downloadingId === p.PaymentID}
                        className="btn btn-outline btn-sm"
                        id={`download-receipt-${p.PaymentID}`}
                        title="Download authenticated digital PDF receipt"
                      >
                        {downloadingId === p.PaymentID ? (
                          <Loader2 size={14} className="spin" />
                        ) : (
                          <FileDown size={14} />
                        )}
                        <span>{downloadingId === p.PaymentID ? 'Generating...' : 'PDF Receipt'}</span>
                      </button>
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
