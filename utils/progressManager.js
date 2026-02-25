import AsyncStorage from "@react-native-async-storage/async-storage";

const PROGRESS_KEY = "@word_progress";
const VIEWED_WORDS_KEY = "@viewed_words"; // Новый ключ для просмотренных слов

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

// Отметить слово как просмотренное для конкретной темы и режима
export const markWordAsViewed = async (wordId, topic, mode) => {
    const viewedWords = await getViewedWords();
    const key = `${mode}_${topic || "all"}`;

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
    const key = `${mode}_${topic || "all"}`;
    return viewedWords[key] || [];
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

// Обновленная функция сброса - теперь сбрасывает и просмотренные и статус
export const resetProgressForTopicAndMode = async (topic, mode) => {
    // Сбрасываем просмотренные слова
    const viewedWords = await getViewedWords();
    const key = `${mode}_${topic || "all"}`;
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
