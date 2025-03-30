# Text to Speech with Amazon Polly 

This React application generates text to speech from text data using AWS Polly and packages them into a downloadable zip file.

## Features

* Converts text to speech using AWS Polly.
* Creates a zip archive containing all generated MP3 files.
* Downloads the zip file to the user's computer.
* Displays the filenames of the generated text to speech.

## Installation

1.  **Clone the repository:**

    ```bash
    git clone [your-repository-url]
    cd [your-repository-name]
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure AWS Polly:**

    * Ensure you have AWS credentials set up.
    * Install the AWS SDK for JavaScript.

4.  **Replace placeholders:**

    * Adapt the Polly parameters to your needs.

5.  **Run the application:**

    ```bash
    npm start
    ```

## Usage

1.  Prepare a CSV file with the text data you want to convert to text to speech. Ensure the CSV has columns for `text` and `Filename`.
2.  Run the React application.
3.  The application will process the CSV data, generate text to speech, and create a zip file named `text to speech.zip`.
4.  The zip file will be automatically downloaded to your computer.
5.  The application will display the filenames of the generated text to speech.
