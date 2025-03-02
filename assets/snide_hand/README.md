# Snide-Hand

Snide Hand is a handwriting font based on my own handwriting. My reference photos were taken from semi-rushed writing on 7mm-ruled paper with a 0.4mm felt-tipped pen. It supports: Latin, Cyrillic, Polytonic Greek, (some) IPA, and Shavian.

![Preview image goes here.](./previews/image0.png)

Making this font is a huge undertaking, and it may never be truly complete. It can be enjoyed by anyone free of charge in the interim, flaws and all.

## Known issues

* **Kerning is straight-up broken.** I tried using a table of kerning classes, but somehow the first column stopped being `{All others}` with no way to correct it. Then I begrudgingly deleted the table and started over with a list of kerning pairs, but pairs kept randomly refusing to work in the preview window, and trying to rekern them added duplicate entries in the table. And whatever I did with the kerning pairs, if I exported as an OpenType font file, the letters got all scrunched up and everything. I have no earthly idea what is going on with the font, and I am officially lost.

## Features

### Latin

* Supports Vietnamese; contains all letters with diacritics necessary for Vietnamese and `Dong sign`.

* Supports (some) IPA.

### Cyrillic

* Supports Ukrainian; contains `Cyrillic letter ge with upturn` and `Hryvnia sign`.

* Supports "Bulgarian" (cursive-like) letterforms, implemented as the `locl` OpenType feature for Bulgarian language. (Several letters only contain cursive-like letterforms, such as `Cyrillic small letter pe` and `Cyrillic small letter tse`.)

### Greek

* Supports Polytonic Greek.

### Shavian

* Incorporates ligatures for the sequences 𐑩𐑯 /ən/, 𐑾𐑯 /iən/, and 𐑦𐑙 /ɪŋ/.

## How to edit/build

The project file is stored as [the `./SnideHand.sfdir` directory](./SnideHand.sfdir). You can open it in the FontForge open-source cross-platform font editor.

## Acknowledgments

Thank you to [Local Fonts](https://localfonts.eu) for helping me troubleshoot an issue with corrupted kerning (although it didn't work out in the end).