import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { getWordId, getWordsByTopicWithCustom } from "../utils/wordsManager";
import {
    recordAttempt,
    markWordAsViewed,
    getViewedWordsForTopicAndMode,
    resetProgressForTopicAndMode,
    getSessionStats,
    saveSessionStats,
    resetSessionStats,
} from "../utils/progressManager";

export default function QuizScreen({ navigation, route }) {
    const [words, setWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [options, setOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [direction, setDirection] = useState("en-ru");
    const [stats, setStats] = useState({ correct: 0, incorrect: 0 });
    const [viewedCount, setViewedCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const { topic } = route.params || {};

    useEffect(() => {
        loadWords();
    }, [topic]);

    useEffect(() => {
        if (words.length > 0) {
            generateOptions();
        }
    }, [currentIndex, words, direction]);

    const loadWords = async () => {
        const topicWords = await getWordsByTopicWithCustom(topic);
        setTotalCount(topicWords.length);

        const viewedWordIds = await getViewedWordsForTopicAndMode(
            topic,
            "quiz",
        );
        setViewedCount(viewedWordIds.length);

        const savedStats = await getSessionStats(topic, "quiz");
        setStats(savedStats);

        const unviewedWords = topicWords.filter((word) => {
            const wordId = getWordId(word);
            return !viewedWordIds.includes(wordId);
        });

        const shuffled = [...unviewedWords].sort(() => 0.5 - Math.random());
        setWords(shuffled);
        setCurrentIndex(0);
    };

    const generateOptions = async () => {
        if (words.length === 0 || currentIndex >= words.length) return;

        const currentWord = words[currentIndex];
        const correctAnswer =
            direction === "en-ru" ? currentWord.russian : currentWord.english;

        const topicWords = await getWordsByTopicWithCustom(topic);

        const wrongOptions = topicWords
            .filter((w) => {
                const answer = direction === "en-ru" ? w.russian : w.english;
                return answer !== correctAnswer;
            })
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map((w) => (direction === "en-ru" ? w.russian : w.english));

        const allOptions = [correctAnswer, ...wrongOptions].sort(
            () => 0.5 - Math.random(),
        );
        setOptions(allOptions);
        setSelectedOption(null);
        setShowResult(false);
    };

    const handleSelectOption = async (option) => {
        if (showResult) return;

        setSelectedOption(option);
        setShowResult(true);

        const currentWord = words[currentIndex];
        const correctAnswer =
            direction === "en-ru" ? currentWord.russian : currentWord.english;
        const isCorrect = option === correctAnswer;

        const wordId = getWordId(currentWord);
        await recordAttempt(wordId, isCorrect);
        await markWordAsViewed(wordId, topic, "quiz");

        const newStats = {
            correct: stats.correct + (isCorrect ? 1 : 0),
            incorrect: stats.incorrect + (isCorrect ? 0 : 1),
        };
        setStats(newStats);

        await saveSessionStats(
            topic,
            "quiz",
            newStats.correct,
            newStats.incorrect,
        );

        setViewedCount((prev) => prev + 1);
    };

    const nextQuestion = () => {
        if (currentIndex < words.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            showCompletionDialog();
        }
    };

    const showCompletionDialog = () => {
        const total = stats.correct + stats.incorrect;
        const percentage =
            total > 0 ? Math.round((stats.correct / total) * 100) : 0;

        Alert.alert(
            "🎉 Тест завершён!",
            `Все слова пройдены!\n\nТема: ${topic || "Все темы"}\nПравильно: ${stats.correct}\nОшибок: ${stats.incorrect}\nТочность: ${percentage}%`,
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
            `Вы уверены, что хотите сбросить прогресс для темы "${topic || "Все темы"}"? Все пройденные вопросы и статистика станут доступны снова.`,
            [
                { text: "Отмена", style: "cancel" },
                {
                    text: "Сбросить",
                    style: "destructive",
                    onPress: async () => {
                        await resetProgressForTopicAndMode(topic, "quiz");
                        await resetSessionStats(topic, "quiz");
                        await loadWords();
                    },
                },
            ],
        );
    };

    const toggleDirection = () => {
        setDirection((prev) => (prev === "en-ru" ? "ru-en" : "en-ru"));
    };

    if (words.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.completionContainer}>
                    <Text style={styles.completionEmoji}>🎉</Text>
                    <Text style={styles.completionTitle}>
                        Все вопросы пройдены!
                    </Text>
                    <Text style={styles.completionText}>
                        Тема: {topic || "Все темы"}
                        {"\n"}
                        Всего слов: {totalCount}
                        {"\n"}
                        Правильно: {stats.correct}
                        {"\n"}
                        Ошибок: {stats.incorrect}
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

    const currentWord = words[currentIndex];
    const questionText =
        direction === "en-ru" ? currentWord.english : currentWord.russian;
    const correctAnswer =
        direction === "en-ru" ? currentWord.russian : currentWord.english;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.progressInfo}>
                    <Text style={styles.counter}>
                        {viewedCount} / {totalCount} пройдено
                    </Text>
                    <Text style={styles.remaining}>
                        Осталось: {words.length - currentIndex}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.directionButton}
                    onPress={toggleDirection}
                    disabled={showResult}
                >
                    <Text style={styles.directionText}>
                        {direction === "en-ru" ? "🇬🇧 → 🇷🇺" : "🇷🇺 → 🇬🇧"}
                    </Text>
                </TouchableOpacity>
                <View style={styles.statsRow}>
                    <Text style={styles.statsText}>
                        ✓ {stats.correct} ✗ {stats.incorrect}
                    </Text>
                    <TouchableOpacity
                        style={styles.resetSmallButton}
                        onPress={handleResetProgress}
                    >
                        <Text style={styles.resetSmallButtonText}>🔄</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.questionContainer}>
                <Text style={styles.questionLabel}>
                    Выберите правильный перевод:
                </Text>
                <Text style={styles.questionText}>{questionText}</Text>
                {direction === "en-ru" && (
                    <Text style={styles.transcription}>
                        {currentWord.transcription}
                    </Text>
                )}
            </View>

            <View style={styles.optionsContainer}>
                {options.map((option, index) => {
                    const isSelected = selectedOption === option;
                    const isCorrectOption = option === correctAnswer;

                    let optionStyle = styles.option;
                    if (showResult && isSelected && isCorrectOption) {
                        optionStyle = [styles.option, styles.optionCorrect];
                    } else if (showResult && isSelected && !isCorrectOption) {
                        optionStyle = [styles.option, styles.optionIncorrect];
                    } else if (showResult && isCorrectOption) {
                        optionStyle = [styles.option, styles.optionCorrect];
                    }

                    return (
                        <TouchableOpacity
                            key={index}
                            style={optionStyle}
                            onPress={() => handleSelectOption(option)}
                            disabled={showResult}
                        >
                            <Text style={styles.optionText}>{option}</Text>
                            {showResult && isCorrectOption && (
                                <Text style={styles.checkmark}>✓</Text>
                            )}
                            {showResult && isSelected && !isCorrectOption && (
                                <Text style={styles.crossmark}>✗</Text>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {showResult && (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.nextButton}
                        onPress={nextQuestion}
                    >
                        <Text style={styles.buttonText}>Далее →</Text>
                    </TouchableOpacity>
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
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 15,
        backgroundColor: "white",
    },
    progressInfo: {
        alignItems: "flex-start",
        flex: 1,
    },
    counter: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
    },
    remaining: {
        fontSize: 12,
        color: "#666",
        marginTop: 2,
    },
    directionButton: {
        backgroundColor: "#e0e0e0",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    directionText: {
        fontSize: 14,
        fontWeight: "600",
    },
    statsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    statsText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
    },
    resetSmallButton: {
        backgroundColor: "#FF9800",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    resetSmallButtonText: {
        color: "white",
        fontSize: 14,
    },
    questionContainer: {
        alignItems: "center",
        padding: 30,
        backgroundColor: "white",
        marginTop: 10,
    },
    questionLabel: {
        fontSize: 16,
        color: "#888",
        marginBottom: 15,
    },
    questionText: {
        fontSize: 36,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
    },
    transcription: {
        fontSize: 18,
        color: "#666",
        marginTop: 10,
    },
    optionsContainer: {
        padding: 20,
        flex: 1,
    },
    option: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 2,
        borderColor: "#ddd",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    optionCorrect: {
        borderColor: "#4CAF50",
        backgroundColor: "#E8F5E9",
    },
    optionIncorrect: {
        borderColor: "#F44336",
        backgroundColor: "#FFEBEE",
    },
    optionText: {
        fontSize: 20,
        color: "#333",
        flex: 1,
    },
    checkmark: {
        fontSize: 28,
        color: "#4CAF50",
        fontWeight: "bold",
    },
    crossmark: {
        fontSize: 28,
        color: "#F44336",
        fontWeight: "bold",
    },
    buttonContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    nextButton: {
        backgroundColor: "#4CAF50",
        padding: 18,
        borderRadius: 12,
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontSize: 20,
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
