# Poseidon FX Orders User Guide

## Overview
The **Poseidon FX Orders** application is a desktop tool designed to streamline the process of placing foreign exchange (FX) orders with UBS. It provides a user-friendly interface to select account details, specify recipients, and retrieve real-time FX pair price data, ultimately generating emails for order submission.

This guide covers how to install, use, and troubleshoot the application on macOS and Windows.

## System Requirements
- **macOS**: macOS 10.13 (High Sierra) or later
- **Windows**: Windows 10 or later (64-bit)
- **Internet**: Stable internet connection for retrieving FX price data
- **Disk Space**: Approximately 200 MB for installation
- **Screen Resolution**: Minimum 1280x800

## Installation Instructions

### For macOS Users
1. **Download the Application**:
   - Obtain the `Poseidon FX Orders.dmg` file from your IT department or shared drive.
   - Save it to a location like your `Downloads` folder.

2. **Install the Application**:
   - Double-click the `.dmg` file to open it.
   - Drag the **Poseidon FX Orders** app icon to the `Applications` folder.
   - Wait for the copy process to complete.

3. **Launch the Application**:
   - Navigate to the `Applications` folder and double-click **Poseidon FX Orders**.
   - If prompted with a security warning ("Poseidon FX Orders is from an unidentified developer"), go to `System Preferences > Security & Privacy` and click "Open Anyway."
   - The application will open in a new window.

### For Windows Users
1. **Download the Application**:
   - Obtain the `Poseidon FX Orders.exe` file from your IT department or shared drive.
   - Save it to a location like your `Downloads` folder.

2. **Install the Application**:
   - Double-click the `.exe` file to start the installation.
   - Follow the on-screen prompts to install the application (default location is `C:\Program Files\Poseidon FX Orders`).
   - If prompted by Windows Defender or User Account Control, click "Allow" or "Yes" to proceed.

3. **Launch the Application**:
   - Find **Poseidon FX Orders** in the Start Menu or on your Desktop.
   - Double-click to launch the application.

## Using the Application
The **Poseidon FX Orders** application provides a simple interface to manage FX orders. Follow these steps to use it effectively:

1. **Open the Application**:
   - Launch **Poseidon FX Orders** as described above. The main interface will display at `http://localhost:3000`.

2. **Select Account**:
   - In the **Account** dropdown, choose the appropriate account:
     - HK-130381 Next Merchant
     - HK-375298 Super Aim
     - SG-229613 Rome Garden Limited
     - HK-375289 Xu Wei

3. **Select Recipient**:
   - In the **Recipient** dropdown, select the UBS contact:
     - UBS HK GFIM (`ubs_hk_gfim@ubs.com`)
     - UBS FX DAC (`ubs_fx_dac@ubs.com`)

4. **Enter Client Code**:
   - In the **UBS FX DAC Client Code** field, select or enter the appropriate code:
     - WMPOSESG1
     - WMPOSEHK1
   - Ensure the code matches the recipient and account for accurate order processing.

5. **Add Order Details**:
   - Click the **Add Another Order** button to include additional orders.
   - For each order, specify the FX pair (e.g., USDJPY, EURUSD) and other required details (e.g., amount, buy/sell).
   - The application retrieves real-time price data for the specified FX pair over the last 24 hours (updated every 30 minutes).

6. **Generate Email**:
   - Once all order details are entered, click the **Generate Email** button.
   - The application will create a formatted email with the order details and price data.
   - Review the email content, then send it to the selected UBS recipient using your email client.

7. **Close the Application**:
   - When finished, close the application window.
   - On macOS, you may need to quit the app from the menu bar (`Poseidon FX Orders > Quit`).

## Viewing FX Pair Price Data
- The application retrieves price data for the specified FX pair via the `/api/price/:pair` endpoint.
- To view price data:
  1. Enter an FX pair (e.g., `USDJPY`) in the appropriate field.
  2. The application will display a chart or table with price data (close prices, updated every 30 minutes) for the last 24 hours.
- If no data appears, ensure you have an active internet connection and the FX pair is valid (e.g., use `USDJPY` instead of `USD/JPY`).

## Troubleshooting
If you encounter issues, try the following:

1. **Application Won’t Open**:
   - **macOS**: Check `System Preferences > Security & Privacy` and allow the app to run. If the issue persists, contact IT to verify the `.dmg` file integrity.
   - **Windows**: Ensure you have administrator privileges. Right-click the app and select "Run as Administrator."

2. **Price Data Not Loading**:
   - Verify your internet connection.
   - Ensure the FX pair is entered correctly (e.g., `EURUSD` without spaces or slashes).
   - Wait a few seconds, as the API may take time to fetch data.

3. **Email Generation Fails**:
   - Ensure all required fields (Account, Recipient, Client Code) are filled.
   - Check that your default email client is configured correctly.

4. **Application Crashes**:
   - Restart the application.
   - Ensure your system meets the requirements (e.g., macOS 10.13+ or Windows 10+).
   - Contact IT with details of the error message, if any.

5. **Other Issues**:
   - Contact your IT department with a description of the issue, including any error messages and the steps leading to the problem.
   - Provide your operating system version and the application version (visible in the app’s "About" section, if available).

## Security Notes
- **Data Privacy**: Do not share sensitive account or client code information outside the application or with unauthorized personnel.
- **Updates**: Periodically check with IT for application updates to ensure you have the latest features and security patches.
- **Network**: Use a secure, corporate-approved network when accessing price data or sending emails.

## Contact IT Support
For assistance, contact your IT department:
- **Email**: [Insert IT department email, e.g., it.support@yourcompany.com]
- **Phone**: [Insert IT support phone number]
- **Hours**: [Insert support hours, e.g., Monday–Friday, 9 AM–6 PM]

Please provide the following when reporting issues:
- Your operating system (e.g., macOS Ventura 13.4, Windows 11).
- A description of the issue and steps to reproduce it.
- Any error messages or screenshots.

## Version
- **Application Version**: 1.0.0 (as of May 12, 2025)
- Check for updates via your IT department.

---

Thank you for using **Poseidon FX Orders**. This tool is designed to enhance your efficiency in managing FX orders. For feedback or feature requests, please contact IT.