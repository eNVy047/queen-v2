import { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    Pressable,
    Dimensions,
    TextInput,
    Alert,
    ActivityIndicator,
    Share,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
const SHARE_URL = process.env.EXPO_PUBLIC_SHARE_URL || "https://xoraxi.com";

interface Comment {
    user: {
        clerkId: string;
        name: string;
        avatar: string;
    };
    text: string;
    createdAt: string;
}

interface Post {
    _id: string;
    author: {
        clerkId: string;
        name: string;
        avatar: string;
    };
    images: string[];
    caption: string;
    taggedUsers: any[];
    likes: string[];
    comments: Comment[];
    createdAt: string;
}

const PostDetailScreen = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { getToken, userId } = useAuth();
    const { user } = useUser();

    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [commentText, setCommentText] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    // Fetch post details
    const fetchPost = async () => {
        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/api/posts/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setPost(data);
                setIsLiked(data.likes.includes(userId));
            }
        } catch (error) {
            console.error("Error fetching post:", error);
            Alert.alert("Error", "Failed to load post");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPost();
    }, [id]);

    // Like/unlike post
    const handleLike = async () => {
        if (!post) return;

        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/api/posts/${post._id}/like`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const updatedPost = await response.json();
                setPost(updatedPost);
                setIsLiked(updatedPost.likes.includes(userId));
            }
        } catch (error) {
            console.error("Error liking post:", error);
        }
    };

    // Add comment
    const handleAddComment = async () => {
        if (!post || !commentText.trim()) return;

        setSubmittingComment(true);
        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/api/posts/${post._id}/comment`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: commentText.trim() }),
            });

            if (response.ok) {
                const updatedPost = await response.json();
                setPost(updatedPost);
                setCommentText("");
            }
        } catch (error) {
            console.error("Error adding comment:", error);
            Alert.alert("Error", "Failed to add comment");
        } finally {
            setSubmittingComment(false);
        }
    };

    // Share post
    const handleShare = async () => {
        if (!post) return;

        const shareUrl = `${SHARE_URL}/post/${post._id}`;
        try {
            await Share.share({
                message: `Check out this post: ${shareUrl}`,
                url: shareUrl,
            });
        } catch (error) {
            console.error("Error sharing:", error);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-surface-dark items-center justify-center">
                <ActivityIndicator size="large" color="#F4A261" />
            </View>
        );
    }

    if (!post) {
        return (
            <View className="flex-1 bg-surface-dark items-center justify-center">
                <Text className="text-foreground">Post not found</Text>
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
                className="pt-12 pb-4 px-5"
            >
                <View className="flex-row items-center justify-between">
                    <Pressable
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full bg-black/20 items-center justify-center active:opacity-70"
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </Pressable>
                    <Text className="text-xl font-bold text-white">Post</Text>
                    <Pressable
                        onPress={handleShare}
                        className="w-10 h-10 rounded-full bg-black/20 items-center justify-center active:opacity-70"
                    >
                        <Ionicons name="share-outline" size={22} color="#FFFFFF" />
                    </Pressable>
                </View>
            </LinearGradient>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* IMAGE CAROUSEL */}
                <View className="relative">
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={(e) => {
                            const index = Math.round(e.nativeEvent.contentOffset.x / width);
                            setCurrentImageIndex(index);
                        }}
                        scrollEventThrottle={16}
                    >
                        {post.images.map((imageUrl, index) => (
                            <Image
                                key={index}
                                source={{ uri: imageUrl }}
                                style={{ width, height: width }}
                                contentFit="cover"
                            />
                        ))}
                    </ScrollView>

                    {/* Image counter */}
                    {post.images.length > 1 && (
                        <View className="absolute bottom-4 right-4 bg-black/60 px-3 py-1.5 rounded-full">
                            <Text className="text-white text-sm font-semibold">
                                {currentImageIndex + 1}/{post.images.length}
                            </Text>
                        </View>
                    )}
                </View>

                {/* ACTIONS */}
                <View className="flex-row items-center px-5 py-4 border-b border-surface-light">
                    <Pressable onPress={handleLike} className="flex-row items-center mr-6">
                        <Ionicons
                            name={isLiked ? "heart" : "heart-outline"}
                            size={28}
                            color={isLiked ? "#EF4444" : "#F4A261"}
                        />
                        <Text className="text-foreground font-semibold ml-2">
                            {post.likes.length}
                        </Text>
                    </Pressable>

                    <View className="flex-row items-center">
                        <Ionicons name="chatbubble-outline" size={24} color="#F4A261" />
                        <Text className="text-foreground font-semibold ml-2">
                            {post.comments.length}
                        </Text>
                    </View>
                </View>

                {/* AUTHOR & CAPTION */}
                <View className="px-5 py-4 border-b border-surface-light">
                    <View className="flex-row items-center mb-3">
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
                    </View>

                    {post.caption && (
                        <Text className="text-foreground leading-5">{post.caption}</Text>
                    )}
                </View>

                {/* COMMENTS */}
                <View className="px-5 py-4">
                    <Text className="text-foreground font-semibold text-lg mb-4">
                        Comments ({post.comments.length})
                    </Text>

                    {post.comments.length === 0 ? (
                        <View className="py-8 items-center">
                            <Ionicons name="chatbubbles-outline" size={48} color="#6B6B70" />
                            <Text className="text-muted-foreground mt-3">No comments yet</Text>
                            <Text className="text-subtle-foreground text-sm">
                                Be the first to comment
                            </Text>
                        </View>
                    ) : (
                        post.comments.map((comment, index) => (
                            <View key={index} className="mb-4">
                                <View className="flex-row">
                                    <Image
                                        source={{ uri: comment.user.avatar }}
                                        style={{ width: 32, height: 32, borderRadius: 16 }}
                                    />
                                    <View className="ml-3 flex-1 bg-surface-card rounded-2xl p-3">
                                        <Text className="text-foreground font-semibold text-sm">
                                            {comment.user.name}
                                        </Text>
                                        <Text className="text-foreground mt-1">{comment.text}</Text>
                                        <Text className="text-subtle-foreground text-xs mt-2">
                                            {new Date(comment.createdAt).toLocaleString()}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* ADD COMMENT INPUT */}
            <View className="border-t border-surface-light bg-surface-card px-5 py-3">
                <View className="flex-row items-center">
                    <Image
                        source={{ uri: user?.imageUrl }}
                        style={{ width: 36, height: 36, borderRadius: 18 }}
                    />
                    <TextInput
                        value={commentText}
                        onChangeText={setCommentText}
                        placeholder="Add a comment..."
                        placeholderTextColor="#6B6B70"
                        className="flex-1 mx-3 bg-surface-dark rounded-full px-4 py-2 text-foreground"
                        multiline
                        maxLength={500}
                    />
                    <Pressable
                        onPress={handleAddComment}
                        disabled={!commentText.trim() || submittingComment}
                        className={`w-10 h-10 rounded-full items-center justify-center ${commentText.trim() ? "bg-primary" : "bg-surface-light"
                            }`}
                    >
                        {submittingComment ? (
                            <ActivityIndicator size="small" color="#0D0D0F" />
                        ) : (
                            <Ionicons
                                name="send"
                                size={18}
                                color={commentText.trim() ? "#0D0D0F" : "#6B6B70"}
                            />
                        )}
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

export default PostDetailScreen;
