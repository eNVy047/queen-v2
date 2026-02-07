import { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    Pressable,
    TextInput,
    Alert,
    ActivityIndicator,
    Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@clerk/clerk-expo";

const { width } = Dimensions.get("window");
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

const CreatePostScreen = () => {
    const router = useRouter();
    const { getToken } = useAuth();

    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [caption, setCaption] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Request permissions and pick images
    const pickImages = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== "granted") {
                Alert.alert(
                    "Permission Required",
                    "Please grant camera roll permissions to upload images."
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsMultipleSelection: true,
                quality: 0.8,
                selectionLimit: 10,
            });

            if (!result.canceled && result.assets) {
                const newImages = result.assets.map((asset) => asset.uri);
                setSelectedImages((prev) => [...prev, ...newImages].slice(0, 10));
            }
        } catch (error) {
            console.error("Error picking images:", error);
            Alert.alert("Error", "Failed to pick images");
        }
    };

    // Remove image from selection
    const removeImage = (index: number) => {
        setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    };

    // Create post
    const handleCreatePost = async () => {
        if (selectedImages.length === 0) {
            Alert.alert("No Images", "Please select at least one image");
            return;
        }

        setIsLoading(true);

        try {
            const token = await getToken();
            const formData = new FormData();

            // Add images to form data
            for (let i = 0; i < selectedImages.length; i++) {
                const uri = selectedImages[i];
                const filename = uri.split("/").pop() || `image_${i}.jpg`;
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : "image/jpeg";

                formData.append("images", {
                    uri,
                    name: filename,
                    type,
                } as any);
            }

            // Add caption
            if (caption.trim()) {
                formData.append("caption", caption.trim());
            }

            const response = await fetch(`${API_URL}/api/posts`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to create post");
            }

            Alert.alert("Success", "Post created successfully!", [
                {
                    text: "OK",
                    onPress: () => router.back(),
                },
            ]);
        } catch (error) {
            console.error("Error creating post:", error);
            Alert.alert("Error", "Failed to create post. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-surface-dark">
            {/* HEADER */}
            <LinearGradient
                colors={["#F4A261", "#E76F51"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="pt-12 pb-6 px-5"
            >
                <View className="flex-row items-center justify-between">
                    <Pressable
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full bg-black/20 items-center justify-center active:opacity-70"
                    >
                        <Ionicons name="close" size={24} color="#FFFFFF" />
                    </Pressable>
                    <Text className="text-2xl font-bold text-white">Create Post</Text>
                    <View className="w-10" />
                </View>
            </LinearGradient>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* IMAGE PICKER SECTION */}
                <View className="mx-5 mt-6">
                    <Text className="text-foreground text-lg font-semibold mb-3">
                        Photos ({selectedImages.length}/10)
                    </Text>

                    {selectedImages.length === 0 ? (
                        <Pressable
                            onPress={pickImages}
                            className="h-48 bg-surface-card rounded-2xl border-2 border-dashed border-surface-light items-center justify-center active:opacity-70"
                        >
                            <Ionicons name="images-outline" size={48} color="#6B6B70" />
                            <Text className="text-muted-foreground mt-3 text-base">
                                Tap to select photos
                            </Text>
                            <Text className="text-subtle-foreground text-sm mt-1">
                                Up to 10 images
                            </Text>
                        </Pressable>
                    ) : (
                        <View>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                className="mb-3"
                            >
                                {selectedImages.map((uri, index) => (
                                    <View key={index} className="mr-3 relative">
                                        <Image
                                            source={{ uri }}
                                            style={{
                                                width: width * 0.7,
                                                height: width * 0.7,
                                                borderRadius: 16,
                                            }}
                                        />
                                        <Pressable
                                            onPress={() => removeImage(index)}
                                            className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full items-center justify-center active:opacity-70"
                                        >
                                            <Ionicons name="close" size={18} color="#FFFFFF" />
                                        </Pressable>
                                        <View className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded-full">
                                            <Text className="text-white text-xs font-semibold">
                                                {index + 1}/{selectedImages.length}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>

                            {selectedImages.length < 10 && (
                                <Pressable
                                    onPress={pickImages}
                                    className="bg-surface-card border border-surface-light rounded-2xl py-3 items-center active:opacity-70"
                                >
                                    <View className="flex-row items-center">
                                        <Ionicons name="add-circle-outline" size={20} color="#F4A261" />
                                        <Text className="text-primary ml-2 font-semibold">
                                            Add More Photos
                                        </Text>
                                    </View>
                                </Pressable>
                            )}
                        </View>
                    )}
                </View>

                {/* CAPTION SECTION */}
                <View className="mx-5 mt-6">
                    <Text className="text-foreground text-lg font-semibold mb-3">
                        Caption
                    </Text>
                    <View className="bg-surface-card rounded-2xl border border-surface-light p-4">
                        <TextInput
                            value={caption}
                            onChangeText={setCaption}
                            placeholder="Write a caption..."
                            placeholderTextColor="#6B6B70"
                            multiline
                            numberOfLines={4}
                            maxLength={2200}
                            className="text-foreground text-base min-h-[100px]"
                            style={{ textAlignVertical: "top" }}
                        />
                        <Text className="text-subtle-foreground text-xs mt-2 text-right">
                            {caption.length}/2200
                        </Text>
                    </View>
                </View>

                {/* TAG PEOPLE SECTION (Placeholder for future implementation) */}
                <View className="mx-5 mt-6">
                    <Text className="text-foreground text-lg font-semibold mb-3">
                        Tag People
                    </Text>
                    <Pressable className="bg-surface-card border border-surface-light rounded-2xl py-4 px-4 flex-row items-center active:opacity-70">
                        <Ionicons name="person-add-outline" size={20} color="#F4A261" />
                        <Text className="text-muted-foreground ml-3">Tag people (Coming soon)</Text>
                    </Pressable>
                </View>

                {/* POST BUTTON */}
                <Pressable
                    onPress={handleCreatePost}
                    disabled={isLoading || selectedImages.length === 0}
                    className={`mx-5 mt-8 rounded-2xl py-4 items-center ${isLoading || selectedImages.length === 0
                            ? "bg-surface-light"
                            : "bg-primary"
                        }`}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#0D0D0F" />
                    ) : (
                        <View className="flex-row items-center">
                            <Ionicons
                                name="checkmark-circle"
                                size={22}
                                color={selectedImages.length === 0 ? "#6B6B70" : "#0D0D0F"}
                            />
                            <Text
                                className={`ml-2 font-bold text-base ${selectedImages.length === 0 ? "text-muted-foreground" : "text-surface-dark"
                                    }`}
                            >
                                Create Post
                            </Text>
                        </View>
                    )}
                </Pressable>
            </ScrollView>
        </View>
    );
};

export default CreatePostScreen;
