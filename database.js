import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('mydatabase.db');

export const createTables = () => {
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

export const insertClient = (name, successCallback, errorCallback) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO clients (name) values (?)',
      [name],
      (_, result) => successCallback(result),
      (_, error) => errorCallback(error)
    );
  });
};

export const insertSchedule = (client_id, start_date, end_date, successCallback, errorCallback) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO schedules (client_id, start_date, end_date) values (?, ?, ?)',
      [client_id, start_date, end_date],
      (_, result) => successCallback(result),
      (_, error) => errorCallback(error)
    );
  });
};

export const getClients = (successCallback, errorCallback) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM clients',
      [],
      (_, { rows: { _array } }) => successCallback(_array),
      (_, error) => errorCallback(error)
    );
  });
};

export const getSchedules = (successCallback, errorCallback) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM schedules',
      [],
      (_, { rows: { _array } }) => successCallback(_array),
      (_, error) => errorCallback(error)
    );
  });
};
