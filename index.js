require("dotenv").config();
// Require express and body-parser
const express = require("express");
const bodyParser = require("body-parser");
const { Octokit } = require("octokit");

// Initialize express and define a port
const app = express();
const PORT = 3000;

// Tell express to use body-parser's JSON parsing
app.use(bodyParser.json());

app.get("/", (_, res) => {
  res.send("App is running");
});

app.post("/webhooks/intercom", async (req, res) => {
// Acknowledge Intercom webhook to prevent retries
  res.status(200).end();

  // Create a GitHub issue from Intercom ticket payload:
  var notification = req.body;
  var ticket_title = notification.data.item.ticket_attributes._default_title_;
  var ticket_description =
    notification.data.item.ticket_attributes._default_description_;
  var ticket_id = notification.data.item.id;

  const octokit = new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN });

  const github_issue = await octokit.rest.issues.create({
    owner: "your_github_org", // TODO replace with your GitHub org e.g. intercom
    repo: "your_github_repo", // TODO replace with your GitHub repo e.g. intercom-github-integration
    // Note that we store Intercom ticket id within the issue title, we'll need it in Step 5 of this tutorial: In real world scenarios you would probably store this elsewhere.
    title: `${ticket_title} [Intercom ticket number: ${ticket_id}]`,
    body: ticket_description,
  });

  const github_issue_url = github_issue.data.html_url;

  // Update Intercom ticket with GitHub issue URL
  const intercom_ticket_endpoint = `https://api.intercom.io/tickets/${ticket_id}`;
  const intercom_payload = { ticket_attributes: { github_issue_url } };

  const options = {
    method: "PUT",
    body: JSON.stringify(intercom_payload),
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "Intercom-Version": "Unstable",
      authorization: `Bearer ${process.env.INTERCOM_ACCESS_TOKEN}`,
    },
  };

  fetch(intercom_ticket_endpoint, options)
    .then((response) => response.json())
    .then((response) => console.log(response))
    .catch((err) => console.error(err));

});

app.post("/webhooks/github", async (req, res) => {
  res.status(200).end();
  const notification = req.body;
  if (notification.action === "closed") {
    console.log("github issue closed");
    const gh_issue_title = notification.issue.title;
    const ticket_id_regex = /Intercom ticket number:\s*(\d+)\]/;
    const intercom_ticket_id = gh_issue_title.match(ticket_id_regex)[1];

    const options = {
      method: "PUT",
      body: JSON.stringify({
        state: "resolved",
      }),
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "Intercom-Version": "Unstable",
        authorization: `Bearer ${process.env.INTERCOM_ACCESS_TOKEN}`,
      },
    };

    fetch(`https://api.intercom.io/tickets/${intercom_ticket_id}`, options)
      .then((response) => response.json())
      .then((response) => console.log(response))
      .catch((err) => console.error(err));

    return;
  }

  console.log(notification.action);
});

// Start express on the defined port
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
