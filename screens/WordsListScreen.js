import { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
} from "react-native";
import { getWordsByTopicWithCustom } from "../utils/wordsManager";

export default function WordsListScreen({ navigation, route }) {
    const [words, setWords] = useState([]);
    const { topic } = route.params;

    useEffect(() => {
        loadWords();

        const unsubscribe = navigation.addListener("focus", () => {
            loadWords();
        });

        return unsubscribe;
    }, [navigation, topic]);

    const loadWords = async () => {
        const topicWords = await getWordsByTopicWithCustom(topic);
        setWords(topicWords);
    };

    const handleWordPress = (word) => {
        navigation.navigate("WordDetail", { word, topic });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{topic}</Text>
            <Text style={styles.subtitle}>{words.length} слов</Text>

            <FlatList
                data={words}
                keyExtractor={(item, index) => `${item.english}_${index}`}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.wordItem}
                        onPress={() => handleWordPress(item)}
                    >
                        <View style={styles.wordContent}>
                            <Text style={styles.english}>{item.english}</Text>
                            <Text style={styles.russian}>{item.russian}</Text>
                        </View>
                        {item.isCustom && (
                            <View style={styles.customBadge}>
                                <Text style={styles.customBadgeText}>✏️</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 20,
        marginBottom: 5,
        color: "#333",
    },
    subtitle: {
        fontSize: 14,
        textAlign: "center",
        color: "#666",
        marginBottom: 20,
    },
    listContainer: {
        padding: 20,
    },
    wordItem: {
        backgroundColor: "white",
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    wordContent: {
        flex: 1,
        marginRight: 10,
    },
    english: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 4,
        flexWrap: "wrap",
    },
    russian: {
        fontSize: 16,
        color: "#666",
        flexWrap: "wrap",
    },
    customBadge: {
        marginLeft: 10,
    },
    customBadgeText: {
        fontSize: 20,
    },
});
