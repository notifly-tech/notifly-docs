# Notifly Documentation

This repository contains the website configuration and documentation powering the [Notifly Documentation](https://docs.notifly.tech).

Notifly is a customer engagement platform that helps businesses send targeted notifications and messages to their users.

## Built with Mintlify

This documentation site is built using [Mintlify](https://mintlify.com), a modern documentation platform that makes it easy to create and maintain beautiful documentation.

## Development

Install the [Mintlify CLI](https://www.npmjs.com/package/mint) to preview the documentation changes locally. To install, use the following command:

```bash
npm i -g mint
```

Run the following command at the root of your documentation, where your `docs.json` is located:

```bash
mint dev
```

View your local preview at `http://localhost:3000`.

## Publishing Changes

Changes are deployed to production automatically after pushing to the main branch. The GitHub integration propagates changes from this repository to the live deployment.

## Troubleshooting

- If your dev environment isn't running: Run `mint update` to ensure you have the most recent version of the CLI.
- If a page loads as a 404: Make sure you are running in a folder with a valid `docs.json`.

## Resources

- [Mintlify Documentation](https://mintlify.com/docs)
- [Notifly Home](https://notifly.tech)
