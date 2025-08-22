import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Users, 
  Clock, 
  Eye, 
  Pin, 
  Lock, 
  Plus,
  Search,
  ThumbsUp,
  Heart,
  Reply,
  Send
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon: string;
  color: string;
}

interface ForumTopic {
  id: string;
  title: string;
  content: string;
  slug: string;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  replyCount: number;
  lastReplyAt: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
}

interface ForumPost {
  id: string;
  content: string;
  parentPostId?: string;
  createdAt: string;
  editedAt?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
}

interface ForumDiscussionProps {
  className?: string;
}

export function ForumDiscussion({ className = "" }: ForumDiscussionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [showCreateTopic, setShowCreateTopic] = useState(false);
  const [showTopicDetail, setShowTopicDetail] = useState(false);
  const [newTopicData, setNewTopicData] = useState({
    title: "",
    content: "",
    categoryId: ""
  });
  const [newReply, setNewReply] = useState("");

  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch forum categories
  const { data: categoriesData } = useQuery({
    queryKey: ["/api/forum/categories"],
    retry: false,
  });

  // Fetch forum topics
  const { data: topicsData, isLoading: topicsLoading } = useQuery({
    queryKey: ["/api/forum/topics", selectedCategory === "all" ? undefined : selectedCategory],
    retry: false,
  });

  // Fetch topic posts when viewing a specific topic
  const { data: postsData } = useQuery({
    queryKey: [`/api/forum/topics/${selectedTopic?.id}/posts`],
    enabled: !!selectedTopic?.id,
    retry: false,
  });

  const categories: ForumCategory[] = categoriesData?.categories || [];
  const topics: ForumTopic[] = topicsData?.topics || [];
  const posts: ForumPost[] = postsData?.posts || [];

  // Create topic mutation
  const createTopicMutation = useMutation({
    mutationFn: async (topicData: any) => {
      return apiRequest("POST", "/api/forum/topics", topicData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Discussion topic created successfully!",
      });
      setShowCreateTopic(false);
      setNewTopicData({ title: "", content: "", categoryId: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/forum/topics"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create topic",
        variant: "destructive",
      });
    },
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async ({ topicId, content }: { topicId: string; content: string }) => {
      return apiRequest("POST", `/api/forum/topics/${topicId}/posts`, { content });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Reply posted successfully!",
      });
      setNewReply("");
      queryClient.invalidateQueries({ queryKey: [`/api/forum/topics/${selectedTopic?.id}/posts`] });
      queryClient.invalidateQueries({ queryKey: ["/api/forum/topics"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post reply",
        variant: "destructive",
      });
    },
  });

  const handleCreateTopic = () => {
    if (!newTopicData.title || !newTopicData.content || !newTopicData.categoryId) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    createTopicMutation.mutate(newTopicData);
  };

  const handlePostReply = () => {
    if (!newReply.trim() || !selectedTopic) return;

    createPostMutation.mutate({
      topicId: selectedTopic.id,
      content: newReply
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTopicClick = async (topic: ForumTopic) => {
    setSelectedTopic(topic);
    setShowTopicDetail(true);
  };

  // Filter topics based on search
  const filteredTopics = topics.filter(topic =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (showTopicDetail && selectedTopic) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Back to topics */}
        <Button 
          variant="outline" 
          onClick={() => {
            setShowTopicDetail(false);
            setSelectedTopic(null);
          }}
          data-testid="button-back-to-topics"
        >
          ← Back to Discussions
        </Button>

        {/* Topic Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge 
                    style={{ backgroundColor: selectedTopic.category.color }}
                    className="text-white"
                  >
                    {selectedTopic.category.name}
                  </Badge>
                  {selectedTopic.isPinned && (
                    <Badge variant="secondary">
                      <Pin className="w-3 h-3 mr-1" />
                      Pinned
                    </Badge>
                  )}
                  {selectedTopic.isLocked && (
                    <Badge variant="secondary">
                      <Lock className="w-3 h-3 mr-1" />
                      Locked
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl font-bold mb-2" data-testid="topic-title">
                  {selectedTopic.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={selectedTopic.user.profileImageUrl} />
                      <AvatarFallback className="text-xs">
                        {selectedTopic.user.firstName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{selectedTopic.user.firstName} {selectedTopic.user.lastName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(selectedTopic.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{selectedTopic.viewCount} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{selectedTopic.replyCount} replies</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none text-gray-700" data-testid="topic-content">
              {selectedTopic.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-3">{paragraph}</p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Posts/Replies */}
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={post.user.profileImageUrl} />
                    <AvatarFallback className="text-xs">
                      {post.user.firstName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-sm">
                        {post.user.firstName} {post.user.lastName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(post.createdAt)}
                      </span>
                      {post.editedAt && (
                        <span className="text-xs text-gray-500">
                          (edited {formatDate(post.editedAt)})
                        </span>
                      )}
                    </div>
                    <div className="text-gray-700 text-sm" data-testid={`post-content-${post.id}`}>
                      {post.content.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-2">{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reply Form */}
        {isAuthenticated && !selectedTopic.isLocked && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Post a Reply</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  rows={4}
                  data-testid="reply-textarea"
                />
                <Button
                  onClick={handlePostReply}
                  disabled={!newReply.trim() || createPostMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-post-reply"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {createPostMutation.isPending ? "Posting..." : "Post Reply"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-green-600" />
            Community Discussions
          </h2>
          <p className="text-gray-600 mt-1">
            Join conversations about healthy eating, recipes, and farming
          </p>
        </div>
        {isAuthenticated && (
          <Button
            onClick={() => setShowCreateTopic(true)}
            className="bg-green-600 hover:bg-green-700"
            data-testid="button-create-topic"
          >
            <Plus className="w-4 h-4 mr-2" />
            Start Discussion
          </Button>
        )}
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          onClick={() => setSelectedCategory("all")}
          className={selectedCategory === "all" ? "bg-green-600 hover:bg-green-700" : ""}
          data-testid="category-all"
        >
          All Categories
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.id)}
            className={selectedCategory === category.id ? "bg-green-600 hover:bg-green-700" : ""}
            style={selectedCategory === category.id ? {} : { borderColor: category.color }}
            data-testid={`category-${category.slug}`}
          >
            <span className="mr-2">{category.icon}</span>
            {category.name}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search discussions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-11"
          data-testid="search-discussions"
        />
      </div>

      {/* Topics List */}
      <div className="space-y-4">
        {topicsLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : filteredTopics.length === 0 ? (
          <Card className="text-center p-12">
            <MessageSquare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No discussions found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? "No discussions match your search." : "Be the first to start a discussion!"}
            </p>
            {isAuthenticated && !searchQuery && (
              <Button
                onClick={() => setShowCreateTopic(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                Start First Discussion
              </Button>
            )}
          </Card>
        ) : (
          filteredTopics.map((topic) => (
            <Card 
              key={topic.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleTopicClick(topic)}
              data-testid={`topic-${topic.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={topic.user.profileImageUrl} />
                    <AvatarFallback>
                      {topic.user.firstName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        style={{ backgroundColor: topic.category.color }}
                        className="text-white text-xs"
                      >
                        {topic.category.name}
                      </Badge>
                      {topic.isPinned && (
                        <Badge variant="secondary" className="text-xs">
                          <Pin className="w-3 h-3 mr-1" />
                          Pinned
                        </Badge>
                      )}
                      {topic.isLocked && (
                        <Badge variant="secondary" className="text-xs">
                          <Lock className="w-3 h-3 mr-1" />
                          Locked
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2 hover:text-green-600">
                      {topic.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {topic.content}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-4">
                        <span>by {topic.user.firstName} {topic.user.lastName}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(topic.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{topic.viewCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>{topic.replyCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Topic Dialog */}
      <Dialog open={showCreateTopic} onOpenChange={setShowCreateTopic}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Start a New Discussion</DialogTitle>
            <DialogDescription>
              Share your thoughts, ask questions, or start a conversation with the community.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select 
                value={newTopicData.categoryId} 
                onValueChange={(value) => setNewTopicData(prev => ({ ...prev, categoryId: value }))}
              >
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="What's your discussion about?"
                value={newTopicData.title}
                onChange={(e) => setNewTopicData(prev => ({ ...prev, title: e.target.value }))}
                data-testid="input-topic-title"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea
                placeholder="Share your thoughts, ask questions, or provide details..."
                value={newTopicData.content}
                onChange={(e) => setNewTopicData(prev => ({ ...prev, content: e.target.value }))}
                rows={6}
                data-testid="textarea-topic-content"
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowCreateTopic(false)}
                data-testid="button-cancel-topic"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTopic}
                disabled={createTopicMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-submit-topic"
              >
                {createTopicMutation.isPending ? "Creating..." : "Start Discussion"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}