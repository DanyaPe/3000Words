import verbs from "../data/verbs";
import nouns from "../data/nouns";
import adjectives from "../data/adjectives";
import adverbs from "../data/adverbs";
import prepositions from "../data/prepositions";
import conjunctions from "../data/conjunctions";

export const getAllWords = () => {
    return [
        ...verbs,
        ...nouns,
        ...adjectives,
        ...adverbs,
        ...prepositions,
        ...conjunctions,
    ];
};

export const getWordsByPartOfSpeech = (partOfSpeech) => {
    const allWords = getAllWords();
    return allWords.filter((word) => word.partOfSpeech === partOfSpeech);
};

export const getWordsByTopic = (topic) => {
    const allWords = getAllWords();
    if (!topic) return allWords;
    return allWords.filter((word) => word.topic === topic);
};

export const getRandomWords = (count, topic = null) => {
    const words = topic ? getWordsByTopic(topic) : getAllWords();
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

export const getWordId = (word) => {
    return `${word.english}_${word.partOfSpeech}`;
};

export const getWordsWithCustom = async () => {
    const { getCustomWords } = require("./customWordsManager");
    const allWords = getAllWords();
    const customWords = await getCustomWords();

    return allWords.map((word) => {
        const wordId = getWordId(word);
        if (customWords[wordId]) {
            return {
                ...word,
                ...customWords[wordId],
            };
        }
        return word;
    });
};

export const getWordsByTopicWithCustom = async (topic) => {
    const { getCustomWords } = require("./customWordsManager");
    const words = getWordsByTopic(topic);
    const customWords = await getCustomWords();

    return words.map((word) => {
        const wordId = getWordId(word);
        if (customWords[wordId]) {
            return {
                ...word,
                ...customWords[wordId],
            };
        }
        return word;
    });
};
