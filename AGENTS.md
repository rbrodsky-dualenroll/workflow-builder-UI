# Contributor Guide

## READ THE DOCUMENTATION
- ALWAYS BEGIN SESSIONS BY READING THE CORE README.MD FILE to understand the context of the project.
- When creating new front-end component code, or creating test code, always reference the puppeteer_testing_documentation directory contents to gain full understanding of our data-testid attribute strategy.
- When working with the inner logic behind workflows, reference the fields_hash_documentation to understand how a workflow in the DualEnroll Application functions.


## UPDATE THE DOCUMENTATION
- After successfully verifying a complete new change to the codebase, modify any relevant documentation files to keep them up to date. 
- When adding or removing UI elements, for example, ensure the puppeteer_testing_documentation files documenting those components are updated accordingly.

## COMMENT CODE
- Ensure that code you create is thoroughly commented for human understanding

## MODULARIZE THE CODEBASE INTO EASILY DIGESTIBLE FILE SIZES
- If a file is about to exceed 400 or more lines, split it up into naturally modularized smaller files. 
- Ensure that modules are intelligently organized within directories grouped by shared functionality.

## WRITING AND RUNNING AUTOMATED TESTS
- When leveraging automated testing, ensure that you are never ever hardcoding the test case results into the functions or components themselves. Tests must be passed because of the underlying logic, not because the function has been hacked to pass the test.
- When altering the codebase, run the test suite to ensure you have not broken any existing functionality. If the refactoring of other components was intentional, you may update the tests accordingly. Do not consider a task complete unless 100% of the tests are passing.
- When adding new functionality, add new test cases to the existing testing framework that confirm its functionality.