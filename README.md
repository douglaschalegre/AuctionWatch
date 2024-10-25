# Auction Monitor for World of Warcraft
## Overview
This project is a powerful auction monitoring tool that leverages the Battle.net API to track and analyze item auctions across connected realms in World of Warcraft. It provides real-time insights into the auction market, helping players make informed decisions about buying and selling items.

# Features
- Real-time Data Fetching: Automatically retrieves auction data from multiple connected realms.
- Price Comparison: Identifies the cheapest and most expensive auctions for specific items across realms.
- Batch Processing: Efficiently handles multiple API requests to minimize memory usage and improve performance.
# Getting Started
To get started, clone this repository and configure your Battle.net API credentials. Follow the instructions in the ENV section for installation details.

If you do not have API credentials check [Battle.net Developer Portal](https://develop.battle.net/) for instructions.

## ENV
### Step 1: Create the .env File
Navigate to the root directory of your project.

Create a new file named .env. You can do this using your code editor or by running the following command in your terminal: ```touch .env```

### Step 2: Add Your API Credentials
```
# Battle.net API credentials
CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here
```


Contributing
Contributions are welcome! Please submit a pull request or open an issue to discuss improvements.