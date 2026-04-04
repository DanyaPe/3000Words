import { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ScrollView,
} from "react-native";
import { getTopicsWithCounts } from "../utils/topicsManager";
import { getTopicsStatusForMode } from "../utils/progressManager";

export default function TopicSelectionScreen({ navigation, route }) {
    const [topics, setTopics] = useState([]);
    const [topicsStatus, setTopicsStatus] = useState({});
    const [filter, setFilter] = useState("all");
    const { mode } = route.params;

    useEffect(() => {
        loadTopics();

        const unsubscribe = navigation.addListener("focus", () => {
            loadTopics();
        });

        return unsubscribe;
    }, [mode, navigation]);

    const loadTopics = async () => {
        const topicsData = getTopicsWithCounts();
        setTopics(topicsData);

        const statuses = await getTopicsStatusForMode(mode);
        setTopicsStatus(statuses);
    };

    const handleTopicSelect = (topicName) => {
        navigation.navigate(mode, { topic: topicName });
    };

    const handleAllTopics = () => {
        navigation.navigate(mode, { topic: null });
    };

    const getModeTitle = () => {
        switch (mode) {
            case "Flashcards":
                return "Карточки";
            case "Practice":
                return "Практика ввода";
            case "Quiz":
                return "Тест";
            default:
                return "";
        }
    };

    const getFilteredTopics = () => {
        if (filter === "all") return topics;

        return topics.filter((topic) => topicsStatus[topic.name] === filter);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "new":
                return "#2196F3";
            case "in_progress":
                return "#FFA500";
            case "completed":
                return "#4CAF50";
            default:
                return "#999";
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case "new":
                return "Новая";
            case "in_progress":
                return "В процессе";
            case "completed":
                return "Пройдена";
            default:
                return "";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "new":
                return "🆕";
            case "in_progress":
                return "📝";
            case "completed":
                return "✅";
            default:
                return "";
        }
    };

    const getFilterCount = (filterType) => {
        if (filterType === "all") return topics.length;
        return topics.filter((topic) => topicsStatus[topic.name] === filterType)
            .length;
    };

    const filteredTopics = getFilteredTopics();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Выберите тему</Text>
            <Text style={styles.subtitle}>{getModeTitle()}</Text>

            <View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filtersContainer}
                    contentContainerStyle={styles.filtersContent}
                >
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            filter === "all" && styles.filterButtonActive,
                        ]}
                        onPress={() => setFilter("all")}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                filter === "all" && styles.filterTextActive,
                            ]}
                        >
                            Все ({getFilterCount("all")})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            filter === "new" && styles.filterButtonActive,
                        ]}
                        onPress={() => setFilter("new")}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                filter === "new" && styles.filterTextActive,
                            ]}
                        >
                            🆕 Новые ({getFilterCount("new")})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            filter === "in_progress" &&
                                styles.filterButtonActive,
                        ]}
                        onPress={() => setFilter("in_progress")}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                filter === "in_progress" &&
                                    styles.filterTextActive,
                            ]}
                        >
                            📝 В процессе ({getFilterCount("in_progress")})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            filter === "completed" && styles.filterButtonActive,
                        ]}
                        onPress={() => setFilter("completed")}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                filter === "completed" &&
                                    styles.filterTextActive,
                            ]}
                        >
                            ✅ Пройдены ({getFilterCount("completed")})
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            <TouchableOpacity
                style={styles.allTopicsButton}
                onPress={handleAllTopics}
            >
                <Text style={styles.topicName}>Все темы</Text>
                <Text style={styles.topicCount}>
                    {topics.reduce((sum, t) => sum + t.count, 0)} слов
                </Text>
            </TouchableOpacity>

            <FlatList
                data={filteredTopics}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => {
                    const status = topicsStatus[item.name] || "new";
                    return (
                        <TouchableOpacity
                            style={
                                status === "completed"
                                    ? styles.completedTopicItem
                                    : styles.topicItem
                            }
                            onPress={() => handleTopicSelect(item.name)}
                        >
                            <View style={styles.topicInfo}>
                                <View style={styles.topicHeader}>
                                    <Text style={styles.topicName}>
                                        {item.name}
                                    </Text>
                                    <View
                                        style={[
                                            styles.statusBadge,
                                            {
                                                backgroundColor:
                                                    getStatusColor(status),
                                            },
                                        ]}
                                    >
                                        <Text style={styles.statusBadgeText}>
                                            {getStatusIcon(status)}{" "}
                                            {getStatusText(status)}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.topicCount}>
                                    {item.count} слов
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                }}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            Нет тем в категории "
                            {filter === "new"
                                ? "Новые"
                                : filter === "in_progress"
                                  ? "В процессе"
                                  : "Пройдены"}
                            "
                        </Text>
                    </View>
                }
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
        marginBottom: 15,
    },
    filtersContainer: {
        paddingVertical: 10,
        marginBottom: 10,
    },
    filtersContent: {
        paddingHorizontal: 20,
        alignItems: "center",
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: "#e0e0e0",
        marginRight: 10,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    filterButtonActive: {
        backgroundColor: "#2196F3",
    },
    filterText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
    },
    filterTextActive: {
        color: "white",
    },
    allTopicsButton: {
        backgroundColor: "#2196F3",
        marginHorizontal: 20,
        marginBottom: 15,
        padding: 20,
        borderRadius: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    listContainer: {
        padding: 20,
        paddingTop: 0,
    },
    completedTopicItem: {
        backgroundColor: "#4CAF50",
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    topicItem: {
        backgroundColor: "white",
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    topicInfo: {
        flex: 1,
    },
    topicHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
        flex: 1,
    },
    topicName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        flex: 1,
        flexWrap: "wrap",
        marginRight: 10,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 10,
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: "600",
        color: "white",
    },
    topicCount: {
        fontSize: 14,
        color: "#666",
    },
    emptyContainer: {
        padding: 40,
        alignItems: "center",
    },
    emptyText: {
        fontSize: 16,
        color: "#999",
        textAlign: "center",
    },
});
