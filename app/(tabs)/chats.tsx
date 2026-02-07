import EmptyUI from "@/components/EmptyUI";
import { useChats } from "@/hooks/useChats";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
    View,
    Text,
    Pressable,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ChatsTab = () => {
    const router = useRouter();
    const { data: chats, isLoading, refetch, isRefetching } = useChats();

    const handleRefresh = () => {
        refetch();
    };

    return (
        <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
            {/* Header */}
            <View className="bg-surface-card border-b border-surface-light px-5 py-4">
                <View className="flex-row items-center justify-between">
                    <Text className="text-3xl font-bold text-primary">Chats</Text>
                    <Pressable
                        onPress={() => router.push("/new-chat")}
                        className="w-10 h-10 rounded-full bg-primary items-center justify-center active:opacity-70"
                    >
                        <Ionicons name="create-outline" size={22} color="#0D0D0F" />
                    </Pressable>
                </View>
            </View>

            {/* Chat List */}
            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#F4A261" />
                    <Text className="text-muted-foreground mt-3">Loading chats...</Text>
                </View>
            ) : !chats || chats.length === 0 ? (
                <EmptyUI
                    title="No chats yet"
                    subtitle="Start a conversation with someone!"
                    iconName="chatbubbles-outline"
                    iconColor="#6B6B70"
                    iconSize={64}
                />
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={handleRefresh}
                            tintColor="#F4A261"
                        />
                    }
                >
                    {chats.map((chat) => {
                        const participant = chat.participant;
                        const lastMessage = chat.lastMessage;

                        return (
                            <Pressable
                                key={chat._id}
                                onPress={() =>
                                    router.push({
                                        pathname: "/chat/[id]",
                                        params: {
                                            id: chat._id,
                                            participantId: participant._id,
                                            name: participant.name,
                                            avatar: participant.avatar,
                                        },
                                    })
                                }
                                className="flex-row items-center px-5 py-4 border-b border-surface-light active:bg-surface-card"
                            >
                                {/* Avatar */}
                                <Image
                                    source={{ uri: participant.avatar }}
                                    style={{ width: 56, height: 56, borderRadius: 28 }}
                                />

                                {/* Chat Info */}
                                <View className="flex-1 ml-3">
                                    <View className="flex-row items-center justify-between mb-1">
                                        <Text
                                            className="text-foreground font-semibold text-base"
                                            numberOfLines={1}
                                        >
                                            {participant.name}
                                        </Text>
                                        {lastMessage && (
                                            <Text className="text-subtle-foreground text-xs">
                                                {new Date(lastMessage.createdAt).toLocaleDateString(undefined, {
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </Text>
                                        )}
                                    </View>

                                    {lastMessage && (
                                        <Text className="text-muted-foreground text-sm" numberOfLines={1}>
                                            {lastMessage.text}
                                        </Text>
                                    )}
                                </View>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

export default ChatsTab;
