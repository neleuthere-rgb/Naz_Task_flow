# Campus Compass

A responsive, front-end prototype for a campus student-services directory. It demonstrates searching and filtering services, viewing service details, saving services, and a guided task flow that ends with a request-form preview.

The guided walkthrough includes tutoring, technology help, and academic advising. Choose a task, then follow its five steps: select the indicated category, search for the indicated term, open the matching service, open its request form, and preview a request. Selecting the correct category also starts a task without pressing **Start task**.

The tracker updates as each step is completed, and the counter shows how many distinct tasks have been completed. Switching tasks preserves each task's progress and directory filters while the page remains open. **Restart task** clears only the selected task's progress and removes its completion from the counter. All task progress resets when the page is refreshed or closed.

The separate **My tasks** section lets users add, edit, complete, reopen, delete, and filter their own tasks by priority. Its counter includes all tasks, including those hidden by the filter. These tasks are stored in the browser's local storage and normally survive refreshes; they do not sync across devices or browsers and can be lost when browser data is cleared. Storage availability depends on browser settings, and locally opened `file:` pages can behave differently from hosted pages. The demo sign-in does not protect stored tasks; do not enter sensitive information.

## Project structure

```text
.
├── index.html       # Page structure and app screens
├── css/
│   └── styles.css   # Responsive visual styles
└── js/
    ├── data.js      # Fictional sample service records and guided tasks
    ├── app.js       # Sign-in, directory, and guided walkthroughs
    └── task-manager.js # Browser-stored personal tasks
```

## Run locally

Open `index.html` in a browser. No package installation or build step is required.

## Demo sign-in

- Username: `test@campus.local`
- Password: `Local@campass16`

These are public, hardcoded demo values in client-side JavaScript, not secure authentication. Anyone with access to the project can inspect or bypass the check. Never reuse this password or enter personal information.
The sign-in screen does not display these values; they are also included in the report for the reviewer.

## Sample data and limitations

Service names, contact details, and hours in `js/data.js` are fictional placeholders. The request form only previews a submission; it does not transmit or store information. Replace demo records with verified campus information before presenting the app as an actual directory.

This project is a static front-end prototype. Putting it in a GitHub repository does not by itself host the app or provide secure accounts. A public app URL requires deployment (for example, GitHub Pages); real user accounts and protected data require a server-side authentication and data service.
