---
title: Browser-Based MIDI Editor
description: MIDI transcription and editing localised in your browser.
tags:
 - dsp
 - js
 - python
 - music
 - hkust
thumbnail: /img/posts/projects/midi-keyboard.jpg
include_thumbnail: true
pitch: Developed a browser-based MIDI editor enabled with audio-to-MIDI conversion features.
related:
---

This project was made for a course on multimedia computing and is published [online](https://github.com/TrebledJ/midi-editor/).

As a composer and programmer, I wanted to create a tool that would make MIDI editing more accessible and user-friendly. This editor allows you to import and export MIDI files, as well as add and edit notes, change velocities, and adjust other parameters with ease. Whether you're a composer, producer, or someone who loves tinkering with music, this editor is a perfect solution for crafting your MIDI creations from anywhere, without the need for expensive software or hardware.

If you’re a composer, transcriber, or musician, you may find the audio import features helpful. The editor enables users to import WAV files, or record directly using their device’s microphone. These audio files are then converted to MIDI before being displayed. This way, you can upload an audio file, sing, or play an instrument to transcribe it to MIDI.[^backend]

[^backend]: The audio file is sent to the backend to be converted to MIDI, then sent back to the frontend for display and editing.

Although it’s meant to be browser-based, I have yet to deploy the site. You can still spin up a local development environment to play with it though. See [setup instructions](https://github.com/TrebledJ/midi-editor/#setup) for details.

This project isn’t the best, certainly there are better options out there. Future work is needed to improve the audio-to-MIDI conversion, set up an actual backend, and construct a better UI. We used vanilla JS, since the course primarily focuses on multimedia computing and not web development.

If you’d like to work together on this (or another) project, or have any queries/suggestions, do [leave a comment](#comment) below or [reach out](https://trebledj.github.io/#contact)!