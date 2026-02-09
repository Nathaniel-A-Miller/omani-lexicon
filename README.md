# Omani Arabic Lexicon

A searchable online dictionary of Omani Arabic containing 6,753 lexical entries with transliteration, Arabic script, roots, definitions, and linguistic annotations.

## Features

- **Multi-field fuzzy search**: Search simultaneously across:
  - Latin transliteration
  - Arabic script
  - Root forms
  - English definitions

- **Advanced filtering**: Filter by part of speech, semantic category, dialect, or entries missing root data

- **Two viewing modes**:
  - **List View**: Browse all entries with expandable details
  - **Root View**: Entries organized by Arabic root (with missing roots highlighted)

- **Mobile responsive**: Works on all devices

## Usage

Simply open the page and start typing in the search box. The search works across all fields automatically.

### Search Examples

- Type `katab` to find entries with this transliteration
- Type `كتب` to find entries in Arabic script
- Type `ktb` to find entries by root
- Type `write` to find entries by definition

### Filtering

Use the dropdown menus to filter by:
- Part of Speech (n, v, adj, etc.)
- Semantic Category (family, beekeeping, fauna, etc.)
- Dialect
- Check "Show only entries missing root" to identify incomplete data

### Browse by Root

Click "Browse by Root" to see all entries organized by their Arabic root. This view helps identify:
- Which roots have the most entries
- Entries that are missing root data (highlighted in red)

## Data Source

Data compiled from Brockett 1985 and other sources. This is an ongoing research project.

## Technical Details

Built with:
- Vanilla JavaScript (no framework required)
- [Fuse.js](https://fusejs.io/) for fuzzy search
- Pure CSS for styling
- Static HTML (works with GitHub Pages)

## Local Development

1. Clone this repository
2. Open `index.html` in a web browser
3. Or serve with a local server: `python -m http.server 8000`

## Contributing

This lexicon is a work in progress. Root data and other fields are still being added. 

## License

[Add your license information here]

## Contact

[Add your contact information here]
