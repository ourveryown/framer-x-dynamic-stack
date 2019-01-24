# Dynamic Stack

Framer X code component that acts ACTS an alternative to the `Stack` component but items can be dyanmicaly hidden via code overrides.

## Installation

Install [this package](http://www.todo.com/) from the Framer X store.

## Usage

1. Connect DynamicStack to items.
2. Override the `visibleItems` prop to control which items are shown.
3. Preview the dynamic stack.

## Props

| Prop           | Type                | Description                                                           |
| -------------- | ------------------- | --------------------------------------------------------------------- |
| `items`        | `React.Component[]` | The frames to be displayed in the stack                               |
| `visibleItems` | `boolean[]`         | Controls which `items` will be displayed in the stack                 |
| `scrollable`   | `boolean`           | If true, makes the stack scrollable and hides any overflowing content |

## Property Controls

As well as exposing the above props, all the property controls of the `Stack` component have been replicated (except for `distribute`).

## Example Project

You can download an example project showing how to use this component [here](http://www.todo.com/).

![News Feed Example](images/small.gif)
