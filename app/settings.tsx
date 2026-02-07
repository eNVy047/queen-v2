import { useAuth, useUser } from "@clerk/clerk-expo";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const MENU_SECTIONS = [
    {
        title: "Account",
        items: [
            { icon: "person-outline", label: "Edit Profile", color: "#F4A261" },
            { icon: "shield-checkmark-outline", label: "Privacy & Security", color: "#10B981" },
            { icon: "notifications-outline", label: "Notifications", value: "On", color: "#8B5CF6" },
        ],
    },
    {
        title: "Preferences",
        items: [
            { icon: "moon-outline", label: "Dark Mode", value: "On", color: "#6366F1" },
            { icon: "language-outline", label: "Language", value: "English", color: "#EC4899" },
            { icon: "cloud-outline", label: "Data & Storage", value: "1.2 GB", color: "#14B8A6" },
        ],
    },
    {
        title: "Support",
        items: [
            { icon: "help-circle-outline", label: "Help Center", color: "#F59E0B" },
            { icon: "chatbubble-outline", label: "Contact Us", color: "#3B82F6" },
            { icon: "star-outline", label: "Rate the App", color: "#F4A261" },
        ],
    },
];

const SettingsScreen = () => {
    const { signOut } = useAuth();
    const { user } = useUser();
    const router = useRouter();

    return (
        <View className="flex-1 bg-surface-dark">
            {/* HEADER */}
            <LinearGradient
                colors={["#F4A261", "#E76F51"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="pt-12 pb-6 px-5"
            >
                <View className="flex-row items-center">
                    <Pressable
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full bg-black/20 items-center justify-center mr-3 active:opacity-70"
                    >
                        <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
                    </Pressable>
                    <Text className="text-2xl font-bold text-white flex-1">Settings</Text>
                </View>
            </LinearGradient>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* USER INFO CARD */}
                <View className="mx-5 mt-4 bg-surface-card rounded-2xl p-4 flex-row items-center border border-surface-light">
                    <View className="w-14 h-14 rounded-full bg-primary/20 items-center justify-center border-2 border-primary">
                        <Text className="text-primary text-xl font-bold">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </Text>
                    </View>
                    <View className="flex-1 ml-3">
                        <Text className="text-foreground font-semibold text-base">
                            {user?.firstName} {user?.lastName}
                        </Text>
                        <Text className="text-muted-foreground text-sm mt-0.5">
                            {user?.emailAddresses[0]?.emailAddress}
                        </Text>
                    </View>
                    <View className="bg-green-500/20 px-2.5 py-1 rounded-full">
                        <Text className="text-green-500 text-xs font-semibold">Online</Text>
                    </View>
                </View>

                {/* MENU SECTIONS */}
                {MENU_SECTIONS.map((section) => (
                    <View key={section.title} className="mt-6 mx-5">
                        <Text className="text-subtle-foreground text-xs font-semibold uppercase tracking-wider mb-2 ml-1">
                            {section.title}
                        </Text>
                        <View className="bg-surface-card rounded-2xl overflow-hidden border border-surface-light">
                            {section.items.map((item, index) => (
                                <Pressable
                                    key={item.label}
                                    className={`flex-row items-center px-4 py-3.5 active:bg-surface-light ${index < section.items.length - 1 ? "border-b border-surface-light" : ""
                                        }`}
                                >
                                    <View
                                        className="w-9 h-9 rounded-xl items-center justify-center"
                                        style={{ backgroundColor: `${item.color}20` }}
                                    >
                                        <Ionicons name={item.icon as any} size={20} color={item.color} />
                                    </View>
                                    <Text className="flex-1 ml-3 text-foreground font-medium">{item.label}</Text>
                                    {item.value && (
                                        <Text className="text-subtle-foreground text-sm mr-1">{item.value}</Text>
                                    )}
                                    <Ionicons name="chevron-forward" size={18} color="#6B6B70" />
                                </Pressable>
                            ))}
                        </View>
                    </View>
                ))}

                {/* APP INFO */}
                <View className="mx-5 mt-6 bg-surface-card rounded-2xl p-4 border border-surface-light">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-subtle-foreground text-sm">App Version</Text>
                        <Text className="text-foreground font-medium">1.0.0</Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                        <Text className="text-subtle-foreground text-sm">Build Number</Text>
                        <Text className="text-foreground font-medium">100</Text>
                    </View>
                </View>

                {/* Logout Button */}
                <Pressable
                    className="mx-5 mt-8 bg-red-500/10 rounded-2xl py-4 items-center active:opacity-70 border border-red-500/20"
                    onPress={() => signOut()}
                >
                    <View className="flex-row items-center">
                        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                        <Text className="ml-2 text-red-500 font-semibold">Log Out</Text>
                    </View>
                </Pressable>

                {/* FOOTER */}
                <Text className="text-center text-subtle-foreground text-xs mt-8">
                    Made with ❤️ by Xoraxi Team
                </Text>
            </ScrollView>
        </View>
    );
};

export default SettingsScreen;
