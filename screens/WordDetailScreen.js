import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { getWordId } from "../utils/wordsManager";
import { resetCustomWord } from "../utils/customWordsManager";

export default function WordDetailScreen({ navigation, route }) {
    const [word, setWord] = useState(route.params.word);
    const { topic } = route.params;

    useEffect(() => {
        // Обновляем слово при возврате с экрана редактирования
        const unsubscribe = navigation.addListener("focus", () => {
            if (route.params.word) {
                setWord(route.params.word);
            }
        });

        return unsubscribe;
    }, [navigation]);

    const handleEdit = () => {
        navigation.navigate("WordEdit", { word, topic });
    };

    const handleReset = () => {
        if (!word.isCustom) {
            Alert.alert("Внимание", "Это слово не редактировалось");
            return;
        }

        Alert.alert(
            "Сбросить изменения",
            "Вы уверены, что хотите вернуть слово к оригинальному виду?",
            [
                { text: "Отмена", style: "cancel" },
                {
                    text: "Сбросить",
                    style: "destructive",
                    onPress: async () => {
                        const wordId = getWordId(word);
                        await resetCustomWord(wordId);
                        Alert.alert(
                            "Готово",
                            "Слово возвращено к оригинальному виду",
                        );
                        navigation.goBack();
                    },
                },
            ],
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                {word.isCustom && (
                    <View style={styles.customBanner}>
                        <Text style={styles.customBannerText}>✏️ Изменено</Text>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.label}>Английский:</Text>
                    <Text style={styles.value}>{word.english}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Транскрипция:</Text>
                    <Text style={styles.value}>{word.transcription}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Русский перевод:</Text>
                    <Text style={styles.value}>{word.russian}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Часть речи:</Text>
                    <Text style={styles.value}>{word.partOfSpeech}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Тема:</Text>
                    <Text style={styles.value}>{word.topic}</Text>
                </View>

                {word.isCustom && word.updatedAt && (
                    <View style={styles.section}>
                        <Text style={styles.label}>Изменено:</Text>
                        <Text style={styles.updatedDate}>
                            {new Date(word.updatedAt).toLocaleString("ru-RU")}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.buttons}>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={handleEdit}
                >
                    <Text style={styles.editButtonText}>✏️ Редактировать</Text>
                </TouchableOpacity>

                {word.isCustom && (
                    <TouchableOpacity
                        style={styles.resetButton}
                        onPress={handleReset}
                    >
                        <Text style={styles.resetButtonText}>
                            🔄 Сбросить изменения
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        padding: 20,
    },
    card: {
        backgroundColor: "white",
        borderRadius: 15,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    customBanner: {
        backgroundColor: "#FFA500",
        padding: 10,
        borderRadius: 8,
        marginBottom: 20,
        alignItems: "center",
    },
    customBannerText: {
        color: "white",
        fontWeight: "600",
        fontSize: 14,
    },
    section: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: "#888",
        marginBottom: 5,
    },
    value: {
        fontSize: 20,
        color: "#333",
        fontWeight: "500",
    },
    updatedDate: {
        fontSize: 14,
        color: "#666",
    },
    buttons: {
        marginTop: 20,
    },
    editButton: {
        backgroundColor: "#2196F3",
        padding: 18,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 10,
    },
    editButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    resetButton: {
        backgroundColor: "#FF9800",
        padding: 18,
        borderRadius: 12,
        alignItems: "center",
    },
    resetButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
});
