import { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    Pressable,
    ActivityIndicator,
    Dimensions,
    RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import { useGetOrCreateChat } from "@/hooks/useChats";
import { User } from "@/types";

const { width } = Dimensions.get("window");
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
const IMAGE_SIZE = (width - 6) / 3;
const GRID_SPACING = 2;

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

const UserProfileScreen = () => {
    const { userId } = useLocalSearchParams();
    const router = useRouter();
    const { getToken } = useAuth();
    const { mutate: getOrCreateChat, isPending: isCreatingChat } = useGetOrCreateChat();
    const [user, setUser] = useState<any>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch user details and posts
    const fetchUserData = async () => {
        try {
            const token = await getToken();

            // Fetch user details
            const userResponse = await fetch(`${API_URL}/api/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (userResponse.ok) {
                const userData = await userResponse.json();
                setUser(userData);
            }

            // Fetch user posts
            const postsResponse = await fetch(`${API_URL}/api/posts/user/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (postsResponse.ok) {
                const postsData = await postsResponse.json();
                setPosts(postsData);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, [userId]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchUserData();
    };

    const handleUserSelect = (user: User) => {
        getOrCreateChat(user._id, {
            onSuccess: (chat) => {
                router.dismiss();
                setTimeout(() => {
                    router.push({
                        pathname: "/chat/[id]",
                        params: {
                            id: chat._id,
                            participantId: chat.participant._id,
                            name: chat.participant.name,
                            avatar: chat.participant.avatar,
                        },
                    });
                }, 100);
            },
        });
    };

    // Calculate stats
    const totalLikes = posts.reduce((acc, post) => acc + post.likes.length, 0);
    const totalComments = posts.reduce((acc, post) => acc + post.comments.length, 0);

    if (loading) {
        return (
            <View className="flex-1 bg-surface-dark items-center justify-center">
                <ActivityIndicator size="large" color="#F4A261" />
            </View>
        );
    }

    if (!user) {
        return (
            <View className="flex-1 bg-surface-dark items-center justify-center">
                <Text className="text-foreground text-lg font-medium">User not found</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-surface-dark">
            {/* HEADER */}
            <LinearGradient
                colors={["#F4A261", "#E76F51"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="pt-12 pb-1 px-5"
            >
                <View className="flex-row items-center justify-between mb-4">
                    <Pressable
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full bg-black/25 items-center justify-center active:opacity-80"
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </Pressable>
                    <View className="flex-1 items-center px-4">
                        <Text className="text-xl font-bold text-white text-center" numberOfLines={1}>
                            {user.name}
                        </Text>
                        <Text className="text-white/90 text-sm mt-1" numberOfLines={1}>
                            {posts.length} posts • {totalLikes} likes
                        </Text>
                    </View>
                    <View className="w-10" />
                </View>
            </LinearGradient>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor="#F4A261"
                        colors={["#F4A261"]}
                    />
                }
            >
                {/* PROFILE INFO */}
                <View className="items-center pt-6 pb-8 px-5">
                    {/* Profile Image with subtle border */}
                    <View className="relative">
                        <View className="absolute -inset-1 bg-gradient-to-r from-[#F4A261] to-[#E76F51] rounded-full blur-sm opacity-30" />
                        <Image
                            source={{ uri: user.avatar }}
                            style={{ width: 110, height: 110, borderRadius: 55 }}
                            className="border-4 border-surface-dark"
                        />
                    </View>

                    {/* Name and Email with better spacing */}
                    <View className="items-center mt-5 max-w-full">
                        <Text
                            className="text-foreground text-2xl font-bold text-center px-4"
                            numberOfLines={2}
                        >
                            {user.name}
                        </Text>
                        <Text
                            className="text-muted-foreground text-sm mt-2 text-center px-4"
                            numberOfLines={1}
                        >
                            {user.email}
                        </Text>
                    </View>

                    {/* Enhanced Activity Stats */}
                    <View className="w-full mt-8">
                        <Text className="text-subtle-foreground text-xs font-semibold uppercase tracking-wider mb-4 px-1">
                            Activity Stats
                        </Text>
                        <View className="flex-row justify-between bg-surface-card rounded-2xl p-5 border border-surface-light">
                            {/* Posts */}
                            <View className="items-center flex-1">
                                <View className="bg-primary/10 w-16 h-16 rounded-full items-center justify-center mb-2">
                                    <Ionicons name="images" size={24} color="#F4A261" />
                                </View>
                                <Text className="text-3xl font-bold text-primary mt-2">
                                    {posts.length}
                                </Text>
                                <Text className="text-subtle-foreground text-xs mt-1 font-medium">
                                    Posts
                                </Text>
                            </View>

                            {/* Divider */}
                            <View className="w-px bg-surface-light mx-2" />

                            {/* Likes */}
                            <View className="items-center flex-1">
                                <View className="bg-red-500/10 w-16 h-16 rounded-full items-center justify-center mb-2">
                                    <Ionicons name="heart" size={24} color="#EF4444" />
                                </View>
                                <Text className="text-3xl font-bold text-red-500 mt-2">
                                    {totalLikes}
                                </Text>
                                <Text className="text-subtle-foreground text-xs mt-1 font-medium">
                                    Likes
                                </Text>
                            </View>

                            {/* Divider */}
                            <View className="w-px bg-surface-light mx-2" />

                            {/* Comments */}
                            <View className="items-center flex-1">
                                <View className="bg-blue-500/10 w-16 h-16 rounded-full items-center justify-center mb-2">
                                    <Ionicons name="chatbubble" size={24} color="#3B82F6" />
                                </View>
                                <Text className="text-3xl font-bold text-blue-500 mt-2">
                                    {totalComments}
                                </Text>
                                <Text className="text-subtle-foreground text-xs mt-1 font-medium">
                                    Comments
                                </Text>
                            </View>
                        </View>

                        {/* Additional Info Box */}
                        {user.bio && (
                            <View className="mt-6 bg-surface-card rounded-2xl p-4 border border-surface-light">
                                <Text className="text-subtle-foreground text-xs font-semibold uppercase tracking-wider mb-3">
                                    About
                                </Text>
                                <Text className="text-foreground text-sm leading-5">
                                    {user.bio}
                                </Text>
                            </View>
                        )}

                        {/* Message Button with improved styling */}
                        <Pressable
                            onPress={() => handleUserSelect(user)}
                            disabled={isCreatingChat}
                            className={`mt-8 flex-row items-center justify-center py-4 rounded-2xl ${isCreatingChat ? 'bg-primary/70' : 'bg-primary'} active:opacity-90`}
                        >
                            {isCreatingChat ? (
                                <ActivityIndicator size="small" color="#0D0D0F" />
                            ) : (
                                <>
                                    <Ionicons name="chatbubble-ellipses" size={22} color="#0D0D0F" />
                                    <Text className="text-surface-dark font-semibold text-base ml-3">
                                        Send Message
                                    </Text>
                                </>
                            )}
                        </Pressable>
                    </View>
                </View>

                {/* POSTS GRID */}
                <View className="mt-4 pb-8">
                    <View className="flex-row items-center justify-between mx-5 mb-4">
                        <Text className="text-subtle-foreground text-xs font-semibold uppercase tracking-wider">
                            Recent Posts
                        </Text>
                        {posts.length > 0 && (
                            <Text className="text-primary text-sm font-medium">
                                {posts.length} total
                            </Text>
                        )}
                    </View>

                    {posts.length === 0 ? (
                        <View className="mx-5 bg-surface-card rounded-2xl p-10 items-center border border-surface-light">
                            <View className="bg-primary/10 w-20 h-20 rounded-full items-center justify-center mb-4">
                                <Ionicons name="images-outline" size={32} color="#6B6B70" />
                            </View>
                            <Text className="text-foreground font-bold text-lg mt-2">
                                No Posts Yet
                            </Text>
                            <Text className="text-muted-foreground text-center mt-2 text-sm">
                                This user hasn't shared any posts
                            </Text>
                        </View>
                    ) : (
                        <View className="flex-row flex-wrap px-1">
                            {posts.map((post) => (
                                <Pressable
                                    key={post._id}
                                    onPress={() => router.push(`/post/${post._id}`)}
                                    style={{
                                        width: IMAGE_SIZE,
                                        height: IMAGE_SIZE,
                                        margin: GRID_SPACING / 2,
                                    }}
                                    className="relative active:opacity-80"
                                >
                                    <Image
                                        source={{ uri: post.images[0] }}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                        }}
                                        contentFit="cover"
                                        className="rounded-lg"
                                    />

                                    {/* Gradient overlay */}
                                    <LinearGradient
                                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                                        className="absolute bottom-0 left-0 right-0 h-12 rounded-b-lg"
                                    />

                                    {/* Multi-image indicator */}
                                    {post.images.length > 1 && (
                                        <View className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full">
                                            <Ionicons name="copy" size={14} color="#FFFFFF" />
                                        </View>
                                    )}

                                    {/* Stats at bottom */}
                                    <View className="absolute bottom-2 left-2 right-2">
                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-row items-center">
                                                <Ionicons name="heart" size={16} color="#FFFFFF" />
                                                <Text className="text-white font-semibold text-xs ml-1">
                                                    {post.likes.length}
                                                </Text>
                                            </View>
                                            <View className="flex-row items-center">
                                                <Ionicons name="chatbubble" size={14} color="#FFFFFF" />
                                                <Text className="text-white font-semibold text-xs ml-1">
                                                    {post.comments.length}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

export default UserProfileScreen;