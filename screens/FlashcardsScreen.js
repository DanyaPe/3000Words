import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import SwipeableCard from "../components/SwipeableCard";
import { getWordsByTopic, getWordId } from "../utils/wordsManager";
import {
    markWordAsKnown,
    markWordAsLearning,
    markWordAsViewed,
    getViewedWordsForTopicAndMode,
    resetProgressForTopicAndMode,
} from "../utils/progressManager";

export default function FlashcardsScreen({ navigation, route }) {
    const [allTopicWords, setAllTopicWords] = useState([]); // Все слова темы
    const [words, setWords] = useState([]); // Непросмотренные слова
    const [currentIndex, setCurrentIndex] = useState(0);
    const [viewedCount, setViewedCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const { topic } = route.params || {};

    useEffect(() => {
        loadWords();
    }, [topic]);

    const loadWords = async () => {
        const topicWords = getWordsByTopic(topic);
        setAllTopicWords(topicWords);
        setTotalCount(topicWords.length);

        // Получаем список просмотренных слов
        const viewedWordIds = await getViewedWordsForTopicAndMode(
            topic,
            "flashcards",
        );
        setViewedCount(viewedWordIds.length);

        // Фильтруем непросмотренные слова
        const unviewedWords = topicWords.filter((word) => {
            const wordId = getWordId(word);
            return !viewedWordIds.includes(wordId);
        });

        // Перемешиваем непросмотренные
        const shuffled = [...unviewedWords].sort(() => 0.5 - Math.random());
        setWords(shuffled);
        setCurrentIndex(0);
    };

    const handleSwipeLeft = async () => {
        if (words.length === 0) return;

        const currentWord = words[currentIndex];
        const wordId = getWordId(currentWord);
        await markWordAsLearning(wordId);
        await markWordAsViewed(wordId, topic, "flashcards");

        nextCard();
    };

    const handleSwipeRight = async () => {
        if (words.length === 0) return;

        const currentWord = words[currentIndex];
        const wordId = getWordId(currentWord);
        await markWordAsKnown(wordId);
        await markWordAsViewed(wordId, topic, "flashcards");

        nextCard();
    };

    const nextCard = () => {
        setViewedCount((prev) => prev + 1);

        if (currentIndex < words.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            // Все карточки просмотрены
            showCompletionDialog();
        }
    };

    const showCompletionDialog = () => {
        Alert.alert(
            "🎉 Поздравляем!",
            `Вы просмотрели все карточки в теме "${topic || "Все темы"}"!\n\nВсего слов: ${totalCount}`,
            [
                {
                    text: "На главную",
                    onPress: () => navigation.navigate("Home"),
                },
                {
                    text: "Сбросить прогресс",
                    onPress: () => handleResetProgress(),
                    style: "destructive",
                },
            ],
        );
    };

    const handleResetProgress = async () => {
        Alert.alert(
            "Сброс прогресса",
            `Вы уверены, что хотите сбросить прогресс для темы "${topic || "Все темы"}"? Все просмотренные карточки станут доступны снова.`,
            [
                { text: "Отмена", style: "cancel" },
                {
                    text: "Сбросить",
                    style: "destructive",
                    onPress: async () => {
                        await resetProgressForTopicAndMode(topic, "flashcards");
                        await loadWords();
                    },
                },
            ],
        );
    };

    if (words.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.completionContainer}>
                    <Text style={styles.completionEmoji}>🎉</Text>
                    <Text style={styles.completionTitle}>
                        Все карточки просмотрены!
                    </Text>
                    <Text style={styles.completionText}>
                        Тема: {topic || "Все темы"}
                        {"\n"}
                        Всего слов: {totalCount}
                    </Text>

                    <TouchableOpacity
                        style={styles.resetButton}
                        onPress={handleResetProgress}
                    >
                        <Text style={styles.resetButtonText}>
                            🔄 Сбросить прогресс
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.homeButton}
                        onPress={() => navigation.navigate("Home")}
                    >
                        <Text style={styles.homeButtonText}>На главную</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.progressInfo}>
                    <Text style={styles.counter}>
                        {viewedCount} / {totalCount} просмотрено
                    </Text>
                    <Text style={styles.remaining}>
                        Осталось: {words.length - currentIndex}
                    </Text>
                </View>
                {topic && <Text style={styles.topicLabel}>Тема: {topic}</Text>}
                <TouchableOpacity
                    style={styles.resetSmallButton}
                    onPress={handleResetProgress}
                >
                    <Text style={styles.resetSmallButtonText}>🔄 Сброс</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.cardContainer}>
                <SwipeableCard
                    key={currentIndex}
                    word={words[currentIndex]}
                    onSwipeLeft={handleSwipeLeft}
                    onSwipeRight={handleSwipeRight}
                />
            </View>

            <View style={styles.buttonsContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.learningButton]}
                    onPress={handleSwipeLeft}
                >
                    <Text style={styles.buttonText}>👈 Еще учу</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.knowButton]}
                    onPress={handleSwipeRight}
                >
                    <Text style={styles.buttonText}>Знаю 👉</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        padding: 20,
        alignItems: "center",
        backgroundColor: "white",
    },
    progressInfo: {
        alignItems: "center",
        marginBottom: 8,
    },
    counter: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
    },
    remaining: {
        fontSize: 14,
        color: "#666",
        marginTop: 3,
    },
    topicLabel: {
        fontSize: 14,
        color: "#2196F3",
        fontWeight: "500",
        marginBottom: 8,
    },
    resetSmallButton: {
        backgroundColor: "#FF9800",
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 15,
    },
    resetSmallButtonText: {
        color: "white",
        fontSize: 14,
        fontWeight: "600",
    },
    cardContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
    },
    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 20,
        paddingBottom: 40,
    },
    button: {
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        minWidth: 150,
        alignItems: "center",
    },
    learningButton: {
        backgroundColor: "#FFA500",
    },
    knowButton: {
        backgroundColor: "#4CAF50",
    },
    buttonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    completionContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 30,
    },
    completionEmoji: {
        fontSize: 80,
        marginBottom: 20,
    },
    completionTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 15,
        textAlign: "center",
    },
    completionText: {
        fontSize: 18,
        color: "#666",
        textAlign: "center",
        marginBottom: 40,
        lineHeight: 26,
    },
    resetButton: {
        backgroundColor: "#FF9800",
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 25,
        marginBottom: 15,
    },
    resetButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    homeButton: {
        backgroundColor: "#2196F3",
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 25,
    },
    homeButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
});
