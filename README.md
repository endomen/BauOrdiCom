# BauOrdiCom

BauOrdiCom is a client-side web application that allows users to combine multiple PDF orders into a single PDF document. This application provides an efficient way to handle multiple orders, aggregate their data, and produce a consolidated PDF report with details about the products, quantities for each order, the delivery address, and the delivery time frame for each order, ordered by their importance.

## Features

- Drag-and-drop file upload functionality
- Displays motivational ZEN quotes in the drop zone to boost your work day
- Supports PDF and ZIP file formats
- Extracts and combines order information from multiple files
- Generates a PDF report with combined order details
- Displays delivery address and time frames
- Ensures orders are sorted by delivery dates

## Usage

1. **File Upload**: Drag and drop your PDF or ZIP files into the designated area or select with the + btn in the top right corner.
2. **Combine Orders**: Click the "Combine" button to process the uploaded files.
3. **Generate PDF**: Once the files are processed, click the "Print Combined PDF" button to generate the consolidated PDF report.

#### Installation
No installation is required. Simply open the index.html file in your web browser to use the application.

### Dependencies
The application uses the following libraries:

`jsPDF`: For generating PDF documents.
`jsPDF-AutoTable`: For creating tables within the PDF.
`PDF.js`: For extracting text content from PDF files.
`JSZip`: For handling zip file extraction.


## License

This software is provided under a proprietary license. Redistribution, modification, and commercial use are not permitted without express written permission from Domen Kastner.

For the full license terms, see the [LICENSE](./LICENSE) file.

## Acknowledgements
Special thanks to the authors and maintainers of jsPDF, jsPDF-AutoTable, PDF.js, and JSZip for their excellent libraries.


