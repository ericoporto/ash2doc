# ash2doc

From ashes to documentation, turn AGS Script Header files into friendly text.

Supports Markdown and BBCode (AGS Forum Markup!).

## Build

after you git clone this repo, just type `npm link` on the folder. This should
add an `ash2doc` command to your path. Type `npm unlink` to remove it.

## Usage

```
Usage: ash2doc <command> [options]

Commands:
  ash2doc mark  Extract .ash comments to Markdown

Options:
  --version    Show version number                                     [boolean]
  -f, --file   Load a file                                            [required]
  -l, --level  Initial header level
  -h, --help   Show help                                               [boolean]

Examples:
  ash2doc mark -f foo.ash  Turns comments in the given .ash file to markdown

copyright 2019
```

## License and author

This utility is created by Érico Vieira Porto and is MIT Licensed.
See [`LICENSE`](LICENSE) for more details.
