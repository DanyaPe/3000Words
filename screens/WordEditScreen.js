import { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { getWordId } from "../utils/wordsManager";
import { saveCustomWord } from "../utils/customWordsManager";

export default function WordEditScreen({ navigation, route }) {
    const originalWord = route.params.word;

    const [english, setEnglish] = useState(originalWord.english);
    const [transcription, setTranscription] = useState(
        originalWord.transcription,
    );
    const [russian, setRussian] = useState(originalWord.russian);

    const handleSave = async () => {
        if (!english.trim()) {
            Alert.alert("Ошибка", "Английское слово не может быть пустым");
            return;
        }
        if (!russian.trim()) {
            Alert.alert("Ошибка", "Русский перевод не может быть пустым");
            return;
        }
        if (!transcription.trim()) {
            Alert.alert("Ошибка", "Транскрипция не может быть пустой");
            return;
        }

        try {
            const wordId = getWordId(originalWord);
            await saveCustomWord(wordId, {
                english: english.trim(),
                transcription: transcription.trim(),
                russian: russian.trim(),
                partOfSpeech: originalWord.partOfSpeech,
                topic: originalWord.topic,
            });

            Alert.alert("Готово", "Изменения сохранены", [
                {
                    text: "OK",
                    onPress: () => navigation.goBack(),
                },
            ]);
        } catch (error) {
            Alert.alert("Ошибка", "Не удалось сохранить изменения");
            console.error(error);
        }
    };

    const hasChanges =
        english !== originalWord.english ||
        transcription !== originalWord.transcription ||
        russian !== originalWord.russian;

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.form}>
                    <Text style={styles.title}>Редактирование слова</Text>

                    <View style={styles.field}>
                        <Text style={styles.label}>Английский:</Text>
                        <TextInput
                            style={styles.input}
                            value={english}
                            onChangeText={setEnglish}
                            placeholder="Введите слово на английском"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Транскрипция:</Text>
                        <TextInput
                            style={styles.input}
                            value={transcription}
                            onChangeText={setTranscription}
                            placeholder="Введите транскрипцию"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <Text style={styles.hint}>
                            Формат: [example] или /example/
                        </Text>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Русский перевод:</Text>
                        <TextInput
                            style={styles.input}
                            value={russian}
                            onChangeText={setRussian}
                            placeholder="Введите перевод"
                            autoCorrect={false}
                        />
                    </View>

                    <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>Часть речи:</Text>
                        <Text style={styles.infoValue}>
                            {originalWord.partOfSpeech}
                        </Text>
                    </View>

                    <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>Тема:</Text>
                        <Text style={styles.infoValue}>
                            {originalWord.topic}
                        </Text>
                    </View>

                    {!hasChanges && (
                        <View style={styles.noChangesBox}>
                            <Text style={styles.noChangesText}>
                                ℹ️ Вы не внесли изменений
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            <View style={styles.buttons}>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.cancelButtonText}>Отмена</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        !hasChanges && styles.saveButtonDisabled,
                    ]}
                    onPress={handleSave}
                    disabled={!hasChanges}
                >
                    <Text style={styles.saveButtonText}>Сохранить</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    scrollContent: {
        padding: 20,
    },
    form: {
        backgroundColor: "white",
        borderRadius: 15,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 20,
        textAlign: "center",
    },
    field: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: "#888",
        marginBottom: 8,
        fontWeight: "600",
    },
    input: {
        borderWidth: 2,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 12,
        fontSize: 18,
        backgroundColor: "#fafafa",
    },
    hint: {
        fontSize: 12,
        color: "#999",
        marginTop: 5,
        fontStyle: "italic",
    },
    infoBox: {
        backgroundColor: "#f0f0f0",
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 12,
        color: "#888",
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        color: "#666",
        fontWeight: "500",
    },
    noChangesBox: {
        backgroundColor: "#E3F2FD",
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
    },
    noChangesText: {
        fontSize: 14,
        color: "#1976D2",
        textAlign: "center",
    },
    buttons: {
        flexDirection: "row",
        padding: 20,
        paddingBottom: 40,
        gap: 10,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: "#999",
        padding: 18,
        borderRadius: 12,
        alignItems: "center",
    },
    cancelButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    saveButton: {
        flex: 1,
        backgroundColor: "#4CAF50",
        padding: 18,
        borderRadius: 12,
        alignItems: "center",
    },
    saveButtonDisabled: {
        backgroundColor: "#ccc",
    },
    saveButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
});
