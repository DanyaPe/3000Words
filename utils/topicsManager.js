import { getAllWords } from "./wordsManager";

export const getAllTopics = () => {
    const allWords = getAllWords();
    const topics = [...new Set(allWords.map((word) => word.topic))];
    return topics.sort();
};

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

    return Object.keys(topicCounts)
        .map((topic) => ({
            name: topic,
            count: topicCounts[topic],
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
};
