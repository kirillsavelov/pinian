# @pinian/persistent-state

This plugin offers effortless state persistence for Pinia stores with a flexible, easy-to-use API. From simple defaults
to advanced customizations like multi-storage and serializers, it streamlines state management through a single
`persistentState` option, making it a perfect fit for any project.

## Features

- **Effortless State Persistence:** Automatically saves and loads your store's state, ensuring a seamless experience
  across sessions and page reloads.
- **Flexible Storage Options:** Choose between `localStorage`, `sessionStorage`, or even define your own custom storage
  solution to fit your needs.
- **Granular Control:** Configure persistence for the entire store or fine-tune it to save specific parts of your state
  with ease.
- **XSS Protection:** Protect your state from XSS by sanitizing data during both save and load, ensuring only clean
  information is used.
- **Zero Dependencies:** This plugin is built with zero external dependencies, ensuring minimal overhead and maximum
  compatibility with any project setup.

## Quickstart

1. Install the plugin:

```sh
npm install @pinian/persistent-state
```

2. Register the plugin with Pinia:

```ts
import { createPinia } from 'pinia';
import { createPersistentState } from '@pinian/persistent-state';

const pinia = createPinia();
pinia.use(createPersistentState());
```

3. Add the `persistentState` option to the store you want to be persisted:

```ts
import { defineStore } from 'pinia';

export const useStore = defineStore('profile', {
  state: () => ({
    user: {
      name: 'John Doe',
      email: 'john@example.com',
    },
    settings: {
      theme: 'dark',
    },
  }),
  persistentState: true,
});
```

> Your store will be saved using the default configuration.

## Configuration

The plugin provides flexible configuration options that can be applied in two main ways:

1. **Globally**: Set configuration options that apply to all stores during plugin initialization. This is useful when
   you want consistent behavior across all your stores without repeating configuration.
2. **Locally (Per Store)**: Override global settings or specify custom settings for individual stores by using the
   `persistentState` option within the store definition.

### Global Configuration

To apply configurations globally, pass them when registering the plugin with Pinia:

```ts
import { createPinia } from 'pinia';
import { createPersistentStatePlugin } from '@pinian/persistent-state';

const pinia = createPinia();
pinia.use(createPersistentStatePlugin({
  serialize: (state) => btoa(JSON.stringify(state)),
  deserialize: (state) => JSON.parse(atob(state)),
}));
```

In this example, all stores will follow the global configuration unless you override it locally for specific stores.

### Local Configuration

For specific stores, you can use the `persistentState` option to override the global settings or define custom behavior.
There are three ways to configure `persistentState` for a store:

1. **Boolean** (true): Use global defaults to persist the entire store state.

```ts
import { defineStore } from 'pinia';

export const useStore = defineStore('profile', {
  state: () => ({
    user: {
      name: 'John Doe',
      email: 'john@example.com',
    },
    settings: {
      theme: 'dark',
    },
  }),
  persistentState: true,
});
```

2. **Object**: Define custom settings for the store, such as custom keys, specific storage, or choosing paths to
   persist.

```ts
import { defineStore } from 'pinia';

export const useStore = defineStore('profile', {
  state: () => ({
    user: {
      name: 'John Doe',
      email: 'john@example.com',
    },
    settings: {
      theme: 'dark',
    },
  }),
  persistentState: {
    storage: sessionStorage,
  },
});
```

3. **Array of Objects**: If you need to apply more complex persistence logic, such as storing different parts of the
   state in different storages, you can use an array of configuration objects.

```ts
import { defineStore } from 'pinia';

export const useStore = defineStore('profile', {
  state: () => ({
    user: {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'secret',
    },
    settings: {
      theme: 'dark',
    },
  }),
  persistentState: [
    {
      storage: localStorage,
      pickPaths: [
        'user.name',
        'user.email',
      ],
    },
    {
      storage: sessionStorage,
      pickPaths: [
        'settings',
      ],
    },
  ],
});
```

## Options

### key

- **type**: `(id: string) => string`
- **default**: `(id) => id`
- **scope**: Global and Local

Defines a custom key to identify the store's state in the selected storage.

<details>
<summary>Example</summary>

```ts
import { defineStore } from 'pinia';

export const useStore = defineStore('profile', {
  state: () => ({
    user: {
      name: 'John Doe',
      email: 'john@example.com',
    },
    settings: {
      theme: 'dark',
    },
  }),
  persistentState: {
    key: (id) => `prefix-${id}`,
  },
});
```

This store will be saved under the `prefix-profile` key in localStorage.
</details>

### storage

- **type**: `KeyValueStorage`
- **default**: `localStorage`
- **scope**: Global and Local

Defines which storage mechanism to use. It can be localStorage, sessionStorage, or a custom implementation of the
KeyValueStorage interface.

<details>
<summary>Example</summary>

```typescript
import { defineStore } from 'pinia';

export const useStore = defineStore('profile', {
  state: () => ({
    user: {
      name: 'John Doe',
      email: 'john@example.com',
    },
    settings: {
      theme: 'dark',
    },
  }),
  persistentState: {
    storage: sessionStorage,
  },
});
```

This store will be saved using sessionStorage instead of localStorage.
</details>

### serialize

- **type**: `(state: T) => string`
- **default**: `JSON.stringify`
- **scope**: Global and Local

Defines how to serialize the state into a string before saving it. You can also provide a custom serialization method if
needed.

<details>
<summary>Example</summary>

```typescript
import { defineStore } from 'pinia';

export const useStore = defineStore('profile', {
  state: () => ({
    user: {
      name: 'John Doe',
      email: 'john@example.com',
    },
    settings: {
      theme: 'dark',
    },
  }),
  persistentState: {
    serialize: (state) => btoa(JSON.stringify(state)),
  },
});
```

This store will save the state using Base64 encoding.
</details>

### deserialize

- **type**: `(state: string) => T`
- **default**: `JSON.parse`
- **scope**: Global and Local

Defines how to deserialize the string from storage back into the state object. You can also provide a custom
deserialization method if needed.

<details>
<summary>Example</summary>

```typescript
import { defineStore } from 'pinia';

export const useStore = defineStore('profile', {
  state: () => ({
    user: {
      name: 'John Doe',
      email: 'john@example.com',
    },
    settings: {
      theme: 'dark',
    },
  }),
  persistentState: {
    deserialize: (state) => JSON.parse(atob(state)),
  },
});
```

This store will load the state from Base64 encoding.
</details>

### pickPaths

- **type**: `string[]`
- **default**: `[]`
- **scope**: Local

Defines which paths of the state should be saved. You can specify only the paths you want to store.

<details>
<summary>Example</summary>

```typescript
import { defineStore } from 'pinia';

export const useStore = defineStore('profile', {
  state: () => ({
    user: {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'secret',
    },
    settings: {
      theme: 'dark',
    },
  }),
  persist: {
    pickPaths: [
      'user.name',
      'settings.theme',
    ],
  },
});
```

This store will only save `user.name` and `settings.theme`, ignoring other state fields.
</details>

### omitPaths

- **type**: `string[]`
- **default**: `[]`
- **scope**: Local

Defines which paths of the state should not be saved. All other paths will be stored.

<details>
<summary>Example</summary>

```typescript
import { defineStore } from 'pinia';

export const useStore = defineStore('main', {
  state: () => ({
    user: {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'secret',
    },
    settings: {
      theme: 'dark',
    },
  }),
  persist: {
    omitPaths: [
      'user.password',
    ],
  },
});
```

This store will save everything except `user.password`.
</details>

## License

@pinian/persistent-state is released under the [MIT License](LICENSE).