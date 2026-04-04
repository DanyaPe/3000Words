import AsyncStorage from "@react-native-async-storage/async-storage";

const PROGRESS_KEY = "@word_progress";
const VIEWED_WORDS_KEY = "@viewed_words";
const SESSION_STATS_KEY = "@session_stats";

export const getProgress = async () => {
    try {
        const progress = await AsyncStorage.getItem(PROGRESS_KEY);
        return progress ? JSON.parse(progress) : {};
    } catch (error) {
        console.error("Ошибка загрузки прогресса:", error);
        return {};
    }
};

export const saveProgress = async (progress) => {
    try {
        await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch (error) {
        console.error("Ошибка сохранения прогресса:", error);
    }
};

export const updateWordProgress = async (wordId, updates) => {
    const progress = await getProgress();
    progress[wordId] = {
        ...progress[wordId],
        ...updates,
        lastReviewed: Date.now(),
    };
    await saveProgress(progress);
};

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

export const markWordAsKnown = async (wordId) => {
    await updateWordProgress(wordId, {
        status: "learned",
        correctCount: (await getWordStatus(wordId)).correctCount + 1,
    });
};

export const markWordAsLearning = async (wordId) => {
    await updateWordProgress(wordId, {
        status: "learning",
    });
};

export const recordAttempt = async (wordId, isCorrect) => {
    const currentStatus = await getWordStatus(wordId);
    const updates = {
        correctCount: currentStatus.correctCount + (isCorrect ? 1 : 0),
        incorrectCount: currentStatus.incorrectCount + (isCorrect ? 0 : 1),
    };

    if (isCorrect && currentStatus.correctCount + 1 >= 3) {
        updates.status = "learned";
    } else if (!isCorrect) {
        updates.status = "learning";
    }

    await updateWordProgress(wordId, updates);
};

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

export const getViewedWords = async () => {
    try {
        const viewed = await AsyncStorage.getItem(VIEWED_WORDS_KEY);
        return viewed ? JSON.parse(viewed) : {};
    } catch (error) {
        console.error("Ошибка загрузки просмотренных слов:", error);
        return {};
    }
};

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

export const resetWordStatusForTopic = async (topic) => {
    const progress = await getProgress();
    const { getWordsByTopic, getWordId } = require("./wordsManager");

    const topicWords = getWordsByTopic(topic);

    topicWords.forEach((word) => {
        const wordId = getWordId(word);
        delete progress[wordId];
    });

    await saveProgress(progress);
};

export const markWordAsViewed = async (wordId, topic, mode) => {
    const viewedWords = await getViewedWords();
    const key = `${mode.toLowerCase()}_${topic || "all"}`;

    if (!viewedWords[key]) {
        viewedWords[key] = [];
    }

    if (!viewedWords[key].includes(wordId)) {
        viewedWords[key].push(wordId);
    }

    await saveViewedWords(viewedWords);
};

export const getViewedWordsForTopicAndMode = async (topic, mode) => {
    const viewedWords = await getViewedWords();
    const key = `${mode.toLowerCase()}_${topic || "all"}`;
    return viewedWords[key] || [];
};

export const resetProgressForTopicAndMode = async (topic, mode) => {
    const viewedWords = await getViewedWords();
    const key = `${mode.toLowerCase()}_${topic || "all"}`;
    delete viewedWords[key];
    await saveViewedWords(viewedWords);

    await resetWordStatusForTopic(topic, mode);
};

export const getViewedStats = async (topic, mode) => {
    const viewedWordIds = await getViewedWordsForTopicAndMode(topic, mode);
    return {
        viewedCount: viewedWordIds.length,
    };
};

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
