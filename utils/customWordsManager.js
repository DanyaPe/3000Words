import AsyncStorage from "@react-native-async-storage/async-storage";
import { getWordId } from "./wordsManager";

const CUSTOM_WORDS_KEY = "@custom_words";

export const getCustomWords = async () => {
    try {
        const customWords = await AsyncStorage.getItem(CUSTOM_WORDS_KEY);
        return customWords ? JSON.parse(customWords) : {};
    } catch (error) {
        console.error("Ошибка загрузки изменённых слов:", error);
        return {};
    }
};

export const saveCustomWord = async (wordId, customData) => {
    try {
        const customWords = await getCustomWords();
        customWords[wordId] = {
            ...customData,
            isCustom: true,
            updatedAt: Date.now(),
        };
        await AsyncStorage.setItem(
            CUSTOM_WORDS_KEY,
            JSON.stringify(customWords),
        );
    } catch (error) {
        console.error("Ошибка сохранения изменённого слова:", error);
    }
};

export const getWord = async (wordId, originalWord) => {
    const customWords = await getCustomWords();
    if (customWords[wordId]) {
        return {
            ...originalWord,
            ...customWords[wordId],
        };
    }
    return originalWord;
};

export const resetCustomWord = async (wordId) => {
    try {
        const customWords = await getCustomWords();
        delete customWords[wordId];
        await AsyncStorage.setItem(
            CUSTOM_WORDS_KEY,
            JSON.stringify(customWords),
        );
    } catch (error) {
        console.error("Ошибка сброса изменённого слова:", error);
    }
};

export const getTopicWordsWithCustom = async (topic) => {
    const { getWordsByTopic } = require("./wordsManager");
    const originalWords = getWordsByTopic(topic);
    const customWords = await getCustomWords();

    return Promise.all(
        originalWords.map(async (word) => {
            const wordId = getWordId(word);
            return await getWord(wordId, word);
        }),
    );
};
