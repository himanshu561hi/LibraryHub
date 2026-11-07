import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Shield,
  Upload,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Copy,
  Check,
  Search,
  FileText,
  Home,
  GraduationCap,
  Sparkles,
  X,
  BookOpen,
  Lock,
} from 'lucide-react';
import client from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';

const EXAM_OPTIONS = [
  'UPSC Civil Services (CSE)',
  'BPSC / State PCS',
  'SSC CGL / CHSL / MTS',
  'Banking & Insurance (IBPS / SBI / RBI)',
  'Railways (RRB NTPC / Group D)',
  'NEET (Medical Entrance)',
  'JEE Mains / Advanced (Engineering)',
  'Defense & Police (NDA / CDS / AFCAT / SI)',
  'CA / CS / Commerce',
  'CUET / College & University Exams',
  'Board Exams (Class 10th / 12th)',
  'General Self-Study & Professional Reading',
  'Other',
];

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState('register'); // 'register' | 'status'

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    fatherName: '',
    emergencyContact: '',
    targetExam: 'UPSC Civil Services (CSE)',
    customExam: '',
    address: '',
  });

  const [aadharFront, setAadharFront] = useState(null); // base64 data url
  const [aadharBack, setAadharBack] = useState(null); // base64 data url
  const [studentPhoto, setStudentPhoto] = useState(null); // base64 data url
  const [aadharFrontName, setAadharFrontName] = useState('');
  const [aadharBackName, setAadharBackName] = useState('');
  const [studentPhotoName, setStudentPhotoName] = useState('');

  const [declarationAgreed, setDeclarationAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedApplication, setSubmittedApplication] = useState(null);
  const [copiedAppNum, setCopiedAppNum] = useState(false);

  // Status Checker State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchingStatus, setSearchingStatus] = useState(false);
  const [statusResult, setStatusResult] = useState(null);
  const [statusError, setStatusError] = useState('');

  // Hidden File Inputs
  const frontFileInputRef = useRef(null);
  const frontCameraInputRef = useRef(null);
  const backFileInputRef = useRef(null);
  const backCameraInputRef = useRef(null);
  const photoFileInputRef = useRef(null);
  const photoCameraInputRef = useRef(null);

  // Client-side image compression helper
  const processImageFile = (file, setImgUrl, setFileName) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WebP).');
      return;
    }

    setFileName(file.name);

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

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setImgUrl(compressedDataUrl);
      };
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim()) return setErrorMessage('Full Name is required');
    if (!formData.email.trim()) return setErrorMessage('Email Address is required');
    if (!formData.phone.trim()) return setErrorMessage('Mobile Number is required');
    if (!formData.fatherName.trim()) return setErrorMessage("Father's Name is required");
    if (!formData.emergencyContact.trim()) return setErrorMessage('Emergency Contact Number is required');
    if (!formData.address.trim()) return setErrorMessage('Residential Address is required');
    if (!studentPhoto) return setErrorMessage('Please take a selfie or upload your passport size photo');
    if (!aadharFront) return setErrorMessage('Please upload the Front side photo of your Aadhar Card');
    if (!aadharBack) return setErrorMessage('Please upload the Back side photo of your Aadhar Card');
    if (!declarationAgreed) return setErrorMessage('Please agree to the confirmation declaration');

    const finalExam =
      formData.targetExam === 'Other'
        ? formData.customExam.trim() || 'General Study'
        : formData.targetExam;

    try {
      setSubmitting(true);
      const res = await client.post(API_ENDPOINTS.PUBLIC.REGISTER, {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        fatherName: formData.fatherName.trim(),
        emergencyContact: formData.emergencyContact.trim(),
        targetExam: finalExam,
        address: formData.address.trim(),
        photo: studentPhoto,
        aadharFront,
        aadharBack,
      });

      if (res && res.success) {
        setSubmittedApplication(res.data);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Registration failed:', err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Registration submission failed. Please try again or visit the library desk.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyApplicationNumber = () => {
    if (submittedApplication?.applicationNumber) {
      navigator.clipboard.writeText(submittedApplication.applicationNumber);
      setCopiedAppNum(true);
      setTimeout(() => setCopiedAppNum(false), 2000);
    }
  };

  const handleSearchStatus = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setStatusError('');
    setStatusResult(null);

    try {
      setSearchingStatus(true);
      const res = await client.get(API_ENDPOINTS.PUBLIC.APPLICATION_STATUS(searchQuery.trim()));
      if (res && res.success) {
        setStatusResult(res.data);
      }
    } catch (err) {
      setStatusError(
        err.response?.data?.message || 'No application found with this email or reference number.'
      );
    } finally {
      setSearchingStatus(false);
    }
  };

  return (
    <div className="py-10 sm:py-14 bg-gradient-to-b from-brand-surface to-brand-surface-muted min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header & Navigation Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold-50 border border-brand-gold-200 text-brand-gold-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold-600" />
            <span>Official Admission & Member Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-brand-navy-950 tracking-tight font-display">
            Join Library Hub Nawalpur
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-brand-navy-600 max-w-xl mx-auto leading-relaxed">
            Fill out the member registration form and securely upload your Aadhar Card. Once approved by the administration, you will receive an email and your student portal will be activated.
          </p>

          {/* Toggle Tab Bar: Register vs Check Status */}
          <div className="mt-6 inline-flex p-1 rounded-xl bg-white border border-brand-surface-border shadow-soft-sm">
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setSubmittedApplication(null);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'register'
                  ? 'bg-brand-navy-950 text-white shadow-soft-sm'
                  : 'text-brand-navy-600 hover:text-brand-navy-950'
              }`}
            >
              New Member Admission
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('status')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'status'
                  ? 'bg-brand-navy-950 text-white shadow-soft-sm'
                  : 'text-brand-navy-600 hover:text-brand-navy-950'
              }`}
            >
              Check Application Status
            </button>
          </div>
        </div>

        {/* ================= VIEW 1: SUCCESS CONFIRMATION ================= */}
        {submittedApplication && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 sm:p-10 shadow-soft border border-brand-surface-border text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-brand-gold-50 border border-brand-gold-200 text-brand-gold-700 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-9 h-9" />
            </div>

            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wider mb-2">
              Pending Admin Verification
            </span>

            <h2 className="text-xl sm:text-2xl font-black text-brand-navy-950">
              Thank You for Choosing Library Hub!
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-brand-navy-600 max-w-lg mx-auto">
              Welcome, <strong>{submittedApplication.name}</strong>. Aapka registration form aur identity documents Library Hub Nawalpur desk ko securely prapt ho chuke hain.
            </p>

            {submittedApplication.photoUrl && (
              <div className="mt-4 mb-2 flex justify-center">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-brand-gold-500 shadow-md">
                  <img src={submittedApplication.photoUrl} alt="Applicant" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {/* Application Reference Number Card */}
            <div className="mt-5 max-w-sm mx-auto p-4 rounded-2xl bg-brand-surface border border-brand-surface-border">
              <span className="block text-[11px] font-bold text-brand-navy-500 uppercase tracking-wider">
                Application Reference ID
              </span>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="font-mono text-base sm:text-lg font-black text-brand-navy-950">
                  {submittedApplication.applicationNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyApplicationNumber}
                  className="p-1.5 rounded-lg hover:bg-white text-brand-navy-600 hover:text-brand-navy-950 transition-colors"
                  title="Copy Reference ID"
                >
                  {copiedAppNum ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Verification & Access Notice Banner */}
            <div className="mt-6 max-w-lg mx-auto p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-950">
              <div className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-900">
                    Dashboard Access Notice: Locked Until Admin Approval
                  </p>
                  <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                    Suraksha aur seat allotment verification ke liye, <strong>dashboard access tab tak locked rahega jab tak Library Administration aapka admission approve nahi kar deta</strong>.
                  </p>
                  <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                    Jaise hi admin aapka application verify karenge, aapke email (<strong>{submittedApplication.email}</strong>) par confirmation mail aayega jisme <strong>dashboard login link, daily attendance mark karne ka tarika (check-in / check-out), aur library rules</strong> ki poori jankari hogi.
                  </p>
                </div>
              </div>
            </div>

            {/* Steps Timeline Card */}
            <div className="mt-6 text-left max-w-md mx-auto p-5 rounded-2xl bg-brand-surface-muted/50 border border-brand-surface-border space-y-3.5 text-xs text-brand-navy-700">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-bold text-brand-navy-950">Document Review (In Progress)</p>
                  <p className="text-[11px] text-brand-navy-500 mt-0.5">
                    Administration aapka student photo aur Aadhar card verify kar rahi hai.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-navy-950 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-bold text-brand-navy-950">Approval & Instruction Email</p>
                  <p className="text-[11px] text-brand-navy-500 mt-0.5">
                    Approve hote hi aapko congratulation email aur complete guide prapt hogi.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-gold-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-bold text-brand-navy-950">Attendance & Study Access</p>
                  <p className="text-[11px] text-brand-navy-500 mt-0.5">
                    Mail milne ke baad aap Google account se login karke Daily Attendance Code ke saath check-in kar sakenge.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions: No login access until verified */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery(submittedApplication.applicationNumber);
                  setActiveTab('status');
                  setSubmittedApplication(null);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brand-navy-950 hover:bg-brand-navy-900 text-white text-xs font-bold transition-all shadow-soft-sm"
              >
                <Search className="w-4 h-4 text-brand-gold-400" />
                <span>Track Application Status</span>
              </button>
              <Link
                to="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white hover:bg-brand-surface-muted text-brand-navy-800 text-xs font-bold border border-brand-surface-border transition-all"
              >
                <span>Return to Home</span>
              </Link>
            </div>
          </motion.div>
        )}

        {/* ================= VIEW 2: APPLICATION STATUS CHECKER ================= */}
        {!submittedApplication && activeTab === 'status' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-brand-surface-border max-w-xl mx-auto"
          >
            <h2 className="text-base sm:text-lg font-bold text-brand-navy-950 mb-1 flex items-center gap-2">
              <Search className="w-5 h-5 text-brand-gold-600" />
              <span>Track Your Admission Status</span>
            </h2>
            <p className="text-xs text-brand-navy-600 mb-6">
              Enter your registered Email Address or Application Reference ID (e.g., APP-20261106-1234) below.
            </p>

            <form onSubmit={handleSearchStatus} className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. rahul@gmail.com or APP-20261106-5432"
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-brand-surface-border text-brand-navy-950 font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                />
              </div>

              {statusError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{statusError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={searchingStatus}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-navy-950 hover:bg-brand-navy-900 text-white text-xs font-bold transition-all shadow-soft-sm disabled:opacity-50"
              >
                {searchingStatus ? (
                  <Loader2 className="w-4 h-4 animate-spin text-brand-gold-400" />
                ) : (
                  <Search className="w-4 h-4 text-brand-gold-400" />
                )}
                <span>Check Status</span>
              </button>
            </form>

            {statusResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 sm:p-5 rounded-2xl bg-brand-surface border border-brand-surface-border text-xs space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-brand-surface-border">
                  <span className="font-bold text-brand-navy-950">{statusResult.name}</span>
                  <span
                    className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                      statusResult.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : statusResult.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {statusResult.status === 'APPROVED'
                      ? 'Approved & Live'
                      : statusResult.status === 'REJECTED'
                      ? 'Needs Attention'
                      : 'Under Review'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-brand-navy-600">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand-navy-400 block">Ref ID</span>
                    <span className="font-mono font-bold text-brand-navy-900">{statusResult.applicationNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand-navy-400 block">Applied On</span>
                    <span className="font-semibold text-brand-navy-900">
                      {new Date(statusResult.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {statusResult.status === 'APPROVED' && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs">
                    <p className="font-bold">Your student account has been approved!</p>
                    <p className="text-[11px] mt-0.5">
                      You can now login with Google at the Student Login page.
                    </p>
                    <Link
                      to="/login"
                      className="mt-2 inline-flex items-center gap-1 font-bold underline text-emerald-800"
                    >
                      Go to Student Login →
                    </Link>
                  </div>
                )}

                {statusResult.status === 'REJECTED' && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs">
                    <p className="font-bold">Application Notice:</p>
                    <p className="text-[11px] mt-0.5">
                      {statusResult.rejectionReason || 'Please visit the front desk to correct your registration.'}
                    </p>
                  </div>
                )}

                {statusResult.status === 'PENDING' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                    <p className="font-bold">Pending Review</p>
                    <p className="text-[11px] mt-0.5">
                      Your documents are waiting for review by the library administrator. An email will be sent once approved.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ================= VIEW 3: REGISTRATION FORM ================= */}
        {!submittedApplication && activeTab === 'register' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 sm:p-10 shadow-soft border border-brand-surface-border"
          >
            <form onSubmit={handleSubmitRegistration} className="space-y-8">
              
              {/* SECTION 1: PERSONAL INFORMATION */}
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-brand-surface-border mb-5">
                  <div className="w-7 h-7 rounded-lg bg-brand-gold-50 border border-brand-gold-200 text-brand-gold-700 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-brand-navy-950">
                    Step 1: Student Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-brand-navy-800 uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-surface-border text-brand-navy-950 font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-brand-navy-800 uppercase tracking-wider mb-1.5">
                      Email Address (For Google Login) *
                    </label>
                    <input
                      type="email"
                      required
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. rahul@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-surface-border text-brand-navy-950 font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                    />
                    <span className="text-[11px] text-brand-navy-500 mt-1 block">
                      Use the Gmail account you will use for signing in.
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-brand-navy-800 uppercase tracking-wider mb-1.5">
                      Student Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      name="phone"
                      maxLength={10}
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="10-digit mobile number"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-surface-border text-brand-navy-950 font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-brand-navy-800 uppercase tracking-wider mb-1.5">
                      Father's / Guardian's Name *
                    </label>
                    <input
                      type="text"
                      required
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleInputChange}
                      placeholder="Father's full name"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-surface-border text-brand-navy-950 font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-brand-navy-800 uppercase tracking-wider mb-1.5">
                      Emergency Contact Number *
                    </label>
                    <input
                      type="tel"
                      required
                      name="emergencyContact"
                      maxLength={10}
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                      placeholder="Parent/Guardian 10-digit mobile"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-surface-border text-brand-navy-950 font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-brand-navy-800 uppercase tracking-wider mb-1.5">
                      Target Exam / Study Goal *
                    </label>
                    <select
                      name="targetExam"
                      value={formData.targetExam}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-surface-border text-brand-navy-950 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                    >
                      {EXAM_OPTIONS.map((exam) => (
                        <option key={exam} value={exam}>
                          {exam}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {formData.targetExam === 'Other' && (
                  <div className="mt-3 text-xs">
                    <label className="block font-bold text-brand-navy-800 uppercase tracking-wider mb-1">
                      Specify Target Exam / Course
                    </label>
                    <input
                      type="text"
                      name="customExam"
                      value={formData.customExam}
                      onChange={handleInputChange}
                      placeholder="e.g. State Judiciary / GATE / UGC NET"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-surface-border text-brand-navy-950 font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                    />
                  </div>
                )}

                <div className="mt-4 text-xs">
                  <label className="block font-bold text-brand-navy-800 uppercase tracking-wider mb-1.5">
                    Permanent / Residential Address *
                  </label>
                  <textarea
                    required
                    rows={2}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Village / Town, Landmark, Nawalpur / District, State, PIN Code"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-surface-border text-brand-navy-950 font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                  />
                </div>
              </div>

              {/* SECTION 2: STUDENT PHOTO & AADHAR CARD VERIFICATION (IMAGEKIT) */}
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-brand-surface-border mb-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-brand-navy-950">
                    Step 2: Student Photo & Aadhar Card Verification
                  </h2>
                </div>

                <p className="text-xs text-brand-navy-600 mb-5">
                  Click a live selfie/photo using your camera or upload a clear passport photo, along with front and back photos of your Aadhar Card. Uploaded securely to ImageKit CDN for official verification.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  
                  {/* STUDENT PASSPORT PHOTO / LIVE SELFIE */}
                  <div className="p-4 rounded-2xl border-2 border-dashed border-brand-surface-border hover:border-brand-gold-500 transition-colors bg-brand-surface-muted/30 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-brand-navy-950 uppercase tracking-wider flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-brand-gold-600" />
                          <span>Student Photo *</span>
                        </span>
                        {studentPhoto && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Check className="w-3 h-3" /> Ready
                          </span>
                        )}
                      </div>

                      {studentPhoto ? (
                        <div className="relative rounded-xl overflow-hidden border border-brand-surface-border bg-black/5 mx-auto max-w-[200px] aspect-square flex items-center justify-center">
                          <img
                            src={studentPhoto}
                            alt="Student Preview"
                            className="w-full h-full object-cover rounded-xl"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setStudentPhoto(null);
                              setStudentPhotoName('');
                            }}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 hover:bg-rose-600 hover:text-white text-brand-navy-800 transition-all shadow-md"
                            title="Remove photo"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="h-44 flex flex-col items-center justify-center text-center p-2">
                          <div className="w-16 h-16 rounded-full bg-brand-surface-muted border-2 border-dashed border-brand-navy-300 flex items-center justify-center mb-2 text-brand-navy-500">
                            <User className="w-8 h-8" />
                          </div>
                          <span className="text-xs font-semibold text-brand-navy-800">
                            Take a Live Photo or Upload Picture
                          </span>
                          <span className="text-[10px] text-brand-navy-500 mt-0.5">
                            Front-facing clear selfie or passport photo
                          </span>
                          
                          <div className="mt-3 flex items-center gap-2">
                            {/* Camera capture (Selfie / Front camera) */}
                            <button
                              type="button"
                              onClick={() => photoCameraInputRef.current?.click()}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-navy-950 hover:bg-brand-navy-900 text-white text-[11px] font-bold transition-all shadow-soft-sm"
                            >
                              <Camera className="w-3.5 h-3.5 text-brand-gold-400" />
                              <span>Click Photo</span>
                            </button>

                            {/* File picker */}
                            <button
                              type="button"
                              onClick={() => photoFileInputRef.current?.click()}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-brand-surface-muted text-brand-navy-800 text-[11px] font-bold border border-brand-surface-border transition-all"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Files</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Hidden inputs for Student Photo */}
                    <input
                      type="file"
                      ref={photoFileInputRef}
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      className="hidden"
                      onChange={(e) =>
                        processImageFile(e.target.files?.[0], setStudentPhoto, setStudentPhotoName)
                      }
                    />
                    <input
                      type="file"
                      ref={photoCameraInputRef}
                      accept="image/*"
                      capture="user"
                      className="hidden"
                      onChange={(e) =>
                        processImageFile(e.target.files?.[0], setStudentPhoto, setStudentPhotoName)
                      }
                    />
                  </div>
                  
                  {/* AADHAR FRONT */}
                  <div className="p-4 rounded-2xl border-2 border-dashed border-brand-surface-border hover:border-brand-gold-500 transition-colors bg-brand-surface-muted/30 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-brand-navy-950 uppercase tracking-wider flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-brand-gold-600" />
                          <span>Aadhar — Front *</span>
                        </span>
                        {aadharFront && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Check className="w-3 h-3" /> Ready
                          </span>
                        )}
                      </div>

                      {aadharFront ? (
                        <div className="relative rounded-xl overflow-hidden border border-brand-surface-border bg-black/5">
                          <img
                            src={aadharFront}
                            alt="Aadhar Front Preview"
                            className="w-full h-44 object-contain rounded-xl"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setAadharFront(null);
                              setAadharFrontName('');
                            }}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 hover:bg-rose-600 hover:text-white text-brand-navy-800 transition-all shadow-md"
                            title="Remove image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="h-44 flex flex-col items-center justify-center text-center p-2">
                          <Shield className="w-8 h-8 text-brand-navy-400 mb-2" />
                          <span className="text-xs font-semibold text-brand-navy-800">
                            Front photo with Aadhar number
                          </span>
                          
                          <div className="mt-3 flex items-center gap-2">
                            {/* Camera capture */}
                            <button
                              type="button"
                              onClick={() => frontCameraInputRef.current?.click()}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-navy-950 hover:bg-brand-navy-900 text-white text-[11px] font-bold transition-all shadow-soft-sm"
                            >
                              <Camera className="w-3.5 h-3.5 text-brand-gold-400" />
                              <span>Camera</span>
                            </button>

                            {/* File picker */}
                            <button
                              type="button"
                              onClick={() => frontFileInputRef.current?.click()}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-brand-surface-muted text-brand-navy-800 text-[11px] font-bold border border-brand-surface-border transition-all"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Files</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Hidden inputs for Front */}
                    <input
                      type="file"
                      ref={frontFileInputRef}
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      className="hidden"
                      onChange={(e) =>
                        processImageFile(e.target.files?.[0], setAadharFront, setAadharFrontName)
                      }
                    />
                    <input
                      type="file"
                      ref={frontCameraInputRef}
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) =>
                        processImageFile(e.target.files?.[0], setAadharFront, setAadharFrontName)
                      }
                    />
                  </div>

                  {/* AADHAR BACK */}
                  <div className="p-4 rounded-2xl border-2 border-dashed border-brand-surface-border hover:border-brand-gold-500 transition-colors bg-brand-surface-muted/30 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-brand-navy-950 uppercase tracking-wider flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-brand-gold-600" />
                          <span>Aadhar — Back *</span>
                        </span>
                        {aadharBack && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Check className="w-3 h-3" /> Ready
                          </span>
                        )}
                      </div>

                      {aadharBack ? (
                        <div className="relative rounded-xl overflow-hidden border border-brand-surface-border bg-black/5">
                          <img
                            src={aadharBack}
                            alt="Aadhar Back Preview"
                            className="w-full h-44 object-contain rounded-xl"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setAadharBack(null);
                              setAadharBackName('');
                            }}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 hover:bg-rose-600 hover:text-white text-brand-navy-800 transition-all shadow-md"
                            title="Remove image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="h-44 flex flex-col items-center justify-center text-center p-2">
                          <Shield className="w-8 h-8 text-brand-navy-400 mb-2" />
                          <span className="text-xs font-semibold text-brand-navy-800">
                            Back photo with address details
                          </span>
                          
                          <div className="mt-3 flex items-center gap-2">
                            {/* Camera capture */}
                            <button
                              type="button"
                              onClick={() => backCameraInputRef.current?.click()}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-navy-950 hover:bg-brand-navy-900 text-white text-[11px] font-bold transition-all shadow-soft-sm"
                            >
                              <Camera className="w-3.5 h-3.5 text-brand-gold-400" />
                              <span>Camera</span>
                            </button>

                            {/* File picker */}
                            <button
                              type="button"
                              onClick={() => backFileInputRef.current?.click()}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-brand-surface-muted text-brand-navy-800 text-[11px] font-bold border border-brand-surface-border transition-all"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Files</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Hidden inputs for Back */}
                    <input
                      type="file"
                      ref={backFileInputRef}
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      className="hidden"
                      onChange={(e) =>
                        processImageFile(e.target.files?.[0], setAadharBack, setAadharBackName)
                      }
                    />
                    <input
                      type="file"
                      ref={backCameraInputRef}
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) =>
                        processImageFile(e.target.files?.[0], setAadharBack, setAadharBackName)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* DECLARATION CHECKBOX */}
              <div className="p-4 rounded-2xl bg-brand-surface border border-brand-surface-border flex items-start gap-3">
                <input
                  type="checkbox"
                  id="declaration"
                  required
                  checked={declarationAgreed}
                  onChange={(e) => setDeclarationAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-brand-gold-600 focus:ring-brand-gold-500 border-brand-surface-border cursor-pointer"
                />
                <label htmlFor="declaration" className="text-xs text-brand-navy-700 leading-relaxed cursor-pointer">
                  I confirm that all personal details and Aadhar Card documents uploaded by me are accurate and genuine. I understand that admission approval is subject to admin verification, and my student dashboard will be activated only after acceptance.
                </label>
              </div>

              {/* ERROR ALERT */}
              {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[11px] text-brand-navy-500">
                  Already a registered member?{' '}
                  <Link to="/login" className="font-bold underline text-brand-navy-900">
                    Sign in to Student Dashboard →
                  </Link>
                </p>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-brand-navy-950 hover:bg-brand-navy-900 text-white text-xs font-bold transition-all shadow-soft disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-brand-gold-400" />
                      <span>Uploading to ImageKit & Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Member Registration</span>
                      <ArrowRight className="w-4 h-4 text-brand-gold-400" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}

