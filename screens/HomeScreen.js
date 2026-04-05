import { useState, useEffect } from "react";
import { getStatistics } from "../utils/progressManager";
import { getAllWords } from "../utils/wordsManager";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";

export default function HomeScreen({ navigation }) {
    const [stats, setStats] = useState(null);
    const [totalWords, setTotalWords] = useState(0);

    useEffect(() => {
        loadData();

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
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
        >
            <Text style={styles.title}>English Learning</Text>

            {stats && (
                <TouchableOpacity
                    style={styles.statsContainer}
                    onPress={() => navigation.navigate("LearningWords")}
                    activeOpacity={0.7}
                >
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

                    {stats.learning > 0 && (
                        <View style={styles.tapHintContainer}>
                            <Text style={styles.tapHint}>
                                👆 Нажмите для практики изучаемых слов
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
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

                <TouchableOpacity
                    style={[styles.modeButton, styles.browseButton]}
                    onPress={() => navigation.navigate("BrowseTopics")}
                >
                    <Text style={styles.modeButtonText}>📖 Просмотр слов</Text>
                    <Text style={styles.modeDescription}>
                        Просмотр и редактирование
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
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
    browseButton: {
        backgroundColor: "#E8F5E9",
        borderWidth: 2,
        borderColor: "#4CAF50",
    },
    tapHintContainer: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },
    tapHint: {
        fontSize: 12,
        color: "#999",
        textAlign: "center",
        fontStyle: "italic",
    },
});
