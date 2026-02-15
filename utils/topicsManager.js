import { getAllWords } from "./wordsManager";

// Получить список всех уникальных тем
export const getAllTopics = () => {
    const allWords = getAllWords();
    const topics = [...new Set(allWords.map((word) => word.topic))];
    return topics.sort();
};

// Получить количество слов по каждой теме
export const getTopicsWithCounts = () => {
    const allWords = getAllWords();
    const topicCounts = {};

    allWords.forEach((word) => {
        const topic = word.topic;
        if (!topicCounts[topic]) {
            topicCounts[topic] = 0;
        }
        topicCounts[topic]++;
    });

    // Преобразуем в массив объектов для удобства
    return Object.keys(topicCounts)
        .map((topic) => ({
            name: topic,
            count: topicCounts[topic],
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
};
