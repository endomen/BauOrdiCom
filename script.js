console.log(`
┏┓   ┓   ┓   •┓  ┓    ┳┓
┃ ┏┓┏┫┏┓ ┣┓┓┏┓┃╋ ┣┓┓┏ ┃┃┏┓┏┳┓┏┓┏┓
┗┛┗┛┗┻┗  ┗┛┗┻┗┗┗ ┗┛┗┫ ┻┛┗┛┛┗┗┗ ┛┗
                    ┛
`);

console.log(`
%c
***********************************************************************************
Copyright (c) Domen Kastner

This codebase is the property of Domen Kastner

Redistribution and use in source and binary forms, with or without modification,
are not permitted without express written permission from the author.
Unauthorized reproduction, distribution, modification, or use of this codebase,
in whole or in part, is strictly prohibited without the express written consent of
the creator.

Conditions:

Redistribution: You may not distribute, publish, or disseminate the source code or compiled binaries 
in any form without prior written consent from Domen Kastner.

Modification: You may not modify the source code without express written permission from Domen Kastner.

Use: This code is provided for the exclusive use of its intended recipient. 
It may not be used for commercial purposes or incorporated into commercial products 
without prior written consent from Domen Kastner.

Attribution: Proper attribution must be given to Domen Kastner 
in any derivative works, documentation, or related materials.

Contact: For any questions or requests for permissions, please contact:

Domen Kastner
Email: domen.kastner@tuta.io

Disclaimer:
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDER AND CONTRIBUTOR "AS IS" 
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE 
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE 
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES 
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

All rights reserved.
***********************************************************************************
`, "color: red; font-weight: bold;");

let processedFiles = [];

document
    .getElementById("drop_zone")
    .addEventListener("drop", handleDrop, false);
document
    .getElementById("drop_zone")
    .addEventListener("dragover", allowDrag, false);
document
    .getElementById("combine")
    .addEventListener("click", extractAndProcessPDFs, false);
document
    .getElementById("file-input")
    .addEventListener("change", handleFileSelect, false);

// HANDLE FILE UPLOADS
function handleDrop(event) {
    event.preventDefault();
    let files = event.dataTransfer.files;
    processFiles(files);
}

function allowDrag(event) {
    event.preventDefault();
}

function handleFileSelect(event) {
    processFiles(event.target.files);
    // Reset the file input after processing.
    // reset the value of the file input after files have been processed.
    //This ensures that the change event will fire even if the same file is chosen again.
    event.target.value = "";
}


// PROCESS FILES
async function processFiles(files) {
    for (let file of files) {
        console.log("Processing:", file.name, file.type); // Log file being processed
        if (file.type === "application/zip" || file.name.endsWith(".zip")) {
            // Handle ZIP files
            const extractedFiles = await unzipAndExtractPDFs(file);
            extractedFiles.forEach((pdfFile) => {
                if (
                    !processedFiles.some(
                        (f) =>
                            f.name === pdfFile.name && f.size === pdfFile.size
                    )
                ) {
                    processedFiles.push(pdfFile);
                    displayFile(pdfFile); // Display only PDF files in the UI
                }
            });
        } else if (
            file.type === "application/pdf" ||
            file.name.endsWith(".pdf")
        ) {
            // Handle PDF files
            if (
                !processedFiles.some(
                    (f) => f.name === file.name && f.size === file.size
                )
            ) {
                processedFiles.push(file);
                displayFile(file);
            }
        } else {
            console.error("Unsupported file type:", file.name);
        }
    }
}

function displayFile(file) {
    let div = document.createElement("div");
    div.className = "file-item";

    // Create a span element to hold the file name
    let span = document.createElement("span");
    span.textContent = file.name;
    div.appendChild(span);

    // Truncate the file name if it's longer than 20 characters
    let truncatedName =
        file.name.length > 20 ? file.name.substring(0, 20) + "..." : file.name;
    span.textContent = truncatedName;

    // Create a remove button for each file
    let removeBtn = document.createElement("button");
    removeBtn.textContent = "X";
    removeBtn.classList.add("delete-btn"); // Add a class for styling
    removeBtn.style.marginLeft = "10px";
    removeBtn.onclick = function () {
        // Remove the file from the processedFiles array and the display
        processedFiles = processedFiles.filter((f) => f.name !== file.name);
        div.remove();
    };

    // Append the remove button to the div
    div.appendChild(removeBtn);

    // Append the div to the file list in the DOM
    document.getElementById("file-list").appendChild(div);
}

async function extractAndProcessPDFs() {
    const allTextData = [];
    for (let file of processedFiles) {
        const text = await extractTextFromPDF(file);
        if (text) {
            const parsedData = parsePDFData(text);
            if (parsedData) {
                console.log("Parsed Data:", parsedData); // check parsed data
                allTextData.push(parsedData);
            }
        }
    }
    console.log("All parsed data:", allTextData); // Check final structure

    if (allTextData.length > 0) {
        const combinedData = combinePDFData(allTextData);
        console.log("Combined Data:", combinedData); // check combined data
        if (combinedData) {
            addPrintButton(combinedData); // Proceed only if data is correctly combined
        }
    } else {
        console.log("No data to print.");
    }
}

async function extractTextFromPDF(file) {
    if (!file || file.type !== "application/pdf") {
        console.error("File is not a PDF or is undefined:", file);
        return null;
    }
    try {
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
        return new Promise((resolve, reject) => {
            fileReader.onload = async function () {
                const typedArray = new Uint8Array(this.result);
                const loadingTask = pdfjsLib.getDocument({ data: typedArray });
                try {
                    const pdfDocument = await loadingTask.promise;
                    let fullText = "";
                    for (
                        let pageNum = 1;
                        pageNum <= pdfDocument.numPages;
                        pageNum++
                    ) {
                        const page = await pdfDocument.getPage(pageNum);
                        const textContent = await page.getTextContent();
                        const textItems = textContent.items
                            .map((item) => item.str)
                            .join(" ");
                        fullText += textItems + " ";
                    }
                    console.log("Extracted Text:", fullText);
                    resolve(fullText.trim());
                } catch (error) {
                    console.error("Error reading PDF page:", error);
                    reject(error);
                }
            };
            fileReader.onerror = function () {
                reject("Error reading PDF file.");
            };
        });
    } catch (error) {
        console.error("Failed to parse PDF document:", error);
        return null;
    }
}

//UNZIP FILES

async function unzipAndExtractPDFs(zipFile) {
    try {
        const jsZip = new JSZip();
        const zipContents = await jsZip.loadAsync(zipFile.arrayBuffer());
        const pdfFiles = [];
        await Promise.all(
            Object.keys(zipContents.files).map(async (fileName) => {
                const file = zipContents.files[fileName];
                if (!file.dir && fileName.toLowerCase().endsWith(".pdf")) {
                    const blob = await file.async("blob");
                    const pdfBlob = new Blob([blob], {
                        type: "application/pdf",
                    });
                    pdfBlob.name = fileName; // Assign the original file name to the Blob object
                    pdfFiles.push(pdfBlob);
                    console.log("Extracted PDF:", fileName, pdfBlob.size);
                }
            })
        );
        return pdfFiles;
    } catch (error) {
        console.error("Error unzipping file:", error);
        throw error;
    }
}

let orders = []; // This will hold all the parsed order data from each PDF

// PARSE EXTRACTED TEXT

function parsePDFData(text) {
    const deliveryAddressRegex = /naslov dobave\s+([\s\S]+?)Naročilo/;
    const orderNumberRegex = /Naročilo (\d+)/;
    const orderDateRegex = /\b(\d{2}\.\d{2}\.\d{4})\b/;
    const deliveryTimeFrameRegex =
        /(\d{2}\.\d{2}\.\d{4}) - (\d{2}\.\d{2}\.\d{4})/;

    let deliveryAddress = (text.match(deliveryAddressRegex) || [])[1]?.trim();
    let orderNumber = (text.match(orderNumberRegex) || [])[1];
    let orderDate = text.match(orderDateRegex)
        ? text.match(orderDateRegex)[0]
        : undefined;
    let deliveryTimeFrame = text.match(deliveryTimeFrameRegex)
        ? text.match(deliveryTimeFrameRegex)[0]
        : undefined;

    let items = [];
    const itemDetailsRegex = /(\d+) PCE (\d+) (\d{13}) ([^]+?)\s+(\d+,\d{2})/g;
    let match;
    while ((match = itemDetailsRegex.exec(text))) {
        items.push({
            quantity: parseInt(match[1]),
            ean: match[3],
            description: match[4],
            order: orderNumber,
        });
    }

    return {
        deliveryAddress,
        orderNumber,
        orderDate,
        deliveryTimeFrame,
        items,
    };
}

function combinePDFData(parsedPDFs) {
    // Extract all unique addresses to check if more than one unique address exists
    const uniqueAddresses = new Set(
        parsedPDFs.map((pdf) => pdf.deliveryAddress)
    );

    if (uniqueAddresses.size > 1) {
        // If there are multiple unique addresses, alert the user
        alert(
            `Opa, PAZI!: Naročila različnih naročnikov ne smejo bit združena. Želel si združit:\n ${Array.from(
                uniqueAddresses
            ).join(",\n in \n ")}`
        );
        return []; // Return an empty array or handle as needed
    }

    let combinedItems = {};
    parsedPDFs.forEach((pdf) => {
        pdf.items.forEach((item) => {
            const key = item.ean + item.description;
            if (!combinedItems[key]) {
                combinedItems[key] = {
                    ...item,
                    quantities: {},
                    orders: [],
                    deliveryAddress: pdf.deliveryAddress,
                    deliveryTimeFrame: {},
                };
            }
            if (!combinedItems[key].orders.includes(pdf.orderNumber)) {
                combinedItems[key].orders.push(pdf.orderNumber);
                combinedItems[key].deliveryTimeFrame[pdf.orderNumber] =
                    pdf.deliveryTimeFrame; // Assign delivery time frame for each order
            }
            combinedItems[key].quantities[pdf.orderNumber] =
                (combinedItems[key].quantities[pdf.orderNumber] || 0) +
                item.quantity;
        });
    });

    // Return combined data with added delivery time frames for each order
    return Object.values(combinedItems).map((item) => ({
        description: item.description,
        ean: item.ean,
        total: Object.values(item.quantities).reduce(
            (sum, qty) => sum + qty,
            0
        ),
        quantities: item.quantities,
        orders: item.orders,
        deliveryAddress: item.deliveryAddress,
        deliveryTimeFrame: item.deliveryTimeFrame,
    }));
}

function getFormattedDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2); // Adds leading zero if needed
    const day = ("0" + date.getDate()).slice(-2); // Adds leading zero if needed
    const hours = ("0" + date.getHours()).slice(-2); // Adds leading zero if needed
    const minutes = ("0" + date.getMinutes()).slice(-2); // Adds leading zero if needed
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`; // Formats date and time
    return formattedDate;
}

function generatePDF(combinedData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
    });

    const marginY = 20; // Margin top for the document
    

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12); // Set font size for address

    // Add delivery address
    const deliveryAddressLines = doc.splitTextToSize(combinedData[0].deliveryAddress, 500);
    doc.text(deliveryAddressLines, 15, marginY + 30);

    // Add current date and time
    const dateTime = getFormattedDate();
    doc.text(dateTime, 13, marginY + deliveryAddressLines.length * 12 + 40); // Adjust the Y position accordingly

    doc.setTextColor(0, 0, 0); // Set text color to black

    // Append the last 4 characters from the deliveryAddress to the file name
    const deliveryAddress = combinedData[0].deliveryAddress;
    const centerDigits = deliveryAddress.substr(-4);

    // Sort the combinedData array based on the closest delivery date
    combinedData.sort((a, b) => {
        // Ensure deliveryTimeFrame is a string before splitting
        const deliveryTimeFrameA =
            typeof a.deliveryTimeFrame === "string" ? a.deliveryTimeFrame : "";
        const deliveryTimeFrameB =
            typeof b.deliveryTimeFrame === "string" ? b.deliveryTimeFrame : "";

        // Split the deliveryTimeFrame strings and parse the dates
        const dateA = new Date(deliveryTimeFrameA.split(" - ")[1]);
        const dateB = new Date(deliveryTimeFrameB.split(" - ")[1]);

        // Compare the dates
        return dateA - dateB;
    });

    // Add delivery time frame if available
    if (combinedData[0].deliveryTimeFrame) {
        const deliveryTimeFrame = combinedData[0].deliveryTimeFrame;
        doc.setFontSize(12);
        doc.text("Delivery Time Frame:", 15, marginY + deliveryAddressLines.length * 12 + 70); // Adjust the Y position accordingly
        let startY = marginY + deliveryAddressLines.length * 12 + 85; // Adjust the Y position accordingly
        Object.keys(deliveryTimeFrame).forEach((order) => {
            const timeFrame = deliveryTimeFrame[order];
            doc.text(`${order}: ${timeFrame}`, 25, startY);
            startY += 15;
        });
    }

    console.log("Final data for PDF:", combinedData);

    let allOrderNumbers = new Set();
    combinedData.forEach((item) => {
        item.orders.forEach((order) => {
            allOrderNumbers.add(order);
        });
    });

    const headers = [
        { title: "Product", dataKey: "description" },
        { title: "EAN", dataKey: "ean" },
        { title: "Total", dataKey: "total" },
    ];

    allOrderNumbers.forEach((order) => {
        headers.push({
            title: `${order}`,
            dataKey: `order_${order}`,
        });
    });

    const body = combinedData.map((item, index) => {
        const rowData = {
            description: item.description || "No Description",
            ean: item.ean || "No EAN",
            total: item.total || 0,
        };

        console.log(`Processing item ${index}: `, item);

        allOrderNumbers.forEach((order) => {
            rowData[`order_${order}`] = item.quantities[order] || 0;
            console.log(`Order ${order}: ${rowData[`order_${order}`]}`);
        });

        console.log(`Row data for item ${index}: `, rowData);
        return rowData;
    });

    // Logging right before using autoTable to see what we're trying to render
    console.log("Headers:", headers);
    console.log("Body ready for autoTable:", body);

    doc.autoTable({
        startY: marginY + 160, // Adjust startY to leave space for the added content
        head: [headers.map((header) => header.title)],
        body: body.map((row) => Object.values(row)),
        columnStyles: {
            0: {
                fontStyle: "bold",
                fontSize: 10,
                padding: { top: 0, right: 0, bottom: 0, left: 0 },
            },
            1: { fontSize: 8, cellWidth: 80 },
            2: { fontStyle: "bold", fontSize: 10, cellWidth: 50 },
        }, // Cells in first column centered and green
        theme: "striped",
        headStyles: {
            fillColor: [0, 98, 102], // Set header background color rgb(0, 98, 102)
            textColor: [255, 255, 255], // Set header text color
            fontStyle: "bold",
        },
        styles: {
            font: "helvetica",
            fontSize: 9,
            overflow: "linebreak",
            valign: "middle",
            halign: "center",
        },
        margin: { top: 0, right: 0, bottom: 0, left: 0 }, // Set margin to 0 on all sides
        tableWidth: "auto", // Set table width to auto to adjust to the viewport width
        didDrawCell: (data) => {
            // Log detailed cell data
            console.log(
                `Drawing cell at row ${data.row.index}, column: ${data.column.dataKey} with data:`,
                data.cell.raw
            );
        },
    });

    const formattedDate = getFormattedDate();
    doc.save(`Bau_${centerDigits}_${formattedDate}.pdf`);
}

// keep track of the print button
let printButton;

// Function to add the print button
function addPrintButton(combinedData) {
    // Remove existing print button if it exists
    if (printButton) {
        printButton.remove();
    }

    // Create a new print button
    printButton = document.createElement("button");
    printButton.textContent = "Save PDF";
    printButton.addEventListener("click", () => {
        // Call the function to generate and print the PDF
        console.log("Data sent to PDF generation:", combinedData);
        generatePDF(combinedData);
    });

    // Append the print button to the document body
    document.body.appendChild(printButton);
}
