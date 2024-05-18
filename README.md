# Growtopia Items.dat Decoder/Encoder

A simple command-line tool for decoding and encoding Growtopia's `items.dat` file.

## Features

-   **Decode `items.dat`:** Extracts data from `items.dat` and saves it to either JSON or text format.
-   **Encode `items.dat`:** Creates a new `items.dat` file from JSON or text data.
-   **Support for various versions:** Handles decoding and encoding for different `items.dat` versions.
-   **Text and JSON format:** Choose between text and JSON formats for decoding and encoding.

## Installation

1. **Install Bun:** Make sure you have Bun installed on your system.
2. **Clone the repository:**
    ```bash
    git clone https://github.com/yoruakio/growtools.git
    ```
3. **Navigate to the project directory:**
    ```bash
     cd growtools
    ```
4. **Install the required pacage:**
    ```bash
    bun install
    ```
5. **Run the tool:**

    ```bash
    bun run index.js -d -f items.dat # Decode items.dat to json
    bun run index.js -d -f items.dat -t # Decode items.dat to text
    ```

## Usage

```bash
Usage: index [options]

Options:
  -e, --encode       Encode items.dat
  -d, --decode       Decode items.dat
  -f, --file <file>  Path to items.dat file
  -t, --txt          Use text format for decoding/encoding
  -h, --help         display help for command
```

## Examples

### Decode `items.dat` to JSON

```bash
bun run index.js -d -f items.dat
```

### Decode `items.dat` to text

```bash
bun run index.js -d -f items.dat -t
```

### Encode JSON data to `items.dat`

```bash
bun run index.js -e -f items.dat.json
```

### Encode text data to `items.dat`

```bash
bun run index.js -e -f items.dat.txt -t
```

## Notes:

-   The based code are from [GrowTools](https://github.com/GuckTubeYT) (GuckTubeYT)
-   The code are modified to work with Bun and to be more user friendly

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve the tool.
