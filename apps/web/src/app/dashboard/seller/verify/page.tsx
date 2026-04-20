'use client';

import React, { useState } from 'react';
import { 
  Upload, 
  CheckCircle, 
  FileText, 
  Info, 
  Lock, 
  ChevronRight,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function VerificationCenter() {
  const [status, setStatus] = useState<'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED'>('NOT_STARTED');
  const [isUploading, setIsUploading] = useState(false);
  const [docs, setDocs] = useState([]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocs(prev => [...prev, ...files.map(f => f.name)]);
  };

  const submitVerification = async () => {
    setIsUploading(true);
    try {
      const response = await fetch('/api/seller/verify', {
        method: 'POST',
 same: 'manual',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          documents: docs.map(name => `https://storage.sharestake.com/kyc/${name}`),
          status: 'PENDING' 
        }),
      });

      if (response.ok) {
        setStatus('PENDING');
      }
    } catch (e) {
      console.error("Submission failed", e);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheckIcon size={32} />
            <h2 className="text-2xl font-bold">Seller Verification Center</h2>
          </div>
          <p className="text-indigo-100 max-w-2xl">
            Upgrade your account to unlock higher group value limits, a "Verified" badge, and priority placement in the marketplace.
          </p>
        </div>

        <div className="p-8">
          {/* Trust Tier Progress */}
          <div className="flex justify-between items-center mb-12 relative">
            <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-100 -z-10"></div>
            {['BASIC', 'VERIFIED', 'PLATINUM'].map((tier, i) => (
              <div key={tier} className="flex flex-col items-center gap-2">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  (tier === 'BASIC') || (status === 'APPROVED' && tier === 'VERIFIED') 
                  ? 'bg-indigo-600 text-white shadow-lg scale-110' 
                  : 'bg-slate-100 text-slate-400'
                }`}>
                  {i + 1}
                </div>
                <span className={`text-xs font-bold ${tier === 'BASIC' ? 'text-indigo-600' : 'text-slate-400'}`}>{tier}</span>
              </div>
            ))}
          </div>

          {status === 'PENDING' ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <Loader2 className="animate-spin" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Documents Under Review</h3>
              <p className="text-slate-500 mt-2">Our team is verifying your credentials. This usually takes 24-48 hours.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Upload Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Upload size={20} className="text-indigo-600" />
                  Submit Documentation
                </h3>
                
                <div className="space-y-4">
                  <VerificationInput 
                    label="Government ID" 
                    description="Passport or Driver's License" 
                    icon={<FileText size={18} />} 
                  />
                  <VerificationInput 
                    label="Business License" 
                    description="BN or Trade Registration" 
                    icon={<FileText size={18} />} 
                  />
                  <VerificationInput 
                    label="Health Permit" 
                    description="Food Safety Certification" 
                    icon={<FileText size={18} />} 
                  />
                </div>

                <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <p className="text-xs text-slate-500 text-center">
                    Uploaded: {docs.length} files. Please ensure all documents are clear and legible.
                  </p>
                </div>

                <button 
                  onClick={submitVerification}
                  disabled={docs.length === 0 || isUploading}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUploading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                  Submit for Verification
                </button>
              </div>

              {/* Info Section */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Info size={20} className="text-indigo-600" />
                  Verification Benefits
                </h3>
                <ul className="space-y-4">
                  <BenefitItem 
                    title="Unlimited Group Value" 
                    desc="Remove the $1,000 cap on group-buy creation." 
                  />
                  <BenefitItem 
                    title="Verified Badge" 
                    desc="Gain instant trust with buyers in the marketplace." 
                  />
                  <BenefitItem 
                    title="Priority Placement"
                    desc="Appear higher in the 'Deal Finder' search results." 
                  />
                </ul>
                <div className="mt-8 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <div className="flex gap-3">
                    <Lock size={18} className="text-indigo-600 shrink-0" />
                    <p className="text-xs text-indigo-700 leading-relaxed">
                      Your documents are encrypted and only accessible by the ShareStake admin team. We never share your private data.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VerificationInput({ label, description, icon }: any) {
  const [file, setFile] = useState<string | null>(null);
  
  return (
    <div className="group relative">
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 transition-all cursor-pointer relative">
        <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-indigo-50 transition-colors">
          {icon}
        </div>
        <input 
          type="file" 
          className="absolute inset-0 opacity-0 cursor-pointer" 
          onChange={(e) => setFile(e.target.files?.[0]?.name || null)}
        />
        <span className="text-sm text-slate-500 truncate">
          {file || description}
        </span>
        {file && <CheckCircle size={16} className="text-emerald-500 ml-auto" />}
      </div>
    </div>
  );
}

function BenefitItem({ title, desc }: any) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 h-2 w-2 rounded-full bg-indigo-600 shrink-0" />
      <div>
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

function ShieldCheckIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
