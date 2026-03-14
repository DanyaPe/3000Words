import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import TopicSelectionScreen from "./screens/TopicSelectionScreen";
import FlashcardsScreen from "./screens/FlashcardsScreen";
import PracticeScreen from "./screens/PracticeScreen";
import QuizScreen from "./screens/QuizScreen";
import BrowseTopicsScreen from "./screens/BrowseTopicsScreen";
import WordsListScreen from "./screens/WordsListScreen";
import WordDetailScreen from "./screens/WordDetailScreen";
import WordEditScreen from "./screens/WordEditScreen";

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
                <Stack.Screen
                    name="BrowseTopics"
                    component={BrowseTopicsScreen}
                    options={{ title: "Просмотр слов" }}
                />
                <Stack.Screen
                    name="WordsList"
                    component={WordsListScreen}
                    options={{ title: "Список слов" }}
                />
                <Stack.Screen
                    name="WordDetail"
                    component={WordDetailScreen}
                    options={{ title: "Слово" }}
                />
                <Stack.Screen
                    name="WordEdit"
                    component={WordEditScreen}
                    options={{ title: "Редактирование" }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
