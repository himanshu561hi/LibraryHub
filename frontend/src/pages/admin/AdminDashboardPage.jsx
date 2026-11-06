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
  Megaphone,
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  ExternalLink,
  Sparkles,
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
  const [memberFilter, setMemberFilter] = useState(''); // status: '' | 'active' | 'inactive'
  const [memberSearch, setMemberSearch] = useState('');
  const [memberPlanFilter, setMemberPlanFilter] = useState(''); // '' | 'half-day-morning' | 'full-day-pass' | 'half-day-evening'
  const [memberFeeStatusFilter, setMemberFeeStatusFilter] = useState(''); // '' | 'dues' | 'advance' | 'paid'
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [liveAttendance, setLiveAttendance] = useState(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [attendanceFilter, setAttendanceFilter] = useState('all'); // 'all' | 'present' | 'inside' | 'absent'
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceShiftFilter, setAttendanceShiftFilter] = useState('');

  const [invoices, setInvoices] = useState([]);
  const [duesList, setDuesList] = useState([]);
  const [paymentsList, setPaymentsList] = useState([]);
  const [billingSubTab, setBillingSubTab] = useState('payments'); // 'payments' | 'dues' | 'invoices'
  const [billingSearch, setBillingSearch] = useState('');
  const [billingMethodFilter, setBillingMethodFilter] = useState(''); // '' | 'CASH' | 'UPI' | 'BANK_TRANSFER'
  const [billingInvoiceStatusFilter, setBillingInvoiceStatusFilter] = useState(''); // '' | 'advance' | 'paid' | 'partially_paid' | 'unpaid'
  const [billingPlanFilter, setBillingPlanFilter] = useState('');
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
    planType: 'day_shift',
    monthlyFee: 500,
    initialPayment: 0,
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

  // Reverse Payment Modal State
  const [showReverseModal, setShowReverseModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [reverseReason, setReverseReason] = useState('');
  const [reversingPayment, setReversingPayment] = useState(false);

  // Fee Reminder State
  const [remindingUserId, setRemindingUserId] = useState(null);
  const [broadcastingReminders, setBroadcastingReminders] = useState(false);

  // Edit / Update Membership State
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [editingMembership, setEditingMembership] = useState(null);
  const [editForm, setEditForm] = useState({
    planType: 'day_shift',
    planId: 'day-shift',
    planName: 'Day Shift Plan (7:00 AM – 8:00 PM)',
    slotType: 'DAY',
    shiftTimings: '7:00 AM - 8:00 PM',
    monthlyFee: 500,
    updateCurrentUnpaidInvoice: true,
    reason: '',
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState('');
  const [reactivatingId, setReactivatingId] = useState(null);

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

  // Banners & Popup Promotions state
  const [promoSettings, setPromoSettings] = useState({
    entry_popup: {
      enabled: false,
      imageUrl: '',
      title: '',
      actionUrl: '',
    },
    top_announcement_bar: {
      enabled: false,
      text: '',
      linkText: '',
      linkUrl: '',
    },
  });
  const [loadingPromoSettings, setLoadingPromoSettings] = useState(false);
  const [savingPromoKey, setSavingPromoKey] = useState(null);
  const [promoToast, setPromoToast] = useState({ type: '', message: '' });
  const [previewPopupOpen, setPreviewPopupOpen] = useState(false);

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
  const fetchLiveAttendance = async (dateOverride) => {
    try {
      setLoadingAttendance(true);
      const targetDate = dateOverride || attendanceDate;
      const res = await client.get(API_ENDPOINTS.ATTENDANCE.ADMIN_LIVE, {
        params: { date: targetDate },
      });
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

  // Load Promotions & Site Settings
  const fetchPromoSettings = async () => {
    try {
      setLoadingPromoSettings(true);
      const res = await client.get(API_ENDPOINTS.ADMIN.SETTINGS);
      if (res && res.success && res.data?.settings) {
        setPromoSettings((prev) => ({
          entry_popup: {
            ...prev.entry_popup,
            ...(res.data.settings.entry_popup || {}),
          },
          top_announcement_bar: {
            ...prev.top_announcement_bar,
            ...(res.data.settings.top_announcement_bar || {}),
          },
        }));
      }
    } catch (err) {
      console.error('Error loading promo settings:', err);
    } finally {
      setLoadingPromoSettings(false);
    }
  };

  // Save specific promotional setting
  const handleSavePromoSetting = async (key) => {
    try {
      setSavingPromoKey(key);
      setPromoToast({ type: '', message: '' });
      const value = promoSettings[key];
      const desc =
        key === 'entry_popup'
          ? 'Homepage entry promotional popup modal configuration'
          : 'Top notice & alert banner across home and student dashboard';

      const res = await client.put(API_ENDPOINTS.ADMIN.SETTINGS, {
        key,
        value,
        description: desc,
      });

      if (res && res.success) {
        setPromoToast({
          type: 'success',
          message:
            key === 'entry_popup'
              ? 'Entry Popup configuration saved successfully! Changes are now live on website.'
              : 'Top Announcement Banner saved successfully! Changes are now live on Home & Student Dashboard.',
        });
        setTimeout(() => setPromoToast({ type: '', message: '' }), 5000);
      }
    } catch (err) {
      console.error('Error saving promo setting:', err);
      setPromoToast({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to save settings',
      });
    } finally {
      setSavingPromoKey(null);
    }
  };

  // Image File Upload and Client-side Canvas Compression
  const handlePopupImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
          setPromoSettings((prev) => ({
            ...prev,
            entry_popup: {
              ...prev.entry_popup,
              imageUrl: compressedBase64,
            },
          }));
        };
      };
    } catch (err) {
      console.error('Error processing image:', err);
      alert('Could not process selected image. Please try another file.');
    }
  };

  // Switch tabs and load relevant dataset
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'memberships') fetchMemberships();
    if (tab === 'attendance') fetchLiveAttendance();
    if (tab === 'fees') fetchBilling();
    if (tab === 'promotions') fetchPromoSettings();
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
        await Promise.all([fetchMemberships(), fetchSummaryAndCode(), fetchBilling()]);
      }
    } catch (err) {
      alert(`Deactivation failed: ${err.message}`);
    }
  };

  // 1-Click Reactivate Membership for Admin
  const handleReactivate = async (membershipId, studentName) => {
    try {
      setReactivatingId(membershipId);
      const res = await client.patch(API_ENDPOINTS.MEMBERSHIPS.REACTIVATE(membershipId), {
        reason: '1-click reactivation by admin',
      });
      if (res && res.success) {
        await Promise.all([fetchMemberships(), fetchSummaryAndCode(), fetchBilling()]);
        alert(`Successfully reactivated membership for ${studentName || 'student'}!`);
      }
    } catch (err) {
      alert(`Reactivation failed: ${err.message || 'Error occurred'}`);
    } finally {
      setReactivatingId(null);
    }
  };

  // Open Edit Membership Modal
  const handleOpenEditModal = (m) => {
    setEditingMembership(m);
    setEditError('');
    let pType = 'day_shift';
    if (m.planId?.includes('day-shift') || m.planId?.includes('morning')) pType = 'day_shift';
    else if (m.planId?.includes('night') || m.planId?.includes('evening')) pType = 'night_shift';
    else if (m.planId?.includes('24') || m.planId?.includes('full-day')) pType = 'full_day_24h';
    else if (m.planId === 'custom') pType = 'custom';

    setEditForm({
      planType: pType,
      planId: m.planId || 'day-shift',
      planName: m.planName || 'Day Shift Plan (7:00 AM – 8:00 PM)',
      slotType: m.slotType || 'DAY',
      shiftTimings: m.shiftTimings || '7:00 AM - 8:00 PM',
      monthlyFee: (m.monthlyFeeInPaise || 0) / 100,
      updateCurrentUnpaidInvoice: true,
      reason: '',
    });
    setShowEditMemberModal(true);
  };

  // Handle Plan Type selection inside Edit Modal
  const handleEditPlanSelect = (type) => {
    const planMeta = {
      day_shift: {
        planId: 'day-shift',
        planName: 'Day Shift Plan (7:00 AM – 8:00 PM)',
        slotType: 'DAY',
        shiftTimings: '7:00 AM - 8:00 PM',
        fee: 500,
      },
      night_shift: {
        planId: 'night-shift',
        planName: 'Night Shift Plan (8:00 PM – 8:00 AM)',
        slotType: 'NIGHT',
        shiftTimings: '8:00 PM - 8:00 AM',
        fee: 600,
      },
      full_day_24h: {
        planId: 'full-day-24h',
        planName: '24 Hours Dedicated Plan',
        slotType: 'TWENTY_FOUR_HOURS',
        shiftTimings: '24 Hours (Round the Clock)',
        fee: 800,
      },
    }[type];

    if (planMeta) {
      setEditForm((prev) => ({
        ...prev,
        planType: type,
        planId: planMeta.planId,
        planName: planMeta.planName,
        slotType: planMeta.slotType,
        shiftTimings: planMeta.shiftTimings,
        monthlyFee: planMeta.fee,
      }));
    } else {
      setEditForm((prev) => ({
        ...prev,
        planType: 'custom',
        planId: 'custom',
      }));
    }
  };

  // Save Membership & Shift Updates
  const handleSaveEditMembership = async (e) => {
    e.preventDefault();
    if (!editingMembership) return;
    setSubmittingEdit(true);
    setEditError('');

    try {
      const feeInPaise = Math.round(Number(editForm.monthlyFee) * 100);
      if (isNaN(feeInPaise) || feeInPaise < 0) {
        throw new Error('Please enter a valid monthly fee in Rupees');
      }

      const res = await client.put(API_ENDPOINTS.MEMBERSHIPS.UPDATE(editingMembership._id), {
        planId: editForm.planId,
        planName: editForm.planName,
        slotType: editForm.slotType,
        shiftTimings: editForm.shiftTimings,
        monthlyFeeInPaise: feeInPaise,
        updateCurrentUnpaidInvoice: editForm.updateCurrentUnpaidInvoice,
        reason: editForm.reason.trim() || 'Shift and/or monthly fee updated by admin',
      });

      if (res && res.success) {
        setShowEditMemberModal(false);
        setEditingMembership(null);
        await Promise.all([fetchMemberships(), fetchSummaryAndCode(), fetchBilling()]);
        alert('Membership plan, shift, and fee updated successfully!');
      }
    } catch (err) {
      setEditError(err.message || 'Failed to update membership');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Handle Plan Type selection during enrollment
  const handleEnrollPlanSelect = (type) => {
    let fee = 500;
    if (type === 'night_shift') {
      fee = 600;
    } else if (type === 'full_day_24h') {
      fee = 800;
    }
    setEnrollForm((prev) => {
      // Only auto-update initialPayment if user previously had it matching the full monthly fee.
      // If user had set it to 0 or another custom number, preserve their choice!
      const wasFullFee = Number(prev.initialPayment) === Number(prev.monthlyFee) && Number(prev.monthlyFee) > 0;
      return {
        ...prev,
        planType: type,
        monthlyFee: fee,
        initialPayment: wasFullFee ? fee : prev.initialPayment,
      };
    });
  };

  // Handle Enroll Member Submission
  const handleEnrollMember = async (e) => {
    e.preventDefault();
    setSubmittingEnroll(true);
    setEnrollError('');
    setEnrollSuccess('');

    try {
      const planMeta = {
        day_shift: {
          planId: 'day-shift',
          planName: 'Day Shift Plan (7:00 AM – 8:00 PM)',
          slotType: 'DAY',
          shiftTimings: '7:00 AM - 8:00 PM',
        },
        night_shift: {
          planId: 'night-shift',
          planName: 'Night Shift Plan (8:00 PM – 8:00 AM)',
          slotType: 'NIGHT',
          shiftTimings: '8:00 PM - 8:00 AM',
        },
        full_day_24h: {
          planId: 'full-day-24h',
          planName: '24 Hours Dedicated Plan',
          slotType: 'TWENTY_FOUR_HOURS',
          shiftTimings: '24 Hours (Round the Clock)',
        },
      }[enrollForm.planType] || {
        planId: 'day-shift',
        planName: 'Day Shift Plan (7:00 AM – 8:00 PM)',
        slotType: 'DAY',
        shiftTimings: '7:00 AM - 8:00 PM',
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
          initialPayment: 0,
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
        const allocation = res.data?.allocation;
        setShowPaymentModal(false);
        setPaymentForm({
          invoiceId: '',
          amountRupees: '',
          method: 'CASH',
          referenceNumber: '',
          notes: '',
        });
        await Promise.all([fetchBilling(), fetchMemberships(), fetchSummaryAndCode()]);
        if (allocation && allocation.invoices?.length > 1) {
          alert(`Payment of ₹${amountPaise / 100} recorded successfully!\n\n✓ Current invoice settled.\n🟣 Advance payment credited for next month (${allocation.invoices.length} billing cycles covered)!`);
        } else {
          alert(`Payment of ₹${amountPaise / 100} recorded successfully!`);
        }
      }
    } catch (err) {
      alert(`Payment failed: ${err.message}`);
    }
  };

  // Handle Reverse Payment
  const handleReversePayment = async (e) => {
    e.preventDefault();
    if (!selectedPayment) return;
    if (!reverseReason.trim()) {
      alert('Please enter a reversal reason (e.g. Mistakenly recorded during enrollment).');
      return;
    }

    try {
      setReversingPayment(true);
      const res = await client.post(API_ENDPOINTS.BILLING.REVERSE_PAYMENT(selectedPayment._id), {
        reason: reverseReason.trim(),
      });

      if (res && res.success) {
        setShowReverseModal(false);
        setSelectedPayment(null);
        setReverseReason('');
        await Promise.all([fetchBilling(), fetchMemberships(), fetchSummaryAndCode()]);
        alert(`Payment receipt ${selectedPayment.paymentNumber} has been reversed successfully!`);
      } else {
        alert(res?.error?.message || 'Failed to reverse payment');
      }
    } catch (err) {
      alert(err.message || 'Error reversing payment');
    } finally {
      setReversingPayment(false);
    }
  };

  // Handle 1-Click Fee Reminder for Single Student
  const handleSendFeeReminder = async (studentUserId, studentName, amount) => {
    if (!window.confirm(`Send payment reminder email to ${studentName || 'this student'} for pending dues of ₹${amount}?`)) {
      return;
    }
    setRemindingUserId(studentUserId);
    try {
      const res = await client.post(API_ENDPOINTS.BILLING.SEND_FEE_REMINDER, { userId: studentUserId });
      if (res && res.success) {
        alert(`Fee reminder email sent successfully to ${studentName || 'student'}!`);
      } else {
        alert(res?.error?.message || 'Failed to send fee reminder');
      }
    } catch (err) {
      alert(err.message || 'Error sending fee reminder');
    } finally {
      setRemindingUserId(null);
    }
  };

  // Handle Broadcast Fee Reminders to All Students with Pending Dues
  const handleBroadcastFeeReminders = async (duesCount) => {
    if (!window.confirm(`Are you sure you want to send fee reminder emails to ALL ${duesCount} students with outstanding dues?`)) {
      return;
    }
    setBroadcastingReminders(true);
    try {
      const res = await client.post(API_ENDPOINTS.BILLING.SEND_FEE_REMINDER, { sendToAll: true });
      if (res && res.success) {
        alert(`Fee reminders successfully sent to ${res.data?.sentCount || 0} students!`);
      } else {
        alert(res?.error?.message || 'Failed to broadcast fee reminders');
      }
    } catch (err) {
      alert(err.message || 'Error broadcasting fee reminders');
    } finally {
      setBroadcastingReminders(false);
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

  // Helper to match shift/plan filter against planId and planName
  const matchesPlanFilter = (planIdentifier, planName, filterVal) => {
    if (!filterVal) return true;
    const pId = (planIdentifier || '').toLowerCase();
    const pName = (planName || '').toLowerCase();
    const f = filterVal.toLowerCase();
    if (f === 'day') return pId.includes('day') || pName.includes('day') || pId.includes('morning') || pName.includes('morning');
    if (f === 'night') return pId.includes('night') || pName.includes('night') || pId.includes('evening') || pName.includes('evening');
    if (f === '24') return pId.includes('24') || pName.includes('24') || pId.includes('full') || pName.includes('full');
    return pId.includes(f) || pName.includes(f);
  };

  // Filtered Memberships for Tab 2 (Students & Members)
  const filteredMemberships = memberships.filter((m) => {
    if (memberFilter && m.status !== memberFilter) return false;
    if (memberPlanFilter && !matchesPlanFilter(m.planId, m.planName, memberPlanFilter)) return false;
    if (memberFeeStatusFilter === 'dues' && (!m.billingSummary || m.billingSummary.totalDuePaise <= 0)) return false;
    if (memberFeeStatusFilter === 'advance' && (!m.billingSummary || !m.billingSummary.isAdvancePaid)) return false;
    if (memberFeeStatusFilter === 'paid' && (!m.billingSummary || m.billingSummary.totalDuePaise > 0 || m.billingSummary.isAdvancePaid)) return false;
    if (memberSearch.trim()) {
      const q = memberSearch.toLowerCase().trim();
      const nameMatch = (m.userId?.name || '').toLowerCase().includes(q);
      const emailMatch = (m.userId?.email || '').toLowerCase().includes(q);
      const phoneMatch = (m.userId?.phone || '').includes(q);
      if (!nameMatch && !emailMatch && !phoneMatch) return false;
    }
    return true;
  });

  // Filtered Live Attendance Records for Tab 3 (Live Attendance)
  const filteredAttendanceRecords = (liveAttendance?.allRecords || []).filter((att) => {
    if (attendanceFilter === 'present' && !att.isPresent) return false;
    if (attendanceFilter === 'inside' && (!att.inTime || att.outTime)) return false;
    if (attendanceFilter === 'absent' && att.isPresent) return false;
    if (attendanceSearch.trim()) {
      const q = attendanceSearch.toLowerCase().trim();
      const studentName = (att.userId?.name || '').toLowerCase();
      const studentEmail = (att.userId?.email || '').toLowerCase();
      if (!studentName.includes(q) && !studentEmail.includes(q)) return false;
    }
    if (attendanceShiftFilter && !matchesPlanFilter(att.planId, att.planName, attendanceShiftFilter)) {
      return false;
    }
    return true;
  });

  // Filtered Billing Lists for Tab 4 (Fees & Invoices)
  const filteredPayments = paymentsList.filter((p) => {
    if (billingMethodFilter && p.method?.toUpperCase() !== billingMethodFilter) return false;
    if (billingPlanFilter && !matchesPlanFilter(p.invoiceId?.planId, p.invoiceId?.planName, billingPlanFilter)) return false;
    if (billingSearch.trim()) {
      const q = billingSearch.toLowerCase().trim();
      const studentName = (p.userId?.name || '').toLowerCase();
      const studentEmail = (p.userId?.email || '').toLowerCase();
      const paymentNum = (p.paymentNumber || '').toLowerCase();
      const invoiceNum = (p.invoiceId?.invoiceNumber || '').toLowerCase();
      const refNum = (p.referenceNumber || '').toLowerCase();
      if (
        !studentName.includes(q) &&
        !studentEmail.includes(q) &&
        !paymentNum.includes(q) &&
        !invoiceNum.includes(q) &&
        !refNum.includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const filteredDues = duesList.filter((due) => {
    if (billingPlanFilter && !matchesPlanFilter(due.membershipId, due.membershipPlan, billingPlanFilter)) return false;
    if (billingSearch.trim()) {
      const q = billingSearch.toLowerCase().trim();
      const studentName = (due.user?.name || '').toLowerCase();
      const studentEmail = (due.user?.email || '').toLowerCase();
      const planName = (due.membershipPlan || '').toLowerCase();
      if (!studentName.includes(q) && !studentEmail.includes(q) && !planName.includes(q)) {
        return false;
      }
    }
    return true;
  });

  const filteredInvoices = invoices.filter((inv) => {
    if (billingInvoiceStatusFilter) {
      if (billingInvoiceStatusFilter === 'advance') {
        const isAdv = (inv.notes && inv.notes.toLowerCase().includes('advance')) || new Date(inv.billingPeriodStart) > new Date();
        if (!isAdv) return false;
      } else if (inv.status !== billingInvoiceStatusFilter) {
        return false;
      }
    }
    if (billingPlanFilter && !matchesPlanFilter(inv.planId, inv.planName, billingPlanFilter)) return false;
    if (billingSearch.trim()) {
      const q = billingSearch.toLowerCase().trim();
      const studentName = (inv.userId?.name || '').toLowerCase();
      const studentEmail = (inv.userId?.email || '').toLowerCase();
      const invoiceNum = (inv.invoiceNumber || '').toLowerCase();
      if (!studentName.includes(q) && !studentEmail.includes(q) && !invoiceNum.includes(q)) {
        return false;
      }
    }
    return true;
  });

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
          { id: 'promotions', label: 'Banners & Popup', icon: Megaphone },
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg font-bold text-brand-navy-950">Student Membership Management</h2>
              <p className="text-xs text-brand-navy-500">
                Manage active and former members. Search, filter by shift or status, and enroll new students.
              </p>
            </div>

            <button
              onClick={() => setShowCreateMemberModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-brand-navy-950 hover:bg-brand-navy-900 text-white transition-colors shrink-0 shadow-soft-sm"
            >
              <Plus className="w-4 h-4 text-brand-gold-400" />
              <span>Enroll Member</span>
            </button>
          </div>

          {/* Interactive Filter & Search Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3 rounded-xl bg-brand-surface-muted/60 border border-brand-surface-border mb-6">
            <div className="sm:col-span-4 relative">
              <Search className="w-4 h-4 text-brand-navy-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search by student name, email, or phone..."
                className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-brand-surface-border bg-white text-brand-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-gold-500 font-medium"
              />
              {memberSearch && (
                <button
                  type="button"
                  onClick={() => setMemberSearch('')}
                  className="absolute right-2.5 top-2 text-brand-navy-400 hover:text-brand-navy-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="sm:col-span-2">
              <select
                value={memberFilter}
                onChange={(e) => setMemberFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-brand-surface-border bg-white text-brand-navy-900 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
              >
                <option value="">All Statuses</option>
                <option value="active">Active Members Only</option>
                <option value="inactive">Inactive / Former</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={memberPlanFilter}
                onChange={(e) => setMemberPlanFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-brand-surface-border bg-white text-brand-navy-900 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
              >
                <option value="">All Shifts & Plans</option>
                <option value="day">Day Shift (7 AM - 8 PM)</option>
                <option value="night">Night Shift (8 PM - 8 AM)</option>
                <option value="24">24 Hours (Round the Clock)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <select
                value={memberFeeStatusFilter}
                onChange={(e) => setMemberFeeStatusFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-brand-surface-border bg-white text-brand-navy-900 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
              >
                <option value="">All Fee Statuses</option>
                <option value="dues">⚠️ With Outstanding Dues</option>
                <option value="advance">🟣 Advance Paid</option>
                <option value="paid">✓ Current Cycle Settled</option>
              </select>
            </div>

            <div className="sm:col-span-1 flex items-center justify-end">
              {(memberSearch || memberFilter || memberPlanFilter || memberFeeStatusFilter) && (
                <button
                  type="button"
                  onClick={() => {
                    setMemberSearch('');
                    setMemberFilter('');
                    setMemberPlanFilter('');
                    setMemberFeeStatusFilter('');
                  }}
                  className="px-2 py-1.5 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
                  title="Reset Filters"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {loadingMembers ? (
            <div className="py-12 text-center text-xs font-semibold text-brand-navy-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-gold-600 mb-2" />
              Loading memberships...
            </div>
          ) : memberships.length === 0 ? (
            <div className="py-12 text-center text-xs text-brand-navy-500">
              No membership records enrolled yet.
            </div>
          ) : filteredMemberships.length === 0 ? (
            <div className="py-12 text-center text-xs text-brand-navy-500 font-semibold">
              No students match your search and filter criteria.
              <button
                type="button"
                onClick={() => {
                  setMemberSearch('');
                  setMemberFilter('');
                  setMemberPlanFilter('');
                  setMemberFeeStatusFilter('');
                }}
                className="block mx-auto mt-2 text-brand-gold-600 hover:underline font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-brand-surface-border text-brand-navy-500 uppercase font-bold tracking-wider">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Plan / Shift</th>
                    <th className="py-3 px-4">Joining Date</th>
                    <th className="py-3 px-4">Monthly Fee</th>
                    <th className="py-3 px-4">Fee & Advance Status</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-surface-border">
                  {filteredMemberships.map((m) => (
                      <tr key={m._id} className="hover:bg-brand-surface-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-brand-navy-950 block">{m.userId?.name || 'Unknown'}</span>
                          <span className="text-[11px] text-brand-navy-500">{m.userId?.email}</span>
                          {m.userId?.phone && <span className="text-[10px] text-brand-navy-400 block font-mono">{m.userId.phone}</span>}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-brand-navy-900 block">{m.planName}</span>
                          <span className="text-[10px] text-brand-navy-500">{m.shiftTimings}</span>
                        </td>
                        <td className="py-3 px-4 text-brand-navy-700">
                          {new Date(m.joiningDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-3 px-4 font-bold text-brand-navy-950">
                          ₹{(m.monthlyFeeInPaise / 100).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4">
                          {m.billingSummary?.isAdvancePaid ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200 shadow-soft-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                                ✓ Advance Paid
                              </span>
                              {m.billingSummary.paidUntil && (
                                <span className="text-[10px] text-purple-700 block font-semibold mt-0.5">
                                  Covered till {new Date(m.billingSummary.paidUntil).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              )}
                            </div>
                          ) : m.billingSummary?.totalDuePaise > 0 ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                Due: ₹{(m.billingSummary.totalDuePaise / 100).toLocaleString('en-IN')}
                              </span>
                              <span className="text-[10px] text-rose-600 block mt-0.5">
                                {m.billingSummary.unpaidCount} unpaid cycle(s)
                              </span>
                            </div>
                          ) : m.billingSummary?.paidUntil ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                ✓ Current Cycle Paid
                              </span>
                              <span className="text-[10px] text-emerald-700 block mt-0.5">
                                Till {new Date(m.billingSummary.paidUntil).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-brand-navy-400 italic">No invoices yet</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            m.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(m)}
                              className="px-2.5 py-1 rounded text-[11px] font-bold bg-brand-surface-muted hover:bg-brand-surface-border text-brand-navy-800 transition-colors"
                              title="Update shift timings or monthly fee"
                            >
                              Edit
                            </button>

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
                              <button
                                type="button"
                                disabled={reactivatingId === m._id}
                                onClick={() => handleReactivate(m._id, m.userId?.name)}
                                className="px-2.5 py-1 rounded text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-soft-sm disabled:opacity-60 flex items-center gap-1"
                                title="1-click reactivate membership"
                              >
                                {reactivatingId === m._id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-3 h-3" />
                                )}
                                <span>Activate</span>
                              </button>
                            )}
                          </div>
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
              onClick={() => fetchLiveAttendance()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-surface-muted hover:bg-brand-surface-border text-brand-navy-800 transition-colors w-fit"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Interactive Search & Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3 rounded-xl bg-brand-surface-muted/60 border border-brand-surface-border mb-4">
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 text-brand-navy-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={attendanceSearch}
                onChange={(e) => setAttendanceSearch(e.target.value)}
                placeholder="Search student by name or email..."
                className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-brand-surface-border bg-white text-brand-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-gold-500 font-medium"
              />
              {attendanceSearch && (
                <button
                  type="button"
                  onClick={() => setAttendanceSearch('')}
                  className="absolute right-2.5 top-2 text-brand-navy-400 hover:text-brand-navy-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="sm:col-span-3">
              <select
                value={attendanceShiftFilter}
                onChange={(e) => setAttendanceShiftFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-brand-surface-border bg-white text-brand-navy-900 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
              >
                <option value="">All Shifts & Plans</option>
                <option value="day">Day Shift (7 AM - 8 PM)</option>
                <option value="night">Night Shift (8 PM - 8 AM)</option>
                <option value="24">24 Hours (Round the Clock)</option>
              </select>
            </div>

            <div className="sm:col-span-3 flex items-center gap-1.5">
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => {
                  setAttendanceDate(e.target.value);
                  fetchLiveAttendance(e.target.value);
                }}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-brand-surface-border bg-white text-brand-navy-900 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
              />
              {attendanceDate !== new Date().toISOString().split('T')[0] && (
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    setAttendanceDate(today);
                    fetchLiveAttendance(today);
                  }}
                  className="px-2 py-1.5 rounded-lg text-xs font-semibold text-brand-gold-700 bg-brand-gold-50 border border-brand-gold-200 hover:bg-brand-gold-100 whitespace-nowrap"
                  title="Reset to today"
                >
                  Today
                </button>
              )}
            </div>

            <div className="sm:col-span-1 flex items-center justify-end">
              {(attendanceSearch || attendanceShiftFilter || attendanceFilter !== 'all' || attendanceDate !== new Date().toISOString().split('T')[0]) && (
                <button
                  type="button"
                  onClick={() => {
                    setAttendanceSearch('');
                    setAttendanceShiftFilter('');
                    setAttendanceFilter('all');
                    const today = new Date().toISOString().split('T')[0];
                    if (attendanceDate !== today) {
                      setAttendanceDate(today);
                      fetchLiveAttendance(today);
                    }
                  }}
                  className="px-2 py-1.5 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
                  title="Reset Filters"
                >
                  Reset
                </button>
              )}
            </div>
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
              No students or attendance records found for this date.
            </div>
          ) : filteredAttendanceRecords.length === 0 ? (
            <div className="py-12 text-center text-xs text-brand-navy-500 font-semibold">
              No students match your search and filter criteria.
              <button
                type="button"
                onClick={() => {
                  setAttendanceSearch('');
                  setAttendanceShiftFilter('');
                  setAttendanceFilter('all');
                }}
                className="block mx-auto mt-2 text-brand-gold-600 hover:underline font-bold"
              >
                Reset Filters
              </button>
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
                  {filteredAttendanceRecords.map((att) => (
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
                          att.autoCheckedOut ? (
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300"
                              title="Automatically checked out at 11:59 PM IST"
                            >
                              ✓ AUTO CHECK-OUT (11:59 PM)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-300">
                              ✓ PRESENT (Completed)
                            </span>
                          )
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
                  type="button"
                  onClick={fetchBilling}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-brand-surface-muted hover:bg-brand-surface-border text-brand-navy-800 transition-colors"
                  title="Refresh records"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-surface-border pb-3 mb-5">
              <div className="flex items-center gap-2">
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

              {billingSubTab === 'dues' && duesList.length > 0 && (
                <button
                  type="button"
                  disabled={broadcastingReminders}
                  onClick={() => handleBroadcastFeeReminders(duesList.length)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-brand-navy-900 hover:bg-brand-navy-800 transition-colors disabled:opacity-50 shadow-soft-sm self-start sm:self-auto"
                  title="Send Fee Reminder Email to all active students with pending dues"
                >
                  {broadcastingReminders ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-gold-400" />
                      <span>Sending Broadcast Reminders...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5 text-brand-gold-400" />
                      <span>Remind All Students ({duesList.length})</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Interactive Filter & Search Bar for Fees */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3 rounded-xl bg-brand-surface-muted/60 border border-brand-surface-border mb-6">
              <div className={`${billingSubTab === 'dues' ? 'sm:col-span-5' : 'sm:col-span-4'} relative`}>
                <Search className="w-4 h-4 text-brand-navy-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={billingSearch}
                  onChange={(e) => setBillingSearch(e.target.value)}
                  placeholder={
                    billingSubTab === 'payments'
                      ? 'Search student name, email, receipt #, invoice #...'
                      : billingSubTab === 'dues'
                      ? 'Search active student name, email, or plan...'
                      : 'Search student name, email, or invoice #...'
                  }
                  className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-brand-surface-border bg-white text-brand-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-gold-500 font-medium"
                />
                {billingSearch && (
                  <button
                    type="button"
                    onClick={() => setBillingSearch('')}
                    className="absolute right-2.5 top-2 text-brand-navy-400 hover:text-brand-navy-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {billingSubTab === 'payments' && (
                <div className="sm:col-span-3">
                  <select
                    value={billingMethodFilter}
                    onChange={(e) => setBillingMethodFilter(e.target.value)}
                    className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-brand-surface-border bg-white text-brand-navy-950 font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                  >
                    <option value="">All Payment Modes</option>
                    <option value="CASH">Cash Payments</option>
                    <option value="UPI">UPI Payments</option>
                    <option value="BANK_TRANSFER">Bank Transfers</option>
                  </select>
                </div>
              )}

              {billingSubTab === 'invoices' && (
                <div className="sm:col-span-3">
                  <select
                    value={billingInvoiceStatusFilter}
                    onChange={(e) => setBillingInvoiceStatusFilter(e.target.value)}
                    className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-brand-surface-border bg-white text-brand-navy-950 font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                  >
                    <option value="">All Invoices (Paid & Unpaid)</option>
                    <option value="advance">🟣 Advance Invoices Only</option>
                    <option value="paid">Fully Settled (Paid)</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="unpaid">Completely Unpaid</option>
                  </select>
                </div>
              )}

              <div className={`${billingSubTab === 'dues' ? 'sm:col-span-5' : 'sm:col-span-3'}`}>
                <select
                  value={billingPlanFilter}
                  onChange={(e) => setBillingPlanFilter(e.target.value)}
                  className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-brand-surface-border bg-white text-brand-navy-950 font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                >
                  <option value="">All Shifts & Plans</option>
                  <option value="day">Day Shift (7 AM - 8 PM)</option>
                  <option value="night">Night Shift (8 PM - 8 AM)</option>
                  <option value="24">24 Hours (Round the Clock)</option>
                </select>
              </div>

              <div className="sm:col-span-2 flex items-center justify-end">
                {(billingSearch || billingMethodFilter || billingInvoiceStatusFilter || billingPlanFilter) && (
                  <button
                    type="button"
                    onClick={() => {
                      setBillingSearch('');
                      setBillingMethodFilter('');
                      setBillingInvoiceStatusFilter('');
                      setBillingPlanFilter('');
                    }}
                    className="w-full py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200 text-center"
                  >
                    Reset
                  </button>
                )}
              </div>
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
              ) : filteredPayments.length === 0 ? (
                <div className="py-12 text-center text-xs text-brand-navy-500 font-semibold">
                  No payment receipts match your search and filter criteria.
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
                      {filteredPayments.map((p) => (
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
                            <div>{p.invoiceId?.invoiceNumber || '—'}</div>
                            {p.notes && (
                              <div className="text-[10px] text-brand-navy-500 font-sans italic max-w-xs truncate" title={p.notes}>
                                {p.notes}
                              </div>
                            )}
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
                            <div className="flex flex-col gap-1">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase w-fit ${
                                  p.isReversed
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {p.isReversed ? 'Reversed' : 'Settled'}
                              </span>
                              {p.notes && p.notes.toLowerCase().includes('advance') && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-900 border border-purple-200 w-fit">
                                  Advance Allocation
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : billingSubTab === 'dues' ? (
              /* SUBTAB 2: PENDING DUES (ONLY ACTIVE MEMBERS) */
              duesList.length === 0 ? (
                <div className="py-12 text-center text-xs text-emerald-700 font-semibold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  All active student balances are completely settled! No outstanding dues.
                </div>
              ) : filteredDues.length === 0 ? (
                <div className="py-12 text-center text-xs text-brand-navy-500 font-semibold">
                  No active members with pending dues match your search criteria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-brand-surface-border text-brand-navy-500 uppercase font-bold tracking-wider">
                        <th className="py-3 px-4">Active Student</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4">Membership Plan</th>
                        <th className="py-3 px-4">Unpaid Invoices</th>
                        <th className="py-3 px-4">Total Due</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-surface-border">
                      {filteredDues.map((due) => (
                        <tr key={due._id} className="hover:bg-brand-surface-muted/50 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-bold text-brand-navy-950 block">{due.user?.name}</span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active Member
                            </span>
                          </td>
                          <td className="py-3 px-4 text-brand-navy-600">{due.user?.email}</td>
                          <td className="py-3 px-4 text-brand-navy-800">{due.membershipPlan || '—'}</td>
                          <td className="py-3 px-4 text-brand-navy-700 font-semibold">{due.unpaidInvoiceCount}</td>
                          <td className="py-3 px-4 font-bold text-amber-800">
                            ₹{(due.totalDuePaise / 100).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                disabled={remindingUserId === (due.user?._id || due._id)}
                                onClick={() =>
                                  handleSendFeeReminder(
                                    due.user?._id || due._id,
                                    due.user?.name,
                                    due.totalDuePaise / 100
                                  )
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-brand-navy-800 bg-brand-surface-muted hover:bg-brand-surface-border transition-colors disabled:opacity-50"
                                title="Send 1-Click Fee Reminder Email to this student"
                              >
                                {remindingUserId === (due.user?._id || due._id) ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin text-brand-navy-600" />
                                    <span>Sending...</span>
                                  </>
                                ) : (
                                  <>
                                    <Mail className="w-3 h-3 text-brand-gold-600" />
                                    <span>Remind</span>
                                  </>
                                )}
                              </button>
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
                            </div>
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
              ) : filteredInvoices.length === 0 ? (
                <div className="py-12 text-center text-xs text-brand-navy-500 font-semibold">
                  No invoices match your search and filter criteria.
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
                      {filteredInvoices.map((inv) => (
                        <tr key={inv._id} className="hover:bg-brand-surface-muted/50 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-brand-navy-950">{inv.invoiceNumber}</td>
                          <td className="py-3 px-4 font-medium text-brand-navy-800">
                            {inv.userId?.name || 'Student'}
                          </td>
                          <td className="py-3 px-4 text-brand-navy-600 font-mono text-[11px]">
                            <div>
                              {new Date(inv.billingPeriodStart).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                              {' - '}
                              {new Date(inv.billingPeriodEnd).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            {((inv.notes && inv.notes.toLowerCase().includes('advance')) || new Date(inv.billingPeriodStart) > new Date()) && (
                              <span className="text-[10px] text-purple-700 font-bold block mt-0.5">
                                🟣 Advance Month Cycle
                              </span>
                            )}
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
                            {((inv.notes && inv.notes.toLowerCase().includes('advance')) || new Date(inv.billingPeriodStart) > new Date()) && inv.status === 'paid' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                                ADVANCE PAID
                              </span>
                            ) : (
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
                            )}
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

      {/* TAB 8: PROMOTIONS, BANNERS & ENTRY POPUP */}
      {activeTab === 'promotions' && (
        <div className="space-y-6">
          {/* Header & Status Alert */}
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-brand-surface-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                  <Megaphone className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-brand-navy-950">
                  Promotional Banners & Entry Graphic Popup
                </h2>
              </div>
              <p className="text-xs text-brand-navy-600 mt-1">
                Configure the first-visit graphic popup and the top notification strip visible on the Home Page and Student Dashboard.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchPromoSettings}
              disabled={loadingPromoSettings}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-brand-surface-muted hover:bg-brand-surface-border text-brand-navy-800 transition-colors self-start md:self-auto shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingPromoSettings ? 'animate-spin' : ''}`} />
              <span>Refresh Settings</span>
            </button>
          </div>

          {/* Toast Notification Alert */}
          {promoToast.message && (
            <div
              className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                promoToast.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {promoToast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{promoToast.message}</span>
            </div>
          )}

          {/* 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CARD 1: ENTRY GRAPHIC POPUP */}
            <div className="bg-white rounded-2xl p-6 shadow-soft border border-brand-surface-border flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between pb-4 border-b border-brand-surface-border">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-brand-navy-950">
                        Website Entry Graphic Popup
                      </h3>
                      <p className="text-[11px] text-brand-navy-500">
                        Shows promotional banner image on site visit with a close (X) button
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() =>
                      setPromoSettings((prev) => ({
                        ...prev,
                        entry_popup: {
                          ...prev.entry_popup,
                          enabled: !prev.entry_popup?.enabled,
                        },
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-gold-500 ${
                      promoSettings.entry_popup?.enabled ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                    role="switch"
                    aria-checked={promoSettings.entry_popup?.enabled}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        promoSettings.entry_popup?.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  {/* Status Indicator */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-brand-navy-700">Popup Display Status:</span>
                    <span
                      className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                        promoSettings.entry_popup?.enabled
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {promoSettings.entry_popup?.enabled ? 'Enabled (Active on Site)' : 'Disabled (Hidden)'}
                    </span>
                  </div>

                  {/* Image Graphic Upload & Preview */}
                  <div>
                    <label className="block text-xs font-bold text-brand-navy-800 uppercase tracking-wider mb-1.5">
                      Promotional Graphic Image *
                    </label>

                    {promoSettings.entry_popup?.imageUrl ? (
                      <div className="relative border-2 border-dashed border-brand-surface-border rounded-xl p-3 bg-brand-surface-muted/40">
                        <img
                          src={promoSettings.entry_popup.imageUrl}
                          alt="Popup Graphic Preview"
                          className="max-h-56 w-auto mx-auto rounded-lg object-contain shadow-soft-sm"
                        />
                        <div className="mt-3 flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewPopupOpen(true)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-brand-navy-950 text-white hover:bg-brand-navy-900 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview Modal</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setPromoSettings((prev) => ({
                                ...prev,
                                entry_popup: {
                                  ...prev.entry_popup,
                                  imageUrl: '',
                                },
                              }))
                            }
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Graphic</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-brand-surface-border hover:border-brand-gold-500 rounded-xl cursor-pointer bg-brand-surface-muted/30 hover:bg-brand-gold-50/20 transition-all text-center group">
                        <UploadCloud className="w-8 h-8 text-brand-navy-400 group-hover:text-brand-gold-600 transition-colors mb-2" />
                        <span className="text-xs font-bold text-brand-navy-900">
                          Upload Promotional Graphic (JPG, PNG, WebP)
                        </span>
                        <span className="text-[11px] text-brand-navy-500 mt-0.5">
                          Automatically resized & optimized for high-speed delivery
                        </span>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/webp"
                          className="hidden"
                          onChange={handlePopupImageUpload}
                        />
                      </label>
                    )}

                    {/* Direct Image URL input as fallback */}
                    <div className="mt-2.5">
                      <label className="block text-[11px] font-semibold text-brand-navy-600 mb-1">
                        Or enter direct Image URL:
                      </label>
                      <input
                        type="url"
                        value={promoSettings.entry_popup?.imageUrl || ''}
                        onChange={(e) =>
                          setPromoSettings((prev) => ({
                            ...prev,
                            entry_popup: {
                              ...prev.entry_popup,
                              imageUrl: e.target.value,
                            },
                          }))
                        }
                        placeholder="https://example.com/festive-banner.jpg"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-brand-surface-border text-brand-navy-950 font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                      />
                    </div>
                  </div>

                  {/* Title & Action URL Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-brand-navy-800 uppercase tracking-wider mb-1">
                        Modal Title (Optional)
                      </label>
                      <input
                        type="text"
                        value={promoSettings.entry_popup?.title || ''}
                        onChange={(e) =>
                          setPromoSettings((prev) => ({
                            ...prev,
                            entry_popup: {
                              ...prev.entry_popup,
                              title: e.target.value,
                            },
                          }))
                        }
                        placeholder="e.g. Diwali Special Offer 2026"
                        className="w-full px-3 py-2 rounded-xl border border-brand-surface-border text-brand-navy-950 font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-brand-navy-800 uppercase tracking-wider mb-1">
                        Click Action Link (Optional)
                      </label>
                      <input
                        type="text"
                        value={promoSettings.entry_popup?.actionUrl || ''}
                        onChange={(e) =>
                          setPromoSettings((prev) => ({
                            ...prev,
                            entry_popup: {
                              ...prev.entry_popup,
                              actionUrl: e.target.value,
                            },
                          }))
                        }
                        placeholder="e.g. /membership or https://wa.me/..."
                        className="w-full px-3 py-2 rounded-xl border border-brand-surface-border text-brand-navy-950 font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-5 mt-4 border-t border-brand-surface-border flex justify-end">
                <button
                  type="button"
                  disabled={savingPromoKey === 'entry_popup'}
                  onClick={() => handleSavePromoSetting('entry_popup')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-navy-950 hover:bg-brand-navy-900 text-white text-xs font-bold transition-all shadow-soft-sm disabled:opacity-50"
                >
                  {savingPromoKey === 'entry_popup' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-brand-gold-400" />
                  ) : (
                    <Check className="w-4 h-4 text-brand-gold-400" />
                  )}
                  <span>Save Entry Popup Settings</span>
                </button>
              </div>
            </div>

            {/* CARD 2: TOP NOTIFICATION BANNER */}
            <div className="bg-white rounded-2xl p-6 shadow-soft border border-brand-surface-border flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between pb-4 border-b border-brand-surface-border">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-brand-navy-950">
                        Top Thin Notification Banner
                      </h3>
                      <p className="text-[11px] text-brand-navy-500">
                        Displayed at the top of Home Page (/) and Student Dashboard (/dashboard) with close button
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() =>
                      setPromoSettings((prev) => ({
                        ...prev,
                        top_announcement_bar: {
                          ...prev.top_announcement_bar,
                          enabled: !prev.top_announcement_bar?.enabled,
                        },
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-gold-500 ${
                      promoSettings.top_announcement_bar?.enabled ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                    role="switch"
                    aria-checked={promoSettings.top_announcement_bar?.enabled}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        promoSettings.top_announcement_bar?.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  {/* Status Indicator */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-brand-navy-700">Banner Display Status:</span>
                    <span
                      className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                        promoSettings.top_announcement_bar?.enabled
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {promoSettings.top_announcement_bar?.enabled
                        ? 'Enabled (Shown on Home & Dashboard)'
                        : 'Disabled (Hidden)'}
                    </span>
                  </div>

                  {/* Banner Notice Text */}
                  <div>
                    <label className="block text-xs font-bold text-brand-navy-800 uppercase tracking-wider mb-1.5">
                      Announcement / Offer Text *
                    </label>
                    <input
                      type="text"
                      required
                      value={promoSettings.top_announcement_bar?.text || ''}
                      onChange={(e) =>
                        setPromoSettings((prev) => ({
                          ...prev,
                          top_announcement_bar: {
                            ...prev.top_announcement_bar,
                            text: e.target.value,
                          },
                        }))
                      }
                      placeholder="e.g. DIWALI OFFER 20% OFF — Limited Seats Available in Day & Night Shifts!"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-brand-surface-border text-brand-navy-950 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <p className="text-[11px] text-brand-navy-500 mt-1">
                      Keep text concise and eye-catching. A dismiss cross (X) is automatically attached.
                    </p>
                  </div>

                  {/* Optional Action Link */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-brand-navy-800 uppercase tracking-wider mb-1">
                        Link Text (Optional)
                      </label>
                      <input
                        type="text"
                        value={promoSettings.top_announcement_bar?.linkText || ''}
                        onChange={(e) =>
                          setPromoSettings((prev) => ({
                            ...prev,
                            top_announcement_bar: {
                              ...prev.top_announcement_bar,
                              linkText: e.target.value,
                            },
                          }))
                        }
                        placeholder="e.g. Explore Memberships"
                        className="w-full px-3 py-2 rounded-xl border border-brand-surface-border text-brand-navy-950 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-brand-navy-800 uppercase tracking-wider mb-1">
                        Target URL / Path (Optional)
                      </label>
                      <input
                        type="text"
                        value={promoSettings.top_announcement_bar?.linkUrl || ''}
                        onChange={(e) =>
                          setPromoSettings((prev) => ({
                            ...prev,
                            top_announcement_bar: {
                              ...prev.top_announcement_bar,
                              linkUrl: e.target.value,
                            },
                          }))
                        }
                        placeholder="e.g. /membership"
                        className="w-full px-3 py-2 rounded-xl border border-brand-surface-border text-brand-navy-950 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Real-time Visual Preview Strip */}
                  <div className="pt-2">
                    <span className="block text-[11px] font-bold text-brand-navy-700 uppercase tracking-wider mb-1.5">
                      Live Strip Preview (How visitors see it):
                    </span>
                    <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-600 text-white rounded-xl py-2 px-3 flex items-center justify-between gap-2 shadow-sm text-xs">
                      <div className="flex-1 flex items-center justify-center gap-1.5 text-center flex-wrap">
                        <span className="inline-flex items-center gap-1 bg-white/20 px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          <Sparkles className="w-2.5 h-2.5 text-amber-200" />
                          Notice
                        </span>
                        <span className="font-semibold text-xs truncate max-w-[280px]">
                          {promoSettings.top_announcement_bar?.text || 'DIWALI OFFER 20% OFF — Limited Seats Available!'}
                        </span>
                        {promoSettings.top_announcement_bar?.linkText && (
                          <span className="underline font-bold text-amber-100 text-[11px] ml-1">
                            {promoSettings.top_announcement_bar.linkText} →
                          </span>
                        )}
                      </div>
                      <div className="p-0.5 rounded bg-white/20 text-white/90 shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-5 mt-4 border-t border-brand-surface-border flex justify-end">
                <button
                  type="button"
                  disabled={savingPromoKey === 'top_announcement_bar'}
                  onClick={() => handleSavePromoSetting('top_announcement_bar')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-soft-sm disabled:opacity-50"
                >
                  {savingPromoKey === 'top_announcement_bar' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Check className="w-4 h-4 text-white" />
                  )}
                  <span>Save Top Banner Settings</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Guidance Info Card */}
          <div className="bg-brand-surface-muted/60 rounded-xl p-4 border border-brand-surface-border text-xs text-brand-navy-600 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-brand-gold-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-brand-navy-900">User Experience Note:</p>
              <p className="mt-0.5">
                Dismissing either the Top Banner or Entry Popup on the site records a single-session dismissal in the visitor's browser. This guarantees your visitors will not be repeatedly interrupted while clicking through library tabs and pages during the same visit.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* POPUP PREVIEW MODAL FOR ADMIN */}
      {previewPopupOpen && promoSettings.entry_popup?.imageUrl && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-brand-navy-950/75 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative z-10 w-full max-w-lg mx-auto bg-white rounded-2xl p-2 shadow-2xl border border-white/20">
            <button
              type="button"
              onClick={() => setPreviewPopupOpen(false)}
              className="absolute -top-3.5 -right-3.5 z-20 w-9 h-9 rounded-full bg-white text-brand-navy-900 hover:bg-brand-gold-500 hover:text-white transition-all shadow-xl flex items-center justify-center border-2 border-brand-navy-950"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div className="relative overflow-hidden rounded-xl bg-black max-h-[75vh] flex flex-col items-center justify-center">
              <img
                src={promoSettings.entry_popup.imageUrl}
                alt={promoSettings.entry_popup.title || 'Preview'}
                className="w-full h-auto max-h-[70vh] object-contain rounded-xl"
              />
              {promoSettings.entry_popup.title && (
                <div className="w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 absolute bottom-0 inset-x-0 text-white text-center font-bold text-sm">
                  {promoSettings.entry_popup.title}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ENROLL NEW MEMBER */}
      {showCreateMemberModal && (
        <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-3 sm:p-4 pt-14 pb-8 sm:py-8 bg-brand-navy-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border border-brand-surface-border my-auto relative">
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
                    onClick={() => handleEnrollPlanSelect('day_shift')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      enrollForm.planType === 'day_shift'
                        ? 'border-brand-gold-500 bg-brand-gold-50/60 font-bold text-brand-navy-950 shadow-soft-sm'
                        : 'border-brand-surface-border bg-white text-brand-navy-700 hover:bg-brand-surface-muted'
                    }`}
                  >
                    <span className="block text-xs font-bold">Day Shift</span>
                    <span className="block text-[10px] text-brand-navy-500">7 AM - 8 PM</span>
                    <span className="block text-xs font-bold text-brand-gold-700 mt-0.5">₹500</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEnrollPlanSelect('night_shift')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      enrollForm.planType === 'night_shift'
                        ? 'border-brand-gold-500 bg-brand-gold-50/60 font-bold text-brand-navy-950 shadow-soft-sm'
                        : 'border-brand-surface-border bg-white text-brand-navy-700 hover:bg-brand-surface-muted'
                    }`}
                  >
                    <span className="block text-xs font-bold">Night Shift</span>
                    <span className="block text-[10px] text-brand-navy-500">8 PM - 8 AM</span>
                    <span className="block text-xs font-bold text-brand-gold-700 mt-0.5">₹600</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEnrollPlanSelect('full_day_24h')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      enrollForm.planType === 'full_day_24h'
                        ? 'border-brand-gold-500 bg-brand-gold-50/60 font-bold text-brand-navy-950 shadow-soft-sm'
                        : 'border-brand-surface-border bg-white text-brand-navy-700 hover:bg-brand-surface-muted'
                    }`}
                  >
                    <span className="block text-xs font-bold">24 Hours</span>
                    <span className="block text-[10px] text-brand-navy-500">Round Clock</span>
                    <span className="block text-xs font-bold text-brand-gold-700 mt-0.5">₹800</span>
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
        <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-3 sm:p-4 pt-14 pb-8 sm:py-8 bg-brand-navy-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-brand-surface-border my-auto relative">
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
        <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-3 sm:p-4 pt-14 pb-8 sm:py-8 bg-brand-navy-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-brand-surface-border my-auto relative">
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

                {/* Live Real-time Advance & Payment Allocation Preview Card */}
                {(() => {
                  const selectedInv = invoices.find((inv) => String(inv._id) === String(paymentForm.invoiceId));
                  if (!selectedInv || !Number(paymentForm.amountRupees)) return null;

                  const currentDue = selectedInv.balanceInPaise / 100;
                  const entered = Number(paymentForm.amountRupees);
                  const isExcess = entered > currentDue;
                  const isPartial = entered < currentDue;
                  const excessAmount = isExcess ? entered - currentDue : 0;
                  const remainingDue = isPartial ? currentDue - entered : 0;

                  return (
                    <div className="mt-2 p-3 rounded-xl border space-y-1.5 text-xs bg-brand-surface-muted/60">
                      <div className="flex items-center justify-between font-bold text-brand-navy-900 border-b border-brand-surface-border pb-1">
                        <span>Payment Breakdown</span>
                        <span className="font-mono text-brand-navy-950 font-bold">Total ₹{entered}</span>
                      </div>

                      {isExcess ? (
                        <div className="space-y-1 pt-1 text-purple-950">
                          <div className="flex items-center justify-between text-emerald-800 font-semibold">
                            <span>✓ Current Cycle ({selectedInv.invoiceNumber}):</span>
                            <span className="font-bold">₹{currentDue} (100% Cleared)</span>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-purple-200 text-purple-900 font-bold">
                            <span className="flex items-center gap-1">
                              🟣 Next Month Advance:
                            </span>
                            <span className="font-extrabold text-purple-950 font-mono">
                              ₹{excessAmount}
                            </span>
                          </div>
                          <p className="text-[10px] text-purple-700 font-medium">
                            An advance invoice for next month will be auto-generated and marked Paid!
                          </p>
                        </div>
                      ) : isPartial ? (
                        <div className="space-y-1 pt-1 text-amber-900 font-semibold">
                          <div className="flex items-center justify-between">
                            <span>Partial Payment towards {selectedInv.invoiceNumber}:</span>
                            <span className="font-bold text-blue-800">₹{entered}</span>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-amber-200 text-amber-950">
                            <span>Remaining Balance on Invoice:</span>
                            <span className="font-bold text-amber-800 font-mono">₹{remainingDue}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-1 text-emerald-800 font-bold flex items-center justify-between">
                          <span>Full Settlement of {selectedInv.invoiceNumber}:</span>
                          <span>₹{entered} (100% Settled)</span>
                        </div>
                      )}
                    </div>
                  );
                })()}

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

      {/* MODAL: UPDATE / EDIT MEMBERSHIP (PLAN, SHIFT TIMINGS, MONTHLY FEE) */}
      {showEditMemberModal && (
        <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-3 sm:p-4 pt-14 pb-8 sm:py-8 bg-brand-navy-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-brand-surface-border my-auto relative">
            <div className="flex items-center justify-between pb-3 border-b border-brand-surface-border mb-4">
              <div>
                <h3 className="text-base font-bold text-brand-navy-950">
                  Update Membership & Shift
                </h3>
                <p className="text-xs text-brand-navy-500">
                  {editingMembership?.userId?.name} ({editingMembership?.userId?.email})
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEditMemberModal(false);
                  setEditingMembership(null);
                  setEditError('');
                }}
                className="text-brand-navy-400 hover:text-brand-navy-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold mb-4 border border-red-200">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEditMembership} className="space-y-4 text-xs">
              {/* Shift Presets */}
              <div>
                <label className="block font-bold text-brand-navy-800 uppercase tracking-wider mb-1.5">
                  Select Shift / Plan Preset *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditPlanSelect('day_shift')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      editForm.planType === 'day_shift'
                        ? 'border-brand-gold-500 bg-brand-gold-50/60 font-bold text-brand-navy-950 shadow-soft-sm'
                        : 'border-brand-surface-border bg-white text-brand-navy-700 hover:bg-brand-surface-muted'
                    }`}
                  >
                    <span className="block text-xs font-bold">Day Shift</span>
                    <span className="block text-[10px] text-brand-navy-500">7 AM - 8 PM</span>
                    <span className="block text-xs font-bold text-brand-gold-700 mt-0.5">₹500</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEditPlanSelect('night_shift')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      editForm.planType === 'night_shift'
                        ? 'border-brand-gold-500 bg-brand-gold-50/60 font-bold text-brand-navy-950 shadow-soft-sm'
                        : 'border-brand-surface-border bg-white text-brand-navy-700 hover:bg-brand-surface-muted'
                    }`}
                  >
                    <span className="block text-xs font-bold">Night Shift</span>
                    <span className="block text-[10px] text-brand-navy-500">8 PM - 8 AM</span>
                    <span className="block text-xs font-bold text-brand-gold-700 mt-0.5">₹600</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEditPlanSelect('full_day_24h')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      editForm.planType === 'full_day_24h'
                        ? 'border-brand-gold-500 bg-brand-gold-50/60 font-bold text-brand-navy-950 shadow-soft-sm'
                        : 'border-brand-surface-border bg-white text-brand-navy-700 hover:bg-brand-surface-muted'
                    }`}
                  >
                    <span className="block text-xs font-bold">24 Hours</span>
                    <span className="block text-[10px] text-brand-navy-500">Round Clock</span>
                    <span className="block text-xs font-bold text-brand-gold-700 mt-0.5">₹800</span>
                  </button>
                </div>
              </div>

              {/* Plan Name & Shift Timings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-brand-navy-800 uppercase tracking-wider mb-1">
                    Plan Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.planName}
                    onChange={(e) => setEditForm({ ...editForm, planName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-surface-border text-brand-navy-950 font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-navy-800 uppercase tracking-wider mb-1">
                    Shift Timings *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.shiftTimings}
                    onChange={(e) => setEditForm({ ...editForm, shiftTimings: e.target.value })}
                    placeholder="e.g. 7:00 AM - 8:00 PM"
                    className="w-full px-3 py-2 rounded-xl border border-brand-surface-border text-brand-navy-950 font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                  />
                </div>
              </div>

              {/* Monthly Fee (Increase or Decrease) */}
              <div>
                <label className="block font-bold text-brand-navy-800 uppercase tracking-wider mb-1">
                  Monthly Fee (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-bold text-brand-navy-400">₹</span>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    required
                    value={editForm.monthlyFee}
                    onChange={(e) => setEditForm({ ...editForm, monthlyFee: e.target.value })}
                    placeholder="e.g. 600 or 1000"
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-brand-surface-border text-brand-navy-950 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                  />
                </div>
                <p className="text-[11px] text-brand-navy-500 mt-1">
                  You can increase or decrease this member's monthly fee at any time.
                </p>
              </div>

              {/* Checkbox: apply to current unpaid invoice */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-brand-surface-muted/60 border border-brand-surface-border cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.updateCurrentUnpaidInvoice}
                  onChange={(e) => setEditForm({ ...editForm, updateCurrentUnpaidInvoice: e.target.checked })}
                  className="mt-0.5 rounded border-brand-surface-border text-brand-navy-950 focus:ring-brand-gold-500"
                />
                <div>
                  <span className="font-bold text-brand-navy-950 block">Update current unpaid billing invoice</span>
                  <span className="text-[11px] text-brand-navy-500 block">
                    If this student has an active unpaid invoice for this cycle, update its due amount to match the new fee.
                  </span>
                </div>
              </label>

              {/* Reason / Notes */}
              <div>
                <label className="block font-bold text-brand-navy-800 uppercase tracking-wider mb-1">
                  Reason for Update (Audit Log)
                </label>
                <input
                  type="text"
                  value={editForm.reason}
                  onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                  placeholder="e.g. Student shifted from morning to full day pass"
                  className="w-full px-3 py-2 rounded-xl border border-brand-surface-border text-brand-navy-950 font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-brand-surface-border">
                <button
                  type="button"
                  disabled={submittingEdit}
                  onClick={() => {
                    setShowEditMemberModal(false);
                    setEditingMembership(null);
                    setEditError('');
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-brand-navy-700 hover:bg-brand-surface-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-brand-navy-950 hover:bg-brand-navy-900 text-white transition-all shadow-soft-sm disabled:opacity-50"
                >
                  {submittingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-gold-400" />}
                  <span>Save & Update Membership</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REVERSE PAYMENT RECEIPT */}
      {showReverseModal && selectedPayment && (
        <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-3 sm:p-4 pt-14 pb-8 sm:py-8 bg-brand-navy-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-brand-surface-border my-auto relative animate-in fade-in zoom-in duration-150">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-rose-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>Reverse Payment Receipt</span>
                </h3>
                <p className="text-xs text-brand-navy-500 mt-0.5">
                  Receipt: <span className="font-mono font-bold text-brand-navy-900">{selectedPayment.paymentNumber}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowReverseModal(false);
                  setSelectedPayment(null);
                  setReverseReason('');
                }}
                className="p-1 rounded-lg text-brand-navy-400 hover:text-brand-navy-700 hover:bg-brand-surface-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 mb-4 space-y-1">
              <div className="flex justify-between font-semibold">
                <span>Amount to Reverse:</span>
                <span className="font-bold text-sm">₹{(selectedPayment.amountInPaise / 100).toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[11px] text-rose-700">
                This will cancel the receipt, restore any linked student invoice balance back to pending dues, and immediately deduct ₹{(selectedPayment.amountInPaise / 100).toLocaleString('en-IN')} from Today's Collections.
              </p>
            </div>

            <form onSubmit={handleReversePayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-navy-800 uppercase tracking-wider mb-1">
                  Reason for Reversal (Audit Log) *
                </label>
                <input
                  type="text"
                  required
                  value={reverseReason}
                  onChange={(e) => setReverseReason(e.target.value)}
                  placeholder="e.g. Mistakenly recorded during enrollment (entered ₹0)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-brand-surface-border text-brand-navy-950 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-brand-surface-border">
                <button
                  type="button"
                  disabled={reversingPayment}
                  onClick={() => {
                    setShowReverseModal(false);
                    setSelectedPayment(null);
                    setReverseReason('');
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-brand-navy-700 hover:bg-brand-surface-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reversingPayment}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-soft-sm disabled:opacity-50"
                >
                  {reversingPayment && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Reversal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

