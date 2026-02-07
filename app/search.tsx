import { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    ScrollView,
    Pressable,
    ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

interface User {
    _id: string;
    clerkId: string;
    name: string;
    email: string;
    avatar: string;
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
    likes: string[];
    comments: any[];
}

const SearchScreen = () => {
    const router = useRouter();
    const { getToken } = useAuth();

    const [searchQuery, setSearchQuery] = useState("");
    const [searchType, setSearchType] = useState<"users" | "posts">("users");
    const [users, setUsers] = useState<User[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch suggested users on mount
    useEffect(() => {
        fetchSuggestedUsers();
    }, []);

    // Fetch suggested users
    const fetchSuggestedUsers = async () => {
        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/api/users?limit=20`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setSuggestedUsers(data);
            }
        } catch (error) {
            console.error("Error fetching suggested users:", error);
        }
    };

    // Search users - filter from suggested users
    const searchUsers = (query: string) => {
        if (!query.trim()) {
            setUsers([]);
            return;
        }

        // Filter suggested users by name or email
        const filtered = suggestedUsers.filter(
            (user) =>
                user.name.toLowerCase().includes(query.toLowerCase()) ||
                user.email.toLowerCase().includes(query.toLowerCase())
        );
        setUsers(filtered);
    };

    // Search posts
    const searchPosts = async (query: string) => {
        if (!query.trim()) {
            setPosts([]);
            return;
        }

        setLoading(true);
        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/api/posts/search?q=${encodeURIComponent(query)}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setPosts(data);
            }
        } catch (error) {
            console.error("Error searching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (searchType === "users") {
            searchUsers(query);
        } else {
            searchPosts(query);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-surface-dark" edges={["top"]}>
            {/* HEADER */}
            <View className="bg-surface-card border-b border-surface-light px-5 py-4">
                <View className="flex-row items-center mb-3">
                    <Pressable
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full items-center justify-center mr-2"
                    >
                        <Ionicons name="arrow-back" size={24} color="#F4A261" />
                    </Pressable>
                    <Text className="text-2xl font-bold text-primary">Search</Text>
                </View>

                {/* Search Input */}
                <View className="flex-row items-center bg-surface-dark rounded-full px-4 py-2">
                    <Ionicons name="search" size={20} color="#6B6B70" />
                    <TextInput
                        value={searchQuery}
                        onChangeText={handleSearch}
                        placeholder={`Search ${searchType}...`}
                        placeholderTextColor="#6B6B70"
                        className="flex-1 ml-2 text-foreground"
                        autoFocus
                    />
                    {searchQuery.length > 0 && (
                        <Pressable onPress={() => handleSearch("")}>
                            <Ionicons name="close-circle" size={20} color="#6B6B70" />
                        </Pressable>
                    )}
                </View>

                {/* Search Type Toggle */}
                <View className="flex-row mt-3 bg-surface-dark rounded-full p-1">
                    <Pressable
                        onPress={() => {
                            setSearchType("users");
                            setPosts([]);
                            if (searchQuery) searchUsers(searchQuery);
                        }}
                        className={`flex-1 py-2 rounded-full ${searchType === "users" ? "bg-primary" : ""
                            }`}
                    >
                        <Text
                            className={`text-center font-semibold ${searchType === "users" ? "text-surface-dark" : "text-muted-foreground"
                                }`}
                        >
                            Users
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => {
                            setSearchType("posts");
                            setUsers([]);
                            if (searchQuery) searchPosts(searchQuery);
                        }}
                        className={`flex-1 py-2 rounded-full ${searchType === "posts" ? "bg-primary" : ""
                            }`}
                    >
                        <Text
                            className={`text-center font-semibold ${searchType === "posts" ? "text-surface-dark" : "text-muted-foreground"
                                }`}
                        >
                            Posts
                        </Text>
                    </Pressable>
                </View>
            </View>

            {/* RESULTS */}
            <ScrollView showsVerticalScrollIndicator={false}>
                {loading ? (
                    <View className="py-20 items-center">
                        <ActivityIndicator size="large" color="#F4A261" />
                    </View>
                ) : searchQuery.length === 0 ? (
                    // Show suggested users when no search
                    searchType === "users" ? (
                        <View>
                            <Text className="text-muted-foreground text-sm px-5 py-3">
                                Suggested Users
                            </Text>
                            {suggestedUsers.length === 0 ? (
                                <View className="py-20 items-center">
                                    <Ionicons name="people-outline" size={64} color="#6B6B70" />
                                    <Text className="text-muted-foreground mt-4">
                                        No users available
                                    </Text>
                                </View>
                            ) : (
                                suggestedUsers.map((user) => (
                                    <Pressable
                                        key={user._id}
                                        onPress={() => router.push(`/user/${user.clerkId}`)}
                                        className="flex-row items-center px-5 py-4 border-b border-surface-light active:bg-surface-card"
                                    >
                                        <Image
                                            source={{ uri: user.avatar }}
                                            style={{ width: 50, height: 50, borderRadius: 25 }}
                                        />
                                        <View className="ml-3 flex-1">
                                            <Text className="text-foreground font-semibold">{user.name}</Text>
                                            <Text className="text-muted-foreground text-sm">{user.email}</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color="#6B6B70" />
                                    </Pressable>
                                ))
                            )}
                        </View>
                    ) : (
                        <View className="py-20 items-center">
                            <Ionicons name="search-outline" size={64} color="#6B6B70" />
                            <Text className="text-muted-foreground mt-4">
                                Search for posts
                            </Text>
                        </View>
                    )
                ) : searchType === "users" ? (
                    users.length === 0 ? (
                        <View className="py-20 items-center">
                            <Ionicons name="person-outline" size={64} color="#6B6B70" />
                            <Text className="text-foreground font-semibold mt-4">No users found</Text>
                            <Text className="text-muted-foreground">Try a different search term</Text>
                        </View>
                    ) : (
                        users.map((user) => (
                            <Pressable
                                key={user._id}
                                onPress={() => router.push(`/user/${user.clerkId}`)}
                                className="flex-row items-center px-5 py-4 border-b border-surface-light active:bg-surface-card"
                            >
                                <Image
                                    source={{ uri: user.avatar }}
                                    style={{ width: 50, height: 50, borderRadius: 25 }}
                                />
                                <View className="ml-3 flex-1">
                                    <Text className="text-foreground font-semibold">{user.name}</Text>
                                    <Text className="text-muted-foreground text-sm">{user.email}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#6B6B70" />
                            </Pressable>
                        ))
                    )
                ) : posts.length === 0 ? (
                    <View className="py-20 items-center">
                        <Ionicons name="images-outline" size={64} color="#6B6B70" />
                        <Text className="text-foreground font-semibold mt-4">No posts found</Text>
                        <Text className="text-muted-foreground">Try a different search term</Text>
                    </View>
                ) : (
                    posts.map((post) => (
                        <Pressable
                            key={post._id}
                            onPress={() => router.push(`/post/${post._id}`)}
                            className="flex-row items-center px-5 py-4 border-b border-surface-light active:bg-surface-card"
                        >
                            <Image
                                source={{ uri: post.images[0] }}
                                style={{ width: 60, height: 60, borderRadius: 8 }}
                                contentFit="cover"
                            />
                            <View className="ml-3 flex-1">
                                <Text className="text-foreground font-semibold" numberOfLines={1}>
                                    {post.author.name}
                                </Text>
                                {post.caption && (
                                    <Text className="text-muted-foreground text-sm" numberOfLines={2}>
                                        {post.caption}
                                    </Text>
                                )}
                                <View className="flex-row items-center mt-1">
                                    <Ionicons name="heart" size={14} color="#6B6B70" />
                                    <Text className="text-subtle-foreground text-xs ml-1 mr-3">
                                        {post.likes.length}
                                    </Text>
                                    <Ionicons name="chatbubble" size={14} color="#6B6B70" />
                                    <Text className="text-subtle-foreground text-xs ml-1">
                                        {post.comments.length}
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#6B6B70" />
                        </Pressable>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default SearchScreen;
