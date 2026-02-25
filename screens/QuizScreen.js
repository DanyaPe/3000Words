import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { getWordsByTopic, getWordId } from "../utils/wordsManager";
import { recordAttempt } from "../utils/progressManager";

export default function QuizScreen({ navigation, route }) {
    const [words, setWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [options, setOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [direction, setDirection] = useState("en-ru");
    const [stats, setStats] = useState({ correct: 0, incorrect: 0 });
    const { topic } = route.params || {};

    useEffect(() => {
        loadWords();
    }, [topic]);

    useEffect(() => {
        if (words.length > 0) {
            generateOptions();
        }
    }, [currentIndex, words, direction]);

    const loadWords = () => {
        const topicWords = getWordsByTopic(topic);
        const shuffled = [...topicWords].sort(() => 0.5 - Math.random());
        setWords(shuffled.slice(0, 30));
        setCurrentIndex(0);
        setStats({ correct: 0, incorrect: 0 });
    };

    const generateOptions = () => {
        if (words.length === 0 || currentIndex >= words.length) return;

        const currentWord = words[currentIndex];
        const correctAnswer =
            direction === "en-ru" ? currentWord.russian : currentWord.english;

        // ВАЖНО: берём неправильные варианты только из текущей темы
        const topicWords = getWordsByTopic(topic); // Используем слова только из текущей темы

        const wrongOptions = topicWords
            .filter((w) => {
                const answer = direction === "en-ru" ? w.russian : w.english;
                return answer !== correctAnswer;
            })
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map((w) => (direction === "en-ru" ? w.russian : w.english));

        // Собираем все варианты и перемешиваем
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

        // Сохраняем результат
        const wordId = getWordId(currentWord);
        await recordAttempt(wordId, isCorrect);

        // Обновляем статистику
        setStats((prev) => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            incorrect: prev.incorrect + (isCorrect ? 0 : 1),
        }));
    };

    const nextQuestion = () => {
        if (currentIndex < words.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            // Сессия завершена
            const total = stats.correct + stats.incorrect;
            const percentage = Math.round((stats.correct / total) * 100);
            Alert.alert(
                "Тест завершён!",
                `Результаты:\n\nПравильно: ${stats.correct}\nОшибок: ${stats.incorrect}\nТочность: ${percentage}%`,
                [
                    { text: "На главную", onPress: () => navigation.goBack() },
                    { text: "Ещё раз", onPress: loadWords },
                ],
            );
        }
    };

    const toggleDirection = () => {
        setDirection((prev) => (prev === "en-ru" ? "ru-en" : "en-ru"));
    };

    if (words.length === 0 || options.length === 0) {
        return (
            <View style={styles.container}>
                <Text>Загрузка...</Text>
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
                <Text style={styles.counter}>
                    {currentIndex + 1} / {words.length}
                </Text>
                {topic && <Text style={styles.topicLabel}>Тема: {topic}</Text>}
                <TouchableOpacity
                    style={styles.directionButton}
                    onPress={toggleDirection}
                    disabled={showResult}
                >
                    <Text style={styles.directionText}>
                        {direction === "en-ru" ? "🇬🇧 → 🇷🇺" : "🇷🇺 → 🇬🇧"}
                    </Text>
                </TouchableOpacity>
                <Text style={styles.statsText}>
                    ✓ {stats.correct} ✗ {stats.incorrect}
                </Text>
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
        padding: 20,
        backgroundColor: "white",
    },
    counter: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
    },
    topicLabel: {
        fontSize: 12,
        color: "#2196F3",
        fontWeight: "500",
    },
    directionButton: {
        backgroundColor: "#e0e0e0",
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 15,
    },
    directionText: {
        fontSize: 16,
        fontWeight: "600",
    },
    statsText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
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
});
