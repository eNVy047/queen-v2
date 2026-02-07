import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Share,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

const { width } = Dimensions.get("window");
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

interface Post {
  _id: string;
  author: {
    clerkId: string;
    name: string;
    avatar: string;
  };
  images: string[];
  caption: string;
  likes: string[];
  comments: any[];
  createdAt: string;
}

const HomeTab = () => {
  const router = useRouter();
  const { getToken, userId } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [currentUserMongoId, setCurrentUserMongoId] = useState<string>("");

  // Fetch current user's MongoDB ID
  const fetchCurrentUser = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setCurrentUserMongoId(userData._id);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  // Fetch posts
  const fetchPosts = async (pageNum: number = 1, isRefresh: boolean = false) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/posts?page=${pageNum}&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (isRefresh) {
          setPosts(data.posts || data);
        } else {
          setPosts((prev) => [...prev, ...(data.posts || data)]);
        }
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchPosts(1);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchPosts(1, true);
  };

  // Like post
  const handleLike = async (postId: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/posts/${postId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPosts((prev) =>
          prev.map((post) => (post._id === postId ? updatedPost : post))
        );
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-surface-dark items-center justify-center">
        <ActivityIndicator size="large" color="#F4A261" />
        <Text className="text-muted-foreground mt-3">Loading feed...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface-dark">
      {/* HEADER */}
      <View className="bg-surface-card border-b border-surface-light pt-12 pb-4 px-5">
        <View className="flex-row items-center justify-between">
          <Text className="text-3xl font-bold text-primary">Xoraxi</Text>
          <Pressable
            onPress={() => router.push("/search")}
            className="w-10 h-10 rounded-full bg-surface-light items-center justify-center active:opacity-70"
          >
            <Ionicons name="search" size={22} color="#F4A261" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#F4A261"
          />
        }
      >
        {posts.length === 0 ? (
          <View className="py-20 items-center">
            <Ionicons name="images-outline" size={64} color="#6B6B70" />
            <Text className="text-foreground font-semibold text-lg mt-4">
              No Posts Yet
            </Text>
            <Text className="text-muted-foreground text-center mt-2 px-8">
              Be the first to share something!
            </Text>
            <Pressable
              onPress={() => router.push("/create-post")}
              className="mt-6 bg-primary px-6 py-3 rounded-full active:opacity-70"
            >
              <Text className="text-surface-dark font-semibold">Create Post</Text>
            </Pressable>
          </View>
        ) : (
          posts.map((post) => {
            const isLiked = post.likes.includes(currentUserMongoId);

            return (
              <View
                key={post._id}
                className="mb-4 bg-surface-card border-b border-surface-light"
              >
                {/* POST HEADER */}
                <Pressable
                  onPress={() => router.push(`/post/${post._id}`)}
                  className="flex-row items-center px-4 py-3"
                >
                  <Image
                    source={{ uri: post.author.avatar }}
                    style={{ width: 40, height: 40, borderRadius: 20 }}
                  />
                  <View className="ml-3 flex-1">
                    <Text className="text-foreground font-semibold">
                      {post.author.name}
                    </Text>
                    <Text className="text-subtle-foreground text-xs">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </Pressable>

                {/* POST IMAGE */}
                <Pressable onPress={() => router.push(`/post/${post._id}`)}>
                  <Image
                    source={{ uri: post.images[0] }}
                    style={{ width, height: width }}
                    contentFit="cover"
                  />
                  {post.images.length > 1 && (
                    <View className="absolute top-3 right-3 bg-black/60 px-2 py-1 rounded-full">
                      <View className="flex-row items-center">
                        <Ionicons name="images" size={14} color="#FFFFFF" />
                        <Text className="text-white text-xs font-semibold ml-1">
                          {post.images.length}
                        </Text>
                      </View>
                    </View>
                  )}
                </Pressable>

                {/* POST ACTIONS */}
                <View className="px-4 py-3">
                  <View className="flex-row items-center mb-2">
                    <Pressable
                      onPress={() => handleLike(post._id)}
                      className="flex-row items-center mr-4"
                    >
                      <Ionicons
                        name={isLiked ? "heart" : "heart"}
                        size={26}
                        color={isLiked ? "#EF4444" : "#A0A0A5"}
                      />
                      <Text className="text-foreground font-semibold ml-2">
                        {post.likes.length}
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => router.push(`/post/${post._id}`)}
                      className="flex-row items-center mr-4"
                    >
                      <Ionicons name="chatbubble-outline" size={22} color="#F4A261" />
                      <Text className="text-foreground font-semibold ml-2">
                        {post.comments.length}
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={async () => {
                        const shareUrl = `${process.env.EXPO_PUBLIC_SHARE_URL || "https://xoraxi.com"}/post/${post._id}`;
                        try {
                          await Share.share({
                            message: `Check out this post: ${shareUrl}`,
                            url: shareUrl,
                          });
                        } catch (error) {
                          console.error("Error sharing:", error);
                        }
                      }}
                      className="flex-row items-center ml-auto"
                    >
                      <Ionicons name="share-outline" size={24} color="#F4A261" />
                    </Pressable>
                  </View>

                  {/* CAPTION */}
                  {post.caption && (
                    <Pressable onPress={() => router.push(`/post/${post._id}`)}>
                      <Text className="text-foreground" numberOfLines={2}>
                        <Text className="font-semibold">{post.author.name} </Text>
                        {post.caption}
                      </Text>
                    </Pressable>
                  )}

                  {/* VIEW COMMENTS */}
                  {post.comments.length > 0 && (
                    <Pressable
                      onPress={() => router.push(`/post/${post._id}`)}
                      className="mt-2"
                    >
                      <Text className="text-muted-foreground text-sm">
                        View all {post.comments.length} comments
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

export default HomeTab;
