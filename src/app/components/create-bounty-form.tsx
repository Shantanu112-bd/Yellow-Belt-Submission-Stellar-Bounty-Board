// src/app/components/create-bounty-form.tsx
import { useState, useRef } from 'react';
import { useContract } from '../../hooks/useContract';
import { useWallet } from '../components/wallet-provider';
import { PlusCircle, AlertCircle, Upload, ChevronDown, Sparkles, X, File as FileIcon } from 'lucide-react';
import { TransactionStatus } from './transaction-status';

export function CreateBountyForm() {
    const { isConnected } = useWallet();
    const { createBounty, txStatus, txHash, isLoading, resetTxStatus } = useContract();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        reward: '',
        duration: '7',
        categories: [] as string[],
        difficulty: 'Medium',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => e.preventDefault();
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files) {
            handleFilesAdded(Array.from(e.dataTransfer.files));
        }
    };
    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFilesAdded(Array.from(e.target.files));
        }
    };
    const handleFilesAdded = (newFiles: File[]) => {
        setFiles(prev => {
            const combined = [...prev, ...newFiles];
            return combined.slice(0, 5); // Max 5 files
        });
    };
    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const toggleCategory = (cat: string) => {
        setFormData(prev => ({
            ...prev,
            categories: prev.categories.includes(cat)
                ? prev.categories.filter(c => c !== cat)
                : [...prev.categories, cat]
        }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.length < 10) {
            newErrors.title = 'Title must be at least 10 characters';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.length < 20) {
            newErrors.description = 'Description must be at least 20 characters';
        }

        const rewardNum = parseFloat(formData.reward);
        if (!formData.reward || isNaN(rewardNum)) {
            newErrors.reward = 'Reward amount is required';
        } else if (rewardNum < 1) {
            newErrors.reward = 'Minimum reward is 1 XLM';
        } else if (rewardNum > 10000) {
            newErrors.reward = 'Maximum reward is 10,000 XLM';
        }

        if (formData.categories.length === 0) {
            newErrors.categories = 'Please select at least one category';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isConnected) {
            setErrors({ form: 'Please connect your wallet first' });
            return;
        }

        if (!validateForm()) return;

        try {
            const hash = await createBounty(
                formData.title,
                formData.description,
                parseFloat(formData.reward),
                parseInt(formData.duration)
            );

            if (hash) {
                // Reset form on success
                setFormData({
                    title: '',
                    description: '',
                    reward: '',
                    duration: '7',
                    categories: [],
                    difficulty: 'Medium',
                });
                setErrors({});
            }
        } catch (error) {
            console.error('Form submission error:', error);
        }
    };

    return (
        <>
            <div className="bg-card rounded-2xl shadow-xl border border-border p-8 max-w-3xl mx-auto text-foreground">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <PlusCircle className="text-primary" size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold">Create Bounty</h2>
                        <p className="text-muted-foreground">Post a task and offer XLM rewards</p>
                    </div>
                </div>

                {!isConnected && (
                    <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg flex items-start gap-3">
                        <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="font-medium text-amber-900">Wallet Required</p>
                            <p className="text-sm text-amber-700">
                                Please connect your wallet to create a bounty
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Bounty Title
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition bg-transparent ${errors.title ? 'border-red-300' : 'border-border'
                                }`}
                            placeholder="e.g., Fix documentation typo in README"
                            maxLength={100}
                            disabled={isLoading}
                        />
                        <div className="flex justify-between mt-1">
                            {errors.title && (
                                <p className="text-sm text-red-600">{errors.title}</p>
                            )}
                            <p className="text-xs text-muted-foreground ml-auto">
                                {formData.title.length}/100
                            </p>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition resize-none bg-transparent ${errors.description ? 'border-red-300' : 'border-border'
                                }`}
                            rows={5}
                            placeholder="Provide detailed requirements, acceptance criteria, and any relevant links..."
                            maxLength={1000}
                            disabled={isLoading}
                        />
                        <div className="flex justify-between mt-1">
                            {errors.description && (
                                <p className="text-sm text-red-600">{errors.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground ml-auto">
                                {formData.description.length}/1000
                            </p>
                        </div>
                    </div>

                    {/* Reward & Duration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Reward (XLM)
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                                    💰
                                </span>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.reward}
                                    onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition bg-transparent ${errors.reward ? 'border-red-300' : 'border-border'
                                        }`}
                                    placeholder="10"
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.reward && (
                                <p className="text-sm text-red-600 mt-1">{errors.reward}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Duration
                            </label>
                            <select
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition bg-transparent"
                                disabled={isLoading}
                            >
                                <option value="3" className="bg-card">3 days</option>
                                <option value="7" className="bg-card">7 days</option>
                                <option value="14" className="bg-card">14 days</option>
                                <option value="30" className="bg-card">30 days</option>
                            </select>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="mt-10 pt-8 border-t border-border/50">
                        <h3 className="text-xl font-bold mb-6">Details</h3>

                        {/* Categories */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold mb-3">
                                Categories <span className="text-red-500">*</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {['Dev', 'Design', 'Writing', 'Marketing', 'Other'].map(cat => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => toggleCategory(cat)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${formData.categories.includes(cat)
                                            ? 'bg-transparent border-indigo-500 text-indigo-500 dark:text-indigo-400'
                                            : 'bg-transparent border-border hover:border-muted-foreground/50'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            {errors.categories && (
                                <p className="text-sm text-red-500 mt-3 flex items-center gap-1.5">
                                    <AlertCircle size={14} /> {errors.categories}
                                </p>
                            )}
                        </div>

                        {/* Difficulty Level */}
                        <div className="mb-8">
                            <label className="block text-sm font-semibold mb-3">
                                Difficulty Level
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                                {['Easy', 'Medium', 'Hard'].map(level => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, difficulty: level })}
                                        className={`py-3 rounded-xl font-medium border-2 transition-colors ${formData.difficulty === level
                                            ? 'bg-orange-500/5 dark:bg-orange-900/20 border-orange-500 text-orange-600 dark:text-orange-400'
                                            : 'bg-transparent border-border hover:border-muted-foreground/50 text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Attachments */}
                        <div className="mb-8">
                            <label className="block text-sm font-semibold mb-3">
                                Attachments (Optional)
                            </label>
                            <input
                                type="file"
                                multiple
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileInput}
                                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                            />
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                className="border border-dashed border-border hover:border-primary/50 hover:bg-muted/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer group bg-muted/10 mb-4"
                            >
                                <Upload className="text-muted-foreground mb-3 group-hover:text-primary transition-colors" size={28} />
                                <p className="font-bold mb-1 group-hover:text-primary transition-colors">Drop files here or click to upload</p>
                                <p className="text-sm text-muted-foreground">PDF, DOC, TXT, PNG, JPG (Max 5 files)</p>
                            </div>

                            {/* File List */}
                            {files.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    {files.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-muted/20 border border-border rounded-xl">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                                                    <FileIcon size={16} className="text-primary" />
                                                </div>
                                                <div className="flex flex-col overflow-hidden text-left">
                                                    <span className="text-sm font-medium truncate">{file.name}</span>
                                                    <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                className="p-2 hover:bg-red-500/10 hover:text-red-500 text-muted-foreground rounded-lg transition-colors shrink-0 cursor-pointer"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preview Accordion */}
                    <div className="pt-6 border-t border-border/50">
                        <button type="button" className="w-full flex items-center justify-between font-bold text-xl py-2 group">
                            Preview
                            <ChevronDown className="text-muted-foreground group-hover:text-foreground transition-colors" size={24} />
                        </button>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                        <button type="button" className="font-bold hover:text-muted-foreground transition-colors px-4 py-2 w-full sm:w-auto text-left">
                            Save Draft
                        </button>

                        <div className="w-full sm:w-auto">
                            {errors.form && (
                                <p className="text-sm text-red-600 text-right mb-2">{errors.form}</p>
                            )}
                            <button
                                type="submit"
                                disabled={!isConnected || isLoading}
                                className="w-full sm:w-auto bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={18} />
                                        Create Bounty
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {(txStatus !== 'idle') && (
                <TransactionStatus
                    status={txStatus}
                    hash={txHash}
                    onClose={resetTxStatus}
                />
            )}
        </>
    );
}
