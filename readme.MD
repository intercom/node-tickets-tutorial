# Node Tickets API Sample

This is a sample Node.js application that demonstrates how to use the [Intercom Tickets API](https://developers.intercom.com/intercom-api-reference/v0/reference/post_tickets-ticket-id-notes) to generate GitHub issues whenever a ticket is created in Intercom.

## Prerequisites
- [Node.js](https://nodejs.org/en/) v19 installed
- You'll need an Intercom developer workspace and an Intercom app. If you don't, follow this [guide](https://developers.intercom.com/building-apps/docs/welcome#step-1-create-an-intercom-workspace).
- You'll need access to the Tickets feature. If you don’t, follow this [guide](https://www.intercom.com/help/en/articles/6604593-how-to-access-tickets-features).
- You'll need a [token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) with access to a GitHub repo where you'd like to create your new issues.

## Installing
- Clone this repo
- Run `npm install` to install dependencies
- Update the `.env` file with your Intercom and GitHub credentials
- Update the `index.js` file with details of the GitHub repo you'd like to create issues in
- Run `node index.js` to start the server