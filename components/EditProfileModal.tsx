import React, { useState, useEffect, MouseEvent, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../stores/useUserStore';
import { usePortfolioStore } from '../stores/usePortfolioStore';
import Button from './Button';
import { Camera, Save, Loader2, CheckCircle, AlertCircle, X, User, Briefcase, FileText, Link, Cog } from 'lucide-react';
import { uploadProfilePicture } from '../services/firebaseStorage';
import type { Integrations } from '../types';
interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}
type Tab = 'general' | 'socials' | 'integrations';
const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
    const { currentUser, updateUserProfile } = useUserStore();
    const portfolio = usePortfolioStore();
    const [activeTab, setActiveTab] = useState<Tab>('general');
    // Form State
    const [displayName, setDisplayName] = useState('');
    const [professionalTitle, setProfessionalTitle] = useState('');
    const [bio, setBio] = useState('');
    const [socialLinks, setSocialLinks] = useState({ github: '', linkedin: '', twitter: '' });
    const [integrations, setIntegrations] = useState<Integrations>({
        leetcode: { username: '', visible: true },
        github: { visible: true },
    });
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    // Reset state when modal opens
    useEffect(() => {
        if (isOpen && currentUser) {
            setDisplayName(currentUser.displayName || '');
            setPhotoPreview(currentUser.photoURL || null);
            setProfessionalTitle(portfolio.professionalTitle);
            setBio(portfolio.bio);
            setSocialLinks(portfolio.socialLinks);
            setIntegrations(portfolio.integrations);
            setPhotoFile(null);
            setError(null);
            setSuccess(null);
            setActiveTab('general');
        }
    }, [isOpen, currentUser, portfolio]);
    if (!currentUser) return null;
    const userAvatar = photoPreview || `https://i.pravatar.cc/128?u=${currentUser.uid}`;
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            let newPhotoURL = currentUser.photoURL;
            if (photoFile) {
                newPhotoURL = await uploadProfilePicture(photoFile, currentUser.uid);
            }
            // Update Firebase Auth and user store
            await updateUserProfile({
                displayName: displayName,
                photoURL: newPhotoURL ?? undefined,
            });
            // Update portfolio store
            portfolio.setProfileDetails({ professionalTitle, bio, socialLinks });
            portfolio.setIntegrations(integrations);
            setSuccess("Profile updated successfully!");
            setPhotoFile(null);
            setTimeout(() => {
                setSuccess(null);
                onClose();
            }, 1500);
        } catch (err) {
            console.error("Profile update failed:", err);
            setError("Failed to update profile. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    const TabButton = ({ id, label, icon }: {id: Tab, label: string, icon: React.ReactNode}) => (
        <button
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
                activeTab === id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
            }`}
        >
            {icon} {label}
        </button>
    );
    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center gap-6">
                            <div className="relative group flex-shrink-0">
                                <img src={userAvatar} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-border" />
                                <label htmlFor="photo-upload" className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera size={24} />
                                    <input type="file" id="photo-upload" accept="image/*" className="sr-only" onChange={handlePhotoChange} />
                                </label>
                            </div>
                            <InputField id="displayName" label="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} icon={<User />} />
                        </div>
                        <InputField id="professionalTitle" label="Professional Title" value={professionalTitle} onChange={(e) => setProfessionalTitle(e.target.value)} icon={<Briefcase />} placeholder="e.g., AI & Full-Stack Developer" />
                        <div>
                            <label htmlFor="bio" className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2"><FileText size={16}/> Bio</label>
                            <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="w-full bg-input rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring border border-border" placeholder="Tell everyone a bit about yourself..."/>
                        </div>
                    </div>
                );
            case 'socials':
                return (
                    <div className="space-y-4">
                        <InputField id="github" label="GitHub Profile URL" value={socialLinks.github} onChange={(e) => setSocialLinks(s => ({...s, github: e.target.value}))} icon={<Link/>} />
                        <InputField id="linkedin" label="LinkedIn Profile URL" value={socialLinks.linkedin} onChange={(e) => setSocialLinks(s => ({...s, linkedin: e.target.value}))} icon={<Link/>} />
                        <InputField id="twitter" label="Twitter Profile URL" value={socialLinks.twitter} onChange={(e) => setSocialLinks(s => ({...s, twitter: e.target.value}))} icon={<Link/>} />
                    </div>
                );
            case 'integrations':
                return (
                    <div className="space-y-6">
                        <InputField id="leetcodeUsername" label="LeetCode Username" value={integrations.leetcode.username} onChange={e => setIntegrations(i => ({...i, leetcode: {...i.leetcode, username: e.target.value}}))} icon={<Link/>} placeholder="e.g., awesome-coder-123" />
                         <div className="space-y-3">
                            <h3 className="text-sm font-medium text-foreground">Visibility Settings</h3>
                            <ToggleSwitch id="github-visible" label="Show GitHub Stats & Projects" checked={integrations.github.visible} onChange={e => setIntegrations(i => ({...i, github: {...i.github, visible: e.target.checked}}))} />
                            <ToggleSwitch id="leetcode-visible" label="Show LeetCode Stats" checked={integrations.leetcode.visible} onChange={e => setIntegrations(i => ({...i, leetcode: {...i.leetcode, visible: e.target.checked}}))} />
                        </div>
                    </div>
                );
            default: return null;
        }
    }
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    {...{
                        initial: { opacity: 0 },
                        animate: { opacity: 1 },
                        exit: { opacity: 0 },
                    } as any}
                    className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        {...{
                            initial: { opacity: 0, scale: 0.9, y: 50 },
                            animate: { opacity: 1, scale: 1, y: 0 },
                            exit: { opacity: 0, scale: 0.9, y: 50 },
                            transition: { duration: 0.3, ease: 'easeOut' },
                        } as any}
                        className="relative bg-card backdrop-blur-xl border border-border rounded-2xl shadow-2xl w-full max-w-2xl"
                        onClick={(e: MouseEvent) => e.stopPropagation()}
                    >
                        <header className="flex justify-between items-center p-4 border-b border-border">
                            <h2 className="text-2xl font-bold text-foreground">Edit Portfolio</h2>
                            <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground"><X size={24} /></button>
                        </header>
                        <form onSubmit={handleSubmit}>
                            <div className="p-6">
                                <div className="flex items-center gap-2 border-b border-border mb-6 -mt-2 pb-4">
                                    <TabButton id="general" label="General" icon={<User size={16}/>} />
                                    <TabButton id="socials" label="Socials" icon={<Link size={16}/>} />
                                    <TabButton id="integrations" label="Integrations" icon={<Cog size={16}/>} />
                                </div>
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTab}
                                        {...{
                                            initial: { opacity: 0, y: 10 },
                                            animate: { opacity: 1, y: 0 },
                                            exit: { opacity: 0, y: -10 },
                                            transition: { duration: 0.2 },
                                        } as any}
                                    >
                                        {renderContent()}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                            <footer className="flex justify-end items-center gap-4 p-4 bg-muted/50 border-t border-border rounded-b-2xl">
                                <AnimatePresence>
                                    {error && <motion.p {...{ initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } as any} className="text-sm text-destructive flex items-center gap-2"><AlertCircle size={16} />{error}</motion.p>}
                                    {success && <motion.p {...{ initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } as any} className="text-sm text-success flex items-center gap-2"><CheckCircle size={16} />{success}</motion.p>}
                                </AnimatePresence>
                                <Button type="submit" disabled={isLoading} variant="primary">
                                    {isLoading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                                    Save Changes
                                </Button>
                            </footer>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
const InputField = ({ id, label, value, onChange, icon, ...props }: any) => (
    <div className="w-full">
        <label htmlFor={id} className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">{icon && React.cloneElement(icon, { size: 16 })} {label}</label>
        <input type="text" id={id} value={value} onChange={onChange} className="w-full bg-input rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring border border-border" {...props} />
    </div>
);
const ToggleSwitch = ({ id, label, checked, onChange }: any) => (
  <label htmlFor={id} className="flex items-center justify-between p-3 bg-input border border-border rounded-lg cursor-pointer">
    <span className="font-medium text-foreground">{label}</span>
    <div className="relative">
      <input type="checkbox" id={id} className="sr-only" checked={checked} onChange={onChange} />
      <div className={`block w-12 h-6 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-muted'}`}></div>
      <div className={`dot absolute left-1 top-1 bg-white dark:bg-foreground w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-6' : ''}`}></div>
    </div>
  </label>
);
export default EditProfileModal;