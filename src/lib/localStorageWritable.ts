import { writable, type Writable } from 'svelte/store';

interface Serialization<T> {
    serialize: (value: T) => string;
    deserialize: (value: string) => T;
} 

const defaultSerialization: Serialization<any> = {
    serialize: (v) => v,
    deserialize: (v) => v,
};

function localStorageWritable<T>(key: string, initialValue: T, serialization: Serialization<T>): Writable<T>;
function localStorageWritable<T extends string>(key: string, initialValue: T): Writable<T>;
function localStorageWritable<T extends string>(key: string, initialValue: T, serialization: Serialization<T>): Writable<T>;

// function localStorageWritable<T>(key: string, initialValue: T, serialization?: T extends string ? Serialization<T> : undefined): Writable<T>;

function localStorageWritable<T>(key: string, initialValue: T, serialization: Serialization<T> = defaultSerialization): Writable<T> {
    const initialValueString = serialization.serialize(initialValue)
    const storedValueString = localStorage.getItem(key);

    let store: Writable<T>;
    if (storedValueString === null) {
        localStorage.setItem(key, initialValueString);
        store = writable(initialValue);
    } else {
        store = writable(serialization.deserialize(storedValueString));
    }

    return {
        subscribe: store.subscribe,
        set: (value) => {
            localStorage.setItem(key, serialization.serialize(value));
            store.set(value);
        },
        update: (updater) => {
            store.update(updater);
        },
    };
}

export { localStorageWritable };
