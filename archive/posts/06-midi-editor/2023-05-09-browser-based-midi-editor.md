---
title: Browser-Based MIDI Editor
excerpt: MIDI transcription and editing localised in your browser.
tags:
  - apps
  - js
  - python
  - music
  - hkust
thumbnail_src: assets/midi-reimagined.jpg
thumbnail_banner: true
pitch: Developed a browser-based MIDI editor enabled with audio-to-MIDI conversion features.
related:
---

This project was made for a course on multimedia computing and is published [online](https://github.com/TrebledJ/midi-editor/).

As a composer and programmer, I wanted to create a tool that would make MIDI editing more accessible and user-friendly. This editor allows you to import and export MIDI files, as well as add and edit notes, change velocities, and adjust other parameters with ease. Whether you're a composer, producer, or someone who loves tinkering with music, this editor is a perfect solution for crafting your MIDI creations from anywhere, without the need for expensive software or hardware.

If you’re a composer, transcriber, or musician, you may find the audio import features helpful. The editor enables users to import WAV files, or record directly using their device’s microphone. These audio files are then converted to MIDI before being displayed. This way, you can upload an audio file, sing, or play an instrument to transcribe it to MIDI.[^backend]

[^backend]: The audio file is sent to a Python backend to be converted to MIDI, then sent back to the frontend for display and editing.

{% image "assets/midi-editor.jpg", "", "A jank UI for editing MIDI designed by yours truly." %}

<sup>Screenshot of the MIDI editor.</sup>
{.caption}

Although it’s meant to be browser-based, I have yet to deploy the site. You can still spin up a local development environment to play with it though. See [setup instructions](https://github.com/TrebledJ/midi-editor/#setup) for details.

This project isn’t the best, certainly there are better options out there. Future work is needed to improve the audio-to-MIDI conversion, set up an actual backend, and construct a better UI. We used vanilla JS, since the course primarily focuses on multimedia computing and not web development.

If you’d like to work together on this (or another) project, or have any queries/suggestions, do [leave a comment](#comment) below or [reach out](/#contact)!