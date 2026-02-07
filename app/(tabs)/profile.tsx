import { useAuth, useUser } from "@clerk/clerk-expo";
import { View, Text, ScrollView, Pressable, FlatList, Dimensions, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const GRID_SPACING = 2;
const NUM_COLUMNS = 3;
const IMAGE_SIZE = (width - GRID_SPACING * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

interface Post {
  _id: string;
  images: string[];
  caption: string;
  likes: string[];
  comments: any[];
  createdAt: string;
}

const ProfileTab = () => {
  const { signOut, getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user posts
  const fetchUserPosts = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/posts/user/${user?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchUserPosts();
    }
  }, [user?.id]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUserPosts();
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-dark">
      <ScrollView

        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* HEADER  */}
        <View className="relative">
          {/* Upload Post Button - Top Left */}
          <Pressable
            onPress={() => router.push("/create-post")}
            className="absolute top-4 left-5 z-10 w-10 h-10 rounded-full bg-primary items-center justify-center active:opacity-70 shadow-lg"
          >
            <Ionicons name="add-circle" size={24} color="#0D0D0F" />
          </Pressable>

          {/* Settings Icon - Top Right */}
          <Pressable
            onPress={() => router.push("/settings")}
            className="absolute top-4 right-5 z-10 w-10 h-10 rounded-full bg-surface-card items-center justify-center active:opacity-70 border border-surface-light"
          >
            <Ionicons name="settings-outline" size={22} color="#F4A261" />
          </Pressable>

          <View className="items-center mt-10">
            <View className="relative">
              <View className="rounded-full border-2 border-primary">
                <Image
                  source={user?.imageUrl}
                  style={{ width: 100, height: 100, borderRadius: 999 }}
                />
              </View>

              <Pressable className="absolute bottom-1 right-1 w-8 h-8 bg-primary rounded-full items-center justify-center border-2 border-surface-dark">
                <Ionicons name="camera" size={16} color="#0D0D0F" />
              </Pressable>
            </View>

            {/* NAME & EMAIL */}
            <Text className="text-2xl font-bold text-foreground mt-4">
              {user?.firstName} {user?.lastName}
            </Text>

            <Text className="text-muted-foreground mt-1">
              {user?.emailAddresses[0]?.emailAddress}
            </Text>

            <View className="flex-row items-center mt-3 bg-green-500/20 px-3 py-1.5 rounded-full">
              <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              <Text className="text-green-500 text-sm font-medium">Online</Text>
            </View>
          </View>
        </View>

        {/* PROFILE STATS */}
        <View className="mx-5 mt-8 bg-surface-card rounded-2xl p-4 border border-surface-light">
          <Text className="text-subtle-foreground text-xs font-semibold uppercase tracking-wider mb-3">
            Activity
          </Text>
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary">{posts.length}</Text>
              <Text className="text-subtle-foreground text-xs mt-1">Posts</Text>
            </View>
            <View className="w-px bg-surface-light" />
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary">
                {posts.reduce((acc, post) => acc + post.likes.length, 0)}
              </Text>
              <Text className="text-subtle-foreground text-xs mt-1">Likes</Text>
            </View>
            <View className="w-px bg-surface-light" />
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary">
                {posts.reduce((acc, post) => acc + post.comments.length, 0)}
              </Text>
              <Text className="text-subtle-foreground text-xs mt-1">Comments</Text>
            </View>
          </View>
        </View>

        {/* POSTS GRID */}
        <View className="mt-6">
          <View className="flex-row items-center justify-between mx-5 mb-3">
            <Text className="text-subtle-foreground text-xs font-semibold uppercase tracking-wider">
              My Posts
            </Text>
            {posts.length > 0 && (
              <Pressable onPress={handleRefresh} disabled={refreshing}>
                <Ionicons
                  name="refresh"
                  size={18}
                  color={refreshing ? "#6B6B70" : "#F4A261"}
                />
              </Pressable>
            )}
          </View>

          {loading ? (
            <View className="py-20 items-center">
              <ActivityIndicator size="large" color="#F4A261" />
              <Text className="text-muted-foreground mt-3">Loading posts...</Text>
            </View>
          ) : posts.length === 0 ? (
            <View className="mx-5 bg-surface-card rounded-2xl p-8 items-center border border-surface-light">
              <Ionicons name="images-outline" size={48} color="#6B6B70" />
              <Text className="text-foreground font-semibold text-lg mt-4">
                No Posts Yet
              </Text>
              <Text className="text-muted-foreground text-center mt-2">
                Tap the + button to create your first post
              </Text>
            </View>
          ) : (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                paddingHorizontal: GRID_SPACING,
              }}
            >
              {posts.map((post, index) => (
                <Pressable
                  key={post._id}
                  onPress={() => router.push(`/post/${post._id}`)}
                  style={{
                    width: IMAGE_SIZE,
                    height: IMAGE_SIZE,
                    margin: GRID_SPACING / 2,
                  }}
                  className="relative active:opacity-70"
                >
                  <Image
                    source={{ uri: post.images[0] }}
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                    contentFit="cover"
                  />

                  {/* Multi-image indicator */}
                  {post.images.length > 1 && (
                    <View className="absolute top-2 right-2">
                      <Ionicons name="copy-outline" size={16} color="#FFFFFF" />
                    </View>
                  )}

                  {/* Overlay with stats */}
                  <View className="absolute inset-0 bg-black/40 opacity-0 active:opacity-100 items-center justify-center">
                    <View className="flex-row items-center">
                      <Ionicons name="heart" size={20} color="#FFFFFF" />
                      <Text className="text-white font-semibold ml-1 mr-4">
                        {post.likes.length}
                      </Text>
                      <Ionicons name="chatbubble" size={18} color="#FFFFFF" />
                      <Text className="text-white font-semibold ml-1">
                        {post.comments.length}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileTab;
