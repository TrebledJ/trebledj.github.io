---
title:  MuseScore Navigation Plugins
description: Developing plugins to enhance the music editors' quality of life.
tags: project qml js programming apps music
# thumbnail: /assets/img/to/thumbnail.jpg
pitch: Developed MuseScore quality-of-life plugins for navigation and score editing using QML/JS.
published: false
---

{% include toc.md %}

## Introduction

MuseScore, a music notation desktop application, allows mini-extensions through its QML Plugins. MuseScore is built with the [Qt](https://en.wikipedia.org/wiki/Qt_(software)) framework and leverages the QML ecosystem for rapid prototyping and user-developed plugins.

QML is a fun language to work with. Generally, the UI is coded in a declarative style and the logic is coded in JavaScript. This, of course, has the downside of losing the static type-checking of C++; so I would often be in the situation where I need to reload and fix things several times before getting it functioning properly.

But the freedom and “I don’t care whether your types are correct” attitude of JS were quite nostalgic. Having played with QML/JS before, I decided I wanted to write some MuseScore plugins for fun ~~and also because I felt a need for them~~.

In this post, I’ll introduce my first set of MuseScore plugins and give a brief developer’s account of them. These plugins aren’t really related to music. Rather, they’re inspired by VSCode plugins and features which I find useful. In a way, the plugins below make MuseScore more of a developer’s second home.

## todo-list

View the project on: [GitHub](https://github.com/TrebledJ/musescore-todo-list) / [MuseScore](https://musescore.org/en/project/musescore-do-list).

In software development, todos are commonly added into source code as reminders to the poor developers toiling away writing code. Todos come in many forms: bugs to be fixed, issues to be resolved, feature requests, etc.

Sometimes when composing, I find myself lost in a sea of todos. During a composing session, I might drop a todo note to follow-up on it next time.

Here are some examples of todos I might encounter while composing:

- TODO: Explore different chord progressions for this transition.
- TODO: More brass to this section.
- FIXME: Playback sounds wonky.
- TODO: Revise counterpoint.
- TODO: Add bowing articulation to strings.

![](/assets/img/posts/music/plugin-todo-list.jpg){:.w-100}

To allow for different todo styles and text, I provided several settings for the user to modify. These are listed in the link.

### Developer’s Note

This plugin is inspired by the todo-tree plugin in VSCode, which searched files in the current workspace for `TODO`s/`FIXME`s and listed them in a tree view. I toyed with idea of replicating this on MuseScore—listing todos on all open scores—but eventually decided to embrace the [KISS principle](https://en.wikipedia.org/wiki/KISS_principle) and just list todos for the current score.

When starting, I took reference of [jeetee’s annotation plugin](https://musescore.org/en/project/annotations). I noticed jeetee used Qt Quick Controls 1.0 instead of 2.0 used in some other plugins. Apparently, QML had made some drastic changes to the styling of controls (buttons, checkboxes, etc.). In 1.0, controls used the native style (e.g. Apple’s aqua style for macs). On the other hand, 2.0 controls require developers to customise styling; this may sound great for design flexibility, but in my experience it’s annoying to get it working with both light and dark theme.

Implementation-wise, the todo-list plugin aims to be self-contained and simple. Self-contained, meaning that everything is in a single .qml file, so that the user doesn’t need to bother with structure too much. Simple, meaning that it doesn’t store too much metadata. The plugin only stores the configuration options mentioned above. I avoid storing data such as measure and staff—which are alike the x and y position in a score—because things get messy when the stored todo is displaced, e.g. when a user inserts a bunch of measures or removes an instrument.

Even though I’ve used Qt before, I was still surprised with how easy it was to set up a form dialog to configure user settings. Just slap together a `Dialog`, `GridLayout`, several `Label`s and `TextField`s, code the logic, and violà—we have our settings dialog.

