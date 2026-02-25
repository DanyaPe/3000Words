import AsyncStorage from "@react-native-async-storage/async-storage";

const PROGRESS_KEY = "@word_progress";
const VIEWED_WORDS_KEY = "@viewed_words"; // Новый ключ для просмотренных слов
const SESSION_STATS_KEY = "@session_stats";

// Получить весь прогресс
export const getProgress = async () => {
    try {
        const progress = await AsyncStorage.getItem(PROGRESS_KEY);
        return progress ? JSON.parse(progress) : {};
    } catch (error) {
        console.error("Ошибка загрузки прогресса:", error);
        return {};
    }
};

// Сохранить прогресс
export const saveProgress = async (progress) => {
    try {
        await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch (error) {
        console.error("Ошибка сохранения прогресса:", error);
    }
};

// Обновить прогресс для конкретного слова
export const updateWordProgress = async (wordId, updates) => {
    const progress = await getProgress();
    progress[wordId] = {
        ...progress[wordId],
        ...updates,
        lastReviewed: Date.now(),
    };
    await saveProgress(progress);
};

// Получить статус конкретного слова
export const getWordStatus = async (wordId) => {
    const progress = await getProgress();
    return (
        progress[wordId] || {
            status: "new",
            correctCount: 0,
            incorrectCount: 0,
            lastReviewed: null,
        }
    );
};

// Отметить слово как "знаю"
export const markWordAsKnown = async (wordId) => {
    await updateWordProgress(wordId, {
        status: "learned",
        correctCount: (await getWordStatus(wordId)).correctCount + 1,
    });
};

// Отметить слово как "еще учу"
export const markWordAsLearning = async (wordId) => {
    await updateWordProgress(wordId, {
        status: "learning",
    });
};

// Записать результат попытки (правильно/неправильно)
export const recordAttempt = async (wordId, isCorrect) => {
    const currentStatus = await getWordStatus(wordId);
    const updates = {
        correctCount: currentStatus.correctCount + (isCorrect ? 1 : 0),
        incorrectCount: currentStatus.incorrectCount + (isCorrect ? 0 : 1),
    };

    // Автоматически переводим в "learned" после 3 правильных ответов подряд
    if (isCorrect && currentStatus.correctCount + 1 >= 3) {
        updates.status = "learned";
    } else if (!isCorrect) {
        updates.status = "learning";
    }

    await updateWordProgress(wordId, updates);
};

// Получить статистику
export const getStatistics = async () => {
    const progress = await getProgress();
    const stats = {
        new: 0,
        learning: 0,
        learned: 0,
        total: 0,
    };

    Object.values(progress).forEach((wordProgress) => {
        stats[wordProgress.status]++;
        stats.total++;
    });

    return stats;
};

// ========== НОВЫЕ ФУНКЦИИ ДЛЯ ПРОСМОТРЕННЫХ СЛОВ ==========

// Получить просмотренные слова по темам и режимам
export const getViewedWords = async () => {
    try {
        const viewed = await AsyncStorage.getItem(VIEWED_WORDS_KEY);
        return viewed ? JSON.parse(viewed) : {};
    } catch (error) {
        console.error("Ошибка загрузки просмотренных слов:", error);
        return {};
    }
};

// Сохранить просмотренные слова
const saveViewedWords = async (viewedWords) => {
    try {
        await AsyncStorage.setItem(
            VIEWED_WORDS_KEY,
            JSON.stringify(viewedWords),
        );
    } catch (error) {
        console.error("Ошибка сохранения просмотренных слов:", error);
    }
};

// Сбросить статус слов для конкретной темы и режима
export const resetWordStatusForTopic = async (topic, mode) => {
    const progress = await getProgress();
    const {
        getAllWords,
        getWordsByTopic,
        getWordId,
    } = require("./wordsManager");

    // Получаем слова темы
    const topicWords = getWordsByTopic(topic);

    // Удаляем статус для каждого слова из темы
    topicWords.forEach((word) => {
        const wordId = getWordId(word);
        delete progress[wordId];
    });

    await saveProgress(progress);
};

// Отметить слово как просмотренное для конкретной темы и режима
export const markWordAsViewed = async (wordId, topic, mode) => {
    const viewedWords = await getViewedWords();
    const key = `${mode.toLowerCase()}_${topic || "all"}`; // ← Добавили .toLowerCase()

    if (!viewedWords[key]) {
        viewedWords[key] = [];
    }

    if (!viewedWords[key].includes(wordId)) {
        viewedWords[key].push(wordId);
    }

    await saveViewedWords(viewedWords);
};

// Получить список просмотренных слов для темы и режима
export const getViewedWordsForTopicAndMode = async (topic, mode) => {
    const viewedWords = await getViewedWords();
    const key = `${mode.toLowerCase()}_${topic || "all"}`; // ← Добавили .toLowerCase()
    return viewedWords[key] || [];
};

// Сбросить прогресс для конкретной темы и режима
export const resetProgressForTopicAndMode = async (topic, mode) => {
    // Сбрасываем просмотренные слова
    const viewedWords = await getViewedWords();
    const key = `${mode.toLowerCase()}_${topic || "all"}`; // ← Добавили .toLowerCase()
    delete viewedWords[key];
    await saveViewedWords(viewedWords);

    // Сбрасываем статус слов (learned/learning)
    await resetWordStatusForTopic(topic, mode);
};

// Получить статистику по просмотренным словам для темы и режима
export const getViewedStats = async (topic, mode) => {
    const viewedWordIds = await getViewedWordsForTopicAndMode(topic, mode);
    return {
        viewedCount: viewedWordIds.length,
    };
};

// Получить статус темы для конкретного режима
export const getTopicStatus = async (topic, mode) => {
    const viewedWordIds = await getViewedWordsForTopicAndMode(topic, mode);
    const { getWordsByTopic } = require("./wordsManager");
    const topicWords = getWordsByTopic(topic);

    if (viewedWordIds.length === 0) {
        return "new";
    } else if (viewedWordIds.length === topicWords.length) {
        return "completed";
    } else {
        return "in_progress";
    }
};

// Получить статистику по всем темам для конкретного режима
export const getTopicsStatusForMode = async (mode) => {
    const { getTopicsWithCounts } = require("./topicsManager");
    const topics = getTopicsWithCounts();

    const topicsStatus = {};

    for (const topic of topics) {
        const status = await getTopicStatus(topic.name, mode);
        topicsStatus[topic.name] = status;
    }

    return topicsStatus;
};

// Получить статистику сессии для темы и режима
export const getSessionStats = async (topic, mode) => {
    try {
        const allStats = await AsyncStorage.getItem(SESSION_STATS_KEY);
        const stats = allStats ? JSON.parse(allStats) : {};
        const key = `${mode.toLowerCase()}_${topic || "all"}`;
        return stats[key] || { correct: 0, incorrect: 0 };
    } catch (error) {
        console.error("Ошибка загрузки статистики сессии:", error);
        return { correct: 0, incorrect: 0 };
    }
};

// Сохранить статистику сессии
export const saveSessionStats = async (topic, mode, correct, incorrect) => {
    try {
        const allStats = await AsyncStorage.getItem(SESSION_STATS_KEY);
        const stats = allStats ? JSON.parse(allStats) : {};
        const key = `${mode.toLowerCase()}_${topic || "all"}`;
        stats[key] = { correct, incorrect };
        await AsyncStorage.setItem(SESSION_STATS_KEY, JSON.stringify(stats));
    } catch (error) {
        console.error("Ошибка сохранения статистики сессии:", error);
    }
};

// Сбросить статистику сессии для темы и режима
export const resetSessionStats = async (topic, mode) => {
    try {
        const allStats = await AsyncStorage.getItem(SESSION_STATS_KEY);
        const stats = allStats ? JSON.parse(allStats) : {};
        const key = `${mode.toLowerCase()}_${topic || "all"}`;
        delete stats[key];
        await AsyncStorage.setItem(SESSION_STATS_KEY, JSON.stringify(stats));
    } catch (error) {
        console.error("Ошибка сброса статистики сессии:", error);
    }
};
