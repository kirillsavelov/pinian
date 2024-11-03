# @pinian/shared-state

This plugin enables effortless state sharing between multiple instances of Pinia stores across browser tabs.
With a flexible API and powerful synchronization options, it makes cross-tab state management seamless and reliable.

## Features

- **Real-time State Sharing:** Automatically shares store state across multiple browser tabs
- **Instant Initialization:** Control whether new tabs receive state immediately upon connection
- **Granular Control:** Configure sharing for the entire store or specific parts of your state
- **Merge Strategy:** Customize how states are merged when conflicts occur
- **Zero Dependencies:** Built with zero external dependencies for maximum compatibility

## Quick Start

1. Install the plugin:

```sh
npm install @pinian/shared-state
```

2. Register the plugin with Pinia:

```ts
import { createPinia } from 'pinia';
import { createSharedState } from '@pinian/shared-state';

const pinia = createPinia();
pinia.use(createSharedState());
```

3. Add the `sharedState` option to the store you want to share:

```ts
import { defineStore } from 'pinia';

export const useStore = defineStore('profile', {
  state: () => ({
    user: {
      name: 'John Doe',
    },
  }),
  sharedState: true,
});
```

> Your store will be shared across all tabs using the default configuration.

## Configuration

The plugin provides flexible configuration options that can be applied in two ways:

1. **Globally**: Set configuration options that apply to all stores during plugin initialization
2. **Locally (Per Store)**: Override global settings or specify custom settings for individual stores

### Global Configuration

To apply configurations globally, pass them when registering the plugin with Pinia:

```ts
import { createPinia } from 'pinia';
import { createSharedState } from '@pinian/shared-state';

const pinia = createPinia();
pinia.use(createSharedState({
  auto: true,
  channel: (id) => `v1.0.0-${id}`,
  instant: true,
  mergeStrategy: 'deep',
}));
```

### Local Configuration

For specific stores, you can use the `sharedState` option to override the global settings or define custom behavior.
There are two ways to configure `sharedState` for a store:

1. **Boolean** (true): Use global defaults to share the entire store state

```ts
import { defineStore } from 'pinia';

export const useStore = defineStore('profile', {
  state: () => ({
    user: {
      name: 'John Doe',
    },
  }),
  sharedState: true,
});
```

2. **Object**: Define custom settings for the store, such as custom channels, merge strategies, and paths to share

```ts
import { defineStore } from 'pinia';

export const useStore = defineStore('profile', {
  state: () => ({
    user: {
      name: 'John Doe',
      password: 'secret',
    },
    settings: {
      theme: 'dark',
    },
  }),
  sharedState: {
    channel: (id) => `v1.0.0-${id}`,
    instant: true,
    mergeStrategy: 'deep',
    pickPaths: [
      'user',
      'settings.theme',
    ],
    omitPaths: [
      'user.password',
    ],
  },
});
```

## Options

### auto

- **type**: `boolean`
- **default**: `false`
- **scope**: Global

Defines whether state sharing should be enabled by default for all stores. This can be useful when you want to
synchronize the entire application state across tabs without explicitly configuring each store.

<details>
<summary>Example</summary>

```ts
import { createPinia } from 'pinia';
import { createSharedState } from '@pinian/shared-state';

const pinia = createPinia();
pinia.use(createSharedState({
  // ensures state sharing across all stores
  auto: true,
  // ensures consistent configuration for all stores
  instant: true,
  mergeStrategy: 'deep',
}));

export const useStore = defineStore('profile', {
  state: () => ({
    user: {
      name: 'John Doe',
    },
  }),
  // ensures state sharing without explicit configuration
});
```

This configuration will automatically enable state sharing for all stores with the specified default settings. This
ensures consistent behavior across your entire application without manual configuration for each store.
</details>

### channel

- **type**: `(id: string) => string`
- **default**: `(id) => id`
- **scope**: Global and Local

Defines a custom naming function for the BroadcastChannel used for cross-tab communication. This can be useful when you
have multiple versions of the app running or need to isolate communication between specific groups of tabs.

<details>
<summary>Example</summary>

```ts
import { defineStore } from 'pinia';

export const useStore = defineStore('profile', {
  state: () => ({
    user: {
      name: 'John Doe',
    },
  }),
  sharedState: {
    // ensures version isolation between apps
    channel: (id) => `v1.0.0-${id}`,
    // ensures staging environment isolation
    // channel: (id) => `staging-${id}`,
    // ensures production environment isolation
    // channel: (id) => `production-${id}`,
  },
});
```

This store will share state through the `v1.0.0-profile` channel. This ensures that different versions of your
application won't interfere with each other.
</details>

### instant

- **type**: `boolean`
- **default**: `true`
- **scope**: Global and Local

Defines whether the store should request initial state immediately when a new tab connects. This can be useful when you
need to control the timing of initial state synchronization between tabs.

<details>
<summary>Example</summary>

```ts
import { defineStore } from 'pinia';

export const useStore = defineStore('profile', {
  state: () => ({
    user: {
      name: 'John Doe',
      status: 'online',
    },
  }),
  sharedState: {
    // ensures immediate state availability in new tabs
    instant: true,
    // ensures data preparation before sharing
    // instant: false,
  },
});
```

This store will immediately synchronize state when a new tab opens. This ensures that all tabs have consistent data as
soon as they connect to the shared state.
</details>

### mergeStrategy

- **type**: `'overwrite' | 'shallow' | 'deep' | MergeStrategyFn<T>`
- **default**: `'overwrite'`
- **scope**: Global and Local

Defines how states are merged when updates arrive from different tabs. This can be useful when you need custom conflict
resolution logic.

<details>
<summary>Example</summary>

```ts
import { defineStore } from 'pinia';

export const useStore = defineStore('profile', {
  state: () => ({
    user: {
      name: 'John Doe',
      lastVisit: '2024-01-01',
      visits: 5,
    },
  }),
  sharedState: {
    // ensures custom handling of concurrent updates
    mergeStrategy: (oldState, newState) => ({
      ...oldState,
      ...newState,
      user: {
        ...oldState.user,
        ...newState.user,
        visits: Math.max(oldState.user.visits, newState.user.visits),
        lastVisit: new Date(Math.max(
          new Date(oldState.user.lastVisit).getTime(),
          new Date(newState.user.lastVisit).getTime(),
        )).toISOString().split('T')[0],
      },
    }),
    // ensures complete state replacement
    // mergeStrategy: 'overwrite',
    // ensures top-level properties merge only
    // mergeStrategy: 'shallow',
    // ensures nested objects preservation
    // mergeStrategy: 'deep',
  },
});
```

This store will use a custom merge strategy to resolve conflicts between tabs. This ensures that the visit counter
always keeps the highest value and the last visit date is always the most recent one.
</details>

### pickPaths

- **type**: `string[]`
- **default**: `[]`
- **scope**: Local

Defines which paths of the state should be synchronized between tabs. This can be useful when you want to share only
specific parts of your store.

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
  sharedState: {
    // ensures only required data is shared
    pickPaths: [
      'user.name',
      'settings.theme',
    ],
  },
});
```

Only `user.name` and `settings.theme` will be synchronized across tabs.
</details>

### omitPaths

- **type**: `string[]`
- **default**: `[]`
- **scope**: Local

Defines which paths of the state should be excluded from synchronization. This can be useful when you want to keep
sensitive data local to the current tab.

<details>
<summary>Example</summary>

```ts
import { defineStore } from 'pinia';

export const useStore = defineStore('profile', {
  state: () => ({
    user: {
      name: 'John Doe',
      password: 'secret',
    },
  }),
  sharedState: {
    // ensures sensitive data remains private
    omitPaths: [
      'user.password',
    ],
  },
});
```

Everything except `user.password` will be synchronized across tabs.
</details>

## License

@pinian/shared-state is released under the MIT License.