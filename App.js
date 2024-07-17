import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as SQLite from 'expo-sqlite';

// Configuração do banco de dados SQLite
const db = SQLite.openDatabase('mydatabase.db');

const createTables = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        FOREIGN KEY (client_id) REFERENCES clients(id)
      );`
    );
  });
};

const insertClient = (name, successCallback, errorCallback) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO clients (name) values (?)',
      [name],
      (_, result) => successCallback(result),
      (_, error) => errorCallback(error)
    );
  });
};

const insertSchedule = (client_id, start_date, end_date, successCallback, errorCallback) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO schedules (client_id, start_date, end_date) values (?, ?, ?)',
      [client_id, start_date, end_date],
      (_, result) => successCallback(result),
      (_, error) => errorCallback(error)
    );
  });
};

const getClients = (successCallback, errorCallback) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM clients',
      [],
      (_, { rows: { _array } }) => successCallback(_array),
      (_, error) => errorCallback(error)
    );
  });
};

const getSchedules = (successCallback, errorCallback) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM schedules',
      [],
      (_, { rows: { _array } }) => successCallback(_array),
      (_, error) => errorCallback(error)
    );
  });
};

// Função para remover um cliente pelo ID
const deleteClient = (clientId, successCallback, errorCallback) => {
  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM clients WHERE id = ?',
      [clientId],
      (_, result) => successCallback(result),
      (_, error) => errorCallback(error)
    );
  });
};

// Função para remover um agendamento pelo ID
const deleteSchedule = (scheduleId, successCallback, errorCallback) => {
  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM schedules WHERE id = ?',
      [scheduleId],
      (_, result) => successCallback(result),
      (_, error) => errorCallback(error)
    );
  });
};

export default function App() {
  const [name, setName] = useState('');
  const [clients, setClients] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchClients = () => {
    getClients(
      (clients) => setClients(clients),
      (error) => console.error(error)
    );
  };

  const fetchSchedules = () => {
    getSchedules(
      (schedules) => setSchedules(schedules),
      (error) => console.error(error)
    );
  };

  useEffect(() => {
    createTables();
    fetchClients();
    fetchSchedules();
  }, []);

  const handleAddClient = () => {
    insertClient(name, fetchClients, (error) => console.error(error));
    setName('');
  };

  const handleAddSchedule = () => {
    insertSchedule(selectedClientId, startDate, endDate, fetchSchedules, (error) => console.error(error));
    setSelectedClientId('');
    setStartDate('');
    setEndDate('');
  };


  // Função para remover um cliente
  const handleRemoveClient = (clientId) => {
    deleteClient(clientId, fetchClients, (error) => console.error(error));
  };

  // Função para remover um agendamento
  const handleRemoveSchedule = (scheduleId) => {
    deleteSchedule(scheduleId, fetchSchedules, (error) => console.error(error));
  };

  return (
    <View>
      <View style={{marginTop: 32, marginHorizontal: 10}}>
        <Text style={{fontSize: 24, fontWeight: 'bold'}}>Adicionar Cliente</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Nome do Cliente" style={styles.input} />
        <Button title="Adicionar" onPress={handleAddClient} />

        <Text>Clientes cadastrados:</Text>
        <FlatList
          data={clients}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text>{item.name}</Text>
              <Button title="Remover" onPress={() => handleRemoveClient(item.id)} />
            </View>
          )}
        />
      </View>

      <View style={{marginTop: 32, marginHorizontal: 10}}>

      <Text style={{fontSize: 24, fontWeight: 'bold'}}>Adicionar Agendamento</Text>
      <Picker
        selectedValue={selectedClientId}
        onValueChange={(itemValue) => setSelectedClientId(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Selecione um Cliente" value="" />
        {clients.map(client => (
          <Picker.Item key={client.id} label={client.name} value={client.id} />
        ))}
      </Picker>
      <TextInput value={startDate} onChangeText={setStartDate} placeholder="Data de Início" style={styles.input} />
      <TextInput value={endDate} onChangeText={setEndDate} placeholder="Data de Término" style={styles.input} />
      <Button title="Adicionar" onPress={handleAddSchedule} />

      

      <Text>Agendamentos</Text>
      <FlatList
        data={schedules}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text>{`Cliente ID: ${item.client_id}, Início: ${item.start_date}, Término: ${item.end_date}`}</Text>
            <Button title="Remover" onPress={() => handleRemoveSchedule(item.id)} />
          </View>
        )}
      />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 32,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    width: '100%',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 12,
  },
});
