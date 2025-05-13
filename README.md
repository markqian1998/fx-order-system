fx-order-system
A system which helps PPFGO traders place the FX orders via email in a faster way
The fx-order-system is a Node.js-based application designed to streamline the process of placing FX (foreign exchange) orders via email for PPFGO traders. It features a user-friendly interface, email integration, and real-time data support to enhance efficiency in order execution.
Features

Email-Based Order Placement: Allows traders to submit FX orders directly through email.
Real-Time Data: Displays spot references and recent trading data for FX pairs.
User Interface: Simple HTML-based interface for easy order input and tracking.
Customizable Intervals: Supports configurable data intervals for market analysis.

Prerequisites

Node.js: Version 14.x or later (recommended).
npm: Included with Node.js installation.
Internet Connection: Required for fetching real-time FX data.

Installation

Clone the repository:git clone https://github.com/markqian1998/fx-order-system.git


Navigate to the project directory:cd fx-order-system


Install the required dependencies:npm install



Usage

Start the server:node server.js


Open a web browser and navigate to http://localhost:3000 (or the port specified in server.js).
Use the interface to:
Input FX order details.
View spot references and historical trading data (last 3 days, updated at 30-minute intervals).
Submit orders via email with a subject line like "FX Orders - YYYYMMDD".


Monitor the console for server logs or errors.

Project Structure

index.html: Main HTML file providing the user interface.
server.js: Node.js server handling order processing and data retrieval.
package.json: Defines project dependencies and scripts.
package-lock.json: Ensures consistent dependency installations.
assets/: Contains supporting files (e.g., Poseidon FX Orders User Guide).
README.md: This documentation file.

Configuration

Edit server.js to adjust the port (default is 3000) or email settings if needed.
The system fetches FX data using external APIs; ensure no rate limits are exceeded (e.g., Yahoo Finance usage).

Contributing
Contributions are welcome to improve functionality or fix issues. To contribute:

Fork the repository.
Create a new branch (git checkout -b feature-branch).
Make your changes and commit them (git commit -m "description").
Push to the branch (git push origin feature-branch).
Open a pull request with a clear description of your changes.

License
This project is licensed under the MIT License - see the LICENSE file for details (create a LICENSE file if not present).
Troubleshooting

Server Not Starting: Ensure Node.js and npm are installed correctly. Check the console for error messages.
Data Not Loading: Verify your internet connection and API availability. Adjust the data interval in server.js if needed.
Email Issues: Configure email settings in server.js with valid SMTP credentials.

Acknowledgments

Built with inspiration from the need to optimize FX order placement for PPFGO traders.
Utilizes community resources and Node.js ecosystem tools for development.

Contact
For questions or support, reach out via the GitHub Issues page or contact the maintainer directly.
