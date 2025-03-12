# AWS Amplify Setup Guide

This document provides instructions on how to set up AWS Amplify for this project.

## Prerequisites

1. AWS Account
2. AWS CLI installed and configured
3. AWS Amplify CLI installed (`npm install -g @aws-amplify/cli`)

## Setup Steps

### 1. Initialize Amplify

```bash
amplify init
```

Follow the prompts:
- Enter a name for the project: `comercial-mva`
- Enter a name for the environment: `dev`
- Choose your default editor
- Choose the type of app: `javascript`
- Choose the framework: `none`
- Choose the source directory path: `/`
- Choose the distribution directory path: `/`
- Choose the build command: `npm run build`
- Choose the start command: `npm start`

### 2. Add Authentication

```bash
amplify add auth
```

Choose the default configuration or customize as needed.

### 3. Add API

```bash
amplify add api
```

Choose REST API and configure as needed for your form submission.

### 4. Push Changes to AWS

```bash
amplify push
```

This will create the resources in your AWS account.

### 5. Update aws-exports.js

After running `amplify push`, the `aws-exports.js` file will be automatically updated with the correct values.

### 6. Connect to GitHub Repository

1. Go to the AWS Amplify Console
2. Click "Connect app"
3. Choose GitHub as the repository source
4. Authorize AWS Amplify to access your GitHub account
5. Select the `comercial-mva` repository
6. Choose the main branch
7. Review the build settings and confirm

### 7. Deploy

Once connected, AWS Amplify will automatically deploy your app whenever you push changes to the main branch.

## Troubleshooting

If the deployment fails:

1. Check the build logs in the AWS Amplify Console
2. Ensure all required files are committed to the repository
3. Verify that the amplify.yml file is correctly configured
4. Make sure the aws-exports.js file has the correct values 