import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { Fontisto } from '@expo/vector-icons';
import { light, theme } from './colors';

const STORAGE_KEY = '@toDos';
const WORK_KEY = '@working';
const COUNT_KEY = '@counting';

export default function App() {
  const [text, setText] = useState('');
  const [working, setWorking] = useState(true);
  const [toDos, setToDos] = useState({});
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [edit, setEdit] = useState(text);
  const [editing, setEditing] = useState('');
  const [dark, setDark] = useState(true);

  useEffect(() => {
    loadToDos();
    loadWorking();
    loadCount();
  }, []);

  useEffect(() => {
    const saveCount = async () => {
      try {
        await AsyncStorage.setItem(COUNT_KEY, JSON.stringify(count));
      } catch (error) {
        console.log(error);
      }
    };
    saveCount();
  }, [count]);

  const result = Object.values(toDos).filter((work) => {
    return work.working === working;
  });
  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const onChangeText = (payload) => {
    setText(payload);
  };
  const onChangeEdit = (payload) => {
    setEdit(payload);
  };

  const saveToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.log(error);
    }
  };
  const saveWorking = async (working) => {
    try {
      await AsyncStorage.setItem(WORK_KEY, JSON.stringify(working));
    } catch (error) {
      console.log(error);
    }
  };

  const loadCount = async () => {
    try {
      const c = await AsyncStorage.getItem(COUNT_KEY);
      if (c) {
        setCount(JSON.parse(c));
      }
    } catch (error) {
      console.log(error);
    }
  };
  const loadToDos = async () => {
    setLoading(true);
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      if (s) {
        setToDos(JSON.parse(s));
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };
  const loadWorking = async () => {
    try {
      const w = await AsyncStorage.getItem(WORK_KEY);
      setWorking(JSON.parse(w));
    } catch (error) {
      console.log(error);
    }
  };

  const addToDo = async () => {
    if (text === '') {
      return;
    }
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, done: false },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText('');
  };

  const deleteToDo = (key) => {
    if (Platform.OS === 'web') {
      const ok = confirm('정말 삭제하시겠습니까?');
      if (ok) {
        const newToDos = { ...toDos };
        delete newToDos[key];
        setToDos(newToDos);
        saveToDos(newToDos);
      }
    } else {
      Alert.alert('Delete To Do', '삭제하시겠습니까?', [
        { text: '취소' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            const newToDos = { ...toDos };
            delete newToDos[key];
            setToDos(newToDos);
            await saveToDos(newToDos);
          },
        },
      ]);
    }
  };

  const finishedTodo = (key) => {
    const newToDos = { ...toDos };
    newToDos[key].done = !newToDos[key].done;
    setToDos(newToDos);
    saveToDos(newToDos);
  };

  const editToDo = async () => {
    if (edit == '') {
      setEdit(toDos[editing].text);
      setEditing('');
      return;
    }
    const newToDos = {
      ...toDos,
    };
    newToDos[editing].text = edit;
    setToDos(newToDos);
    await saveToDos(newToDos);
    setEdit('');
    setEditing('');
  };

  return (
    <View style={styles(dark).container}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <View style={styles(dark).darkMode}>
        <TouchableOpacity
          onPress={() => {
            setDark(!dark);
          }}
        >
          {dark ? (
            <Fontisto name="day-sunny" size={24} color="white" />
          ) : (
            <Fontisto name="night-clear" size={24} color="black" />
          )}
        </TouchableOpacity>
      </View>
      <View style={styles(dark).header}>
        <TouchableOpacity
          onPress={() => {
            work();
            saveWorking(true);
          }}
        >
          <Text
            style={{
              fontSize: 30,
              fontWeight: '600',
              color: working ? 'lightgrey' : theme.grey,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>
        {working && (
          <Text style={{ color: dark ? 'white' : 'teal' }}>
            {result.length === 0
              ? 0
              : Math.floor((100 / result.length) * count)}
            %
          </Text>
        )}
        <TouchableOpacity
          onPress={() => {
            travel();
            saveWorking(false);
          }}
        >
          <Text
            style={{
              fontSize: 30,
              fontWeight: '600',
              color: !working ? 'lightgrey' : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      {working && (
        <View style={styles(dark).progressBar}>
          <Animated.View
            style={
              ([StyleSheet.absoluteFill],
              {
                backgroundColor: theme.grey,
                width: `${Math.floor((100 / result.length) * count)}%`,
                borderRadius: 5,
              })
            }
          />
        </View>
      )}
      <TextInput
        onSubmitEditing={addToDo}
        value={text}
        onChangeText={onChangeText}
        returnKeyType="done"
        placeholder={working ? 'Add a To Do' : 'Where do you want to go?'}
        style={styles(dark).input}
      />
      <ScrollView>
        {loading ? (
          <View style={{ alignItems: 'center' }}>
            <ActivityIndicator
              color="white"
              style={{ marginTop: 10 }}
              size="large"
            />
          </View>
        ) : (
          Object.keys(toDos).map((key) =>
            toDos[key].working === working ? (
              <View style={styles(dark).toDo} key={key}>
                {editing !== key ? (
                  <Text
                    style={
                      !toDos[key].done
                        ? styles(dark).toDoText
                        : {
                            ...styles.toDoText,
                            color: theme.grey,
                            textDecorationLine: 'line-through',
                            textDecorationColor: 'red',
                          }
                    }
                  >
                    {toDos[key].text}
                  </Text>
                ) : (
                  <TextInput
                    onSubmitEditing={editToDo}
                    value={edit}
                    onChangeText={onChangeEdit}
                    returnKeyType="done"
                    style={styles(dark).editInput}
                  />
                )}
                <View style={styles(dark).btns}>
                  {!toDos[key].done && (
                    <TouchableOpacity
                      style={styles(dark).btn}
                      onPress={() => {
                        setEditing(key);
                      }}
                    >
                      <Fontisto name="comment" size={18} color={theme.white} />
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles(dark).btn}
                    onPress={() => {
                      finishedTodo(key);
                      toDos[key].done
                        ? setCount((prevCount) => prevCount + 1)
                        : setCount((prevCount) => prevCount - 1);
                    }}
                  >
                    {toDos[key].done ? (
                      <Fontisto
                        name="checkbox-active"
                        size={18}
                        color={theme.white}
                      />
                    ) : (
                      <Fontisto
                        name="checkbox-passive"
                        size={18}
                        color={theme.white}
                      />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles(dark).btn}
                    onPress={() => {
                      deleteToDo(key);
                    }}
                  >
                    <Fontisto name="trash" size={18} color={theme.white} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = (dark) =>
  StyleSheet.create({
    container: {
      backgroundColor: dark ? theme.bg : light.bg,
      flex: 1,
      paddingHorizontal: 20,
    },
    darkMode: {
      position: 'absolute',
      right: '50%',
      top: 50,
    },
    header: {
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: 'row',
      marginTop: 100,
    },
    progressBar: {
      backgroundColor: dark ? 'white' : '#B9B7BD',
      height: 10,
      flexDirection: 'row',
      width: '100%',
      borderRadius: 5,
      marginVertical: 20,
    },
    input: {
      backgroundColor: dark ? '#b3b1c4' : '#B9B7BD',
      marginVertical: 10,
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderRadius: 30,
      fontSize: 18,
    },
    toDo: {
      backgroundColor: dark ? theme.toDoBg : 'lightgrey',
      marginBottom: 10,
      paddingVertical: 20,
      paddingHorizontal: 20,
      borderRadius: 15,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    editInput: {
      flex: 1,
    },
    toDoText: {
      color: dark ? 'white' : '#4C5270',
      fontSize: 16,
      fontWeight: '500',
    },

    btns: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    btn: {
      paddingLeft: 20,
    },
  });
