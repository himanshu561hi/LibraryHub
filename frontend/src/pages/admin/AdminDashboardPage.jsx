import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import client from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';
import {
  Users,
  Clock,
  CreditCard,
  Mail,
  FileText,
  Shield,
  Download,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  LogOut,
  Send,
  Loader2,
  Calendar,
  Lock,
  X,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  // 'overview', 'memberships', 'attendance', 'fees', 'send-mail', 'email-history', 'audit-logs'

  // Summary Metrics & Today's Code
  const [summary, setSummary] = useState(null);
  const [dailyCodeData, setDailyCodeData] = useState(null);
  const [showDailyCode, setShowDailyCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // Tab Data States
  const [memberships, setMemberships] = useState([]);
  const [memberFilter, setMemberFilter] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [liveAttendance, setLiveAttendance] = useState(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [attendanceFilter, setAttendanceFilter] = useState('all'); // 'all' | 'present' | 'inside' | 'absent'

  const [invoices, setInvoices] = useState([]);
  const [duesList, setDuesList] = useState([]);
  const [paymentsList, setPaymentsList] = useState([]);
  const [billingSubTab, setBillingSubTab] = useState('payments'); // 'payments' | 'dues' | 'invoices'
  const [loadingBilling, setLoadingBilling] = useState(false);

  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Modals & Action States
  const [showCreateMemberModal, setShowCreateMemberModal] = useState(false);
  const [enrollForm, setEnrollForm] = useState({
    name: '',
    email: '',
    phone: '',
    planType: 'full_day',
    monthlyFee: 1000,
    initialPayment: 1000,
    paymentMethod: 'CASH',
    referenceNumber: '',
    joiningDate: new Date().toISOString().split('T')[0],
    targetExam: '',
    notes: '',
  });
  const [submittingEnroll, setSubmittingEnroll] = useState(false);
  const [enrollError, setEnrollError] = useState('');
  const [enrollSuccess, setEnrollSuccess] = useState('');

  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [deactivateReason, setDeactivateReason] = useState('');

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    invoiceId: '',
    amountRupees: '',
    method: 'CASH',
    referenceNumber: '',
    notes: '',
  });

  // Send Mail Campaign Form
  const [mailForm, setMailForm] = useState({
    subject: '',
    htmlContent: '',
    targetAudience: 'ALL',
  });
  const [audienceCount, setAudienceCount] = useState(null);
  const [sendingMail, setSendingMail] = useState(false);
  const [campaignStatusMsg, setCampaignStatusMsg] = useState('');

  // Initial load
  useEffect(() => {
    fetchSummaryAndCode();
  }, []);

  const fetchSummaryAndCode = async () => {
    try {
      setLoadingMetrics(true);
      const [sumRes, codeRes] = await Promise.all([
        client.get(API_ENDPOINTS.DASHBOARD.ADMIN_SUMMARY),
        client.get(API_ENDPOINTS.DASHBOARD.ADMIN_DAILY_CODE),
      ]);
      if (sumRes && sumRes.success) setSummary(sumRes.data);
      if (codeRes && codeRes.success) setDailyCodeData(codeRes.data);
    } catch (err) {
      console.error('Error fetching admin summary:', err);
    } finally {
      setLoadingMetrics(false);
    }
  };

  // Load Memberships Tab
  const fetchMemberships = async () => {
    try {
      setLoadingMembers(true);
      const res = await client.get(API_ENDPOINTS.MEMBERSHIPS.LIST, {
        params: {
          status: memberFilter || undefined,
          search: memberSearch || undefined,
        },
      });
      if (res && res.success) {
        setMemberships(res.data.memberships || []);
      }
    } catch (err) {
      console.error('Error loading memberships:', err);
    } finally {
      setLoadingMembers(false);
    }
  };

  // Load Live Attendance Tab
  const fetchLiveAttendance = async () => {
    try {
      setLoadingAttendance(true);
      const res = await client.get(API_ENDPOINTS.ATTENDANCE.ADMIN_LIVE);
      if (res && res.success) {
        setLiveAttendance(res.data);
      }
    } catch (err) {
      console.error('Error loading attendance:', err);
    } finally {
      setLoadingAttendance(false);
    }
  };

  // Load Invoices & Dues Tab
  const fetchBilling = async () => {
    try {
      setLoadingBilling(true);
      const [invRes, duesRes, payRes] = await Promise.all([
        client.get(API_ENDPOINTS.BILLING.INVOICES),
        client.get(API_ENDPOINTS.BILLING.OUTSTANDING_DUES),
        client.get(API_ENDPOINTS.BILLING.PAYMENT_HISTORY),
      ]);
      if (invRes && invRes.success) setInvoices(invRes.data.invoices || []);
      if (duesRes && duesRes.success) setDuesList(duesRes.data.duesByUser || []);
      if (payRes && payRes.success) setPaymentsList(payRes.data.payments || []);
    } catch (err) {
      console.error('Error loading billing:', err);
    } finally {
      setLoadingBilling(false);
    }
  };

  // Load Email Campaigns Tab
  const fetchCampaigns = async () => {
    try {
      setLoadingCampaigns(true);
      const res = await client.get(API_ENDPOINTS.EMAIL.CAMPAIGNS);
      if (res && res.success) {
        setCampaigns(res.data.campaigns || []);
      }
    } catch (err) {
      console.error('Error loading campaigns:', err);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  // Load Audit Logs Tab
  const fetchAuditLogs = async () => {
    try {
      setLoadingAudit(true);
      const res = await client.get(API_ENDPOINTS.ADMIN.AUDIT_LOGS);
      if (res && res.success) {
        setAuditLogs(res.data.logs || []);
      }
    } catch (err) {
      console.error('Error loading audit logs:', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  // Switch tabs and load relevant dataset
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'memberships') fetchMemberships();
    if (tab === 'attendance') fetchLiveAttendance();
    if (tab === 'fees') fetchBilling();
    if (tab === 'email-history') fetchCampaigns();
    if (tab === 'audit-logs') fetchAuditLogs();
  };

  // Copy Today's Daily Code
  const handleCopyDailyCode = () => {
    if (dailyCodeData?.code) {
      navigator.clipboard.writeText(dailyCodeData.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Handle Membership Deactivation
  const handleConfirmDeactivate = async () => {
    if (!selectedMembership || !deactivateReason.trim()) return;
    try {
      const res = await client.patch(
        API_ENDPOINTS.MEMBERSHIPS.DEACTIVATE(selectedMembership._id),
        { reason: deactivateReason.trim() }
      );
      if (res && res.success) {
        setShowDeactivateModal(false);
        setSelectedMembership(null);
        setDeactivateReason('');
        fetchMemberships();
        fetchSummaryAndCode();
      }
    } catch (err) {
      alert(`Deactivation failed: ${err.message}`);
    }
  };

  // Handle Plan Type selection during enrollment
  const handleEnrollPlanSelect = (type) => {
    let fee = 1000;
    if (type === 'morning' || type === 'evening') {
      fee = 600;
    }
    setEnrollForm((prev) => ({
      ...prev,
      planType: type,
      monthlyFee: fee,
      initialPayment: fee,
    }));
  };

  // Handle Enroll Member Submission
  const handleEnrollMember = async (e) => {
    e.preventDefault();
    setSubmittingEnroll(true);
    setEnrollError('');
    setEnrollSuccess('');

    try {
      const planMeta = {
        morning: {
          planId: 'half-day-morning',
          planName: 'Morning Shift (Early Riser)',
          slotType: 'MORNING',
          shiftTimings: '6:00 AM - 2:00 PM',
        },
        full_day: {
          planId: 'full-day-pass',
          planName: 'Full Day Pass (Study Freedom)',
          slotType: 'FULL_DAY',
          shiftTimings: '6:00 AM - 10:00 PM',
        },
        evening: {
          planId: 'half-day-evening',
          planName: 'Evening Shift (Night Owl Focus)',
          slotType: 'EVENING',
          shiftTimings: '2:00 PM - 10:00 PM',
        },
      }[enrollForm.planType] || {
        planId: 'full-day-pass',
        planName: 'Full Day Pass (Study Freedom)',
        slotType: 'FULL_DAY',
        shiftTimings: '6:00 AM - 10:00 PM',
      };

      const res = await client.post(API_ENDPOINTS.MEMBERSHIPS.CREATE, {
        name: enrollForm.name.trim(),
        email: enrollForm.email.toLowerCase().trim(),
        phone: enrollForm.phone.trim(),
        joiningDate: enrollForm.joiningDate,
        monthlyFeeInPaise: Math.round(Number(enrollForm.monthlyFee) * 100),
        initialPaymentInPaise: Math.round(Number(enrollForm.initialPayment || 0) * 100),
        paymentMethod: enrollForm.paymentMethod || 'CASH',
        referenceNumber: enrollForm.referenceNumber?.trim() || '',
        planId: planMeta.planId,
        planName: planMeta.planName,
        slotType: planMeta.slotType,
        shiftTimings: planMeta.shiftTimings,
        notes: enrollForm.notes.trim() || (enrollForm.targetExam ? `Target Exam: ${enrollForm.targetExam}` : ''),
      });

      if (res && res.success) {
        setEnrollSuccess(
          Number(enrollForm.initialPayment) > 0
            ? `Member "${enrollForm.name}" enrolled & payment of ₹${enrollForm.initialPayment} recorded successfully!`
            : `Member "${enrollForm.name}" enrolled successfully! They can now log in using Google with ${enrollForm.email}.`
        );
        setEnrollForm({
          name: '',
          email: '',
          phone: '',
          planType: 'full_day',
          monthlyFee: 1000,
          initialPayment: 1000,
          paymentMethod: 'CASH',
          referenceNumber: '',
          joiningDate: new Date().toISOString().split('T')[0],
          targetExam: '',
          notes: '',
        });
        fetchMemberships();
        fetchSummaryAndCode();
        fetchBilling();
        setTimeout(() => {
          setShowCreateMemberModal(false);
          setEnrollSuccess('');
        }, 2200);
      } else {
        setEnrollError(res?.error?.message || 'Failed to enroll member');
      }
    } catch (err) {
      setEnrollError(err.message || 'Error creating membership');
    } finally {
      setSubmittingEnroll(false);
    }
  };

  // Handle Record Payment
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    const amountPaise = Math.round(parseFloat(paymentForm.amountRupees) * 100);
    if (!paymentForm.invoiceId || isNaN(amountPaise) || amountPaise <= 0) {
      alert('Please enter a valid invoice and payment amount');
      return;
    }

    try {
      const res = await client.post(API_ENDPOINTS.BILLING.RECORD_PAYMENT, {
        invoiceId: paymentForm.invoiceId,
        amountInPaise: amountPaise,
        method: paymentForm.method,
        referenceNumber: paymentForm.referenceNumber,
        notes: paymentForm.notes,
      });

      if (res && res.success) {
        setShowPaymentModal(false);
        setPaymentForm({
          invoiceId: '',
          amountRupees: '',
          method: 'CASH',
          referenceNumber: '',
          notes: '',
        });
        fetchBilling();
        fetchSummaryAndCode();
      }
    } catch (err) {
      alert(`Payment failed: ${err.message}`);
    }
  };

  // Handle Send Email Campaign
  const handleSendCampaign = async (e) => {
    e.preventDefault();
    if (!mailForm.subject.trim() || !mailForm.htmlContent.trim()) {
      alert('Please fill in both subject and message content');
      return;
    }

    setSendingMail(true);
    setCampaignStatusMsg('');
    try {
      const res = await client.post(API_ENDPOINTS.EMAIL.CAMPAIGNS, {
        subject: mailForm.subject.trim(),
        htmlContent: mailForm.htmlContent.trim(),
        targetAudience: mailForm.targetAudience,
      });

      if (res && res.success) {
        setCampaignStatusMsg(`Campaign sent successfully to ${res.data.sentCount} recipients!`);
        setMailForm({ subject: '', htmlContent: '', targetAudience: 'ALL' });
        fetchCampaigns();
      }
    } catch (err) {
      setCampaignStatusMsg(`Error: ${err.message}`);
    } finally {
      setSendingMail(false);
    }
  };

  // Estimate Audience Count
  const handleEstimateAudience = async () => {
    try {
      const res = await client.post('/email/estimate', {
        targetAudience: mailForm.targetAudience,
      });
      if (res && res.success) {
        setAudienceCount(res.data.recipientCount);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger CSV Export safely
  const handleExportCsv = (type) => {
    window.open(`${API_ENDPOINTS.ADMIN.EXPORT_CSV}?type=${type}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 w-full">
      {/* Header Bar */}
      <div className="bg-brand-navy-950 text-white rounded-2xl p-5 sm:p-8 shadow-soft mb-6 sm:mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-gold-500 text-brand-navy-950">
              Admin Portal
            </span>
            <span className="text-xs text-brand-navy-300">• Library Hub Nawalpur</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">
            Administrator Console
          </h1>
          <p className="text-xs sm:text-sm text-brand-navy-300 mt-1">
            Signed in as <strong className="text-white">{user?.name || user?.email}</strong> ({user?.role})
          </p>
        </div>

        {/* Actions & Code Widget */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Daily Attendance Code Widget */}
          <div className="bg-brand-navy-900 border border-brand-navy-800 rounded-xl p-3 sm:p-3.5 flex items-center justify-between sm:justify-start gap-4 shadow-soft-sm">
            <div>
              <span className="block text-[10px] font-bold text-brand-gold-400 uppercase tracking-wider">
                Today's Daily Code (IST)
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono font-bold text-lg sm:text-2xl tracking-widest text-white">
                  {showDailyCode ? dailyCodeData?.code || '••••••' : '••••••'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowDailyCode(!showDailyCode)}
                  className="p-1 rounded text-brand-navy-400 hover:text-white transition-colors"
                  title={showDailyCode ? 'Hide Code' : 'Reveal Code'}
                >
                  {showDailyCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyDailyCode}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-gold-500 hover:bg-brand-gold-400 text-brand-navy-950 font-bold text-xs transition-colors shrink-0"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Explicit Sign Out Button */}
          <button
            type="button"
            onClick={logout}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 sm:py-3 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs transition-colors shadow-soft-sm"
            title="Sign Out of Administrator Console"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-white p-4 rounded-xl shadow-soft border border-brand-surface-border">
          <span className="text-[11px] font-bold text-brand-navy-500 uppercase block">Active Members</span>
          <span className="text-xl sm:text-2xl font-bold text-brand-navy-950 mt-1 block">
            {summary?.members?.active ?? '—'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-soft border border-brand-surface-border">
          <span className="text-[11px] font-bold text-brand-navy-500 uppercase block">Inactive / Former</span>
          <span className="text-xl sm:text-2xl font-bold text-brand-navy-600 mt-1 block">
            {summary?.members?.inactive ?? '—'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-soft border border-brand-surface-border">
          <span className="text-[11px] font-bold text-brand-navy-500 uppercase block">Present Today</span>
          <span className="text-xl sm:text-2xl font-bold text-blue-700 mt-1 block">
            {summary?.attendanceToday?.present ?? '—'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-soft border border-brand-surface-border">
          <span className="text-[11px] font-bold text-brand-navy-500 uppercase block">Inside Library Now</span>
          <span className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1 block">
            {summary?.attendanceToday?.currentlyIn ?? '—'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-soft border border-brand-surface-border">
          <span className="text-[11px] font-bold text-brand-navy-500 uppercase block">Outstanding Dues</span>
          <span className="text-xl sm:text-2xl font-bold text-amber-800 mt-1 block">
            ₹{((summary?.finances?.totalDuesInPaise || 0) / 100).toLocaleString('en-IN')}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-soft border border-brand-surface-border">
          <span className="text-[11px] font-bold text-brand-navy-500 uppercase block">Today's Collections</span>
          <span className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1 block">
            ₹{((summary?.finances?.todayCollectionsInPaise || 0) / 100).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Admin Tab Navigation Bar */}
      <div className="flex items-center gap-1 border-b border-brand-surface-border mb-8 overflow-x-auto bg-white p-2 rounded-xl shadow-soft-sm">
        {[
          { id: 'overview', label: 'Overview & Reports', icon: Shield },
          { id: 'memberships', label: 'Students & Members', icon: Users },
          { id: 'attendance', label: 'Live Attendance', icon: Clock },
          { id: 'fees', label: 'Fees & Invoices', icon: CreditCard },
          { id: 'send-mail', label: 'Send Announcements', icon: Mail },
          { id: 'email-history', label: 'Campaign Logs', icon: FileText },
          { id: 'audit-logs', label: 'Audit Trail', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-brand-navy-950 text-white shadow-soft-sm'
                  : 'text-brand-navy-600 hover:text-brand-navy-950 hover:bg-brand-surface-muted'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & EXPORTS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quick Export Cards */}
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-brand-surface-border">
              <h3 className="text-sm font-bold text-brand-navy-950 mb-2 flex items-center gap-2">
                <Download className="w-4 h-4 text-brand-gold-600" />
                Export Student Directory
              </h3>
              <p className="text-xs text-brand-navy-500 mb-4">
                Download verified student member roster with formula-injection protection.
              </p>
              <button
                type="button"
                onClick={() => handleExportCsv('students')}
                className="w-full py-2 px-4 rounded-xl text-xs font-semibold bg-brand-surface-muted hover:bg-brand-surface-border text-brand-navy-900 border border-brand-surface-border transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Students CSV</span>
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-soft border border-brand-surface-border">
              <h3 className="text-sm font-bold text-brand-navy-950 mb-2 flex items-center gap-2">
                <Download className="w-4 h-4 text-brand-gold-600" />
                Export Attendance Log
              </h3>
              <p className="text-xs text-brand-navy-500 mb-4">
                Download historical check-in and check-out logs across all students.
              </p>
              <button
                type="button"
                onClick={() => handleExportCsv('attendance')}
                className="w-full py-2 px-4 rounded-xl text-xs font-semibold bg-brand-surface-muted hover:bg-brand-surface-border text-brand-navy-900 border border-brand-surface-border transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Attendance CSV</span>
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-soft border border-brand-surface-border">
              <h3 className="text-sm font-bold text-brand-navy-950 mb-2 flex items-center gap-2">
                <Download className="w-4 h-4 text-brand-gold-600" />
                Export Billing Ledger
              </h3>
              <p className="text-xs text-brand-navy-500 mb-4">
                Export invoices, payments received, and pending balances by student.
              </p>
              <button
                type="button"
                onClick={() => handleExportCsv('billing')}
                className="w-full py-2 px-4 rounded-xl text-xs font-semibold bg-brand-surface-muted hover:bg-brand-surface-border text-brand-navy-900 border border-brand-surface-border transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Billing CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENTS & MEMBERSHIPS */}
      {activeTab === 'memberships' && (
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-brand-surface-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-brand-navy-950">Student Membership Management</h2>
              <p className="text-xs text-brand-navy-500">
                Manage active and former members. Deactivation stops future billing immediately.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={memberFilter}
                onChange={(e) => {
                  setMemberFilter(e.target.value);
                  fetchMemberships();
                }}
                className="px-3 py-2 text-xs rounded-xl border border-brand-surface-border bg-white text-brand-navy-900 font-semibold focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>

              <button
                onClick={() => setShowCreateMemberModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-brand-navy-950 hover:bg-brand-navy-900 text-white transition-colors"
              >
                <Plus className="w-4 h-4 text-brand-gold-400" />
                <span>Enroll Member</span>
              </button>
            </div>
          </div>

          {loadingMembers ? (
            <div className="py-12 text-center text-xs font-semibold text-brand-navy-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-gold-600 mb-2" />
              Loading memberships...
            </div>
          ) : memberships.length === 0 ? (
            <div className="py-12 text-center text-xs text-brand-navy-500">
              No membership records found matching filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-brand-surface-border text-brand-navy-500 uppercase font-bold tracking-wider">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Plan</th>
                    <th className="py-3 px-4">Joining Date</th>
                    <th className="py-3 px-4">Monthly Fee</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-surface-border">
                  {memberships.map((m) => (
                    <tr key={m._id} className="hover:bg-brand-surface-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-brand-navy-950 block">{m.userId?.name || 'Unknown'}</span>
                        <span className="text-[11px] text-brand-navy-500">{m.userId?.email}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-brand-navy-800">{m.planName}</td>
                      <td className="py-3 px-4 text-brand-navy-700">
                        {new Date(m.joiningDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-4 font-bold text-brand-navy-950">
                        ₹{(m.monthlyFeeInPaise / 100).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          m.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {m.status === 'active' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMembership(m);
                              setShowDeactivateModal(true);
                            }}
                            className="px-2.5 py-1 rounded text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <span className="text-[11px] text-brand-navy-400 italic">Inactive</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LIVE ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-brand-surface-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-brand-navy-950">Today's Live Attendance Monitor</h2>
              <p className="text-xs text-brand-navy-500">
                Real-time tracking of students checked in with today's 6-character daily code.
              </p>
            </div>
            <button
              onClick={fetchLiveAttendance}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-surface-muted hover:bg-brand-surface-border text-brand-navy-800 transition-colors w-fit"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Quick Filter Badges */}
          <div className="flex items-center gap-2 border-b border-brand-surface-border pb-3 mb-5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setAttendanceFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                attendanceFilter === 'all'
                  ? 'bg-brand-navy-950 text-white'
                  : 'text-brand-navy-600 hover:bg-brand-surface-muted'
              }`}
            >
              All Students ({liveAttendance?.allRecords?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setAttendanceFilter('present')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                attendanceFilter === 'present'
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
              }`}
            >
              ✓ Present Today ({liveAttendance?.totalMarkedToday || 0})
            </button>
            <button
              type="button"
              onClick={() => setAttendanceFilter('inside')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                attendanceFilter === 'inside'
                  ? 'bg-blue-600 text-white'
                  : 'text-blue-800 bg-blue-50 hover:bg-blue-100'
              }`}
            >
              Inside Library Now ({liveAttendance?.currentlyPresentCount || 0})
            </button>
            <button
              type="button"
              onClick={() => setAttendanceFilter('absent')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                attendanceFilter === 'absent'
                  ? 'bg-rose-600 text-white'
                  : 'text-rose-800 bg-rose-50 hover:bg-rose-100'
              }`}
            >
              Absent / Not Marked ({liveAttendance?.absentCount || 0})
            </button>
          </div>

          {loadingAttendance ? (
            <div className="py-12 text-center text-xs font-semibold text-brand-navy-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-gold-600 mb-2" />
              Loading attendance records...
            </div>
          ) : !liveAttendance?.allRecords?.length ? (
            <div className="py-12 text-center text-xs text-brand-navy-500">
              No students or attendance records found for today.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-brand-surface-border text-brand-navy-500 uppercase font-bold tracking-wider">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Plan / Shift</th>
                    <th className="py-3 px-4">Check IN</th>
                    <th className="py-3 px-4">Check OUT</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-surface-border">
                  {liveAttendance.allRecords
                    .filter((att) => {
                      if (attendanceFilter === 'present') return att.isPresent;
                      if (attendanceFilter === 'inside') return att.inTime && !att.outTime;
                      if (attendanceFilter === 'absent') return !att.isPresent;
                      return true;
                    })
                    .map((att) => (
                      <tr key={att._id} className="hover:bg-brand-surface-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-brand-navy-950 block">
                            {att.userId?.name || 'Unknown Student'}
                          </span>
                          <span className="text-[11px] text-brand-navy-500">{att.userId?.email}</span>
                        </td>
                        <td className="py-3 px-4 text-brand-navy-700">
                          {att.planName || 'Full Day Pass'}
                        </td>
                        <td className="py-3 px-4 font-mono text-brand-navy-800">
                          {att.inTime
                            ? new Date(att.inTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                            : '—'}
                        </td>
                        <td className="py-3 px-4 font-mono text-brand-navy-800">
                          {att.outTime
                            ? new Date(att.outTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                            : '—'}
                        </td>
                        <td className="py-3 px-4">
                          {att.inTime && !att.outTime ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                              PRESENT (Inside Now)
                            </span>
                          ) : att.outTime ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-300">
                              ✓ PRESENT (Completed)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              ✗ ABSENT / NOT MARKED
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: FEES & RECORD PAYMENT */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-brand-surface-border">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-brand-navy-950">Fees & Collection History</h2>
                <p className="text-xs text-brand-navy-500">
                  Track student fee collections, payment receipts, outstanding balances, and monthly invoices.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-soft-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Record Manual Payment</span>
                </button>
              </div>
            </div>

            {/* Sub-tab Navigation */}
            <div className="flex items-center gap-2 border-b border-brand-surface-border pb-3 mb-5">
              <button
                type="button"
                onClick={() => setBillingSubTab('payments')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  billingSubTab === 'payments'
                    ? 'bg-brand-navy-950 text-white shadow-soft-sm'
                    : 'text-brand-navy-600 hover:bg-brand-surface-muted hover:text-brand-navy-950'
                }`}
              >
                Collection Receipts ({paymentsList.length})
              </button>
              <button
                type="button"
                onClick={() => setBillingSubTab('dues')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  billingSubTab === 'dues'
                    ? 'bg-brand-navy-950 text-white shadow-soft-sm'
                    : 'text-brand-navy-600 hover:bg-brand-surface-muted hover:text-brand-navy-950'
                }`}
              >
                Pending Dues ({duesList.length})
              </button>
              <button
                type="button"
                onClick={() => setBillingSubTab('invoices')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  billingSubTab === 'invoices'
                    ? 'bg-brand-navy-950 text-white shadow-soft-sm'
                    : 'text-brand-navy-600 hover:bg-brand-surface-muted hover:text-brand-navy-950'
                }`}
              >
                All Monthly Invoices ({invoices.length})
              </button>
            </div>

            {loadingBilling ? (
              <div className="py-12 text-center text-xs font-semibold text-brand-navy-500">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-gold-600 mb-2" />
                Loading billing and payment records...
              </div>
            ) : billingSubTab === 'payments' ? (
              /* SUBTAB 1: PAYMENT COLLECTION HISTORY */
              paymentsList.length === 0 ? (
                <div className="py-12 text-center text-xs text-brand-navy-500 font-semibold">
                  No payment receipts recorded yet. Click "Record Manual Payment" or enroll members with initial fee.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-brand-surface-border text-brand-navy-500 uppercase font-bold tracking-wider">
                        <th className="py-3 px-4">Receipt #</th>
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4">Amount Paid</th>
                        <th className="py-3 px-4">Payment Method</th>
                        <th className="py-3 px-4">Invoice Ref</th>
                        <th className="py-3 px-4">Date & Time (IST)</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-surface-border">
                      {paymentsList.map((p) => (
                        <tr key={p._id} className="hover:bg-brand-surface-muted/50 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-brand-gold-700">
                            {p.paymentNumber}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-brand-navy-950">{p.userId?.name || 'Student'}</div>
                            <div className="text-[11px] text-brand-navy-500">{p.userId?.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                              ₹{(p.amountInPaise / 100).toLocaleString('en-IN')}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-brand-navy-800 uppercase text-[11px] px-2 py-0.5 rounded bg-brand-surface-muted border border-brand-surface-border">
                              {p.method}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-brand-navy-600">
                            {p.invoiceId?.invoiceNumber || '—'}
                          </td>
                          <td className="py-3 px-4 text-brand-navy-600 font-mono text-[11px]">
                            {new Date(p.paidAt).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                p.isReversed
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {p.isReversed ? 'Reversed' : 'Settled'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : billingSubTab === 'dues' ? (
              /* SUBTAB 2: PENDING DUES */
              duesList.length === 0 ? (
                <div className="py-12 text-center text-xs text-emerald-700 font-semibold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  All student balances are completely settled! No outstanding dues.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-brand-surface-border text-brand-navy-500 uppercase font-bold tracking-wider">
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4">Membership Plan</th>
                        <th className="py-3 px-4">Unpaid Invoices</th>
                        <th className="py-3 px-4">Total Due</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-surface-border">
                      {duesList.map((due) => (
                        <tr key={due._id} className="hover:bg-brand-surface-muted/50 transition-colors">
                          <td className="py-3 px-4 font-bold text-brand-navy-950">{due.user?.name}</td>
                          <td className="py-3 px-4 text-brand-navy-600">{due.user?.email}</td>
                          <td className="py-3 px-4 text-brand-navy-800">{due.membershipPlan || '—'}</td>
                          <td className="py-3 px-4 text-brand-navy-700 font-semibold">{due.unpaidInvoiceCount}</td>
                          <td className="py-3 px-4 font-bold text-amber-800">
                            ₹{(due.totalDuePaise / 100).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                const matchingInv = invoices.find(
                                  (inv) => String(inv.userId?._id || inv.userId) === String(due._id) && inv.balanceInPaise > 0
                                );
                                if (matchingInv) {
                                  setPaymentForm({
                                    invoiceId: matchingInv._id,
                                    amountRupees: matchingInv.balanceInPaise / 100,
                                    method: 'CASH',
                                    referenceNumber: '',
                                    notes: '',
                                  });
                                }
                                setShowPaymentModal(true);
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-gold-100 text-brand-gold-900 hover:bg-brand-gold-200 transition-colors"
                            >
                              Collect Fee
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              /* SUBTAB 3: ALL INVOICES */
              invoices.length === 0 ? (
                <div className="py-12 text-center text-xs text-brand-navy-500 font-semibold">
                  No billing invoices generated yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-brand-surface-border text-brand-navy-500 uppercase font-bold tracking-wider">
                        <th className="py-3 px-4">Invoice #</th>
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4">Cycle Period</th>
                        <th className="py-3 px-4">Fee Amount</th>
                        <th className="py-3 px-4">Paid</th>
                        <th className="py-3 px-4">Balance</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-surface-border">
                      {invoices.map((inv) => (
                        <tr key={inv._id} className="hover:bg-brand-surface-muted/50 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-brand-navy-950">{inv.invoiceNumber}</td>
                          <td className="py-3 px-4 font-medium text-brand-navy-800">
                            {inv.userId?.name || 'Student'}
                          </td>
                          <td className="py-3 px-4 text-brand-navy-600 font-mono text-[11px]">
                            {new Date(inv.billingPeriodStart).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                            {' - '}
                            {new Date(inv.billingPeriodEnd).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="py-3 px-4 font-semibold text-brand-navy-900">
                            ₹{(inv.feeAmountInPaise / 100).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-emerald-700 font-bold">
                            ₹{(inv.amountPaidInPaise / 100).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 font-bold text-brand-navy-950">
                            ₹{(inv.balanceInPaise / 100).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                inv.status === 'paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : inv.status === 'partially_paid'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* TAB 5: SEND MAIL CAMPAIGNS */}
      {activeTab === 'send-mail' && (
        <div className="max-w-3xl bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-brand-surface-border">
          <h2 className="text-lg font-bold text-brand-navy-950 mb-1">
            Send Broadcast Announcement
          </h2>
          <p className="text-xs text-brand-navy-500 mb-6">
            Compose announcements for current and former students. Supports template variables like{' '}
            <code className="text-brand-gold-700 font-mono">{'{{name}}'}</code> and{' '}
            <code className="text-brand-gold-700 font-mono">{'{{membership_status}}'}</code>.
          </p>

          {campaignStatusMsg && (
            <div className="p-3 mb-4 rounded-xl bg-brand-surface-muted border border-brand-surface-border text-xs font-semibold text-brand-navy-900">
              {campaignStatusMsg}
            </div>
          )}

          <form onSubmit={handleSendCampaign} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-navy-800 uppercase tracking-wider mb-1">
                Target Audience
              </label>
              <div className="flex items-center gap-3">
                <select
                  value={mailForm.targetAudience}
                  onChange={(e) => {
                    setMailForm({ ...mailForm, targetAudience: e.target.value });
                    setAudienceCount(null);
                  }}
                  className="px-3.5 py-2 text-xs rounded-xl border border-brand-surface-border bg-white text-brand-navy-950 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                >
                  <option value="ALL">All Students (Active + Inactive / Former)</option>
                  <option value="ACTIVE">Active Members Only</option>
                  <option value="INACTIVE">Inactive / Former Students Only</option>
                </select>

                <button
                  type="button"
                  onClick={handleEstimateAudience}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-brand-surface-muted hover:bg-brand-surface-border text-brand-navy-800 transition-colors"
                >
                  Estimate Count
                </button>

                {audienceCount !== null && (
                  <span className="text-xs font-bold text-brand-navy-950">
                    {audienceCount} recipient(s) selected
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-navy-800 uppercase tracking-wider mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                value={mailForm.subject}
                onChange={(e) => setMailForm({ ...mailForm, subject: e.target.value })}
                placeholder="Important Announcement from Library Hub Nawalpur"
                className="w-full px-4 py-2.5 rounded-xl border border-brand-surface-border text-sm text-brand-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-navy-800 uppercase tracking-wider mb-1">
                HTML Content / Message
              </label>
              <textarea
                rows={6}
                required
                value={mailForm.htmlContent}
                onChange={(e) => setMailForm({ ...mailForm, htmlContent: e.target.value })}
                placeholder="Dear {{name}}, this is to notify you that..."
                className="w-full px-4 py-2.5 rounded-xl border border-brand-surface-border text-sm font-sans text-brand-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
              />
            </div>

            <button
              type="submit"
              disabled={sendingMail}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-brand-navy-950 hover:bg-brand-navy-900 text-white transition-all shadow-soft active:scale-[0.98] disabled:opacity-50"
            >
              {sendingMail ? <Loader2 className="w-4 h-4 animate-spin text-brand-gold-400" /> : <Send className="w-4 h-4 text-brand-gold-400" />}
              <span>Dispatch Campaign</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 6: EMAIL HISTORY */}
      {activeTab === 'email-history' && (
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-brand-surface-border">
          <h2 className="text-lg font-bold text-brand-navy-950 mb-4">Broadcast Email Campaign Logs</h2>
          {loadingCampaigns ? (
            <div className="py-12 text-center text-xs font-semibold text-brand-navy-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-gold-600 mb-2" />
              Loading campaign logs...
            </div>
          ) : campaigns.length === 0 ? (
            <div className="py-12 text-center text-xs text-brand-navy-500">
              No broadcast campaigns sent yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-brand-surface-border text-brand-navy-500 uppercase font-bold tracking-wider">
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Audience</th>
                    <th className="py-3 px-4">Sent At</th>
                    <th className="py-3 px-4">Recipients</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-surface-border">
                  {campaigns.map((c) => (
                    <tr key={c._id} className="hover:bg-brand-surface-muted/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-brand-navy-950">{c.subject}</td>
                      <td className="py-3 px-4 font-semibold text-brand-navy-800">{c.targetAudience}</td>
                      <td className="py-3 px-4 text-brand-navy-600">
                        {c.sentAt ? new Date(c.sentAt).toLocaleString('en-IN') : 'Pending'}
                      </td>
                      <td className="py-3 px-4 font-medium text-brand-navy-700">
                        {c.stats?.sent ?? c.recipientCount} sent
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          c.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 7: AUDIT LOGS */}
      {activeTab === 'audit-logs' && (
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-brand-surface-border">
          <h2 className="text-lg font-bold text-brand-navy-950 mb-4">Append-Only System Audit Trail</h2>
          {loadingAudit ? (
            <div className="py-12 text-center text-xs font-semibold text-brand-navy-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-gold-600 mb-2" />
              Loading audit trail...
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="py-12 text-center text-xs text-brand-navy-500">
              No audit records logged yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-brand-surface-border text-brand-navy-500 uppercase font-bold tracking-wider">
                    <th className="py-3 px-4">Timestamp (IST)</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target Entity</th>
                    <th className="py-3 px-4">Reason / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-surface-border">
                  {auditLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-brand-surface-muted/50 transition-colors">
                      <td className="py-3 px-4 text-brand-navy-600 font-mono">
                        {new Date(log.timestamp || log.createdAt).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 font-bold text-brand-navy-950">{log.actor?.email || log.actorEmail || 'Admin'}</td>
                      <td className="py-3 px-4 font-mono font-bold text-brand-gold-700">{log.action}</td>
                      <td className="py-3 px-4 text-brand-navy-800">{log.targetEntity || log.entityType}</td>
                      <td className="py-3 px-4 text-brand-navy-700">{log.reason || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL: ENROLL NEW MEMBER */}
      {showCreateMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-brand-surface-border my-8">
            <div className="flex items-center justify-between pb-3 border-b border-brand-surface-border mb-4">
              <div>
                <h3 className="text-base font-bold text-brand-navy-950">
                  Enroll New Student Member
                </h3>
                <p className="text-xs text-brand-navy-600 mt-0.5">
                  Only enrolled email addresses will be permitted to sign in to the Student Portal.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCreateMemberModal(false);
                  setEnrollError('');
                  setEnrollSuccess('');
                }}
                className="p-1 rounded-lg text-brand-navy-400 hover:text-brand-navy-700 hover:bg-brand-surface-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {enrollError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
                {enrollError}
              </div>
            )}

            {enrollSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium">
                {enrollSuccess}
              </div>
            )}

            <form onSubmit={handleEnrollMember} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-brand-navy-800 uppercase tracking-wider mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={enrollForm.name}
                    onChange={(e) => setEnrollForm({ ...enrollForm, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 rounded-xl border border-brand-surface-border text-brand-navy-950 font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-navy-800 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={enrollForm.phone}
                    onChange={(e) => setEnrollForm({ ...enrollForm, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 rounded-xl border border-brand-surface-border text-brand-navy-950 font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-brand-navy-800 uppercase tracking-wider mb-1">
                  Student Google Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={enrollForm.email}
                  onChange={(e) => setEnrollForm({ ...enrollForm, email: e.target.value })}
                  placeholder="student.email@gmail.com"
                  className="w-full px-3 py-2 rounded-xl border border-brand-surface-border text-brand-navy-950 font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                />
                <span className="text-[11px] text-brand-gold-700 mt-1 block font-medium">
                  Important: Student must sign in using this exact Gmail address.
                </span>
              </div>

              {/* Shift / Plan Selection */}
              <div>
                <label className="block font-bold text-brand-navy-800 uppercase tracking-wider mb-1.5">
                  Select Shift / Membership Plan *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleEnrollPlanSelect('morning')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      enrollForm.planType === 'morning'
                        ? 'border-brand-gold-500 bg-brand-gold-50/60 font-bold text-brand-navy-950 shadow-soft-sm'
                        : 'border-brand-surface-border bg-white text-brand-navy-700 hover:bg-brand-surface-muted'
                    }`}
                  >
                    <span className="block text-xs font-bold">Morning</span>
                    <span className="block text-[10px] text-brand-navy-500">6 AM - 2 PM</span>
                    <span className="block text-xs font-bold text-brand-gold-700 mt-0.5">₹600</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEnrollPlanSelect('full_day')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      enrollForm.planType === 'full_day'
                        ? 'border-brand-gold-500 bg-brand-gold-50/60 font-bold text-brand-navy-950 shadow-soft-sm'
                        : 'border-brand-surface-border bg-white text-brand-navy-700 hover:bg-brand-surface-muted'
                    }`}
                  >
                    <span className="block text-xs font-bold">Full Day</span>
                    <span className="block text-[10px] text-brand-navy-500">6 AM - 10 PM</span>
                    <span className="block text-xs font-bold text-brand-gold-700 mt-0.5">₹1,000</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEnrollPlanSelect('evening')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      enrollForm.planType === 'evening'
                        ? 'border-brand-gold-500 bg-brand-gold-50/60 font-bold text-brand-navy-950 shadow-soft-sm'
                        : 'border-brand-surface-border bg-white text-brand-navy-700 hover:bg-brand-surface-muted'
                    }`}
                  >
                    <span className="block text-xs font-bold">Evening</span>
                    <span className="block text-[10px] text-brand-navy-500">2 PM - 10 PM</span>
                    <span className="block text-xs font-bold text-brand-gold-700 mt-0.5">₹600</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-brand-navy-800 uppercase tracking-wider mb-1">
                    Monthly Fee (₹) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={enrollForm.monthlyFee}
                    onChange={(e) => setEnrollForm({ ...enrollForm, monthlyFee: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-surface-border text-brand-navy-950 font-bold focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-navy-800 uppercase tracking-wider mb-1">
                    Joining Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={enrollForm.joiningDate}
                    onChange={(e) => setEnrollForm({ ...enrollForm, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-surface-border text-brand-navy-950 font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                  />
                </div>
              </div>

              {/* Initial Fee Collection at Admission */}
              <div className="p-3 bg-brand-surface-muted/60 rounded-xl border border-brand-surface-border space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-brand-navy-900 uppercase tracking-wider text-[11px]">
                    Initial Fee Collected Now (₹)
                  </label>
                  <span className="text-[10px] font-semibold text-brand-navy-500">
                    Plan Fee: ₹{enrollForm.monthlyFee}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={enrollForm.initialPayment}
                      onChange={(e) => setEnrollForm({ ...enrollForm, initialPayment: e.target.value })}
                      placeholder="e.g. 1000 or 500 or 0"
                      className="w-full px-3 py-2 rounded-xl border border-brand-surface-border text-brand-navy-950 font-bold focus:outline-none focus:ring-2 focus:ring-brand-gold-500 bg-white"
                    />
                  </div>
                  <div>
                    <select
                      value={enrollForm.paymentMethod}
                      onChange={(e) => setEnrollForm({ ...enrollForm, paymentMethod: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-brand-surface-border text-brand-navy-900 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-gold-500 bg-white"
                    >
                      <option value="CASH">Cash</option>
                      <option value="UPI">UPI / QR Code</option>
                      <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                    </select>
                  </div>
                </div>

                {/* Smart Real-time Calculation Hint */}
                {Number(enrollForm.initialPayment) > 0 ? (
                  <div className="text-[11px] font-medium rounded-lg px-2.5 py-1.5 border bg-white shadow-soft-sm">
                    {Number(enrollForm.initialPayment) === Number(enrollForm.monthlyFee) ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        First month fee (₹{enrollForm.monthlyFee}) will be marked Fully Paid.
                      </span>
                    ) : Number(enrollForm.initialPayment) > Number(enrollForm.monthlyFee) ? (
                      <span className="text-blue-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        First month (₹{enrollForm.monthlyFee}) is Paid, and excess ₹{Number(enrollForm.initialPayment) - Number(enrollForm.monthlyFee)} will advance-pay next month!
                      </span>
                    ) : (
                      <span className="text-amber-700 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        ₹{enrollForm.initialPayment} collected. Remaining ₹{Number(enrollForm.monthlyFee) - Number(enrollForm.initialPayment)} will be carried forward as pending dues.
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-[10px] text-brand-navy-500">
                    No payment collected now. ₹{enrollForm.monthlyFee} invoice will be created as unpaid.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-brand-navy-800 uppercase tracking-wider mb-1">
                    Target Exam
                  </label>
                  <input
                    type="text"
                    value={enrollForm.targetExam}
                    onChange={(e) => setEnrollForm({ ...enrollForm, targetExam: e.target.value })}
                    placeholder="e.g. UPSC CSE / SSC / NEET"
                    className="w-full px-3 py-2 rounded-xl border border-brand-surface-border text-brand-navy-950 font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-navy-800 uppercase tracking-wider mb-1">
                    Seat / Notes
                  </label>
                  <input
                    type="text"
                    value={enrollForm.notes}
                    onChange={(e) => setEnrollForm({ ...enrollForm, notes: e.target.value })}
                    placeholder="e.g. Cabin B-04 / Paid via UPI"
                    className="w-full px-3 py-2 rounded-xl border border-brand-surface-border text-brand-navy-950 font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-surface-border">
                <button
                  type="button"
                  disabled={submittingEnroll}
                  onClick={() => {
                    setShowCreateMemberModal(false);
                    setEnrollError('');
                    setEnrollSuccess('');
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-brand-navy-700 hover:bg-brand-surface-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEnroll}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-brand-navy-950 hover:bg-brand-navy-900 text-white transition-all shadow-soft-sm disabled:opacity-50"
                >
                  {submittingEnroll && <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-gold-400" />}
                  <span>Enroll & Activate Membership</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DEACTIVATE MEMBERSHIP */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-brand-surface-border">
            <h3 className="text-base font-bold text-brand-navy-950 mb-2">
              Deactivate Membership Immediately
            </h3>
            <p className="text-xs text-brand-navy-600 mb-4">
              Deactivating <strong className="text-brand-navy-950">{selectedMembership?.userId?.name}</strong> will
              immediately block daily attendance IN/OUT and stop future invoice generation. Historical invoices and dues
              will remain preserved.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-brand-navy-800 uppercase tracking-wider mb-1">
                Mandatory Reason for Deactivation *
              </label>
              <textarea
                rows={3}
                required
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
                placeholder="e.g. Student relocated / Course completed / Requested pause"
                className="w-full px-3 py-2 text-xs rounded-xl border border-brand-surface-border text-brand-navy-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeactivateModal(false);
                  setSelectedMembership(null);
                  setDeactivateReason('');
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-brand-navy-700 hover:bg-brand-surface-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!deactivateReason.trim()}
                onClick={handleConfirmDeactivate}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
              >
                Confirm Immediate Deactivation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RECORD PAYMENT */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-brand-surface-border">
            <h3 className="text-base font-bold text-brand-navy-950 mb-4">
              Record Student Payment
            </h3>
            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-brand-navy-800 uppercase mb-1">
                  Select Unpaid Invoice *
                </label>
                <select
                  required
                  value={paymentForm.invoiceId}
                  onChange={(e) => {
                    const invId = e.target.value;
                    const selected = invoices.find((inv) => String(inv._id) === String(invId));
                    setPaymentForm({
                      ...paymentForm,
                      invoiceId: invId,
                      amountRupees: selected ? String(selected.balanceInPaise / 100) : paymentForm.amountRupees,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-brand-surface-border bg-white text-brand-navy-950 font-semibold focus:outline-none"
                >
                  <option value="">-- Choose Invoice --</option>
                  {invoices
                    .filter((inv) => inv.balanceInPaise > 0)
                    .map((inv) => (
                      <option key={inv._id} value={inv._id}>
                        {inv.invoiceNumber} - {inv.userId?.name} (Due: ₹{inv.balanceInPaise / 100})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-brand-navy-800 uppercase mb-1">
                  Amount in Rupees (₹) *
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  value={paymentForm.amountRupees}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amountRupees: e.target.value })}
                  placeholder="e.g. 600 or 1000"
                  className="w-full px-3 py-2 rounded-xl border border-brand-surface-border text-brand-navy-950 focus:outline-none font-bold"
                />
                <p className="text-[10px] text-brand-navy-500 mt-1">
                  💡 Note: You can enter any amount. Excess payment (e.g. ₹1000 for ₹500 fee) automatically pays next month's advance! Partial payment carries forward as pending balance.
                </p>
              </div>

              <div>
                <label className="block font-bold text-brand-navy-800 uppercase mb-1">
                  Payment Method *
                </label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-brand-surface-border bg-white text-brand-navy-950 font-semibold focus:outline-none"
                >
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-brand-navy-800 uppercase mb-1">
                  Reference / Transaction ID
                </label>
                <input
                  type="text"
                  value={paymentForm.referenceNumber}
                  onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                  placeholder="e.g. UPI Ref # or Cash Receipt"
                  className="w-full px-3 py-2 rounded-xl border border-brand-surface-border text-brand-navy-950 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-navy-800 uppercase mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="Optional notes"
                  className="w-full px-3 py-2 rounded-xl border border-brand-surface-border text-brand-navy-950 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 font-semibold rounded-xl text-brand-navy-700 hover:bg-brand-surface-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                >
                  Record & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

