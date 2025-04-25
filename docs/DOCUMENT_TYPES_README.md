# Document Types Update

## Overview

This update changes how document types are configured in the Upload Step section of the Workflow Builder. Previously, users could enter any text for document types, which could lead to inconsistencies with the core DualEnroll application. Now, document types are selected from a predefined dropdown list that matches the standard document types used in the core application.

## Changes Made

1. Updated the `UploadStepSection.jsx` component to:
   - Add a constant array of document types from the StudentDocument.