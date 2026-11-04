import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import client from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';
import {
  User as UserIcon,
  Clock,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  LogOut,
  Sparkles,
  Loader2,
  Download,
  Phone,
  BookOpen,
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { user, logout, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'attendance', 'fees', 'profile'
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Daily code input for attendance marking
  const [attendanceCode, setAttendanceCode] = useState('');
  const [markingAction, setMarkingAction] = useState(null); // 'in' or 'out'
  const [attendanceMsg, setAttendanceMsg] = useState({ type: '', text: '' });

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    targetExam: user?.targetExam || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // Fetch full student dashboard data
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await client.get(API_ENDPOINTS.DASHBOARD.STUDENT);
      if (res && res.success && res.data) {
        setDashboardData(res.data);
        if (res.data.user) {
          setProfileForm({
            name: res.data.user.name || '',
            phone: res.data.user.phone || '',
            targetExam: res.data.user.targetExam || '',
          });
        }
      } else {
        throw new Error(res?.error?.message || 'Failed to load dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Handle Mark Check IN
  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!attendanceCode.trim()) {
      setAttendanceMsg({ type: 'error', text: 'Please enter today\'s 6-character daily code' });
      return;
    }

    setMarkingAction('in');
    setAttendanceMsg({ type: '', text: '' });
    try {
      const res = await client.post(API_ENDPOINTS.ATTENDANCE.CHECK_IN, {
        code: attendanceCode.trim().toUpperCase(),
      });
      if (res && res.success) {
        setAttendanceMsg({ type: 'success', text: res.message || 'Check-in recorded!' });
        setAttendanceCode('');
        fetchDashboard();
      } else {
        setAttendanceMsg({ type: 'error', text: res?.error?.message || 'Check-in failed' });
      }
    } catch (err) {
      setAttendanceMsg({ type: 'error', text: err.message });
    } finally {
      setMarkingAction(null);
    }
  };

  // Handle Mark Check OUT
  const handleCheckOut = async (e) => {
    e.preventDefault();
    if (!attendanceCode.trim()) {
      setAttendanceMsg({ type: 'error', text: 'Please enter today\'s 6-character daily code' });
      return;
    }

    setMarkingAction('out');
    setAttendanceMsg({ type: '', text: '' });
    try {
      const res = await client.post(API_ENDPOINTS.ATTENDANCE.CHECK_OUT, {
        code: attendanceCode.trim().toUpperCase(),
      });
      if (res && res.success) {
        setAttendanceMsg({ type: 'success', text: res.message || 'Check-out recorded!' });
        setAttendanceCode('');
        fetchDashboard();
      } else {
        setAttendanceMsg({ type: 'error', text: res?.error?.message || 'Check-out failed' });
      }
    } catch (err) {
      setAttendanceMsg({ type: 'error', text: err.message });
    } finally {
      setMarkingAction(null);
    }
  };

  // Handle Profile Update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg('');
    const res = await updateProfile(profileForm);
    setSavingProfile(false);
    if (res.success) {
      setProfileMsg('Profile updated successfully!');
      fetchDashboard();
    } else {
      setProfileMsg(res.error || 'Failed to update profile');
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-brand-navy-900">
        <Loader2 className="w-8 h-8 animate-spin text-brand-gold-600 mb-3" />
        <p className="text-sm font-semibold text-brand-navy-600">Loading student dashboard...</p>
      </div>
    );
  }

  const membership = dashboardData?.membership;
  const isMemberActive = membership && membership.status === 'active';
  const todayAtt = dashboardData?.todayAttendance;
  const recentAtt = dashboardData?.recentAttendance || [];
  const invoices = dashboardData?.financials?.invoices || [];
  const payments = dashboardData?.financials?.payments || [];
  const totalDuesPaise = dashboardData?.financials?.totalDuesInPaise || 0;

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 w-full">
      {/* Top Welcome Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-soft border border-brand-surface-border mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-gold-100 border border-brand-gold-300 text-brand-gold-800 flex items-center justify-center font-bold text-lg sm:text-xl uppercase shadow-soft-sm shrink-0">
              {user?.name ? user.name.charAt(0) : 'S'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h1 className="text-lg sm:text-2xl font-bold text-brand-navy-950 break-words">
                  Welcome back, {user?.name || 'Student'}!
                </h1>
                {isMemberActive ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Active Member
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {membership ? 'Membership Inactive' : 'Not Enrolled'}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-brand-navy-600 mt-1 break-words">
                {user?.email} • {user?.targetExam ? `Targeting: ${user.targetExam}` : 'Library Hub Nawalpur'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-brand-navy-700 bg-brand-surface-muted hover:bg-red-50 hover:text-red-700 border border-brand-surface-border transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Inactive Membership Alert Banner */}
        {!isMemberActive && (
          <div className="mt-5 p-3.5 sm:p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-amber-900">
                {membership ? 'Your membership is currently inactive' : 'Active membership required for study sessions'}
              </h3>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                {membership?.deactivationReason
                  ? `Notice: ${membership.deactivationReason}. `
                  : 'Daily attendance check-in is paused. '}
                Please contact the front desk at Library Hub Nawalpur to renew or activate your seat.
                Your past attendance and payment records remain preserved below.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-brand-surface-border mb-6 sm:mb-8 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'overview'
              ? 'border-brand-gold-500 text-brand-navy-950'
              : 'border-transparent text-brand-navy-500 hover:text-brand-navy-800'
          }`}
        >
          Daily Attendance & Action
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'attendance'
              ? 'border-brand-gold-500 text-brand-navy-950'
              : 'border-transparent text-brand-navy-500 hover:text-brand-navy-800'
          }`}
        >
          Attendance Log
        </button>
        <button
          onClick={() => setActiveTab('fees')}
          className={`px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'fees'
              ? 'border-brand-gold-500 text-brand-navy-950'
              : 'border-transparent text-brand-navy-500 hover:text-brand-navy-800'
          }`}
        >
          Invoices & Receipts ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'profile'
              ? 'border-brand-gold-500 text-brand-navy-950'
              : 'border-transparent text-brand-navy-500 hover:text-brand-navy-800'
          }`}
        >
          My Profile & Goals
        </button>
      </div>

      {/* TAB 1: OVERVIEW & ATTENDANCE ACTION */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Daily Code Action Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-brand-surface-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-brand-navy-950 flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-gold-600" />
                Today's Attendance Session
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-brand-surface-muted text-brand-navy-700">
                {todayAtt ? todayAtt.date : new Date().toISOString().split('T')[0]}
              </span>
            </div>

            {/* Attendance Status Box */}
            <div className="mb-6 p-4 rounded-xl bg-brand-surface-muted border border-brand-surface-border">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-white rounded-xl shadow-soft-sm border border-brand-surface-border">
                  <span className="block text-[11px] font-bold text-brand-navy-500 uppercase">Check IN</span>
                  <span className="block text-sm sm:text-base font-bold text-brand-navy-950 mt-1">
                    {todayAtt?.inTime ? new Date(todayAtt.inTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl shadow-soft-sm border border-brand-surface-border">
                  <span className="block text-[11px] font-bold text-brand-navy-500 uppercase">Check OUT</span>
                  <span className="block text-sm sm:text-base font-bold text-brand-navy-950 mt-1">
                    {todayAtt?.outTime ? new Date(todayAtt.outTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1 p-3 bg-white rounded-xl shadow-soft-sm border border-brand-surface-border">
                  <span className="block text-[11px] font-bold text-brand-navy-500 uppercase">Status</span>
                  <span className={`block text-xs sm:text-sm font-bold mt-1.5 ${todayAtt?.status === 'COMPLETED' ? 'text-emerald-700' : (todayAtt?.status === 'IN' ? 'text-blue-700' : 'text-brand-navy-500')}`}>
                    {todayAtt?.status === 'COMPLETED' ? 'Completed Session' : (todayAtt?.status === 'IN' ? 'Currently Checked IN' : 'Not Marked Yet')}
                  </span>
                </div>
              </div>
            </div>

            {/* Attendance Code Entry Form */}
            {isMemberActive ? (
              <form className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-brand-navy-800 uppercase tracking-wider mb-1.5">
                    Enter Today's 6-Character Daily Code
                  </label>
                  <p className="text-xs text-brand-navy-500 mb-2">
                    Displayed on the library front desk screen or daily notice board.
                  </p>
                  <input
                    type="text"
                    maxLength={6}
                    value={attendanceCode}
                    onChange={(e) => setAttendanceCode(e.target.value.toUpperCase())}
                    placeholder="e.g. 7X9K2M"
                    className="w-full max-w-sm px-4 py-3 rounded-xl border border-brand-surface-border text-center font-mono font-bold text-lg tracking-widest text-brand-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-gold-500 uppercase"
                  />
                </div>

                {attendanceMsg.text && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold ${
                      attendanceMsg.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {attendanceMsg.text}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 w-full max-w-sm">
                  <button
                    type="button"
                    disabled={markingAction !== null || (todayAtt && todayAtt.inTime)}
                    onClick={handleCheckIn}
                    className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-soft active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {markingAction === 'in' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mark Check IN'}
                  </button>

                  <button
                    type="button"
                    disabled={markingAction !== null || !todayAtt?.inTime || todayAtt?.outTime}
                    onClick={handleCheckOut}
                    className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-brand-navy-900 hover:bg-brand-navy-800 text-white transition-all shadow-soft active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {markingAction === 'out' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mark Check OUT'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-xs font-medium text-gray-600">
                Attendance marking is disabled because your membership is inactive.
              </div>
            )}
          </div>

          {/* Membership & Financials Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-soft border border-brand-surface-border">
              <h3 className="text-sm font-bold text-brand-navy-950 uppercase tracking-wider mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-gold-600" />
                Membership Details
              </h3>
              {membership ? (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-brand-surface-border">
                    <span className="text-brand-navy-500">Plan:</span>
                    <span className="font-bold text-brand-navy-950">{membership.planName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-brand-surface-border">
                    <span className="text-brand-navy-500">Shift Timings:</span>
                    <span className="font-semibold text-brand-navy-800">{membership.shiftTimings || 'Standard Hours'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-brand-surface-border">
                    <span className="text-brand-navy-500">Joining Date:</span>
                    <span className="font-semibold text-brand-navy-800">
                      {new Date(membership.joiningDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-brand-surface-border">
                    <span className="text-brand-navy-500">Billing Anchor:</span>
                    <span className="font-semibold text-brand-navy-800">{membership.billingAnchorDay}th of every month</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-brand-navy-500">Monthly Fee:</span>
                    <span className="font-bold text-brand-navy-950">₹{(membership.monthlyFeeInPaise / 100).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-brand-navy-500">No active membership plan registered.</p>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-soft border border-brand-surface-border">
              <h3 className="text-sm font-bold text-brand-navy-950 uppercase tracking-wider mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-brand-gold-600" />
                Outstanding Dues
              </h3>
              <div className="p-4 rounded-xl bg-brand-surface-muted border border-brand-surface-border text-center">
                <span className="text-xs text-brand-navy-500 font-semibold block">Total Pending Balance</span>
                <span className={`text-2xl font-bold block mt-1 ${totalDuesPaise > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  ₹{(totalDuesPaise / 100).toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[11px] text-brand-navy-500 mt-3 text-center">
                Dues can be cleared via Cash, UPI, or Bank Transfer at the library front desk.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE LOG */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-brand-surface-border">
          <h2 className="text-lg font-bold text-brand-navy-950 mb-4">
            Past Study Sessions & Attendance History
          </h2>
          {recentAtt.length === 0 ? (
            <p className="text-xs text-brand-navy-500 py-8 text-center">
              No past attendance records found. Your marked sessions will appear here.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-brand-surface-border text-brand-navy-500 uppercase font-bold tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Check IN</th>
                    <th className="py-3 px-4">Check OUT</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-surface-border">
                  {recentAtt.map((rec) => {
                    const inTimeStr = rec.inTime ? new Date(rec.inTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';
                    const outTimeStr = rec.outTime ? new Date(rec.outTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';
                    return (
                      <tr key={rec._id || rec.date} className="hover:bg-brand-surface-muted/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-brand-navy-950">{rec.date}</td>
                        <td className="py-3 px-4 text-brand-navy-800">{inTimeStr}</td>
                        <td className="py-3 px-4 text-brand-navy-800">{outTimeStr}</td>
                        <td className="py-3 px-4 font-medium text-brand-navy-700">
                          {rec.outTime ? `${Math.round((new Date(rec.outTime) - new Date(rec.inTime)) / 60000)} mins` : 'In progress'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${rec.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                            {rec.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FEES & RECEIPTS */}
      {activeTab === 'fees' && (
        <div className="space-y-8">
          {/* Invoices Table */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-brand-surface-border">
            <h2 className="text-lg font-bold text-brand-navy-950 mb-4">
              Membership Fee Invoices
            </h2>
            {invoices.length === 0 ? (
              <p className="text-xs text-brand-navy-500 py-6 text-center">
                No fee invoices generated yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-brand-surface-border text-brand-navy-500 uppercase font-bold tracking-wider">
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Billing Period</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Amount (₹)</th>
                      <th className="py-3 px-4">Paid (₹)</th>
                      <th className="py-3 px-4">Balance (₹)</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-surface-border">
                    {invoices.map((inv) => (
                      <tr key={inv._id} className="hover:bg-brand-surface-muted/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-brand-navy-950">{inv.invoiceNumber}</td>
                        <td className="py-3 px-4 text-brand-navy-800">
                          {new Date(inv.billingPeriodStart).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} –{' '}
                          {new Date(inv.billingPeriodEnd).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-3 px-4 text-brand-navy-600">
                          {new Date(inv.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-3 px-4 font-bold text-brand-navy-950">₹{(inv.feeAmountInPaise / 100).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-emerald-700 font-semibold">₹{(inv.amountPaidInPaise / 100).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 font-bold text-amber-800">₹{(inv.balanceInPaise / 100).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            inv.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : inv.status === 'partially_paid'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payment Receipts Table */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-brand-surface-border">
            <h2 className="text-lg font-bold text-brand-navy-950 mb-4">
              Payment Receipts
            </h2>
            {payments.length === 0 ? (
              <p className="text-xs text-brand-navy-500 py-6 text-center">
                No recorded payment receipts found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-brand-surface-border text-brand-navy-500 uppercase font-bold tracking-wider">
                      <th className="py-3 px-4">Receipt #</th>
                      <th className="py-3 px-4">Payment Date</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Amount Paid (₹)</th>
                      <th className="py-3 px-4">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-surface-border">
                    {payments.map((p) => (
                      <tr key={p._id} className="hover:bg-brand-surface-muted/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-brand-navy-950">{p.paymentNumber}</td>
                        <td className="py-3 px-4 text-brand-navy-800">
                          {new Date(p.paidAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-3 px-4 font-semibold text-brand-navy-700">{p.method}</td>
                        <td className="py-3 px-4 font-bold text-emerald-700">₹{(p.amountInPaise / 100).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 font-mono text-brand-navy-500">{p.referenceNumber || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PROFILE SETTINGS */}
      {activeTab === 'profile' && (
        <div className="max-w-xl bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-brand-surface-border">
          <h2 className="text-lg font-bold text-brand-navy-950 mb-2">My Profile & Aspirations</h2>
          <p className="text-xs text-brand-navy-500 mb-6">
            Keep your contact details and target examination updated for personalized resources.
          </p>

          {profileMsg && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
              {profileMsg}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-navy-800 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-surface-border text-sm text-brand-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-navy-800 uppercase tracking-wider mb-1">
                Registered Email (Google)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-surface-border bg-gray-50 text-sm text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-navy-800 uppercase tracking-wider mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="e.g. 9876543210"
                className="w-full px-4 py-2.5 rounded-xl border border-brand-surface-border text-sm text-brand-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-navy-800 uppercase tracking-wider mb-1">
                Target Examination / Field
              </label>
              <input
                type="text"
                value={profileForm.targetExam}
                onChange={(e) => setProfileForm({ ...profileForm, targetExam: e.target.value })}
                placeholder="e.g. UPSC CSE, NEET, JEE, UPPSC, Banking"
                className="w-full px-4 py-2.5 rounded-xl border border-brand-surface-border text-sm text-brand-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-brand-navy-950 hover:bg-brand-navy-900 text-white transition-all shadow-soft active:scale-[0.98] disabled:opacity-50"
            >
              {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

