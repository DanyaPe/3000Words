import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
} from "react-native";
import { getTopicsWithCounts } from "../utils/topicsManager";

export default function TopicSelectionScreen({ navigation, route }) {
    const [topics, setTopics] = useState([]);
    const { mode } = route.params; // 'Flashcards', 'Practice', или 'Quiz'

    useEffect(() => {
        const topicsData = getTopicsWithCounts();
        setTopics(topicsData);
    }, []);

    const handleTopicSelect = (topicName) => {
        // Переходим на выбранный режим с темой
        navigation.navigate(mode, { topic: topicName });
    };

    const handleAllTopics = () => {
        // Переходим на выбранный режим без фильтра по теме
        navigation.navigate(mode, { topic: null });
    };

    const getModeTitle = () => {
        switch (mode) {
            case "Flashcards":
                return "Карточки";
            case "Practice":
                return "Практика ввода";
            case "Quiz":
                return "Тест";
            default:
                return "";
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Выберите тему</Text>
            <Text style={styles.subtitle}>{getModeTitle()}</Text>

            <TouchableOpacity
                style={styles.allTopicsButton}
                onPress={handleAllTopics}
            >
                <Text style={styles.topicName}>Все темы</Text>
                <Text style={styles.topicCount}>
                    {topics.reduce((sum, t) => sum + t.count, 0)} слов
                </Text>
            </TouchableOpacity>

            <FlatList
                data={topics}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.topicItem}
                        onPress={() => handleTopicSelect(item.name)}
                    >
                        <Text style={styles.topicName}>{item.name}</Text>
                        <Text style={styles.topicCount}>{item.count} слов</Text>
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 20,
        marginBottom: 5,
        color: "#333",
    },
    subtitle: {
        fontSize: 16,
        textAlign: "center",
        color: "#666",
        marginBottom: 20,
    },
    allTopicsButton: {
        backgroundColor: "#2196F3",
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 20,
        borderRadius: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    listContainer: {
        padding: 20,
        paddingTop: 0,
    },
    topicItem: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    topicName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
    },
    topicCount: {
        fontSize: 14,
        color: "#666",
    },
});
