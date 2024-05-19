// JavaScript code to fetch and display the quote
document.addEventListener('DOMContentLoaded', () => {
    // Function to fetch a quote from the ZenQuotes API using a CORS proxy
    async function fetchQuote() {
        try {
            // Fetch data from the ZenQuotes API using a CORS proxy
            const response = await fetch('https://api.allorigins.win/get?url=https://zenquotes.io/api/random');
            // const response = await fetch('https://zenquotes.io/api/random');
            // Check if the response is OK
            if (response.ok) {
                // Parse the response JSON
                const data = await response.json();
                // Parse the contents of the fetched data
                const contents = JSON.parse(data.contents);
                // Get the quote and author from the response
                const quote = contents[0].q;
                const author = contents[0].a;
                // Display the quote and author in the HTML elements
                document.getElementById('quote').textContent = quote;
                document.getElementById('quoteAuthor').textContent = author;
            } else {
                console.error('Failed to fetch the quote');
            }
        } catch (error) {
            console.error('Error fetching the quote:', error);
        }
    }

    // Call the fetchQuote function to get and display the quote
    fetchQuote();
});