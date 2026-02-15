import React, { useRef, useState } from "react";
import {
    Animated,
    PanResponder,
    Dimensions,
    StyleSheet,
    View,
    Text,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_DISTANCE_THRESHOLD = 10; // Минимальное движение для свайпа

export default function SwipeableCard({ word, onSwipeLeft, onSwipeRight }) {
    const position = useRef(new Animated.ValueXY()).current;
    const [isFlipped, setIsFlipped] = useState(false);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (event, gesture) => {
                // Двигаем карточку только по горизонтали
                position.setValue({ x: gesture.dx, y: 0 });
            },
            onPanResponderRelease: (event, gesture) => {
                const { dx, dy } = gesture;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Если движение было маленьким - это тап для переворота
                if (distance < SWIPE_DISTANCE_THRESHOLD) {
                    setIsFlipped((prev) => !prev); // ← Изменили здесь
                    resetPosition();
                    return;
                }

                // Иначе это свайп
                if (gesture.dx > SWIPE_THRESHOLD) {
                    forceSwipe("right");
                } else if (gesture.dx < -SWIPE_THRESHOLD) {
                    forceSwipe("left");
                } else {
                    resetPosition();
                }
            },
        }),
    ).current;

    const forceSwipe = (direction) => {
        const x =
            direction === "right" ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
        Animated.timing(position, {
            toValue: { x, y: 0 },
            duration: 250,
            useNativeDriver: false,
        }).start(() => {
            onSwipeComplete(direction);
        });
    };

    const onSwipeComplete = (direction) => {
        setIsFlipped(false); // Сбрасываем переворот для новой карточки
        if (direction === "right") {
            onSwipeRight();
        } else {
            onSwipeLeft();
        }
        position.setValue({ x: 0, y: 0 });
    };

    const resetPosition = () => {
        Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
        }).start();
    };

    const getCardStyle = () => {
        const rotate = position.x.interpolate({
            inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
            outputRange: ["-30deg", "0deg", "30deg"],
        });

        return {
            ...position.getLayout(),
            transform: [{ rotate }],
        };
    };

    return (
        <Animated.View
            style={[styles.cardWrapper, getCardStyle()]}
            {...panResponder.panHandlers}
        >
            <View style={styles.card}>
                <View style={styles.cardContent}>
                    {!isFlipped ? (
                        // Лицевая сторона - английское слово
                        <>
                            <Text style={styles.mainText}>{word.english}</Text>
                            <Text style={styles.transcription}>
                                {word.transcription}
                            </Text>
                            <Text style={styles.hint}>
                                Нажмите для перевода
                            </Text>
                        </>
                    ) : (
                        // Обратная сторона - русский перевод
                        <>
                            <Text style={styles.mainText}>{word.russian}</Text>
                            <Text style={styles.partOfSpeech}>
                                {word.partOfSpeech}
                            </Text>
                            <Text style={styles.topic}>Тема: {word.topic}</Text>
                        </>
                    )}
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    cardWrapper: {
        width: "100%",
        alignItems: "center",
    },
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
