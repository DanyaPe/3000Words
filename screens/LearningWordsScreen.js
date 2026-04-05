import { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Alert,
} from "react-native";
import { getTopicsWithLearningWords } from "../utils/progressManager";

export default function LearningWordsScreen({ navigation }) {
    const [topics, setTopics] = useState([]);
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [totalWords, setTotalWords] = useState(0);

    useEffect(() => {
        loadTopics();
    }, []);

    const loadTopics = async () => {
        const learningTopics = await getTopicsWithLearningWords();
        setTopics(learningTopics);

        const total = learningTopics.reduce(
            (sum, topic) => sum + topic.count,
            0,
        );
        setTotalWords(total);
    };

    const toggleTopic = (topicName) => {
        if (selectedTopics.includes(topicName)) {
            setSelectedTopics(selectedTopics.filter((t) => t !== topicName));
        } else {
            setSelectedTopics([...selectedTopics, topicName]);
        }
    };

    const selectAll = () => {
        if (selectedTopics.length === topics.length) {
            setSelectedTopics([]);
        } else {
            setSelectedTopics(topics.map((t) => t.name));
        }
    };

    const handleModeSelect = (mode) => {
        if (selectedTopics.length === 0) {
            Alert.alert("Внимание", "Выберите хотя бы одну тему");
            return;
        }

        navigation.navigate(mode, {
            learningMode: true,
            selectedTopics: selectedTopics,
        });
    };

    const getSelectedWordsCount = () => {
        return topics
            .filter((topic) => selectedTopics.includes(topic.name))
            .reduce((sum, topic) => sum + topic.count, 0);
    };

    if (topics.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>📚</Text>
                <Text style={styles.emptyTitle}>Нет слов на изучении</Text>
                <Text style={styles.emptyText}>
                    Свайпните карточки влево чтобы отметить слова как "Ещё учу"
                </Text>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>Назад</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Слова на изучении</Text>
                <Text style={styles.subtitle}>Всего: {totalWords} слов</Text>

                <TouchableOpacity
                    style={styles.selectAllButton}
                    onPress={selectAll}
                >
                    <Text style={styles.selectAllText}>
                        {selectedTopics.length === topics.length
                            ? "☑️ Снять все"
                            : "☐ Выбрать все"}
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={topics}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => {
                    const isSelected = selectedTopics.includes(item.name);
                    return (
                        <TouchableOpacity
                            style={[
                                styles.topicItem,
                                isSelected && styles.topicItemSelected,
                            ]}
                            onPress={() => toggleTopic(item.name)}
                        >
                            <View style={styles.checkbox}>
                                <Text style={styles.checkboxText}>
                                    {isSelected ? "☑️" : "☐"}
                                </Text>
                            </View>
                            <View style={styles.topicContent}>
                                <Text style={styles.topicName}>
                                    {item.name}
                                </Text>
                                <Text style={styles.topicCount}>
                                    {item.count} слов
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                }}
                contentContainerStyle={styles.listContainer}
            />

            {selectedTopics.length > 0 && (
                <View style={styles.footer}>
                    <Text style={styles.selectedCount}>
                        Выбрано: {getSelectedWordsCount()} слов из{" "}
                        {selectedTopics.length} тем
                    </Text>

                    <Text style={styles.modeTitle}>Выберите режим:</Text>

                    <View style={styles.modeButtons}>
                        <TouchableOpacity
                            style={styles.modeButton}
                            onPress={() => handleModeSelect("Flashcards")}
                        >
                            <Text style={styles.modeButtonText}>
                                📚 Карточки
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modeButton}
                            onPress={() => handleModeSelect("Practice")}
                        >
                            <Text style={styles.modeButtonText}>
                                ✍️ Практика
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modeButton}
                            onPress={() => handleModeSelect("Quiz")}
                        >
                            <Text style={styles.modeButtonText}>📝 Тест</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        backgroundColor: "white",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginBottom: 15,
    },
    selectAllButton: {
        backgroundColor: "#E3F2FD",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    selectAllText: {
        fontSize: 16,
        color: "#1976D2",
        fontWeight: "600",
    },
    listContainer: {
        padding: 20,
    },
    topicItem: {
        backgroundColor: "white",
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#ddd",
    },
    topicItemSelected: {
        borderColor: "#2196F3",
        backgroundColor: "#E3F2FD",
    },
    checkbox: {
        marginRight: 15,
    },
    checkboxText: {
        fontSize: 24,
    },
    topicContent: {
        flex: 1,
    },
    topicName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 4,
    },
    topicCount: {
        fontSize: 14,
        color: "#666",
    },
    footer: {
        backgroundColor: "white",
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },
    selectedCount: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginBottom: 15,
    },
    modeTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 10,
        textAlign: "center",
    },
    modeButtons: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    modeButton: {
        backgroundColor: "#2196F3",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        minWidth: 100,
        alignItems: "center",
    },
    modeButtonText: {
        color: "white",
        fontSize: 14,
        fontWeight: "bold",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
        backgroundColor: "#f5f5f5",
    },
    emptyEmoji: {
        fontSize: 80,
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
        textAlign: "center",
    },
    emptyText: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 30,
        lineHeight: 24,
    },
    backButton: {
        backgroundColor: "#2196F3",
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 25,
    },
    backButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
});
