
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Briefcase, MapPin, DollarSign, Clock, ArrowLeft, Trash2, Plus } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { getHRHiringPosts, deleteHiringPost } from '@/services/firebaseService';
import { HiringPost } from '@/types/interview';
import { toast } from "sonner";

const HRMyPosts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = React.useState<HiringPost[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadPosts = async () => {
    if (!user) return;
    try {
      const hrPosts = await getHRHiringPosts(user.id);
      setPosts(hrPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (user?.id) {
      loadPosts();
    }
  }, [user]);

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await deleteHiringPost(postId);
      toast.success('Post deleted successfully');
      loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/hr/dashboard')} className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold">My Hiring Posts</h1>
          </div>
          <Button onClick={() => navigate('/hr/dashboard')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create New Post
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700/50 p-20 text-center">
            <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
            <p className="text-gray-400 mb-6">You haven't created any hiring posts yet.</p>
            <Button onClick={() => navigate('/hr/dashboard')} className="bg-blue-600">
              Create Your First Post
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="bg-gray-800/70 backdrop-blur-xl border-gray-700/50 hover:border-blue-500/30 transition-all shadow-xl overflow-hidden flex flex-col">
                {post.imageUrl && (
                  <div className="w-full h-48 overflow-hidden">
                    <img 
                      src={post.imageUrl} 
                      alt={post.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-bold text-white">{post.title}</CardTitle>
                      <CardDescription className="text-blue-400 font-medium">{post.companyName}</CardDescription>
                    </div>
                    <div className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-semibold rounded-full border border-green-500/20">
                      {post.status.toUpperCase()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-grow">
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                      {post.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-gray-500" />
                      {post.jobType}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm line-clamp-3">{post.description}</p>
                </CardContent>
                <div className="p-6 pt-0 mt-auto border-t border-gray-700/50 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {post.createdAt.toLocaleDateString()}
                  </span>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HRMyPosts;
