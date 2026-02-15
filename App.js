import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import TopicSelectionScreen from "./screens/TopicSelectionScreen";
import FlashcardsScreen from "./screens/FlashcardsScreen";
import PracticeScreen from "./screens/PracticeScreen";
import QuizScreen from "./screens/QuizScreen";

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                    headerStyle: {
                        backgroundColor: "#2196F3",
                    },
                    headerTintColor: "#fff",
                    headerTitleStyle: {
                        fontWeight: "bold",
                    },
                }}
            >
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ title: "Главная" }}
                />
                <Stack.Screen
                    name="TopicSelection"
                    component={TopicSelectionScreen}
                    options={{ title: "Выбор темы" }}
                />
                <Stack.Screen
                    name="Flashcards"
                    component={FlashcardsScreen}
                    options={{ title: "Карточки" }}
                />
                <Stack.Screen
                    name="Practice"
                    component={PracticeScreen}
                    options={{ title: "Практика" }}
                />
                <Stack.Screen
                    name="Quiz"
                    component={QuizScreen}
                    options={{ title: "Тест" }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
