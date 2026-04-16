'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { validateSellerOnboarding, getFieldError, type ValidationError } from '@/lib/validation';

function SellerOnboardingForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, refreshUser } = useAuthStore();

    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        businessName: '',
        description: '',
        location: '',
        phoneNumber: '',
        certifications: [] as string[],
    });
    const [newCertification, setNewCertification] = useState('');
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [certFile, setCertFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Check if user is already a seller
    useEffect(() => {
        const checkSellerStatus = async () => {
            if (user) {
                // Check if user already has a seller profile
                const { data: sellerProfile } = await supabase
                    .from('seller_profiles')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();

                if (sellerProfile) {
                    // Already a seller, redirect to dashboard
                    toast.success('Welcome back! Redirecting to your seller dashboard...');
                    router.push('/dashboard/seller');
                }
            }
        };

        checkSellerStatus();
    }, [user, router]);

    // Pre-fill email from URL if provided
    useEffect(() => {
        const email = searchParams.get('email');
        const businessName = searchParams.get('business_name');

        if (businessName) {
            setFormData(prev => ({ ...prev, businessName: decodeURIComponent(businessName) }));
        }
    }, [searchParams]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addCertification = async () => {
        console.log('Adding certification:', { newCertification, hasFile: !!certFile, userId: user?.id });
        if (!newCertification.trim()) return;

        let certString = newCertification.trim();

        if (certFile) {
            setIsUploading(true);
            try {
                // Sanitize filename
                const fileExt = certFile.name.split('.').pop();
                const fileName = `${Date.now()}-${certFile.name.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`;
                const filePath = `certifications/${user?.id || 'anon'}/${fileName}`;

                console.log('Uploading to:', filePath);

                // Add timeout to prevent hanging
                const uploadPromise = supabase.storage
                    .from('merchant-assets')
                    .upload(filePath, certFile);

                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Upload timed out after 30 seconds')), 30000)
                );

                const { data, error: uploadError } = await Promise.race([uploadPromise, timeoutPromise]) as any;

                console.log('Upload response:', { data, uploadError });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('merchant-assets')
                    .getPublicUrl(filePath);

                console.log('Public URL:', publicUrl);

                certString = `${certString}|${publicUrl}`;
            } catch (error: any) {
                console.error('Upload error details:', error);
                toast.error(`Upload failed: ${error.message}. You can add the certification without a file for now.`);
                setIsUploading(false);
                // Don't return - allow adding certification without file if upload fails
                // Just add the name without URL
            }
            setIsUploading(false);
        }

        if (!formData.certifications.includes(certString)) {
            setFormData(prev => ({
                ...prev,
                certifications: [...prev.certifications, certString]
            }));
            setNewCertification('');
            setCertFile(null);
            // Reset file input value
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        }
    };

    const removeCertification = (cert: string) => {
        setFormData(prev => ({
            ...prev,
            certifications: prev.certifications.filter(c => c !== cert)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error('Please sign in first');
            router.push('/login');
            return;
        }

        console.log('Form data at submission:', formData);
        const validation = validateSellerOnboarding(formData);
        if (!validation.isValid) {
            setErrors(validation.errors);
            console.log('Validation errors:', validation.errors);

            // Auto-navigate to error step
            const step1Fields = ['businessName', 'description'];
            const step2Fields = ['location', 'phoneNumber'];

            if (validation.errors.some(e => step1Fields.includes(e.field))) {
                setStep(1);
                toast.error('Please fix errors in Step 1');
            } else if (validation.errors.some(e => step2Fields.includes(e.field))) {
                setStep(2);
                toast.error('Please fix errors in Step 2');
            } else {
                toast.error('Please check the form for errors');
            }
            return;
        }
        setErrors([]);

        setIsLoading(true);

        try {
            console.log('Starting onboarding submission via API...');

            const response = await fetch('/api/seller-onboarding', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    businessName: formData.businessName,
                    description: formData.description,
                    location: formData.location,
                    certifications: formData.certifications,
                }),
            });

            const data = await response.json();
            console.log('API response:', data);

            if (!response.ok) {
                throw new Error(data.error || 'Failed to complete onboarding');
            }

            // Refresh user data with timeout - don't block redirect if it hangs
            console.log('Refreshing user...');
            try {
                await Promise.race([
                    refreshUser(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Refresh timeout')), 5000))
                ]);
                console.log('User refreshed successfully');
            } catch (refreshError) {
                console.log('User refresh timed out or failed, but profile was created successfully');
            }

            toast.success('Your seller account has been created! Pending admin verification.');
            router.push('/dashboard/seller');
        } catch (error: any) {
            console.error('Onboarding error:', error);
            toast.error(error.message || 'Failed to complete onboarding');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome, Future Merchant!</h2>
                    <p className="text-gray-600 mb-6">
                        You've been invited to join ShareSteak as a merchant. Please sign in or create an account to complete your setup.
                    </p>
                    <div className="space-y-3">
                        <a
                            href={`/login?redirect=/seller/onboarding`}
                            className="block w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
                        >
                            Sign In
                        </a>
                        <a
                            href={`/signup?redirect=/seller/onboarding`}
                            className="block w-full py-3 px-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Create Account
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Merchant Profile</h1>
                    <p className="text-gray-600">Tell us about your business to start selling on ShareSteak</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            1
                        </div>
                        <div className={`w-16 h-1 ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            2
                        </div>
                        <div className={`w-16 h-1 ${step >= 3 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            3
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Basic Info */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Business Information</h2>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Business Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.businessName}
                                        onChange={(e) => handleChange('businessName', e.target.value)}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${getFieldError(errors, 'businessName') ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                                        placeholder="Your Farm or Business Name"
                                        required
                                    />
                                    {getFieldError(errors, 'businessName') && (
                                        <p className="mt-1 text-sm text-red-500">{getFieldError(errors, 'businessName')}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        rows={4}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none ${getFieldError(errors, 'description') ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                                        placeholder="Tell customers about your business, your practices, and what makes your products special..."
                                    />
                                    {getFieldError(errors, 'description') && (
                                        <p className="mt-1 text-sm text-red-500">{getFieldError(errors, 'description')}</p>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
                                >
                                    Continue
                                </button>
                            </div>
                        )}

                        {/* Step 2: Location & Contact */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Location & Contact</h2>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Business Location
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => handleChange('location', e.target.value)}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${getFieldError(errors, 'location') ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                                        placeholder="City, State"
                                    />
                                    {getFieldError(errors, 'location') && (
                                        <p className="mt-1 text-sm text-red-500">{getFieldError(errors, 'location')}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => handleChange('phoneNumber', e.target.value)}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${getFieldError(errors, 'phoneNumber') ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                                        placeholder="(555) 123-4567"
                                    />
                                    {getFieldError(errors, 'phoneNumber') && (
                                        <p className="mt-1 text-sm text-red-500">{getFieldError(errors, 'phoneNumber')}</p>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStep(3)}
                                        className="flex-1 py-3 px-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Certifications */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Certifications (Optional)</h2>
                                <p className="text-gray-600 text-sm">Add any certifications your business holds (e.g., USDA Organic, Grass-Fed Certified, etc.)</p>

                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={newCertification}
                                        onChange={(e) => setNewCertification(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                        placeholder="Certification Name (e.g. USDA Organic)"
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            type="file"
                                            onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                                        />
                                        <button
                                            type="button"
                                            onClick={addCertification}
                                            disabled={!newCertification.trim() || isUploading}
                                            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isUploading ? 'Uploading...' : 'Add'}
                                        </button>
                                    </div>
                                    {certFile && <p className="text-xs text-green-600">Selected: {certFile.name}</p>}
                                </div>

                                {formData.certifications.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {formData.certifications.map((cert) => {
                                            const [name, url] = cert.split('|');
                                            return (
                                                <span
                                                    key={cert}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-md text-sm font-medium border border-green-200"
                                                >
                                                    <span className="flex flex-col sm:flex-row sm:items-center gap-1">
                                                        <span>{name}</span>
                                                        {url && (
                                                            <a
                                                                href={url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs text-green-600 underline hover:text-green-800 bg-white/50 px-1.5 py-0.5 rounded"
                                                            >
                                                                View Proof
                                                            </a>
                                                        )}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCertification(cert)}
                                                        className="text-green-600 hover:text-green-800 ml-1"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}

                                <div className="pt-4 border-t border-gray-100">
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                                        <div className="flex items-start gap-3">
                                            <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <div>
                                                <p className="text-sm font-medium text-amber-800">Verification Required</p>
                                                <p className="text-sm text-amber-700 mt-1">Your account will be reviewed by our admin team before you can start listing products. This usually takes 1-2 business days.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 py-3 px-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Setting up...
                                            </>
                                        ) : (
                                            'Complete Setup'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function SellerOnboardingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        }>
            <SellerOnboardingForm />
        </Suspense>
    );
}
