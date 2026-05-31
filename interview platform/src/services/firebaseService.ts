import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { signInWithPopup } from 'firebase/auth';
import { db, auth, googleProvider } from '@/lib/firebase';
import { InterviewSession, UserProfile, JobRole, Difficulty, RoundType, InterviewQuestion, QuestionFeedback, HiringPost, JobApplication, Notification } from '@/types/interview';

// User operations
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

export async function createUserProfile(userId: string, email: string, name: string): Promise<UserProfile> {
  const userRef = doc(db, 'users', userId);
  const profile: Omit<UserProfile, 'createdAt'> & { createdAt: any; role: string } = {
    id: userId,
    email,
    name,
    role: 'candidate',
    totalInterviews: 0,
    averageScore: 0,
    streakDays: 0,
    badges: [],
    createdAt: serverTimestamp(),
  };

  await setDoc(userRef, profile);

  return {
    ...profile,
    createdAt: new Date(),
  };
}

export async function createHRUserProfile(
  userId: string,
  email: string,
  name: string,
  companyName: string,
  companySize: string,
  hrRole: string,
  companyWebsite?: string,
  linkedin?: string,
  password?: string
): Promise<UserProfile> {
  const hrRef = doc(db, 'hr_profiles', userId);
  
  const hrProfile = {
    id: userId,
    email,
    name,
    password: password || null,
    role: 'HR',
    companyName,
    companySize,
    hrRole,
    companyWebsite: companyWebsite || null,
    linkedin: linkedin || null,
    totalInterviews: 0,
    averageScore: 0,
    streakDays: 0,
    badges: [],
    createdAt: serverTimestamp(),
  };

  await setDoc(hrRef, hrProfile);

  return {
    ...hrProfile,
    createdAt: new Date(),
  } as UserProfile;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  // Check users collection first (candidates)
  const userRef = doc(db, 'users', userId);
  const snapshot = await getDoc(userRef);
  
  if (snapshot.exists()) {
    const userData = snapshot.data();
    console.log('Found candidate profile:', userData);
    return {
      ...userData,
      id: snapshot.id,
      createdAt: userData.createdAt instanceof Timestamp ? userData.createdAt.toDate() : new Date(userData.createdAt),
    } as UserProfile;
  }

  // If not found in users, check hr_profiles collection
  const hrRef = doc(db, 'hr_profiles', userId);
  const hrSnapshot = await getDoc(hrRef);
  
  if (hrSnapshot.exists()) {
    const hrData = hrSnapshot.data();
    console.log('Found HR profile:', hrData);
    return {
      ...hrData,
      id: hrSnapshot.id,
      createdAt: hrData.createdAt instanceof Timestamp ? hrData.createdAt.toDate() : new Date(hrData.createdAt),
    } as UserProfile;
  }
  
  return null;
}

// Hiring Post operations
export async function createHiringPost(postData: Omit<HiringPost, 'id' | 'createdAt' | 'status'>): Promise<HiringPost> {
  const data = {
    ...postData,
    status: 'active',
    createdAt: serverTimestamp(),
  };
  
  const docRef = await addDoc(collection(db, 'hiring_posts'), data);
  
  return {
    id: docRef.id,
    ...data,
    status: 'active',
    createdAt: new Date(),
  } as HiringPost;
}

export async function deleteHiringPost(postId: string): Promise<void> {
  const postRef = doc(db, 'hiring_posts', postId);
  await deleteDoc(postRef);
}

export async function getHRHiringPosts(hrId: string): Promise<HiringPost[]> {
  const q = query(
    collection(db, 'hiring_posts'),
    where('hrId', '==', hrId)
  );
  
  const snapshot = await getDocs(q);
  
  const posts = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      requirements: [],
      responsibilities: [],
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
    } as HiringPost;
  });

  // Sort manually to avoid composite index requirement in production
  return posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getAllHiringPosts(): Promise<HiringPost[]> {
  const q = query(
    collection(db, 'hiring_posts'),
    where('status', '==', 'active')
  );
  
  const snapshot = await getDocs(q);
  
  const posts = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      requirements: [],
      responsibilities: [],
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
    } as HiringPost;
  });

  // Sort manually if needed to avoid composite index requirement
  return posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    await updateDoc(userRef, updates);
    return;
  }

  const hrRef = doc(db, 'hr_profiles', userId);
  const hrSnap = await getDoc(hrRef);
  if (hrSnap.exists()) {
    await updateDoc(hrRef, updates);
  }
}

import { uploadResume as uploadToCloudinary, uploadImage as uploadImageToCloudinary } from './imageUpload';

// Photo operations
export async function uploadProfilePhoto(userId: string, file: File): Promise<string> {
  try {
    const downloadUrl = await uploadImageToCloudinary(file);
    await updateUserProfile(userId, { avatar: downloadUrl });
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    throw error;
  }
}

export async function uploadHiringPostImage(hrId: string, file: File): Promise<string> {
  try {
    const downloadUrl = await uploadImageToCloudinary(file);
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading hiring post image:', error);
    throw error;
  }
}

export async function uploadResume(file: File): Promise<string> {
  try {
    const downloadUrl = await uploadToCloudinary(file);
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading resume:', error);
    throw error;
  }
}

export async function deleteProfilePhoto(userId: string): Promise<void> {
  try {
    await updateUserProfile(userId, { avatar: '' });
  } catch (error) {
    console.error('Error deleting profile photo:', error);
    throw error;
  }
}

// Interview Session operations
export type FirestoreInterviewSession = InterviewSession;

export interface UserAnalytics {
  totalSessions: number;
  averageScore: number;
  scoreHistory: { date: string; score: number }[];
  skillBreakdown: { skill: string; score: number }[];
}

export async function getUserInterviews(userId: string): Promise<FirestoreInterviewSession[]> {
  const q = query(
    collection(db, 'interview_sessions'),
    where('userId', '==', userId)
  );
  
  const snapshot = await getDocs(q);
  
  const sessions = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
      completedAt: data.completedAt ? (data.completedAt instanceof Timestamp ? data.completedAt.toDate() : new Date(data.completedAt)) : undefined,
    } as FirestoreInterviewSession;
  });

  // Sort manually to avoid composite index requirement in production
  return sessions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getUserAnalytics(userId: string): Promise<UserAnalytics> {
  const sessions = await getUserInterviews(userId);
  const completedSessions = sessions.filter(s => s.totalScore !== undefined);
  
  const totalSessions = completedSessions.length;
  const averageScore = totalSessions > 0 
    ? completedSessions.reduce((acc, s) => acc + (s.totalScore || 0), 0) / totalSessions 
    : 0;

  const scoreHistory = completedSessions
    .slice(0, 7)
    .reverse()
    .map(s => ({
      date: s.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: s.totalScore || 0
    }));

  // Calculate skill breakdown from feedback
  const breakdown = {
    technical: { total: 0, count: 0 },
    communication: { total: 0, count: 0 },
    clarity: { total: 0, count: 0 },
    relevance: { total: 0, count: 0 }
  };

  completedSessions.forEach(session => {
    session.feedback?.forEach(f => {
      if (f.technicalAccuracy !== undefined) {
        breakdown.technical.total += f.technicalAccuracy;
        breakdown.technical.count++;
      }
      breakdown.communication.total += f.communication;
      breakdown.communication.count++;
      breakdown.clarity.total += f.clarity;
      breakdown.clarity.count++;
      breakdown.relevance.total += f.relevance;
      breakdown.relevance.count++;
    });
  });

  const getAvg = (stat: { total: number, count: number }) => 
    stat.count > 0 ? Number((stat.total / stat.count).toFixed(1)) : 0;

  return {
    totalSessions,
    averageScore: Number(averageScore.toFixed(1)),
    scoreHistory,
    skillBreakdown: [
      { skill: 'Technical', score: getAvg(breakdown.technical) || Number((averageScore * 0.9).toFixed(1)) },
      { skill: 'Communication', score: getAvg(breakdown.communication) || Number((averageScore * 0.85).toFixed(1)) },
      { skill: 'Clarity', score: getAvg(breakdown.clarity) || Number((averageScore * 0.95).toFixed(1)) },
      { skill: 'Relevance', score: getAvg(breakdown.relevance) || Number((averageScore * 0.9).toFixed(1)) },
    ]
  };
}

export async function createInterviewSession(
  userId: string,
  jobRole: JobRole,
  difficulty: Difficulty,
  roundType: RoundType,
  questions: InterviewQuestion[],
  resumeContent?: string
): Promise<{ id: string }> {
  const sessionData = {
    userId,
    jobRole,
    difficulty,
    roundType,
    questions,
    resumeContent: resumeContent || null,
    answers: {},
    feedback: [],
    totalScore: 0,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'interview_sessions'), sessionData);
  return { id: docRef.id };
}

export async function completeInterviewSession(
  sessionId: string,
  answers: Record<string, string>,
  feedback: QuestionFeedback[],
  totalScore: number
): Promise<void> {
  const sessionRef = doc(db, 'interview_sessions', sessionId);
  await updateDoc(sessionRef, {
    answers,
    feedback,
    totalScore,
    completedAt: serverTimestamp(),
  });
}

export async function updateUserStats(userId: string, totalScore: number): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const data = userSnap.data();
    const newTotalInterviews = (data.totalInterviews || 0) + 1;
    const newAverageScore = ((data.averageScore || 0) * (data.totalInterviews || 0) + totalScore) / newTotalInterviews;
    
    await updateDoc(userRef, {
      totalInterviews: newTotalInterviews,
      averageScore: Number(newAverageScore.toFixed(1)),
    });
  }
}

// Job Application operations
export async function submitJobApplication(applicationData: Omit<JobApplication, 'id' | 'createdAt' | 'status'>): Promise<string> {
  const data = {
    ...applicationData,
    status: 'pending',
    createdAt: serverTimestamp(),
  };
  
  const docRef = await addDoc(collection(db, 'job_applications'), data);
  return docRef.id;
}

export async function getHRApplications(hrId: string): Promise<JobApplication[]> {
  const q = query(
    collection(db, 'job_applications'),
    where('hrId', '==', hrId)
  );
  
  const snapshot = await getDocs(q);
  
  const applications = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
    } as JobApplication;
  });

  // Sort manually to avoid composite index requirement in production
  return applications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function updateApplicationStatus(applicationId: string, status: JobApplication['status']): Promise<void> {
  const applicationRef = doc(db, 'job_applications', applicationId);
  // Using setDoc with merge: true can sometimes bypass specific updateDoc permission issues
  await setDoc(applicationRef, { 
    status,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

// Notification operations
export async function createNotification(notificationData: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<void> {
  const data = {
    ...notificationData,
    read: false,
    createdAt: serverTimestamp(),
  };
  
  await addDoc(collection(db, 'notifications'), data);
}

export async function getUserNotifications(userId: string): Promise<Notification[]> {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId)
  );
  
  const snapshot = await getDocs(q);
  
  const notifications = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
    } as Notification;
  });

  // Sort manually to avoid composite index requirement in production
  return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const notificationRef = doc(db, 'notifications', notificationId);
  await updateDoc(notificationRef, { read: true });
}
