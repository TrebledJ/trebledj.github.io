---
title:  MuseScore Navigation Plugins
description: Developing plugins to enhance the music editors' quality of life.
updated: "2022-09-11"
tags: project qml js apps qt music
thumbnail: /assets/img/posts/music/piano-keys.jpg
pitch: Developed MuseScore quality-of-life plugins for navigation and score editing using QML/JS.
related: none
---

MuseScore, a music notation desktop application, allows mini-extensions through its QML Plugins. MuseScore is built with the [Qt](https://en.wikipedia.org/wiki/Qt_(software)) framework and leverages the QML ecosystem for rapid prototyping and user-developed plugins.

QML is a fun language to work with. Generally, the UI is coded in a declarative style and the logic is coded in JavaScript. This, of course, has the downside of losing the static type-checking of C++; so I would often be in the situation where I need to reload and fix things several times before getting it functioning properly.

But the freedom and “I don’t care whether your types are correct” attitude of JS were quite nostalgic. Having played with QML/JS before, I decided I wanted to write some MuseScore plugins for fun ~~and also because I felt a need for them~~.

In this post, I’ll introduce my first set of MuseScore plugins and give a brief developer’s account of them. These plugins aren’t really related to music. Rather, they’re inspired by VSCode plugins and features which I find useful. In a way, the plugins below make MuseScore more of a developer’s second home.

{% include "toc.md" %}

## todo-list

View the project on: [MuseScore](https://musescore.org/en/project/musescore-do-list) / [GitHub](https://github.com/TrebledJ/musescore-todo-list).

In software development, todos are commonly added into source code as reminders to the poor developers toiling away writing code. Todos come in many forms: bugs to be fixed, issues to be resolved, feature requests, etc.

Sometimes when composing, I find myself lost in a sea of todos. During a composing session, I might drop a todo note to follow-up on it next time.

Here are some examples of todos I might encounter while composing:

- TODO: Explore different chord progressions for this transition.
- TODO: More brass to this section.
- FIXME: Playback sounds wonky.
- TODO: Revise counterpoint.
- TODO: Add bowing articulation to strings.

![](/assets/img/posts/music/musescore/plugin-todo-list.jpg){:.w-100}

To allow for different todo styles and text, I provided several settings for the user to modify. These are listed in on the [GitHub readme](https://github.com/TrebledJ/musescore-todo-list).

### Developer’s Note

This plugin is inspired by the todo-tree plugin in VSCode, which searches files in the current workspace for `TODO`s/`FIXME`s and lists them in a tree view. I toyed with idea of replicating this on MuseScore—listing todos on all open scores—but eventually decided to embrace the [KISS principle](https://en.wikipedia.org/wiki/KISS_principle) and just list todos for the current score.

When starting, I took reference of [jeetee’s annotation plugin](https://musescore.org/en/project/annotations). I noticed jeetee used Qt Quick Controls 1.0 instead of 2.0 used in some other plugins. Apparently, QML had made some drastic changes to the styling of controls (buttons, checkboxes, etc.). In 1.0, controls used the native style (e.g. Apple’s aqua style for macs). On the other hand, 2.0 controls require developers to customise styling; this may sound great for design flexibility, but in my experience it’s annoying to get it working with both light and dark themes.

![](/assets/img/posts/music/musescore/plugin-qtquick1.jpg){:.w-45}
![](/assets/img/posts/music/musescore/plugin-qtquick2.jpg){:.w-45}
{:.center}

<sup>Qt Quick Controls 1.0 vs 2.0. The latter comes with barely any default and takes more effort to properly set up.</sup>
{:.center}

Implementation-wise, the todo-list plugin aims to be self-contained and simple. Self-contained, meaning that everything is in a single .qml file, so that the user doesn’t need to bother with structure too much. Simple, meaning that it doesn’t store too much metadata. The plugin only stores the configuration options mentioned above. I avoid storing data such as measure and staff—which are alike the x and y position in a score—because things get messy when the stored todo is displaced, e.g. when a user inserts a bunch of measures or removes an instrument.

Even though I’ve used Qt before, I was still surprised with how easy it was to set up a form dialog to configure user settings. Just slap together a `Dialog`, `GridLayout`, several `Label`s and `TextField`s, code the logic, and violà—we have our settings dialog.

## History

View the project on: [MuseScore](https://musescore.org/en/project/musescore-navigation) / [GitHub](https://github.com/TrebledJ/musescore-navigation).

This plugin keeps track of where your cursor has been so that you can easily jump back and forth between different points in time (effectively making you a time traveller!).

When programming in an IDE, it is sometimes necessary to jump to a different part of code, then jump back to where you were before. For example, you might want to check the implementation of a certain function.

Similarly when editing a score, one might wish to visit a section, perhaps copy something, then return to their previous position.

The History module is comprised of three separate plugins:

- Go Back,
- Go Forward, and
- the UI.

The first two are action plugins—plugins without any visual component, and just run—whereas the third contains a simple UI. The need for a UI makes the module slightly inflexible for reasons explained below.

### Developer’s Note

There are some limitations to this module, the root cause being the limited MuseScore plugin API.

For the plugins to work properly, the UI plugin must be activated at all times. This plugin is responsible for recording cursor positions, since MuseScore does not provide a way for plugins to record score/cursor information in the background. We *could* start a subprocess, keylog user input, and interpret it to determine where the cursor currently is… but this is of course out of the question, it’s much too tedious and not worth the effort.

Another drawback is that plugins can’t jump across scores. This is very convenient in IDEs when you have several files open and want to quickly check/copy something from a different file. In MuseScore however, this simply isn’t possible (as far as I could see). So for now, we’ll have to be content with keeping cursor history isolated within each score.

## Bookmarks

View the project on: [MuseScore](https://musescore.org/en/project/musescore-navigation) / [GitHub](https://github.com/TrebledJ/musescore-navigation).

Marks down a section, saving it so that you can easily return to it later without the pain of scrolling.

This is really useful for large scores, where scrolling from front to middle to end can be pain. An existing built-in way to jump around sections is to use rehearsal marks plus MuseScore's timeline. However, I find this insufficient since a rehearsal mark only carries horizontal positioning info (measures), but not vertical positioning info (staffs).

The Bookmarks module is comprised of four plugins:

- Go to Previous Bookmark,
- Go to Next Bookmark,
- Toggle Bookmark at Cursor, and
- Clear All Bookmarks.

All of these are action plugins, so in my mind they’re fairly simple and straightforward.

### Developer’s Note

This module was inspired by the VSCode bookmarks plugin. In VSCode, bookmarks allowed you to jump between bookmarks across files and long stretches of code. Sadly alike History, Bookmarks doesn’t jump across files.

Something else to note—and this applies to all my plugins here: currently, I use a rather hacky method to jump to the selected notes:

```
cmd("note-input")
cmd("note-input")
```

We call the command twice to toggle between the two different modes (default and note-input).

However, when jumping to a specific measure + staff, MuseScore will scroll to the correct measure, but not the staff. Logic-wise, nothing is affected since the correct measure + staff are selected. The problem is just an UI issue which the MuseScore Plugins API doesn’t have a solution for. 😢

For History and Bookmark, I decided to use separate JS files to hold all the logic. This is useful since the logic will be used in several different plugins. For example, both *History: Go Back* and *History: Go Forward* use the same underlying function to iterate across the score.

I tried commenting my code cleanly, in case I need to come back to it later; I’m quite forgetful.

JavaScript’s non-existent type checking really irks me. I’m toying with the idea of using TypeScript and compiling the file to JavaScript for testing. I’ve already set up a MakeFile for packaging (zipping) the files anyways, so might as well add a rule that compiles .ts into .js and gain type safety.

## Epilogue

If you’ve read this far, then you’re probably aware that these plugins aren’t perfect. But most of these issues can't be trivially fixed due to limitations with the Plugin API.

In my development roadmap, I’ve planned several new (music-related!) plugins. As MuseScore 4 is coming out, I’ll also need to plan the maintenance of the above plugins.

If you’re interested in using the plugins or contributing, you can check the MuseScore or GitHub links below.

**To-Do List**: [MuseScore](https://musescore.org/en/project/musescore-do-list) / [GitHub](https://github.com/TrebledJ/musescore-todo-list).

**History + Bookmarks**: [MuseScore](https://musescore.org/en/project/musescore-navigation) / [GitHub](https://github.com/TrebledJ/musescore-navigation).


Thanks for reading, and happy musing!