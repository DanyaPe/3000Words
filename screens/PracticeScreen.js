import { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from "react-native";
import { getWordsByTopic, getWordId } from "../utils/wordsManager";
import {
    recordAttempt,
    markWordAsViewed,
    getViewedWordsForTopicAndMode,
    resetProgressForTopicAndMode,
    getSessionStats,
    saveSessionStats,
    resetSessionStats,
} from "../utils/progressManager";

export default function PracticeScreen({ navigation, route }) {
    const [words, setWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userInput, setUserInput] = useState("");
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [direction, setDirection] = useState("en-ru");
    const [stats, setStats] = useState({ correct: 0, incorrect: 0 });
    const [viewedCount, setViewedCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const { topic } = route.params || {};

    useEffect(() => {
        loadWords();
    }, [topic]);

    const loadWords = async () => {
        const topicWords = getWordsByTopic(topic);
        setTotalCount(topicWords.length);

        const viewedWordIds = await getViewedWordsForTopicAndMode(
            topic,
            "practice",
        );
        setViewedCount(viewedWordIds.length);

        // Загружаем сохранённую статистику сессии
        const savedStats = await getSessionStats(topic, "practice");
        setStats(savedStats);

        const unviewedWords = topicWords.filter((word) => {
            const wordId = getWordId(word);
            return !viewedWordIds.includes(wordId);
        });

        const shuffled = [...unviewedWords].sort(() => 0.5 - Math.random());
        setWords(shuffled);
        setCurrentIndex(0);
    };

    const checkAnswer = async () => {
        if (!userInput.trim()) {
            Alert.alert("Внимание", "Введите перевод");
            return;
        }

        const currentWord = words[currentIndex];
        const correctAnswer =
            direction === "en-ru"
                ? currentWord.russian.trim().toLowerCase()
                : currentWord.english.trim().toLowerCase();

        const userAnswer = userInput.trim().toLowerCase();
        const correct = userAnswer === correctAnswer;

        setIsCorrect(correct);
        setShowResult(true);

        const wordId = getWordId(currentWord);
        await recordAttempt(wordId, correct);
        await markWordAsViewed(wordId, topic, "practice");

        const newStats = {
            correct: stats.correct + (correct ? 1 : 0),
            incorrect: stats.incorrect + (correct ? 0 : 1),
        };
        setStats(newStats);

        // Сохраняем статистику в AsyncStorage
        await saveSessionStats(
            topic,
            "practice",
            newStats.correct,
            newStats.incorrect,
        );

        setViewedCount((prev) => prev + 1);
    };

    const nextWord = () => {
        setUserInput("");
        setShowResult(false);

        if (currentIndex < words.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            // Сессия завершена
            showCompletionDialog();
        }
    };

    const showCompletionDialog = () => {
        const total = stats.correct + stats.incorrect;
        const percentage =
            total > 0 ? Math.round((stats.correct / total) * 100) : 0;

        Alert.alert(
            "🎉 Отлично!",
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
            `Вы уверены, что хотите сбросить прогресс для темы "${topic || "Все темы"}"? Все пройденные слова и статистика станут доступны снова.`,
            [
                { text: "Отмена", style: "cancel" },
                {
                    text: "Сбросить",
                    style: "destructive",
                    onPress: async () => {
                        await resetProgressForTopicAndMode(topic, "practice");
                        await resetSessionStats(topic, "practice");
                        await loadWords();
                    },
                },
            ],
        );
    };

    const toggleDirection = () => {
        setDirection((prev) => (prev === "en-ru" ? "ru-en" : "en-ru"));
        setUserInput("");
        setShowResult(false);
    };

    if (words.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.completionContainer}>
                    <Text style={styles.completionEmoji}>🎉</Text>
                    <Text style={styles.completionTitle}>
                        Все слова пройдены!
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
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
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
                <Text style={styles.questionLabel}>Переведите:</Text>
                <Text style={styles.questionText}>{questionText}</Text>
                {direction === "en-ru" && (
                    <Text style={styles.transcription}>
                        {currentWord.transcription}
                    </Text>
                )}
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={[
                        styles.input,
                        showResult &&
                            (isCorrect
                                ? styles.inputCorrect
                                : styles.inputIncorrect),
                    ]}
                    value={userInput}
                    onChangeText={setUserInput}
                    placeholder="Введите перевод"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!showResult}
                    onSubmitEditing={checkAnswer}
                />

                {showResult && (
                    <View style={styles.resultContainer}>
                        <Text
                            style={[
                                styles.resultText,
                                isCorrect
                                    ? styles.correctText
                                    : styles.incorrectText,
                            ]}
                        >
                            {isCorrect ? "✓ Правильно!" : "✗ Неправильно"}
                        </Text>
                        {!isCorrect && (
                            <Text style={styles.correctAnswerText}>
                                Правильный ответ: {correctAnswer}
                            </Text>
                        )}
                    </View>
                )}
            </View>

            <View style={styles.buttonContainer}>
                {!showResult ? (
                    <TouchableOpacity
                        style={styles.checkButton}
                        onPress={checkAnswer}
                    >
                        <Text style={styles.buttonText}>Проверить</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.nextButton}
                        onPress={nextWord}
                    >
                        <Text style={styles.buttonText}>Далее →</Text>
                    </TouchableOpacity>
                )}
            </View>
        </KeyboardAvoidingView>
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
        padding: 40,
        marginTop: 20,
    },
    questionLabel: {
        fontSize: 18,
        color: "#888",
        marginBottom: 15,
    },
    questionText: {
        fontSize: 42,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
    },
    transcription: {
        fontSize: 20,
        color: "#666",
        marginTop: 10,
    },
    inputContainer: {
        padding: 20,
        flex: 1,
    },
    input: {
        backgroundColor: "white",
        borderWidth: 2,
        borderColor: "#ddd",
        borderRadius: 12,
        padding: 15,
        fontSize: 24,
        textAlign: "left",
    },
    inputCorrect: {
        borderColor: "#4CAF50",
        backgroundColor: "#E8F5E9",
    },
    inputIncorrect: {
        borderColor: "#F44336",
        backgroundColor: "#FFEBEE",
    },
    resultContainer: {
        marginTop: 20,
        alignItems: "center",
    },
    resultText: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
    },
    correctText: {
        color: "#4CAF50",
    },
    incorrectText: {
        color: "#F44336",
    },
    correctAnswerText: {
        fontSize: 20,
        color: "#666",
    },
    buttonContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    checkButton: {
        backgroundColor: "#2196F3",
        padding: 18,
        borderRadius: 12,
        alignItems: "center",
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
