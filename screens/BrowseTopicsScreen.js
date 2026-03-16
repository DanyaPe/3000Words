import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
} from "react-native";
import { getTopicsWithCounts } from "../utils/topicsManager";

export default function BrowseTopicsScreen({ navigation }) {
    const [topics, setTopics] = useState([]);

    useEffect(() => {
        loadTopics();
    }, []);

    const loadTopics = () => {
        const topicsData = getTopicsWithCounts();
        setTopics(topicsData);
    };

    const handleTopicSelect = (topicName) => {
        navigation.navigate("WordsList", { topic: topicName });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Просмотр слов</Text>
            <Text style={styles.subtitle}>Выберите тему</Text>

            <FlatList
                data={topics}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.topicItem}
                        onPress={() => handleTopicSelect(item.name)}
                    >
                        <Text style={styles.topicName}>{item.name}</Text>
                        <Text style={styles.topicCount}>{item.count} слов</Text>
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
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 20,
        marginBottom: 5,
        color: "#333",
    },
    subtitle: {
        fontSize: 16,
        textAlign: "center",
        color: "#666",
        marginBottom: 20,
    },
    listContainer: {
        padding: 20,
    },
    topicItem: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    topicName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        flex: 1,
        flexWrap: "wrap",
        marginRight: 10,
    },
    topicCount: {
        fontSize: 14,
        color: "#666",
        flexShrink: 0,
        minWidth: 60,
        textAlign: "right",
    },
});
