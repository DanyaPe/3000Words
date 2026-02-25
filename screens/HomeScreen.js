import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { getStatistics } from "../utils/progressManager";
import { getAllWords } from "../utils/wordsManager";

export default function HomeScreen({ navigation }) {
    const [stats, setStats] = useState(null);
    const [totalWords, setTotalWords] = useState(0);

    useEffect(() => {
        loadData();

        // Обновляем статистику при возврате на экран (после сброса прогресса)
        const unsubscribe = navigation.addListener("focus", () => {
            loadData();
        });

        return unsubscribe;
    }, [navigation]);

    const loadData = async () => {
        const statistics = await getStatistics();
        setStats(statistics);

        const words = getAllWords();
        setTotalWords(words.length);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>English Learning</Text>

            {stats && (
                <View style={styles.statsContainer}>
                    <Text style={styles.statsTitle}>Ваш прогресс</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>
                                {totalWords - stats.total}
                            </Text>
                            <Text style={styles.statLabel}>Новых</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text
                                style={[
                                    styles.statNumber,
                                    { color: "#FFA500" },
                                ]}
                            >
                                {stats.learning}
                            </Text>
                            <Text style={styles.statLabel}>Изучается</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text
                                style={[
                                    styles.statNumber,
                                    { color: "#4CAF50" },
                                ]}
                            >
                                {stats.learned}
                            </Text>
                            <Text style={styles.statLabel}>Выучено</Text>
                        </View>
                    </View>
                </View>
            )}

            <View style={styles.modesContainer}>
                <Text style={styles.modesTitle}>Выберите режим</Text>

                <TouchableOpacity
                    style={styles.modeButton}
                    onPress={() =>
                        navigation.navigate("TopicSelection", {
                            mode: "Flashcards",
                        })
                    }
                >
                    <Text style={styles.modeButtonText}>📚 Карточки</Text>
                    <Text style={styles.modeDescription}>
                        Свайп: знаю / учу
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.modeButton}
                    onPress={() =>
                        navigation.navigate("TopicSelection", {
                            mode: "Practice",
                        })
                    }
                >
                    <Text style={styles.modeButtonText}>✍️ Практика ввода</Text>
                    <Text style={styles.modeDescription}>
                        Введите перевод слова
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.modeButton}
                    onPress={() =>
                        navigation.navigate("TopicSelection", { mode: "Quiz" })
                    }
                >
                    <Text style={styles.modeButtonText}>📝 Тест</Text>
                    <Text style={styles.modeDescription}>
                        Выберите правильный ответ
                    </Text>
                </TouchableOpacity>
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
    title: {
        fontSize: 32,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 40,
        marginBottom: 30,
        color: "#333",
    },
    statsContainer: {
        backgroundColor: "white",
        borderRadius: 15,
        padding: 20,
        marginBottom: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 15,
        color: "#333",
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    statItem: {
        alignItems: "center",
    },
    statNumber: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#2196F3",
    },
    statLabel: {
        fontSize: 14,
        color: "#666",
        marginTop: 5,
    },
    modesContainer: {
        flex: 1,
    },
    modesTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 15,
        color: "#333",
    },
    modeButton: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    modeButtonText: {
        fontSize: 20,
        fontWeight: "600",
        color: "#333",
        marginBottom: 5,
    },
    modeDescription: {
        fontSize: 14,
        color: "#666",
    },
});
