import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Brain,
  ArrowLeft,
  Loader2,
  Camera,
  Trash2,
  User,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Briefcase,
  Award,
  Code,
  Save,
  X,
  Shield,
  CheckCircle2,
  Upload,
  Edit2,
  Settings,
  Star,
  Target
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '@/services/firebaseService';
import { uploadProfilePhoto, deleteProfilePhoto } from '@/services/firebaseService';
import { toast } from '@/components/ui/use-toast';
import { UserProfile } from '@/types/interview';

const EXPERIENCE_LEVELS = ['Undergraduate', 'Graduate', 'Entry-level', 'Mid-level', 'Senior', 'Executive'];

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tempPhotoFile, setTempPhotoFile] = useState<File | null>(null);
  const [tempPhotoPreview, setTempPhotoPreview] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    about: '',
    description: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
    skills: '',
    avatar: '',
  });

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    try {
      const profileData = await getUserProfile(user.id);
      if (profileData) {
        setProfile(profileData);
        setFormData({
          name: profileData.name || '',
          role: profileData.role || '',
          about: profileData.about || '',
          description: profileData.description || '',
          phone: profileData.phone || '',
          location: profileData.location || '',
          linkedin: profileData.linkedin || '',
          github: profileData.github || '',
          portfolio: profileData.portfolio || '',
          skills: profileData.skills || '',
          avatar: profileData.avatar || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({ title: 'Error', description: 'Failed to load profile', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Error', description: 'File size must be less than 5MB', variant: 'destructive' });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Please select a valid image file', variant: 'destructive' });
      return;
    }

    setTempPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setTempPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadPhoto = async () => {
    if (!tempPhotoFile || !user) return;

    setIsUploadingPhoto(true);
    try {
      console.log('=== Starting Photo Upload ===');
      console.log('User ID:', user.id);
      console.log('File:', tempPhotoFile.name, 'Size:', tempPhotoFile.size);

      const photoUrl = await uploadProfilePhoto(user.id, tempPhotoFile);

      console.log('=== Upload Complete ===');
      console.log('Returned URL:', photoUrl);
      console.log('URL is empty?', !photoUrl || photoUrl.trim() === '');

      setProfile(prev => prev ? { ...prev, avatar: photoUrl } : null);
      setFormData(prev => ({ ...prev, avatar: photoUrl }));
      setTempPhotoFile(null);
      setTempPhotoPreview(null);
      toast({ title: 'Success', description: 'Profile photo updated successfully' });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({ title: 'Error', description: 'Failed to upload photo. Check console for details.', variant: 'destructive' });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!user || !profile?.avatar || !profile.avatar.trim()) return;

    setIsUploadingPhoto(true);
    try {
      await deleteProfilePhoto(user.id);
      setProfile(prev => prev ? { ...prev, avatar: '' } : null);
      setShowDeleteConfirm(false);
      toast({ title: 'Success', description: 'Profile photo deleted' });
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast({ title: 'Error', description: 'Failed to delete photo', variant: 'destructive' });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await updateUserProfile(user.id, {
        ...formData,
      });
      setProfile(prev => prev ? { ...prev, ...formData } : null);
      toast({ title: 'Success', description: 'Profile updated successfully' });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({ title: 'Error', description: 'Failed to save profile', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex flex-col items-center justify-center">
        <div className="relative mb-8">
          <div className="w-28 h-28 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse">
            <div className="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center">
              <User className="h-12 w-12 text-white" />
            </div>
          </div>
          <div className="absolute inset-0 w-28 h-28 border-4 border-transparent border-t-white border-r-white rounded-2xl animate-spin"></div>
        </div>
        <p className="text-gray-400 text-lg">Loading your profile...</p>
        <div className="mt-6 w-64">
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-[loading_2s_ease-in-out_infinite]"></div>
          </div>
        </div>
        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  const displayAvatar = tempPhotoPreview || (profile?.avatar && profile.avatar.trim() ? profile.avatar : null);
  const displayName = formData.name.split(' ')[0] || 'U';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-500">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/10 dark:bg-purple-900/5 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center  space-x-3">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                  PrepBot
                </span>
              </Link>
            </div>
            <div className="hidden md:flex items-end space-x-6 ml-8">
              <Link to="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                Dashboard
              </Link>
              <Link to="/setup" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                Interviews
              </Link>
              {/* <Link to="/results" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                Results
              </Link> */}
              <Link to="/profile" className="text-blue-600 dark:text-blue-400 font-bold flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 px-8 py-12 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Profile <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">Settings</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your account information and preferences</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Photo & Summary */}
          <div className="space-y-8">
            {/* Profile Photo Card */}
            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl overflow-hidden transition-all duration-300">
              <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="flex items-center text-xl text-gray-900 dark:text-gray-100">
                  <User className="h-6 w-6 mr-3 text-blue-600 dark:text-blue-400" />
                  Profile Photo
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="flex flex-col items-center">
                  <div className="relative mb-8">
                    <Avatar className="h-40 w-40 border-4 border-white dark:border-gray-800 shadow-xl">
                      <AvatarImage src={displayAvatar} alt={formData.name} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-4xl font-bold">
                        {displayName.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {tempPhotoPreview && (
                      <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>

                  {!tempPhotoFile ? (
                    <div className="space-y-4 w-full">
                      <div className="space-y-2">
                        <label className="block">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                            disabled={isUploadingPhoto}
                          />
                          <Button
                            variant="outline"
                            className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300 py-6 transition-all"
                          >
                            <Camera className="h-5 w-5 mr-3" />
                            {profile?.avatar && profile.avatar.trim() ? 'Change Photo' : 'Upload Photo'}
                          </Button>
                        </label>
                        <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                          JPG, PNG, or GIF • Max 5MB
                        </p>
                      </div>

                      {profile?.avatar && profile.avatar.trim() && (
                        <Button
                          variant="ghost"
                          onClick={() => setShowDeleteConfirm(true)}
                          disabled={isUploadingPhoto}
                          className="w-full text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="h-5 w-5 mr-2" />
                          Delete Current Photo
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4 w-full">
                      <div className="text-center mb-4">
                        <p className="font-bold text-gray-900 dark:text-gray-100 mb-2">Preview</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Ready to upload your new profile photo</p>
                      </div>
                      <div className="flex space-x-3">
                        <Button
                          onClick={handleUploadPhoto}
                          disabled={isUploadingPhoto}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/20"
                        >
                          {isUploadingPhoto ? (
                            <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                          ) : (
                            <Upload className="h-5 w-5 mr-3" />
                          )}
                          Upload
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setTempPhotoFile(null);
                            setTempPhotoPreview(null);
                          }}
                          disabled={isUploadingPhoto}
                          className="flex-1 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <X className="h-5 w-5 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Summary */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                  <Shield className="h-6 w-6 mr-3 text-blue-600 dark:text-blue-400" />
                  Account Summary
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/80 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-400">Member Since</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">2024</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/80 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-400">Interviews</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">12</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/80 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-400">Average Score</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">87%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/80 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-400">Completion</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">95%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Profile Information */}
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl overflow-hidden transition-all duration-300">
              <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-2xl text-gray-900 dark:text-gray-100">
                    <Edit2 className="h-7 w-7 mr-3 text-blue-600 dark:text-blue-400" />
                    Edit Profile Information
                  </CardTitle>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Star className="h-4 w-4 mr-1 text-amber-500" />
                    <span>All fields are optional</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                      Full Name
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="John Doe"
                      className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* Role/Experience Level */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center">
                      <Briefcase className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                      Experience Level
                    </label>
                    <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                      <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500">
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-900 dark:border-gray-800">
                        {EXPERIENCE_LEVELS.map((level) => (
                          <SelectItem key={level} value={level} className="dark:text-gray-200 dark:focus:bg-gray-800">
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Skills */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center">
                      <Code className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                      Skills
                    </label>
                    <Input
                      value={formData.skills}
                      onChange={(e) => handleInputChange('skills', e.target.value)}
                      placeholder="JavaScript, React, Python, Node.js, AWS, Docker..."
                      className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* About */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center">
                      <Award className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                      Professional Summary
                    </label>
                    <Textarea
                      value={formData.about}
                      onChange={(e) => handleInputChange('about', e.target.value)}
                      placeholder="Briefly describe your professional background and career objectives..."
                      className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500 min-h-32 resize-none"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center">
                      <Target className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                      Personal Description
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Tell us about your interests, passions, and what drives you..."
                      className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500 min-h-32 resize-none"
                    />
                  </div>

                  {/* Contact Information Section */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center mt-6">
                      <Mail className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                      Contact Information
                    </h3>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                      Phone Number
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      type="tel"
                      className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                      Location / City
                    </label>
                    <Input
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="San Francisco, CA"
                      className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* Social Links Section */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center mt-6">
                      <Globe className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                      Social Links
                    </h3>
                  </div>

                  {/* LinkedIn */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center">
                      <Linkedin className="h-4 w-4 mr-2 text-blue-600" />
                      LinkedIn
                    </label>
                    <Input
                      value={formData.linkedin}
                      onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      placeholder="linkedin.com/in/username"
                      type="url"
                      className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* GitHub */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center">
                      <Github className="h-4 w-4 mr-2 text-gray-800 dark:text-gray-200" />
                      GitHub
                    </label>
                    <Input
                      value={formData.github}
                      onChange={(e) => handleInputChange('github', e.target.value)}
                      placeholder="github.com/username"
                      type="url"
                      className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* Portfolio */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-purple-600" />
                      Portfolio / Website
                    </label>
                    <Input
                      value={formData.portfolio}
                      onChange={(e) => handleInputChange('portfolio', e.target.value)}
                      placeholder="https://yourportfolio.com"
                      type="url"
                      className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    {isSaving ? (
                      <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    ) : (
                      <Save className="h-5 w-5 mr-3" />
                    )}
                    Save All Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => loadProfile()}
                    disabled={isSaving}
                    className="flex-1 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 py-6 text-lg rounded-xl"
                  >
                    <X className="h-5 w-5 mr-3" />
                    Discard Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
          <div className="p-2">
            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Trash2 className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
              Delete Profile Photo?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-600 dark:text-gray-400 mt-4">
              Are you sure you want to delete your profile photo?
              This action cannot be undone.
            </AlertDialogDescription>
            <div className="flex gap-4 justify-center mt-8">
              <AlertDialogCancel className="border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-xl transition-colors">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePhoto}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 rounded-xl"
              >
                Delete Photo
              </AlertDialogAction>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default Profile;
