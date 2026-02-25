import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function WordCard({ word, allowFlip = true }) {
    const [isFlipped, setIsFlipped] = useState(false);

    const handlePress = () => {
        if (allowFlip) {
            setIsFlipped(!isFlipped);
        }
    };

    const CardContent = (
        <View style={styles.cardContent}>
            {!isFlipped ? (
                // Лицевая сторона - английское слово
                <>
                    <Text style={styles.mainText}>{word.english}</Text>
                    <Text style={styles.transcription}>
                        {word.transcription}
                    </Text>
                    {allowFlip && (
                        <Text style={styles.hint}>
                            Нажмите, чтобы перевернуть
                        </Text>
                    )}
                </>
            ) : (
                // Обратная сторона - русский перевод
                <>
                    <Text style={styles.mainText}>{word.russian}</Text>
                    <Text style={styles.partOfSpeech}>{word.partOfSpeech}</Text>
                    <Text style={styles.topic}>Тема: {word.topic}</Text>
                </>
            )}
        </View>
    );

    if (allowFlip) {
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={handlePress}
                activeOpacity={0.9}
            >
                {CardContent}
            </TouchableOpacity>
        );
    }

    // Если переворот отключен, не используем TouchableOpacity
    return <View style={styles.card}>{CardContent}</View>;
}

const styles = StyleSheet.create({
    card: {
        width: "90%",
        height: 400,
        backgroundColor: "white",
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    cardContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 30,
    },
    mainText: {
        fontSize: 48,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 15,
    },
    transcription: {
        fontSize: 24,
        color: "#666",
        marginBottom: 10,
    },
    partOfSpeech: {
        fontSize: 18,
        color: "#888",
        marginTop: 20,
    },
    topic: {
        fontSize: 16,
        color: "#999",
        marginTop: 10,
    },
    hint: {
        fontSize: 14,
        color: "#999",
        marginTop: 30,
        fontStyle: "italic",
    },
});
