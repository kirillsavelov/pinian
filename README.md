# Pinian

**Pinian** is a collection of essential plugins for [Pinia](https://pinia.vuejs.org/), the official state management
library for Vue.js. The name "Pinian" playfully combines "Pinia" with the idea of "and" — inspired by the familiar "
M&M's" style.

This collection extends Pinia's capabilities with carefully crafted plugins that solve common state management
challenges in Pinia-based applications.

## Plugins

### [@pinian/persistent-state](./packages/persistent-state)

This plugin offers effortless state persistence for Pinia stores with a flexible, easy-to-use API. From simple defaults
to advanced customizations like multi-storage and serializers, it streamlines state management through a single
`persistentState` option, making it a perfect fit for any project.

#### Features

- **Effortless State Persistence:** Automatically saves and loads your store's state, ensuring a seamless experience
  across sessions and page reloads
- **Flexible Storage Options:** Choose between `localStorage`, `sessionStorage`, or even define your own custom storage
  solution to fit your needs
- **Granular Control:** Configure persistence for the entire store or fine-tune it to save specific parts of your state
  with ease
- **XSS Protection:** Protect your state from XSS by sanitizing data during both save and load, ensuring only clean
  information is used
- **Zero Dependencies:** This plugin is built with zero external dependencies, ensuring minimal overhead and maximum
  compatibility with any project setup

### [@pinian/shared-state](./packages/shared-state)

This plugin enables effortless state sharing between multiple instances of Pinia stores across browser tabs.
With a flexible API and powerful synchronization options, it makes cross-tab state management seamless and reliable.

#### Features

- **Real-time State Sharing:** Automatically shares store state across multiple browser tabs
- **Instant Initialization:** Control whether new tabs receive state immediately upon connection
- **Granular Control:** Configure sharing for the entire store or specific parts of your state
- **Merge Strategy:** Customize how states are merged when conflicts occur
- **Zero Dependencies:** Built with zero external dependencies for maximum compatibility